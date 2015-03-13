'use strict';

angular.module('phenology.snowings', ['ngStorageTraverser', 'phenology.api'])

.controller('SnowingCtrl', function($scope, authApiClient, snowingService, storageTraverser) {
    var userid = authApiClient.getUsername();
    
    var areas = snowingService.getAreas(userid);
    var snowings_tmp = {};

    //initial data
    var snow_covers = storageTraverser.traverse('/users/' + userid + '/snowcovers');

    angular.forEach(areas, function(area){
        var today = new Date();
        snow_covers.filter(function(d){
            return d.areaId === area.id;
        }).filter(function(d){
            var date = new Date(d.date);
            return (date.getDate() === today.getDate() && date.getMonth() === today.getMonth());
        })
        if(snow_covers.length > 0){
            snowings_tmp[area.id] = angular.copy(snow_covers[0]);
        }
        else{
            snowings_tmp[area.id] = {
                areaId: area.id,
                areaName: area.name,
                height: undefined
            } 
        }
        console.log(snow_covers);
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
        console.log(snow_covers);
        angular.forEach(snowings, function(snowing){
            var snowing_date = new Date(snowing.date);
            var found = snow_covers.filter(function(d){
                return d.areaId === snowing.areaId;
            }).filter(function(d){
                var date = new Date(d.date);
                return (date.getDate() === snowing_date.getDate() && date.getMonth() === snowing_date.getMonth());
            })
            if(found.length>0){
                snow_covers[snow_covers.indexOf(found[0])] = snowing;
            }
            else{
                snow_covers.push(snowing);
            }
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