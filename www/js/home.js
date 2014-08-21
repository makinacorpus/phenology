'use strict';

angular.module('home.controllers', ['synchronize','ngAuthApiClient', 'ngStorage', 'survey.controllers', 'ngStorageTraverser'])

.controller('HomeCtrl', function($scope, synchronizeService, $localStorage, storageTraverser, authApiClient, HomeService, $ionicLoading, $ionicPopup, $cordovaNetwork) {
    $scope.user = {};

    $scope.$watch(function() {
        return angular.toJson(storageTraverser.traverse("/sessions/current"));
    }, function() {
        $scope.user.upcomming_tasks = HomeService.getTasks(storageTraverser.traverse("/sessions/current/username"), true);
    });

    /**
    [
        { title: 'Watch bud stage next month'},
        { title: 'Watch tree growth before summertime'}
    ];**/
    /** TODO : 
    make it pretty
    add popup if all is ok
    add popup if fail
    **/

    $scope.synchronize = function(){
        var username = authApiClient.getUsername();
        if (username == ""){
            $scope.login().then(function(){
                 $scope.synchronize();
            })
        }
        else{
             synchronizeService.synchronize().then(function(event){
                $scope.user.upcomming_tasks = HomeService.getTasks(username, true);
            },function(event){
                console.log(event);
            });
        }
    };
})
.service('HomeService', function(storageTraverser, authApiClient, surveyService){
    
    var self = this;

    this.getTasks = function(username, withIndividuals){
        if(username){
            var ind = 1;
            //console.log(storageTraverser.traverse(String.format('/users/{0}/observations/[indId="{1}"]', username, ind)));
            var species = storageTraverser.traverse("/users/" + username + "/species");
            var tasks = [];

            //Fake to see some tasks
            var today = new Date("2014-02-20");

            angular.forEach(species, function(item, id){
                if(withIndividuals)
                    var individuals = self.getSpeciesIndividuals(username, item.id);
                
                angular.forEach(item.stages, function(item2, id2){
                    var date_start = new Date(item2.date_start);
                    var date_end = new Date(item2.date_end);
                    if(today >= date_start && today <= date_end){
                        var task = item2;
                        task.species_name = item.name;
                        task.species_id = item.id;
                        if(withIndividuals) {
                            task.individuals = [];
                            angular.forEach(individuals,function(ind){
                                var local = ind.stages.filter(function(a){
                                    return a.id === task.id
                                });
                                if (local.length === 0){
                                    ind.stageId = item2.id;
                                    this.push(ind);
                                }
                            },task.individuals);
                        }
                        this.push(task);
                    }
                }, tasks);
            });

            tasks.sort(function(a, b){ var a1=new Date(a.date_start); var b2=new Date(b.date_start); return a1-b2});
            return tasks;
        }
    }

    this.getSpeciesIndividuals = function(user, speciesid){
        var userData = storageTraverser.traverse("/users/" + user);
        var areas = userData.areas;
        var individuals = [];
        angular.forEach(areas,function(area, id){
            angular.forEach(area.species,function(species, id2){
                //console.log(species.id + "   " + speciesid);
                var tmp = species.individuals;
                tmp = tmp.map(function(element){
                    var ind = element;
                    ind.areaId = area.id;
                    ind.speciesId = species.id;
                    ind.indId = element.id;
                    return ind;
                });
                if(species.id == speciesid){
                    individuals = individuals.concat(tmp);
                }
            });
        });
        return individuals;
    }

})