'use strict';

angular.module('phenology.map', ['phenology.survey', 'ngStorageTraverser'])

.controller('MapCtrl', function($scope, $geolocation, $rootScope, $log, $location, authApiClient, $stateParams, leafletData, $ionicPopup, storageTraverser, speciesService, mapService, $timeout, toolService){

    var user = authApiClient.getUsername(),
        areaId = $stateParams.areaId,
        class_tmp = ['positive', 'energized', 'assertive', 'royal', 'dark'];
    
    mapService.watchPosition();

    angular.extend($scope,{
            areas: storageTraverser.traverse("/users/" + user + "/areas"),
            defaults: {
                zoomControl: false
            },
            filter: {
                showOnlyNeeded: "true"
            },
            tiles: {
                url: mapService.getBackGroundUrl(),
                options: {}
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
            } **/
        }
    );

    if(!(angular.isDefined(areaId) && areaId !== "")){
        areaId = $stateParams.areaId = $scope.areas[0].id;
    }

    $scope.area = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
    );
    
    $scope.center = {
        lat: +$scope.area.lat,
        lng: +$scope.area.lon,
        zoom: 7
    };

    $timeout(function() {

        var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id),
            filtered = {},
            all_individuals = {};

        $scope.geojson = {
            data: (Object.keys($scope.area.geojson).length > 0) ? $scope.area.geojson : undefined,
            style: {
                fillColor: "green",
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.2,
            }
        };

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
        });

        $scope.individuals = filtered;

        $scope.$watch('filter.showOnlyNeeded', function(newvalue, oldvalue) {
            $scope.individuals = (newvalue === "false") ? all_individuals : filtered;
        }, true);

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

        mapService.centerMap($scope.geojson.data);

    }, 100);

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

.controller('GlobalMapCtrl', function($scope, $location, authApiClient, leafletData, $timeout, mapService){
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
        var features = mapService.getAreaFeatures(user);

        $scope.geojson = {
                data:  {
                    type: "FeatureCollection",
                    features: features
                },
                style: {
                    fillColor: "green",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.2,
                }
        };

        //$scope.markers = mapService.getCenterMarkers(features);

        mapService.centerMap($scope.geojson.data);
    }, 100);

    $scope.$on('leafletDirectiveMarker.dblclick', function(event, args){
        $location.path(
            String.format('/app/map/{0}', args.leafletEvent.latlng.id)
        );
    });

    $scope.$on('leafletDirectiveMap.geojsonClick', function(event, geojson) {
        $location.path(
            String.format('/app/map/{0}', geojson.properties.id)
        );
    });

    // get leaflet height using the ionic content height
    $scope.height = function(){
        return document.querySelectorAll(".has-header")[0].offsetHeight;
    }

})

.service('mapService', function(storageTraverser, surveyService, leafletData, $geolocation, toolService){
    var self = this;
    this.getAreaFeatures = function(user){
        var areas = storageTraverser.traverse("/users/" + user + "/areas");

        var features = areas.map(function(area){ 
            var feature = angular.copy(area.geojson.features[0]);
            feature.properties.name = area.name;
            feature.properties.id = area.id;
            return feature;
        });

        return features;
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
        return (window.cordova) ? toolService.mobile_background_url : toolService.remote_background_url;
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