'use strict';

angular.module('survey.controllers', ['synchronize', 'ngStorageTraverser', 'ngAuthApiClient', 'ngCordova'])

.controller('AreasCtrl', function($scope, storageTraverser, authApiClient, $state) {
    $scope.areas = storageTraverser.traverse('/users/' + authApiClient.getUsername() +'/areas') || {};
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $location) {
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;
    $scope.areas = storageTraverser.traverse("/users/" + user + "/areas");

    if(!(angular.isDefined(areaId) && areaId !== "")){
        areaId = $scope.areas[0].id;
        $stateParams.areaId = areaId;
    }

    $scope.area = storageTraverser.traverse(        
        String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
    );

    var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id);
    var filtered = [];

    angular.forEach(all_species, function(item, id){
        all_species[id].toggle = false;
        if(angular.isDefined(item.tasks) && item.tasks.length > 0) {
            this.push(angular.copy(item));
        }
    }, filtered);

    if(filtered.length === 1){
        filtered[0].toggle = true;
    }


    $scope.filter = { showOnlyNeeded : "true" };

    // watch changes and store
    $scope.$watch('filter.showOnlyNeeded', function(newvalue, oldvalue) {
        $scope.species = (newvalue === "false") ? all_species : filtered;
    }, true);

    $scope.switchArea = function(area){
        $location.path(
            String.format('/app/species/{0}', area.id)
        );
    }
})

.controller('LastSurveyCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $location, $log) {
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;
    var observations = storageTraverser.traverse("/users/" + user + "/observations");
    $scope.areas = speciesService.getAreaSpecies(user);
    $log.info($scope.areas);
})

.controller('UploadCtrl', function($scope, authApiClient, storageTraverser, surveyService, synchronizeService) {
    var user = authApiClient.getUsername();
    var stored_observations = storageTraverser.traverse("/users/" + user + "/current_observations") || {};
    var observations = angular.copy(stored_observations);
    $scope.observations  = [];
    angular.forEach(observations, function(obs){
         if(obs.validated === true){
             obs.area_name = surveyService.getAreaName(user, obs.areaId)
             obs.species_name = surveyService.getSpeciesName(user, obs.specId);
             obs.stage_name = surveyService.getStageName(user, obs.specId, obs.stageId);
             obs.individual_name = surveyService.getIndivualName(user, obs.areaId, obs.specId, obs.indId);
             this.push(obs);
        }
    }, $scope.observations);
    $scope.test = { obs_checked: []};
    $scope.uploadSurveys = function(){
        var surveys = $scope.observations.filter(function(item){
            return item.checked === true;
        });
        synchronizeService.uploadSurveys(surveys);

    }
    //$scope.areas = speciesService.getAreaSpecies(user);
})

