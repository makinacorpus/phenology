'use strict';

angular.module('phenology.snowings', ['ngStorageTraverser', 'phenology.api'])

.controller('SnowingCtrl', function($scope, authApiClient, snowingService) {
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
        snowingService.validate(userid, $scope.snowings);
    };
})

.service('snowingService', ['storageTraverser', '$ionicPopup', '$translate', '$location', function(storageTraverser, $ionicPopup, $translate, $location){
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

    //validate and save 
    this.validate = function(userId, snowings){
        var date = new Date();
        //array
        var snowings_filled = [];
        var regex_error_found = false;
        //just keep filled inputs
        angular.forEach(snowings, function(snowing){
            // add date
            snowing.date = date;
            // criteria
            if(angular.isDefined(snowing.height)){
                if(!isNaN(parseFloat(snowing.height)) && isFinite(snowing.height)){
                    this.push(snowing);
                }
                else{
                    regex_error_found = true;
                }
            }
        }, snowings_filled);

        if(snowings_filled.length > 0 && !regex_error_found){
            //store in localstorage
            self.storeSnowing(userId, snowings_filled);
            //show a popup that confirms success
            $translate('sucess.title').then(function(title){
                $ionicPopup.alert({
                    title: title,
                    template: $translate('message.snowing_success')
                });
                //redirect to the homepage
                $location.path('/app/home');
            });
        }
        else{
            //show a popup that explains errors
            var template = (regex_error_found === true) ? 'error.not_number' : 'error.at_least_one';
            $translate('error.title').then(function(title){
                $ionicPopup.alert({
                    title: title,
                    template: $translate(template)
                });
            });
        }
    }

}])