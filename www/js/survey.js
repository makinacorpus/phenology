'use strict';

angular.module('survey.controllers', ['synchronize', 'ngStorageTraverser', 'ngAuthApiClient', 'FBAngular'])

.controller('AreasCtrl', function($scope, storageTraverser, authApiClient) {
    $scope.areas = storageTraverser.traverse('/users/' + authApiClient.getUsername() +'/areas') || {};
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $location) {
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;
    $scope.areas = storageTraverser.traverse("/users/" + user + "/areas");
    $scope.area = storageTraverser.traverse(        
        String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
    );

    var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id);
    var filtered = [];

    angular.forEach(all_species, function(item, id){
        all_species[id].toggle = false;
        if(angular.isDefined(item.tasks) && item.tasks.length > 0) {
            this.push(angular.copy(item));
        }
    }, filtered);

    if(filtered.length === 1){
        filtered[0].toggle = true;
    }


    $scope.filter = { showOnlyNeeded : "false" };

    $scope.species = all_species;
    // watch changes and store
    $scope.$watch('filter.showOnlyNeeded', function(newvalue, oldvalue) {
        $scope.species = (newvalue === "false") ? all_species : filtered;
    }, true);

    $scope.switchArea = function(area){
        $location.path(
            String.format('/app/species/{0}', area.id)
        );
    }
})

.controller('LastSurveyCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $location) {
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;
    var observations = storageTraverser.traverse("/users/" + user + "/observations");
    $scope.areas = speciesService.getAreaSpecies(user);
})

.controller('UploadCtrl', function($scope, authApiClient, storageTraverser, surveyService, synchronizeService) {
    var user = authApiClient.getUsername();
    var stored_observations = storageTraverser.traverse("/users/" + user + "/current_observations") || {};
    var observations = angular.copy(stored_observations);
    $scope.observations  = [];
    angular.forEach(observations, function(obs){
         if(obs.validated === true){
             obs.area_name = surveyService.getAreaName(user, obs.areaId)
             obs.species_name = surveyService.getSpeciesName(user, obs.specId);
             obs.stage_name = surveyService.getStageName(user, obs.specId, obs.stageId);
             obs.individual_name = surveyService.getIndivualName(user, obs.areaId, obs.specId, obs.indId);
             this.push(obs);
        }
    }, $scope.observations);
    $scope.test = { obs_checked: []};
    $scope.uploadSurveys = function(){
        var surveys = $scope.observations.filter(function(item){
            return item.checked === true;
        });
        synchronizeService.uploadSurveys(surveys);

    }
    //$scope.areas = speciesService.getAreaSpecies(user);
})

.controller('SurveyCtrl', function($scope, $stateParams, storageTraverser, surveyService, authApiClient, $log, $location) {
    var stage, stageId;
    var user = authApiClient.getUsername();
    
    //get species
    var species = storageTraverser.traverse(
        String.format('/users/{0}/species/[id="{1}"]', user, $stateParams.specId)
    );

    $scope.stages = species.stages;

    // get individual
    $scope.individual = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]', user, $stateParams.areaId, $stateParams.specId, $stateParams.indId)
    );
    
    // get stage
    var stageId = $stateParams.stageId;
    if(!angular.isDefined(stageId)){
        stage = species.stages[0];
        var stage_tmp = species.stages.filter(function(item){return item.id==stageId;})[0];
        stageId = stage.id;
    }
    else{
        stage = species.stages.filter(function(item){return item.id==stageId;})[0];
    }

    $scope.status = { validated : false };
    
    $scope.survey = {
        areaId: $stateParams.areaId,
        specId: $stateParams.specId,
        indId: $stateParams.indId,
        stageId: stageId
    };

    var surveyId = surveyService.getSurveyId($scope.survey);

    var data = surveyService.getSurveyLocalInfo(user, surveyId);

    angular.extend($scope.survey, {
        beforeDate: data.beforeDate,
        surveyDate: data.surveyDate,
        when: data.when,
        status: data.status || [],
        stage: stage,
        validated: data.validated || false,
    })
    console.log(stage);
    $scope.survey.stage = stage;
    // watch changes and store
    $scope.$watch('survey', function() {
        surveyService.storeSurvey(user, $scope.survey);
        $scope.validated = $scope.survey.validated;
    }, true);

    $scope.switchStage = function(stage){
        $location.path(
            String.format('/app/survey/{0}/{1}/{2}/{3}',$scope.survey.areaId, $scope.survey.specId, $scope.survey.indId, stage.id)
        );
    }

    // validate button
    $scope.validate = function() {
        $scope.validated = true;
        surveyService.validateSurvey(user, $scope.survey);
    }
})