.controller('SurveyCtrl', function($scope, $rootScope, $stateParams, storageTraverser, $ionicSlideBoxDelegate, surveyService, authApiClient, $ionicModal, $log, $location, toolService) {
    var stage, stageId;
    var user = authApiClient.getUsername();
    
    //get species
    var species = storageTraverser.traverse(
        String.format('/users/{0}/species/[id="{1}"]', user, $stateParams.specId)
    );

    $scope.stages = species.stages;

    // get individual
    $scope.individual = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]', user, $stateParams.areaId, $stateParams.specId, $stateParams.indId)
    );

    var stage = surveyService.getStage($stateParams.stageId, species);
    var stageId = stage.id;

    var params = {
            areaId: $stateParams.areaId,
            specId: $stateParams.specId,
            indId: $stateParams.indId,
            stageId: stageId
    };

    $scope.survey = surveyService.getSurvey(user, params);
    $scope.survey.stage = stage;

    $scope.status = {};

    $scope.current_stage = $scope.survey.stage;
    $scope.current_picture = $scope.current_picture;

    // watch changes and store
    $scope.$watch('survey', function(newvalue, oldvalue) {
        if (oldvalue !== newvalue){
            if(!(oldvalue.validated === false && newvalue.validated === true)){
                newvalue.validated = false;
                delete newvalue["identifier"];
            }
            surveyService.storeSurvey(user, $scope.survey);
        }
    }, true);

    $ionicModal.fromTemplateUrl('templates/datemodal.html',
        function(modal) {
            $scope.datemodal = modal;
        },
        {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'

        }
    );

    $scope.opendateModal = function() {
      $scope.datemodal.show();
      //$scope.datemodal.scope.myDate = $scope.survey.beforeDate;
    };
    $scope.closedateModal = function(model) {

      $scope.survey.beforeDate = model;
      //$scope.$apply();

      $scope.datemodal.hide();

    };
    // switch stage
    $scope.switchStage = function(stage){
        $location.path(
            String.format('/app/survey/{0}/{1}/{2}/{3}',$scope.survey.areaId, $scope.survey.specId, $scope.survey.indId, stage.id)
        );
    };

    // validate button
    $scope.validate = function() {
        $scope.survey.validated = true;
    };

})
.controller('MapCtrl', function($scope, $rootScope, $log, $location, authApiClient, $stateParams, leafletData, storageTraverser, speciesService, $timeout, toolService){
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;

    angular.extend($scope,{
            areas: storageTraverser.traverse("/users/" + user + "/areas"),
            filter: {
                showOnlyNeeded: "true"
            },
            defaults: {
                zoomControl: false,
            },
            individuals: {}
        }
    );

    if(!(angular.isDefined(areaId) && areaId !== "")){
        areaId = $stateParams.areaId = $scope.areas[0].id;
    }

    $scope.area = storageTraverser.traverse(        
        String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
    );

    $timeout(function() {
        var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id);
        var filtered = {};
        var all_individuals = {};
        var class_tmp = ['positive', 'energized', 'assertive', 'royal', 'dark']

        angular.forEach(all_species, function(species, id){

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

            angular.forEach(species.individuals, function(individual, key){
                if((angular.isDefined(individual.lat) && individual.lat!=1) && angular.isDefined(individual.lon)){
                    all_individuals[individual.id+""] = {
                        lat: +individual.lat,
                        lng: +individual.lon,
                        icon: toolService.create_div_icon(class_tmp[id]),
                        tasks: species.tasks,
                        enable: ['click'],
                        message: "<p><h4>" + individual.name + "</h4><br><span><a href='#/app/survey/"+ areaId +"/"+ species.id +"/" + individual.id + "'>saisir l'observation</a></span></p>"
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

         leafletData.getMap().then(function(map) {
             var currentBounds = L.geoJson($scope.geojson.data).getBounds();
             map.fitBounds(currentBounds);
        });
    }, 100);

    $scope.center = {
        lat: +$scope.area.lat,
        lng: +$scope.area.lon,
        zoom: 7
    }

    $scope.switchArea = function(area){
        $location.path(
            String.format('/app/map/{0}', area.id)
        );
    }
})
.controller('GlobalMapCtrl', function($scope, $location, authApiClient, leafletData, storageTraverser, speciesService, $timeout){
    var user = authApiClient.getUsername();

    angular.extend($scope,{
            defaults: {zoomControl: false},
            markers: {},
            geojson: undefined
        }
    );

    $timeout(function() {
        var areas = storageTraverser.traverse("/users/" + user + "/areas");
        var features = areas.map(function(area){ return area.geojson.features[0] })

        $scope.geojson = {
                data:  {
                    type: "FeatureCollection",
                    features: features
                },
                style: {
                    fillColor: "red",
                    weight: 2,
                    opacity: 1,
                    color: 'red',
                    dashArray: '5',
                    fillOpacity: 1,
                }
        };

        $scope.markers = features.map(function(feature){
            return L.geoJson(feature).getBounds().getCenter();
        });

        leafletData.getMap().then(function(map) {
             map.fitBounds(L.geoJson($scope.geojson.data).getBounds());
        });

    }, 100);

    // get leaflet height using the ionic content height
    $scope.height = function(){
        return document.querySelectorAll(".has-header")[0].offsetHeight;
    }
})
.service('speciesService', function(storageTraverser, surveyService, toolService){
    var self = this;
    this.getTaskForSpecies = function(species){
        var tasks = [];
        var today = new Date("2014-02-20");//surveyService.today();
        angular.forEach(species.stages, function(stage){
            var date_start = new Date(stage.date_start);
            var date_end = new Date(stage.date_end);
            if(today >= date_start && today <= date_end){
                this.push(stage);
            }
        }, tasks);
        return tasks;
    }
    this.getSpecies = function(user, area) {
        var areaSpecies = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species', user, area));
        var species = [];
        for(var i=0; i<areaSpecies.length; i++) {
            species[i] = angular.copy(areaSpecies[i]);
            var speciesInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]', user, species[i].id));
            species[i].stages = speciesInfo.stages.slice();
            species[i].tasks = self.getTaskForSpecies(speciesInfo);
            species[i].name = speciesInfo.name;
            species[i].picture = toolService.getFullPictureUrl(speciesInfo.picture);
            species[i].individuals = self.getIndivuals(user, area, species[i].id)
        }
        return species;
    }
    this.getIndivuals = function(user, area, species){
        var storedInds = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals', user, area, species));
        var stages = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages', user, species));
        var individuals = [];
        angular.forEach(storedInds, function(item, key){
            
            var ind_tmp = angular.copy(item);
            var surveys = []
            angular.forEach(stages, function(stage, key2){
                var local_observation = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}-{2}-{3}-{4}', user, area, species, ind_tmp.id, stage.id))
                if(angular.isUndefined(local_observation)){
                    local_observation = storageTraverser.traverse(String.format('/users/{0}/observations/[identifier="{1}-{2}-{3}-{4}"]', user, area, species, ind_tmp.id, stage.id));
                }
                var observation = angular.copy(local_observation);

                if(angular.isDefined(observation)){
                    var stageInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]', user, species, stage.id));
                    observation.name = stageInfo.name;
                    this.push(observation);
                }
            },surveys);            
            ind_tmp.surveys = surveys;

            this.push(ind_tmp);
        }, individuals);
        return individuals;
    }
    this.getAreaSpecies = function(user){
        var areasLocal = storageTraverser.traverse(String.format('/users/{0}/areas', user))
        var areas = [];
        angular.forEach(areasLocal, function(area){
            var tmp = area;
            tmp.species = self.getSpecies(user, area.id);
            this.push(tmp);
        }, areas)
        return areas;
    }
})

.service('surveyService', function(storageTraverser, $log, toolService){
    var self = this;
    this.getSurveyId = function(data) {
        var areaId = data.areaId || data.area;
        var specId = data.specId || data.species;
        var indId = data.indId || data.individual;
        var stageId = data.stageId || data.stage;
        return String.format('{0}-{1}-{2}-{3}',
            areaId,
            specId,
            indId,
            stageId
        )
    };
    this.storeSurvey = function(user, data) {
        var data = angular.copy(data);
        data.surveyDate = (data.when == 'before') ? data.beforeDate : toolService.today();
        delete data["stage"];
        delete data["identifier"];
        var surveyId = self.getSurveyId(data);
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId] = data;
        $log.debug("updated")
    };
    this.validateSurvey = function(user, data) {
        var surveyId = self.getSurveyId(data);
        $log.debug("validate")
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId]['validated'] = true;
    };
    this.getSurveyLocalInfo = function(user, surveyId){
        // inject existing data if any (and change today to before if no sync since last day)
        var data = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}', user, surveyId));
        if (angular.isUndefined(data)) {
            data = storageTraverser.traverse(String.format('/users/{0}/observations/[identifier="{1}"]', user, surveyId)) || {}
        }
        data.beforeDate = data.surveyDate;
        if(angular.isDefined(data.beforeDate)){
            data.when = 'today';
        }
        data.when = data.when;
        if(data.when=='today' && data.surveyDate != toolService.today()) {
            data.when = 'before';
        }
        return data;
    };
    this.getSurvey = function(user, params){
        var survey = params;

        var surveyId = self.getSurveyId(survey);

        var data = self.getSurveyLocalInfo(user, surveyId);

        angular.extend(survey, {
            beforeDate: data.beforeDate,
            surveyDate: data.surveyDate,
            isPassed: data.isPassed,
            isLost: data.isLost, 
            when: data.when,
            identifier: data.identifier,
            status: data.status || [],
            id: data.id,
            validated: data.validated || false,
        })
        return survey;
    };
    this.getStage = function(stageId, species){
        // get stage
        var stage = undefined;
        if(!angular.isDefined(stageId)){
            stage = species.stages[0];
            var stage_tmp = species.stages.filter(function(item){return item.id==stageId;})[0];
        }
        else{
            stage = species.stages.filter(function(item){return item.id==stageId;})[0];
        }
        stage = angular.copy(stage);
        stage.picture_before = toolService.getFullPictureUrl(stage.picture_before);
        stage.picture_current = toolService.getFullPictureUrl(stage.picture_current);
        stage.picture_after = toolService.getFullPictureUrl(stage.picture_after);

        return stage;
    }
    this.getAreaName=function(user, areaId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/name', user, areaId));
    }
    this.getSpeciesName=function(user, speciesId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/name', user, speciesId));
    }
    this.getStageName=function(user, speciesId, stageId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]/name', user, speciesId, stageId));
    }
    this.getIndivualName=function(user, areaId, speciesId, indId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]/name', 
                                                        user, areaId, speciesId, indId));
    }
})
.service('toolService', function(storageTraverser, authApiClient, $cordovaFile, $http, $log, $q){
    var self = this;
    this.mobile_root_path = 'cdvfile://localhost/persistent'
    this.mobile_path = 'cdvfile://localhost/persistent/phenology';
    this.create_div_icon = function(additional_class) {
        return {
                type: 'div',
                iconAnchor: [13, 52],
                popupAnchor: [0, -32],
                className: 'icon ion-android-location mymarker ' + additional_class,
                html: ''
            }
    }
    this.today = function() {
        var today = new Date();
        return today.toISOString().slice(0, 10);
    }
    this.getRootCordovaUrl = function(){
        return self.mobile_path + '/';
    }
    this.getMediaUrl = function(){
        return authApiClient.backend_url + '/media/';
    } 
    this.getFullPictureUrl = function(picture_url){
        var root_url = (angular.isDefined(window.cordova)) ? self.getRootCordovaUrl() : self.getMediaUrl();
        return root_url + picture_url;
    }
    this.downloadPicture = function(relativePath){
        var path = self.getRootCordovaUrl() + relativePath;
        var url = self.getMediaUrl() + relativePath;
        return self.downloadFile(url, path, false);
    }
    //thanks to Natsu
    this.downloadFile = function(url, filepath, forceDownload) {

        if (angular.isDefined(forceDownload) && forceDownload === false) {
            var relativePath = filepath.replace(self.mobile_root_path + '/', '');
            return $cordovaFile.readFileMetadata(relativePath)
            .then(function(file) {
                // If there is a file, we check on server if file was modified
                // by using HTTP header 'If-Modified-Since'
                var lastModifiedDate = new Date(file.lastModifiedDate),
                    config = {
                        headers: {
                        'If-Modified-Since': lastModifiedDate.toUTCString()
                        }
                    };
                // NOTICE
                // We have used $http service because we needed 'If-Modified-Since' HTTP header,
                // and cordova plugin file transfer (used by $cordovaFile.downloadFile) doesn't manage it properly.
                // In case on 304, response body is empty, and cordova plugin overwrites previous data with empty file...
                // https://issues.apache.org/jira/browse/CB-7006
                return $http.get(url, config)
                .then(function(response) {
                    // Response is 2xx
                    // It means that server file is more recent than device one
                    // We download it so !
                    // We could have used $cordovaFile 'writeFile' function, as response contains our data,
                    // but we prefer 'downloadFile' call to be consistent with other cases.
                    return $cordovaFile.downloadFile(url, filepath);
                }, function(response) {
                    var status = response.status,
                    deferred = $q.defer();
                    if (status === 304) {
                        // If status is 304, it means that server file is older than device one
                        // Do nothing.
                        var msg = 'File not changed (304) : ' + url + ' at ' + filepath;
                        $log.info(msg);
                        deferred.resolve({message: msg, type: 'connection', data: {status: status}});
                    }
                    else {
                        // If status is different than 304, there is a connection problem
                        // We can't connect to URL
                        if (status === 0) {
                            $log.info('Network unreachable');
                            deferred.reject({message: 'Network unreachable', type: 'connection', data: {status: status}});
                        }
                        else {
                            $log.info('Response error status ' + status);
                            deferred.reject({message: 'Response error ', type: 'connection', data: {status: status}});
                        }
                    }
                    return deferred.promise;
                });
                }, function() {
                    // If there is no file with that path, we download it !
                    $log.info('cannot read ' + filepath + ' so downloading it !' + relativePath);
                    return $cordovaFile.downloadFile(url, filepath);
                });
        }
        else {
                $log.info('forcing download of ' + url);
                return $cordovaFile.downloadFile(url, filepath)
            }  
        };
});