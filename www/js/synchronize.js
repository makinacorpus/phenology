'use strict';

angular.module('synchronize', ['ngStorageTraverser'])

.service('synchronizeService', function(storageTraverser){
    var self = this;

    this.loadUserSettings = function(userid) {
        if(!storageTraverser.traverse('/users')) {
            storageTraverser.traverse('/')['users'] = {};
        }
        console.log("Load data for "+userid);
        // FAKE DATA
        // TODO: call REST API
        storageTraverser.traverse('/users/'+userid, {
            create: true,
            data: {
                observations: [],
                current_observations: [],
                species: [
                    {
                        title: "Flower A",
                        id: 'spec1',
                        stages: [
                            {
                                id: 'stage1',
                                title: "Blooming"
                            },
                            {
                                id: 'stage2',
                                title: "Fall"
                            }
                        ]
                    },
                    {
                        title: "Flower B",
                        id: 'spec2',
                        stages: [
                            {
                                id: 'stage1',
                                title: "Blooming"
                            },
                            {
                                id: 'stage2',
                                title: "Fall"
                            }
                        ]
                    }
                ],
                areas: [
                    {
                        title: "Deep forest",
                        id: 'area1',
                        species: [
                            {
                                id: 'spec1',
                                individuals: [
                                    {
                                        id: 'ind1',
                                        title: "Flower A 1"
                                    },
                                    {
                                        id: 'ind2',
                                        title: "Flower A 2"
                                    },
                                ]
                            },
                            {
                                id: 'spec2',
                                individuals: [
                                    {
                                        id: 'ind1',
                                        title: "Flower B 1"
                                    },
                                    {
                                        id: 'ind2',
                                        title: "Flower B 2"
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        title: "Area 2",
                        id: 'area2',
                        species: [
                            {
                                id: 'spec1',
                                individuals: [
                                    {
                                        id: 'ind1',
                                        title: "Tree A 1"
                                    },
                                    {
                                        id: 'ind2',
                                        title: "Tree A 2"
                                    },
                                ]
                            },
                            {
                                id: 'spec2',
                                individuals: [
                                    {
                                        id: 'ind1',
                                        title: "Tree B 1"
                                    },
                                    {
                                        id: 'ind2',
                                        title: "Tree B 2"
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        });
    };

});