'use strict';

angular.module('home.controllers', ['synchronize','ngAuthApiClient'])

.controller('HomeCtrl', function($scope, synchronizeService, authApiClient) {
    $scope.upcomming_tasks = [
        { title: 'Watch bud stage next month'},
        { title: 'Watch tree growth before summertime'}
    ];
    $scope.load = function() {
    	var username = authApiClient.getUsername();
    	if (username == ""){
    		$scope.login().then(function(){
    			 $scope.load();
    		})
    	}
    	else{
    		 synchronizeService.loadUserSettings(username);
    	}
    };
    $scope.upload = function(){
        var username = authApiClient.getUsername();
        if (username == ""){
            $scope.login().then(function(){
                 $scope.load();
            })
        }
        else{
             synchronizeService.uploadLocalSurveys();
        }
    };
});
