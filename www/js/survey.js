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

.controller('SurveyCtrl', function($scope, $stateParams, storageTraverser, surveyService) {
    var user = "user1";
    var stageId = "stage1";
    $scope.individual = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]', user, $stateParams.areaId, $stateParams.specId, $stateParams.indId)
    );
    var stage = storageTraverser.traverse(
        String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]', user, $stateParams.specId, stageId)
    );
    $scope.survey = {
        areaId: $stateParams.areaId,
        specId: $stateParams.specId,
        indId: $stateParams.indId,
        stageId: stageId
    };
    // inject existing data if any (and change today to before if no sync since last day)
    var surveyId = surveyService.getSurveyId($scope.survey);
    var data = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}', user, surveyId)) || {};
    var when = data.when;
    var beforeDate = data.beforeDate;
    if(when=='today' && data.surveyDate != surveyService.today()) {
        when = 'before';
        beforeDate = data.surveyDate;
    }
    $scope.survey.when = when;
    $scope.survey.beforeDate = beforeDate;

    // watch changes and store
    $scope.$watch('survey', function() {
        surveyService.storeSurvey(user, $scope.survey);
    }, true);
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
})

.service('surveyService', function(storageTraverser){
    var self = this;
    this.getSurveyId = function(data) {
        return String.format('{0}-{1}-{2}',
            data.areaId,
            data.specId,
            data.indId
        )
    };
    this.today = function() {
        var today = new Date();
        return today.toISOString().slice(0, 10);
    };
    this.storeSurvey = function(user, data) {
        if(data.when == 'before') {
            data.surveyDate = data.beforeDate;
        } else {
            data.surveyDate = self.today();
        }
        var surveyId = self.getSurveyId(data);
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId] = data;
    };
});