.service('speciesService', function(storageTraverser, surveyService){
    var self = this;
    this.getSpecies = function(user, area) {
        var areaSpecies = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species', user, area));
        var species = [];
        for(var i=0; i<areaSpecies.length; i++) {
            species[i] = angular.copy(areaSpecies[i]);
            var speciesInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]', user, species[i].id));
            species[i].stages = speciesInfo.stages.slice();
            species[i].name = speciesInfo.name;
            species[i].individuals = self.getIndivuals(user, area, species[i].id)
        }
        return species;
    }
    this.getIndivuals = function(user, area, species){
        var storedInds = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals', user, area, species));
        var individuals = [];
        angular.forEach(storedInds, function(item, key){
            
            var ind_tmp = angular.copy(item);
            var stages = ind_tmp.stages;
            var surveys = []

            angular.forEach(stages, function(stage, key2){
                var stored_observation = storageTraverser.traverse(String.format('/users/{0}/observations/[identifier="{1}-{2}-{3}-{4}"]', user, area, species, ind_tmp.id, stage.id))
                var local_observation = storageTraverser.traverse(String.format('/users/{0}/observations/{1}-{2}-{3}-{4}', user, area, species, ind_tmp.id, stage.id))
                var observation = angular.copy(stored_observation);
                var stageInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]', user, species, stage.id));
                observation.name = stageInfo.name;
                this.push(observation)
            },surveys);            
            ind_tmp.surveys = surveys;

            this.push(ind_tmp);
        }, individuals);
        return individuals;
    }
    this.getAreaSpecies = function(user){
        var areasLocal = storageTraverser.traverse(String.format('/users/{0}/areas', user))
        var areas = [];
        angular.forEach(areasLocal, function(area){
            var tmp = area;
            tmp.species = self.getSpecies(user, area.id);
            this.push(tmp);
        }, areas)
        return areas;
    }
})

.service('surveyService', function(storageTraverser, $log){
    var self = this;
    this.getSurveyId = function(data) {
        var areaId = data.areaId || data.area;
        var specId = data.specId || data.species;
        var indId = data.indId || data.individual;
        var stageId = data.stageId || data.stage;
        return String.format('{0}-{1}-{2}-{3}',
            areaId,
            specId,
            indId,
            stageId
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
        $log.debug("updated")
    };
    this.validateSurvey = function(user, data) {
        var surveyId = self.getSurveyId(data);
        $log.debug("validate")
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId]['validated'] = true;
    };
    this.getSurveyLocalInfo = function(user, surveyId){
        // inject existing data if any (and change today to before if no sync since last day)
        var data = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}', user, surveyId)) || {};
        if (data === {}){
            data = torageTraverser.traverse(String.format('/users/{0}/observations/[identifier="{1}"]', user, surveyId))
        }
        var when = data.when;
        data.beforeDate = data.surveyDate;
        
        if(when=='today' && data.surveyDate != self.today()) {
            data.when = 'before';
            data.beforeDate = data.surveyDate;
        }
        return data;
    };
    this.getAreaName=function(user, areaId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/name', user, areaId));
    }
    this.getSpeciesName=function(user, speciesId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/name', user, speciesId));
    }
    this.getStageName=function(user, speciesId, stageId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]/name', user, speciesId, stageId));
    }
    this.getIndivualName=function(user, areaId, speciesId, indId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]/name', 
                                                        user, areaId, speciesId, indId));
    }
});

X