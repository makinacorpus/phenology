'use strict';

var map;

angular.module('phenology.map', ['phenology.survey', 'ngStorageTraverser'])

.controller('MapCtrl', function($scope, $geolocation, $ionicBackdrop, $rootScope, $log, $location, authApiClient, $stateParams, leafletData, $ionicPopup, storageTraverser, speciesService, mapService, $timeout, toolService){

    var user = authApiClient.getUsername(),
        areaId = $stateParams.areaId,
        class_tmp = ['positive', 'energized', 'assertive', 'royal', 'dark', 'blue', 'purple', 'orange', 'grey'],
        layers = L.featureGroup() ;
    $ionicBackdrop.release();
    map = L.map('map', {
        zoomControl: false,
        zoom: 9,
    });
    var phenoMarker = L.AwesomeMarkers.icon({
      icon: 'pagelines',
      markerColor: 'green',
      prefix: 'fa'
    });
    var myIcon = L.divIcon({
        className: 'phenology-marker',
        iconSize: [50, 65],
        iconAnchor:   [26, 60],
        popupAnchor: [-3, -50],
        shadowAnchor: [10, 12],
        shadowSize: [0, 0],
        prefix: 'glyphicon',
        spinClass: 'fa-spin',
        extraClasses: '',
        icon: 'home',
        html: '<i class="ion-leaf"></i>',
        markerColor: 'blue',
        iconColor: 'white'
    });

    // add an OpenStreetMap tile layer
    L.tileLayer(mapService.getBackGroundUrl(), {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    angular.extend($scope,{
            areas: storageTraverser.traverse("/users/" + user + "/areas"),
            filter: {
                showOnlyNeeded: "true"
            },
            geojson: undefined,
            individuals: {},
            paths: {},
            /** leaflet.locate 
            controls: {
                custom: [
                    L.control.locate({
                            keepCurrentZoomLevel: true, 
                            locateOptions: {
                                enableHighAccuracy: true,
                                timeout: 40000,
                                maximumAge: 0,
                                maxZoom: Infinity,
                                watch: true  // if you overwrite this, visualization cannot be updated
                            }
                    })
                ]
            }
            **/
        }
    );
    //mapService.watchPosition();
    if(!(angular.isDefined(areaId) && areaId !== "")){
        areaId = $stateParams.areaId = $scope.areas[0].id;
    }
    console.log(areaId);
    $scope.area = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
    );

    $timeout(function() {

        var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id),
            filtered = {},
            all_individuals = {};
        var all_coords = []
        var i = 0;
        angular.forEach(all_species, function(species, id){
            angular.forEach(species.individuals, function(individual, key){
                if((angular.isDefined(individual.lat) && individual.lat!=1) && angular.isDefined(individual.lon)){
                    all_individuals[individual.id+""] = {
                        lat: +individual.lat,
                        lng: +individual.lon,
                        icon: toolService.create_div_icon(class_tmp[id]),
                        tasks: species.tasks,
                        enable: ['click'],
                        message: '<div class="individual-popup">' +
                                    '<h5>' + individual.name + '</h5>' +
                                    '<div><img src="' + species.picture + '" /></div>' +
                                    '<a class="button button-small button-positive" href="#/app/survey/' + areaId  + '/' + species.id + '/' + individual.id + '">saisir l\'observation</a>' +
                                 '</div>'
                    };
                    if(angular.isDefined(species.tasks) && species.tasks.length > 0) {
                        filtered[individual.id+""] = all_individuals[individual.id+""]
                    }
                }
           });
           i = i+1;
        });
        $scope.individuals = filtered;

        $scope.$watch('filter.showOnlyNeeded', function(newvalue, oldvalue) {
            $scope.individuals = (newvalue === "false") ? all_individuals : filtered;
            $scope.refresh();
        }, true);

        $scope.$on("leafletDirectiveMap.zoomend", function(event, args) {
            leafletData.getMap().then(function(map) {
                //console.log(map.getZoom());
            });
        });

        // check if coords are changed
        $scope.$watch(function() {
            return $geolocation.position.coords;
        }, function() {
            $scope.position = mapService.getLatLng();
            if(angular.isDefined($scope.position)){
                // set position marker
                $scope.paths["userposition"] = mapService.setPositionMarker($scope.position);
            }
        });
        //mapService.fitAreas([$scope.area]);

    }, 100);

    $scope.refresh = function(){
        console.log("refresh");
        layers.clearLayers();
        angular.forEach($scope.individuals, function(d, i){
            var marker = L.marker([d.lat, d.lng], {icon: myIcon});
            marker.addTo(layers);
            marker.bindPopup(d.message);
        })
        layers.addTo(map);
        map.fitBounds(layers.getBounds());
    }

    // center map on user if position exists
    $scope.centerMapOnUser = function() {
        if(!angular.isDefined($geolocation.position.error)){
            leafletData.getMap().then(function(map) {
                map.setView($scope.position);
            });
        }
        else{
            $ionicPopup.alert({
                    title: 'Error',
                    template: $geolocation.position.error.message
            });
        }
    };

    // change area
    $scope.switchArea = function(area){
        $location.path(
            String.format('/app/map/{0}', area.id)
        );
    }
})

