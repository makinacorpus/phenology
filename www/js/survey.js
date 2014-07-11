angular.module('survey.controllers', ['ngStorageTraverser'])

.controller('AreasCtrl', function($scope, storageTraverser) {
    $scope.areas = storageTraverser.traverse("/users/user1/areas");
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService) {
    var area = $stateParams.areaId
    $scope.area = area;
    $scope.species = speciesService.getSpecies("user1", area);
})

.controller('SurveyCtrl', function($scope, $stateParams, storageTraverser) {
    $scope.individual = storageTraverser.traverse(
        '/users/user1/areas/[id="'+$stateParams.areaId+'"]/species/[id="'+$stateParams.specId+'"]/individuals/[id="'+$stateParams.indId+'"]'
    );
    $scope.question = "Flowers are blooming";
    $scope.notObservable = null;
    $scope.observed = null;
    $scope.observationToday = null;
    $scope.observationDate = null;
})

.service('speciesService', function(storageTraverser){
    this.getSpecies = function(user, area) {
        return storageTraverser.traverse("/users/"+user+"/areas/[id='"+area+"']/species");
    };
});