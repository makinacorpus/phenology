angular.module('home.controllers', [])

.controller('HomeCtrl', function($scope) {
  $scope.upcomming_tasks = [
    { title: 'Watch bud stage next month'},
    { title: 'Watch tree growth before summertime'}
  ];
})
