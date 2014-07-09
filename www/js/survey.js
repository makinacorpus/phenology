angular.module('survey.controllers', [])

.controller('AreasCtrl', function($scope, areaService) {
    $scope.areas = areaService.getAreas("user1");
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService) {
    var area = $stateParams.areaId
    $scope.area = area;
    $scope.species = speciesService.getSpecies("user1", area);
})

.controller('SurveyCtrl', function($scope, $stateParams) {
    $scope.title = $stateParams.indId;
})

.service('areaService', function(){
    this.getAreas = function(user) {
        return [
            {title: "Area 1", id: 'area1'},
            {title: "Area 2", id: 'area2'},
            {title: "Area 3", id: 'area3'}
        ];
    }
})

.service('speciesService', function(){
    this.getSpecies = function(user, area) {
        return [
            {
                title: "Flower A",
                id: 's1',
                individuals: [
                    {title: "Flower A 1", id: 'a1'},
                    {title: "Flower A 2", id: 'a2'},
                    {title: "Flower A 3", id: 'a3'}
                ]
            },
            {
                title: "Tree B",
                id: 's2',
                individuals: [
                    {title: "Tree B 1", id: 'b1'},
                    {title: "Tree B 2", id: 'b2'},
                    {title: "Tree B 3", id: 'b3'}
                ]
            },
            {
                title: "Tree C",
                id: 's3',
                individuals: [
                    {title: "Tree C 1", id: 't1'},
                    {title: "Tree C 2", id: 't2'},
                    {title: "Tree C 3", id: 't3'}
                ]
            }
        ];
    };
});