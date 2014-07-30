'use strict';

angular.module('snowing.controllers', ['ngStorageTraverser', 'ngAuthApiClient'])

.controller('SnowingCtrl', function($scope, storageTraverser, authApiClient, snowingService) {
    var userid = authApiClient.getUsername();
    
    var areas = snowingService.getAreas(userid);
    var snowings_tmp = {};

    //initial data
    angular.forEach(areas, function(area){
        snowings_tmp[area.id] = {
            areaId: area.id,
            areaName: area.name,
            height: undefined
        }
    });

    $scope.snowings = snowings_tmp;
    
    $scope.validate = function(){
        //init date
        var date = new Date();
        //array
        var snowings_filled = [];
        //just keep filled inputs
        angular.forEach($scope.snowings, function(snowing){
            // add date
            snowing.date = date;
            // criteria
            if(angular.isDefined(snowing.height)){
                this.push(snowing);
            }
        }, snowings_filled);

        //store in localstorage
        snowingService.storeSnowing(userid, snowings_filled);
    };
})

.service('snowingService', ['storageTraverser', function(storageTraverser){
    var self = this;

    //get user areas localstorage values
    this.getAreas = function(userId){
        return storageTraverser.traverse(String.format('/users/{0}/areas', userId));
    }

    //function to store list of snowings in localstorage
    this.storeSnowing = function(userId, snowings){
        var path = String.format('/users/{0}/snowcovers', userId);
        if (!storageTraverser.traverse(path)){
            //array
            storageTraverser.traverse('/users/' + userId)["snowcovers"] = [];
        }
        var snow_covers = storageTraverser.traverse('/users/' + userId + '/snowcovers');
        angular.forEach(snowings, function(snowing){
            snow_covers.push(snowing);
        });
    }
}])