'use strict';

angular.module('survey.controllers', ['ngStorageTraverser'])

.controller('AreasCtrl', function($scope, storageTraverser) {
    $scope.areas = storageTraverser.traverse('/users/user1/areas');
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService) {
    var area = $stateParams.areaId
    $scope.area = area;
    $scope.species = speciesService.getSpecies('user1', area);
})

.controller('SurveyCtrl', function($scope, $stateParams, storageTraverser) {
    $scope.individual = storageTraverser.traverse(
        String.format('/users/user1/areas/[id="{0}"]/species/[id="{1}"]/individuals/[id="{2}"]', $stateParams.areaId, $stateParams.specId, $stateParams.indId)
    );
    var stage = storageTraverser.traverse(
        String.format('/users/user1/species/[id="{0}"]/stages/[id="stage1"]', $stateParams.specId)
    );
    $scope.survey = {
        stage: stage,
        when: null,
        beforeDate: null
    };
    // TODO: watch and persist survey
    $scope.$watch('survey.when', function() {
        console.log($scope.survey);
    });
})

.service('speciesService', function(storageTraverser){
    this.getSpecies = function(user, area) {
        var areaSpecies = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species', user, area));
        var species = [];
        for(var i=0; i<areaSpecies.length; i++) {
            species[i] = areaSpecies[i];
            var speciesInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]', user, species[i].id));
            species[i].stages = speciesInfo.stages.slice();
            species[i].title = speciesInfo.title;
        }
        return species;
    };
});