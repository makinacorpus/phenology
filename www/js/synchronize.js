'use strict';

angular.module('synchronize', ['ngStorageTraverser', 'ngApiClient', 'ngAuthApiClient'])

.service('synchronizeService', function(storageTraverser, apiClient, authApiClient){
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
        apiClient.get_user_settings().$promise.then(function(data){
            storageTraverser.traverse('/users/'+userid, {
                            create: true,
                            data: data
                        });
         if (!storageTraverser.traverse('/users/'+userid+'/"current_observations')){
            storageTraverser.traverse('/users/'+userid)['current_observations'] = {}
         }
       });

    };

    this.uploadLocalSurveys = function(){
        var userid = authApiClient.getUsername();
        var current_observations = storageTraverser.traverse('/users/'+userid+'/current_observations');
        var validated_observations = [];
        angular.forEach(current_observations, function(value, key){
            if(value.validated === true){
                console.log(value);
                this.push({
                    'key': key,
                    'date': value.surveyDate,
                    'stage': value.stageId,
                    'individual': value.indId
                });    
            }
        },validated_observations);

        for (var i = 0; i < validated_observations.length; i++) {
            apiClient.create_survey(validated_observations[i]);
        };
        console.log(validated_observations);
        //console.log(current_observatioss);
        //var validated_observations = current_observations.filter(function(item){return item.validated === true});
        //var validated_submit_surveys = validated_observations.map(function(item){
         //   var tmp = {}
         //   console.log(item);
        //})
    };

});