.controller('GlobalMapCtrl', function($scope, $location, authApiClient, leafletData, storageTraverser, $timeout, mapService){
    var user = authApiClient.getUsername();

    angular.extend($scope,{
            defaults: {zoomControl: false},
            markers: {},
            tiles: {
                url: mapService.getBackGroundUrl(),
                options: {}
            },
            geojson: undefined
        }
    );

    $timeout(function() {
        var areas = storageTraverser.traverse("/users/" + user + "/areas"),
            markers = {};

        var mapping = areas.map(function(area){ 
            var center = mapService.getAreaCenter(area); 
            return { lat: center[0], lng: center[1], area_id: area.id, message: area.name }
        });

        angular.forEach(mapping, function(marker){
            markers[marker.area_id] = marker;
        })

        $scope.markers = markers;

        mapService.fitAreas(areas);

    }, 200);

    $scope.$on('leafletDirectiveMarker.dblclick', function(event, args){
        $location.path(
            String.format('/app/map/{0}', args["markerName"])
        );
    });

    // get leaflet height using the ionic content height
    $scope.height = function(){
        return document.querySelectorAll(".has-header")[0].offsetHeight;
    }

})

.service('mapService', function(storageTraverser, surveyService, leafletData, $geolocation, toolService, $cordovaNetwork){
    var self = this;
    this.getAreaGeoJsonFeatures = function(user){
        var areas = storageTraverser.traverse("/users/" + user + "/areas");

        var features = areas.map(function(area){ 
            var feature = angular.copy(area.geojson.features[0]);
            feature.properties.name = area.name;
            feature.properties.id = area.id;
            return feature;
        });

        return features;
    }

    this.radius2bbox = function(lat, lng, radius){
        return [[lat - radius, lng - radius], [lat + radius, lng + radius]];
    }

    this.checkCoords = function(lat, lon){
        if(angular.isDefined(lat) && angular.isDefined(lon) && +lat !== -1 && +lon !== 1){
            return true;
        }
        return false;
    }

    this.getAreaCenter = function(area){
        if(self.checkCoords(area.lat, area.lon) === true){
            return ([area.lat, area.lon]);
        }
        else{
            var bbox = L.latLngBounds(self.getAreaPoints(area)).pad(0.1);
            var center = bbox.getCenter();
        }
    }

    this.getAreaPoints = function(area){
        var points = [];
        if(self.checkCoords(area.lat, area.lon) === true){
            points.push([area.lat, area.lon]);
        }
        angular.forEach(area.species, function(species, id){
            angular.forEach(species.individuals, function(individual, key){
                if(self.checkCoords(individual.lat, individual.lon) === true){
                    points.push([individual.lat, individual.lon]);
                }
            });
        });
        return points;
    }

    this.fitAreas = function(areas){
        var points = [];
        angular.forEach(areas, function(area, id){
            points = points.concat(self.getAreaPoints(area));
        });
        self.fitPoints(points);
    }

    this.fitPoints = function(points){
        leafletData.getMap().then(function(map) {
            var bbox = L.latLngBounds(points).pad(0.1);
            map.fitBounds(bbox);
        });
    }

    this.centerMap = function(geojson){
        leafletData.getMap().then(function(map) {
            map.fitBounds(L.geoJson(geojson).getBounds());
        });
    }

    this.getCenterMarkers = function(features){
        return features.map(function(feature){
            var point = L.geoJson(feature).getBounds().getCenter();
            point.message = feature.properties.name;
            point.id = feature.properties.id;
            return point;
        });
    }

    this.getLatLng =function(){
        if(angular.isDefined($geolocation.position.coords)){
            return {
                lat: $geolocation.position.coords.latitude,
                lng: $geolocation.position.coords.longitude
            }
        }
    }

    this.getBackGroundUrl = function(){
        return (window.cordova && $cordovaNetwork.isOnline() === false) ? toolService.mobile_background_url : toolService.remote_background_url;
    }

    this.watchPosition = function(){
        $geolocation.watchPosition({
            timeout: 40000,
            frequency: 3000,
            maximumAge: 250,
            enableHighAccuracy: true
        });
    }

    this.setPositionMarker = function(result) {
        // Pulsing marker inspired by
        // http://blog.thematicmapping.org/2014/06/real-time-tracking-with-spot-and-leafet.html
        return {
            radius: 5,
            color: 'orange',
            fillColor: '#22568f',
            fillOpacity: 0.9,
            latlngs: result,
            type: 'circleMarker',
            className: 'leaflet-live-user',
            strokeWidth: 9
        };
    }
})