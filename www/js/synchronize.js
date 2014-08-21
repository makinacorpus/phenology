'use strict';

angular.module('synchronize', ['ngStorageTraverser', 'ngApiClient', 'ngAuthApiClient', 'home.controllers', 'survey.controllers'])

.service('synchronizeService', function(storageTraverser, apiClient, authApiClient, surveyService, $q, $log, toolService){
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
            if(angular.isDefined(window.cordova)){
                var species = storageTraverser.traverse('/users/' + userid + '/species');
                angular.forEach(species, function(spec){
                    toolService.downloadPicture(spec.picture);
                    angular.forEach(spec.stages, function(stage){
                        toolService.downloadPicture(stage.picture_before);
                        toolService.downloadPicture(stage.picture_current);
                        toolService.downloadPicture(stage.picture_after);
                    });
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
                        validated: true,
                    }
                    // get identifier
                    survey_tmp['identifier'] = surveyService.getSurveyId(survey_tmp);
                    // remove local observations in order to don't create conflict
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
        var userid = authApiClient.getUsername();
        var promises = [];
        promises.push(self.uploadLocalSurveys());
        promises.push(self.uploadLocalSnowings());
        return $q.all(promises).then(function(){
            return self.loadUserSettings(userid);
        });
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
            if(value.validated === true){
                var obs = {
                    'key': key,
                    'date': value.surveyDate,
                    'stage': value.stageId,
                    'individual': value.indId,
                    'area': value.areaId,
                    'species': value.specId,
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
            var snowcovers = storageTraverser.traverse('/users/' + userid + '/snowcovers')
            snowcovers = [];
        });
    };
})
