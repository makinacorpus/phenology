'use strict';

angular.module('phenology.synchronize', ['ngStorageTraverser', 'phenology.survey'])

.controller('UploadCtrl', function($scope, authApiClient, storageTraverser, surveyService, synchronizeService) {
    var user = authApiClient.getUsername(),
        stored_observations = storageTraverser.traverse("/users/" + user + "/current_observations") || {},
        observations = angular.copy(stored_observations);
    
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
})

.service('synchronizeService', function(storageTraverser, apiClient, authApiClient, surveyService, $q, $log, toolService, $ionicPopup, $ionicLoading, $cordovaNetwork){
    var self = this;

    this.loadUserSettings = function(userid) {

        if(!storageTraverser.traverse('/users')) {
            storageTraverser.traverse('/')['users'] = {};
        }

        console.log("Load data for "+userid);

        return apiClient.get_user_settings().$promise.then(function(data){
            var userid = authApiClient.getUsername();
            var current_observations = {};
            var snowcovers = [];
            if(storageTraverser.traverse('/users/'+userid)){
                current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations')||{}
                snowcovers = storageTraverser.traverse('/users/'+userid+'/snowcovers')||[]
            }

            data.current_observations = current_observations;
            data.snowcovers = snowcovers;

            storageTraverser.traverse('/users/'+userid, {
                            create: true,
                            data: data
            });
            var species = storageTraverser.traverse('/users/' + userid + '/species');
            angular.forEach(species, function(spec){
                spec.stages.sort(function(a, b){
                    return +a.order - +b.order;
                })
            });
            if(angular.isDefined(window.cordova)){
                angular.forEach(species, function(spec){
                    toolService.downloadPicture(spec.picture);
                    angular.forEach(spec.stages, function(stage){
                        toolService.downloadPicture(stage.picture_before);
                        toolService.downloadPicture(stage.picture_current);
                        toolService.downloadPicture(stage.picture_after);
                    });
                });
                toolService.downloadTiles('global.zip');
                var areas = storageTraverser.traverse('/users/' + userid + '/areas');
                angular.forEach(areas, function(area){
                    toolService.downloadTiles("area_" + area["id"] + ".zip");
                });
            }

            return apiClient.get_user_surveys().$promise.then(function(surveys_data){
                var surveys = [];
                angular.forEach(surveys_data, function(survey){
                    var survey_tmp = {
                        id: survey.id,
                        stageId: survey.stage,
                        specId: survey.species,
                        indId: survey.individual,
                        areaId: survey.area,
                        surveyDate: survey.date,
                        answer: survey.answer,
                        validated: true
                    }
                    // get identifier
                    survey_tmp['identifier'] = surveyService.getSurveyId(survey_tmp);
                    // remove local observations in order to avoid conflicts
                    if (storageTraverser.traverse('/users/' + userid + '/current_observations/' + survey_tmp['identifier'])){
                        storageTraverser.traverse('/users/' + userid + '/current_observations/' + survey_tmp['identifier'], { delete: true });
                    }
                    this.push(survey_tmp);
                }, surveys);

                storageTraverser.traverse('/users/'+userid+'/observations', {
                                create: true,
                                data: surveys
                });

            });
       });

    };

    this.synchronize = function(){
        var userid = authApiClient.getUsername(),
            promises = [],
            typeNetwork = "computer",
            isOnline = undefined,
            defer = $q.defer();

        if(angular.isDefined(navigator.connection)){
            typeNetwork = $cordovaNetwork.getNetwork();
            isOnline = $cordovaNetwork.isOnline();
        }

        promises.push(self.uploadLocalSurveys());
        promises.push(self.uploadLocalSnowings());
        $ionicLoading.show();

        return $q.all(promises).then(function(test){
            console.log("loading user settings, promise")
            return self.loadUserSettings(userid);
        }).catch(function(event){
            var message = "Error";
            if( angular.isDefined(isOnline) && isOnline === false){
                message = "Network is unreachable, turn on the network to be able to synchronize."
            }
            else if(event.status == "0"){
                message = "login.error.no_connexion";
            }
            return $q.reject(message);

        }).finally(function(){
            $ionicLoading.hide();
        })
    };

    this.uploadLocalSurveys = function(){
        var userid = authApiClient.getUsername();
        var current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations');
        return self.uploadSurveys(current_observations);
    };

    this.uploadSurveys =function(surveys){
        var userid = authApiClient.getUsername();
        var validated_observations = [];
        var promises = [];
        var promise;

        angular.forEach(surveys, function(value, key){
            if(value.validated === true) {
                var answer = value.when;
                if(answer == 'today' || answer == 'before') {
                    answer = 'isObserved';
                }
                var obs = {
                    'key': key,
                    'date': value.surveyDate,
                    'stage': value.stageId,
                    'individual': value.indId,
                    'area': value.areaId,
                    'species': value.specId,
                    'answer': answer,
                    'id': value.id // undefined if creation
                };

                // update or create depending to id
                promise = (angular.isDefined(obs.id)) ? apiClient.save_survey(obs).$promise : apiClient.create_survey(obs).$promise;

                promises.push(promise);
            }
        });

        return $q.all(promises).then(function(datas){
            angular.forEach(datas, function(data){
                var surveyId = surveyService.getSurveyId(data);
                storageTraverser.traverse('/users/' + userid + '/current_observations/' + surveyId, { delete: true });
            });
        });
    }

    this.uploadLocalSnowings = function(){
        var userid = authApiClient.getUsername();
        var snowings = storageTraverser.traverse('/users/'+userid+'/snowcovers')||[];
        var promises = [];
        var promise;

        angular.forEach(snowings, function(value, key){
                var date = new Date(value.date);
                var snow = {
                    'date': date.format("yyyy-MM-dd h:mm:ss"),
                    'area': value.areaId + "",
                    'height': parseFloat(value.height),
                };
                // update or create depending to id
                promise = apiClient.create_snowcover(snow);
                promises.push(promise);
        });

        return $q.all(promises).then(function(){
            storageTraverser.traverse('/users/' + userid + '/snowcovers', { delete: true });
        });
    };

    this.getNbItemsToSync = function(){
        var userid = authApiClient.getUsername();
        var nb = 0;
        var current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations')||[];
        angular.forEach(current_observations, function(element, i ){
            if(element.validated === true){
                nb += 1;
            }
        })
        return nb;
    }
});