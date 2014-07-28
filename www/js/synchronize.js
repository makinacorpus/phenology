'use strict';

angular.module('synchronize', ['ngStorageTraverser', 'ngApiClient', 'ngAuthApiClient', 'home.controllers'])

.service('synchronizeService', function(storageTraverser, apiClient, authApiClient, surveyService, $q){
    var self = this;

    this.loadUserSettings = function(userid) {
        if(!storageTraverser.traverse('/users')) {
            storageTraverser.traverse('/')['users'] = {};
        }
        console.log("Load data for "+userid);
        // FAKE DATA
        var demo_data = {
                'species': [
                    {
                        'name': "Noisetier",
                        'id': 'spec1',
                        'stages': [
                            {
                                'id': 'stageA1',
                                'name': "Flowering",
                                'date_start': '2014/01/15',
                                'date_end': '2014/03/31',
                                'month_start': '1',
                                'day_start': '15',
                                'month_end': '3',
                                'day_end': '31',
                                'order': "1",
                            },
                            {
                                'id': 'stageA2',
                                'name': "Blooming",
                                'date_start': '2014/02/15',
                                'date_end': '2014/04/30',
                                'month_start': '2',
                                'day_start': '15',
                                'month_end': '4',
                                'day_end': '30',
                                'order': "2",
                            },
                            {
                                'id': 'stageA3',
                                'name': "Leafing",
                                'date_start': '2014/03/15',
                                'date_end': '2014/05/31',
                                'month_start': '3',
                                'day_start': '15',
                                'month_end': '5',
                                'day_end': '31',
                                'order': '3'
                            }
                        ]
                    },
                    {
                        'name': "Flower B",
                        'id': 'spec2',
                        'stages': [
                            {
                                'id': 'stageB1',
                                'name': "Blooming",
                                'order': '1'
                            },
                            {
                                'id': 'stageB2',
                                'name': "Fall",
                                'order': '2'
                            },
                            {
                                'id': 'stageB4',
                                'name': "End",
                                'order': '3'
                            }

                        ]
                    },
                    {
                        'name': "Tussilage",
                        'id': 'spec3',
                        'stages': [
                            {
                                'id': 'stageC1',
                                'name': 'Flowering',
                                'date_start': '2014/02/10',
                                'date_end': '2014/05/31',
                                'month_start': '3',
                                'day_start': '15',
                                'month_end': '5',
                                'day_end': '31',
                                'order': '3'
                            }
                        ]
                    }
                ],
                'areas': [
                    {
                        'name': "Deep forest",
                        'id': 'area1',
                        'species': [
                            {
                                'id': 'spec1',
                                'individuals': [
                                    {
                                        'id': 'ind1',
                                        'name': "Flower A 1"
                                    },
                                    {
                                        'id': 'ind2',
                                        'name': "Flower A 2"
                                    },
                                ]
                            },
                            {
                                'id': 'spec2',
                                'individuals': [
                                    {
                                        'id': 'ind1',
                                        'name': "Flower B 1"
                                    },
                                    {
                                        'id': 'ind2',
                                        'name': "Flower B 2"
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        'name': "Area 2",
                        'id': 'area2',
                        'species': [
                            {
                                'id': 'spec1',
                                'individuals': [
                                    {
                                        'id': 'ind1',
                                        'name': "Tree A 1"
                                    },
                                    {
                                        'id': 'ind2',
                                        'name': "Tree A 2"
                                    },
                                ]
                            },
                            {
                                'id': 'spec2',
                                'individuals': [
                                    {
                                        'id': 'ind1',
                                        'name': "Tree B 1"
                                    },
                                    {
                                        'id': 'ind2',
                                        'name': "Tree B 2"
                                    },
                                ]
                            }
                        ]
                    }
                ]
        }

        return apiClient.get_user_settings().$promise.then(function(data){
            var userid = authApiClient.getUsername();

            if(storageTraverser.traverse('/users/'+userid)){
                var current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations')||{}
            }
            else{
                var current_observations = {};
            }
            
            data.current_observations = current_observations;

            storageTraverser.traverse('/users/'+userid, {
                            create: true,
                            data: data
            });

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

    this.uploadLocalSurveys = function(){
        var userid = authApiClient.getUsername();
        var current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations');
        return self.uploadSurveys(current_observations);
    };

    this.uploadSurveys =function(surveys){
        var userid = authApiClient.getUsername();
        var validated_observations = [];
        var deferred = $q.defer();
        angular.forEach(surveys, function(value, key){
            if(value.validated === true){
                this.push({
                    'key': key,
                    'date': value.surveyDate,
                    'stage': value.stageId,
                    'individual': value.indId,
                    'area': value.areaId,
                    'species': value.specId,
                    'id': value.id
                });    
            }
        },validated_observations);
        for (var i = 0; i < validated_observations.length; i++) {
            var obs = validated_observations[i];
            var id = surveyService.getSurveyId(obs);
            if ( angular.isDefined(obs.id) ) {
                var promise = apiClient.save_survey(obs).$promise;
            }
            else{
                var promise =  apiClient.create_survey(obs).$promise;
            }
            promise.then(function(data){
                storageTraverser.traverse('/users/' + userid + '/current_observations/' + id, { delete: true });
            })
        };
    }

});