angular.module('home.controllers', ['synchronize'])

.controller('HomeCtrl', function($scope, synchronizeService) {
    $scope.upcomming_tasks = [
        { title: 'Watch bud stage next month'},
        { title: 'Watch tree growth before summertime'}
    ];
    $scope.load = function() {
        synchronizeService.loadUserSettings('user1');
    };
});
