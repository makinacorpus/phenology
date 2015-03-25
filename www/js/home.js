'use strict';

angular.module('phenology.home', ['phenology.synchronize','phenology.api', 'ngStorage', 'phenology.survey', 'ngStorageTraverser'])

.controller('HomeCtrl', function($scope, synchronizeService, $localStorage, storageTraverser, $translate, authApiClient, HomeService, $ionicLoading, $ionicPopup, $cordovaNetwork) {
    $scope.user = {};

    $scope.$watch(function() {
        return angular.toJson(storageTraverser.traverse("/sessions/current"));
    }, function() {
        $scope.user.username = authApiClient.getUsername();
        $scope.nbToSync = synchronizeService.getNbItemsToSync();
    });

    $scope.synchronize = function(){
        var username = authApiClient.getUsername();
        if (angular.isUndefined(username)){
            $scope.login().then(function(){
                $scope.synchronize();
            })
        }
        else{
            synchronizeService.synchronize().then(function(event){
                $scope.nbToSync = synchronizeService.getNbItemsToSync();
            },function(message){
              $ionicPopup.alert({
                  title: 'Error',
                  template: $translate(message)
              });
          });
        }
    };
})
.service('HomeService', function(storageTraverser, authApiClient, surveyService, tasksService){

    var self = this;

    this.getTasks = function(username){
        if(username){
            var species = storageTraverser.traverse("/users/" + username + "/species"),
                tasks = [],
                today = new Date();
            angular.forEach(species, function(item, id){
              var stages = tasksService.getTasksForSpecies(item);
              angular.forEach(stages, function(item2, id2){
                  var task = angular.copy(item2);
                  task.species_name = item.name;
                  task.species_id = item.id;
                  this.push(task);
              }, tasks);;
            });

            tasks.sort(function(a, b){
              var a1=new Date(today.getFullYear(), (+a.month_start)-1, a.day_start);
              var b2=new Date(today.getFullYear(), (+b.month_start)-1, b.day_start);
              return a1-b2});
            return tasks;
        }
    }

})
