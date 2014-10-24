'use strict';

angular.module('phenology.home', ['phenology.synchronize','phenology.api', 'ngStorage', 'phenology.survey', 'ngStorageTraverser'])

.controller('HomeCtrl', function($scope, synchronizeService, $localStorage, storageTraverser, authApiClient, HomeService, $ionicLoading, $ionicPopup, $cordovaNetwork) {
    $scope.user = {};

    $scope.$watch(function() {
        return angular.toJson(storageTraverser.traverse("/sessions/current"));
    }, function() {
        $scope.user.upcomming_tasks = HomeService.getTasks(storageTraverser.traverse("/sessions/current/username"));
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
        if (angular.isUndefined(username)){
            $scope.login().then(function(){
                $scope.synchronize();
            })
        }
        else{
            synchronizeService.synchronize().then(function(event){
                $scope.user.upcomming_tasks = HomeService.getTasks(username);
            });
        }
    };
})
.service('HomeService', function(storageTraverser, authApiClient, surveyService){
    
    var self = this;

    this.getTasks = function(username){
        if(username){
            var species = storageTraverser.traverse("/users/" + username + "/species");
            var tasks = [];

            //Fake to see some tasks
            var today = new Date();

            angular.forEach(species, function(item, id){
                angular.forEach(item.stages, function(item2, id2){
                    var date_start = new Date(item2.date_start);
                    var date_end = new Date(item2.date_end);
                    if(today >= date_start && today <= date_end){
                        var task = item2;
                        task.species_name = item.name;
                        task.species_id = item.id;
                        this.push(task);
                    }
                }, tasks);
            });

            tasks.sort(function(a, b){ var a1=new Date(a.date_start); var b2=new Date(b.date_start); return a1-b2});
            return tasks;
        }
    }
})