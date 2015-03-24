'use strict';

angular.module('phenology.survey', ['ngStorageTraverser', 'phenology.api', 'ngCordova'])

.controller('AreasCtrl', function($scope, storageTraverser, authApiClient, $state) {
    $scope.areas = storageTraverser.traverse('/users/' + authApiClient.getUsername() +'/areas') || {};
})

.controller('SpeciesCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $state, $timeout, $ionicScrollDelegate) {
    var user = authApiClient.getUsername();
    var areaId = $stateParams.areaId;
    $scope.areas = storageTraverser.traverse("/users/" + user + "/areas");

    if(!(angular.isDefined(areaId) && areaId !== "")){
        areaId = $scope.areas[0].id;
        $stateParams.areaId = areaId;
    }
    $scope.scrollBottom = function(is_last){
        if(is_last){
            $ionicScrollDelegate.scrollBottom(true);
        }
    }

    $timeout( function() {
        $scope.area = storageTraverser.traverse(
            String.format('/users/{0}/areas/[id="{1}"]', user, areaId)
        );

        var all_species = speciesService.getSpecies(authApiClient.getUsername(), $scope.area.id);
        for(var i=0; i<all_species.length; i++) {
            for(var j=0; j<all_species[i].individuals.length; j++) {
                all_species[i].individuals[j].tasks = speciesService.getTaskForIndividual(user, $scope.area, all_species[i], all_species[i].individuals[j]);
            }
        }

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

        $scope.filter = { showOnlyNeeded : "true" };

        // watch changes and store
        $scope.$watch('filter.showOnlyNeeded', function(newvalue, oldvalue) {
            $scope.species = (newvalue === "false") ? all_species : filtered;
        }, true);

    }, 100);

    $scope.switchArea = function(area){
        $state.go('app.species', {areaId: area.id});
    };

    $scope.goToFirstPending = function(species, individual) {
        var taskId;
        var tasks = [];
        angular.forEach(individual.tasks, function(value, key){
            if(!value.validated) {
                tasks.push(value);
            }
        });
        if (tasks.length > 0){
            tasks.sort(function(a, b){
                return +a.order - +b.order;
            });
            $state.go('app.stages', {areaId: areaId, specId: species.id, indId: individual.id, stageId: tasks[0].id});
        }
        else{
            $state.go('app.survey', {areaId: areaId, specId: species.id, indId: individual.id});
        }
    };
})

.controller('LastSurveyCtrl', function($scope, $stateParams, speciesService, authApiClient, storageTraverser, $location, $log) {
    var user = authApiClient.getUsername();
    $scope.areas = speciesService.getAreaSpecies(user);
})

.controller('SurveyCtrl', function($scope, $rootScope, $stateParams, storageTraverser, $ionicSlideBoxDelegate, speciesService, surveyService, authApiClient, $ionicModal, $log, $location, toolService) {
    var stage, stageId;
    var user = authApiClient.getUsername();

    //get species
    var species = storageTraverser.traverse(
        String.format('/users/{0}/species/[id="{1}"]', user, $stateParams.specId)
    );

    $scope.stages = species.stages.filter(function(d){
        return d.is_active === true;
    });
    // get individual
    $scope.individual = storageTraverser.traverse(
        String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]', user, $stateParams.areaId, $stateParams.specId, $stateParams.indId)
    );

    var stage = surveyService.getStage($stateParams.stageId, species);
    var stageId = stage.id;

    var params = {
            areaId: $stateParams.areaId,
            specId: $stateParams.specId,
            indId: $stateParams.indId,
            stageId: stageId
    };

    $scope.speciesName = species.name;
    $scope.surveys = speciesService.getSurveys(user, params.areaId, params.specId, $scope.individual.id);
    $scope.lastSurvey = ($scope.surveys.length>0) ? $scope.surveys.reduce(function (a, b) { return a.surveyDate > b.surveyDate ? a : b; }) : undefined;

    $scope.survey = surveyService.getSurvey(user, params);
    $scope.survey.stage = stage;

    $scope.status = {};

    $scope.current_stage = $scope.survey.stage;

    // watch changes and store
    $scope.$watch('survey', function(newvalue, oldvalue) {
        var oldData = [oldvalue.when, oldvalue.beforeDate, oldvalue.validated];
        var newData = [newvalue.when, newvalue.beforeDate, newvalue.validated];
        if (!angular.equals(oldData, newData)){
            if(oldvalue.validated == newvalue.validated){
                $scope.survey.validated = false;
                delete $scope.survey["identifier"];
            }
            surveyService.storeSurvey(user, $scope.survey);
        }
    }, true);

    // behaviour to manage event when user selects a new date in datepicker
    $scope.$watch('datemodal.date', function(newvalue, oldvalue) {
      var date = $scope.survey.beforeDate;
      if (angular.isDefined(newvalue) && (angular.isUndefined(date) || date != $scope.datemodal.date)){
        $scope.survey.beforeDate  = newvalue;
        $scope.datemodal.hide();
      }
    }, true);

    // date modal
    $ionicModal.fromTemplateUrl('templates/datemodal.html',
        function(modal) {
            $scope.datemodal = modal;
            $scope.maxDate = new Date();
        },
        {
            scope: $scope,
            animation: 'slide-in-up'
        }
    );

    // slide modal
    $ionicModal.fromTemplateUrl('templates/slidemodal.html',
        function(modal) {
            $scope.slidemodal = modal;
        },
        {
            scope: $scope,
            animation: 'slide-in-up'
        }
    );

    // open date modal with datepicker
    $scope.opendateModal = function() {
      if($scope.locked) {
        return
      }
      $scope.datemodal.date = $scope.survey.beforeDate;
      $scope.datemodal.show();

    };

    // close datemodal
    $scope.closedateModal = function(model, force) {
      if( angular.isDefined(model)){
        $scope.survey.beforeDate = model;
        $scope.datemodal.hide();
      }
      if( angular.isDefined(force) && force === true){
        $scope.datemodal.hide();
      }
    };

    // open slides modal wich shows pictures of the current stage
    $scope.openSlideModal = function(state) {
      $scope.status.slideIndex = state;
      $scope.slidemodal.show();
      //$timeout( function() { $ionicSlideBoxDelegate.update(); });
    };

    // switch stage
    $scope.switchStage = function(stage){
        $location.path(
            String.format('/app/survey/{0}/{1}/{2}/{3}',$scope.survey.areaId, $scope.survey.specId, $scope.survey.indId, stage.id)
        );
    };

    // validate button
    $scope.validate = function() {
        $scope.survey.validated = true;
    };

    // cancel button
    $scope.cancel = function() {
        surveyService.deleteTmpSurvey(user, params);
        $scope.survey = surveyService.getSurvey(user, params);
        if($scope.survey.validated && $scope.survey.identifier) {
            $scope.locked = true;
        }
    };

    // locking
    if($scope.survey.validated && $scope.survey.identifier) {
        $scope.locked = true;
    }
    $scope.unlock = function() {
        $scope.locked = false;
    };
})
.service('tasksService', function(storageTraverser, toolService){
    var self = this;

    this.getTasksForSpecies = function(species, monthdiff){
      if(angular.isUndefined(monthdiff)){
        monthdiff = 2;
      }
      species.stages = species.stages.filter(function(d){
        return d.is_active === true;
      }) 
      var tasks = [];
      var today = new Date();
      for(var i=0; i<species.stages.length; i++){
        var stage = species.stages[i];
        var dates = toolService.getLimitDates(stage);
        if(today >= dates.start && today <= dates.end){
          tasks.push(stage);
        }
      }
      return tasks;
    };

})
.service('speciesService', function(storageTraverser, surveyService, toolService, tasksService){
    var self = this;
    this.getTaskForIndividual = function(user, area, species, individual, all) {
        var is_for_all = (angular.isDefined(all) && all === true)
        var tasks = tasksService.getTasksForSpecies(species),
            surveys = this.getSurveys(user, area.id, species.id, individual.id),
            individualTasks = {};
        for(var i=0, len=tasks.length; i<len; i++) {
            individualTasks[tasks[i].id] = {
                label: tasks[i].name,
                validated: false,
                order: tasks[i].order,
                id: tasks[i].id,
                dates: toolService.getLimitDates(tasks[i])
            };
        }
        for(var j=0, len=surveys.length; j<len; j++) {
            var stage = surveys[j].stageId,
                date = new Date(surveys[j].surveyDate);
            if(individualTasks[stage] && surveys[j].validated 
                                      && individualTasks[stage].dates.start <= date
                                      && individualTasks[stage].dates.end >= date) {
               individualTasks[stage].validated = true;
            }
        }
        return individualTasks;
    };
    this.getSpecies = function(user, area) {
        var areaSpecies = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species', user, area));
        var species = [];
        for(var i=0; i<areaSpecies.length; i++) {
            species[i] = angular.copy(areaSpecies[i]);
            var speciesInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]', user, species[i].id));
            species[i].stages = speciesInfo.stages.slice();
            species[i].tasks = tasksService.getTasksForSpecies(speciesInfo);
            species[i].name = speciesInfo.name;
            species[i].picture = toolService.getFullPictureUrl(speciesInfo.picture);
            species[i].individuals = self.getIndivuals(user, area, species[i].id)
        }
        species.sort(function(a,b){ return a.name.localeCompare(b.name); });

        return species;
    };
    this.getIndivuals = function(user, area, species){
        var storedInds = storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals', user, area, species));
        var individuals = [];
        for (var i = 0; i < storedInds.length; i++) {
            var ind_tmp = angular.copy(storedInds[i]);
            ind_tmp.surveys = self.getSurveys(user, area, species, ind_tmp.id)
            individuals.push(ind_tmp);
        };
        return individuals;
    };
    this.getSurveys = function(user, area, species, individual){
        var stages = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages', user, species));
        if(!stages) {
            return [];
        }
        var surveys = []
        for (var j = 0; j < stages.length; j++) {
            var stage = stages[j];
            var local_observation = surveyService.getSurveyLocalInfo(user, String.format('{0}-{1}-{2}-{3}', area, species, individual, stage.id));
            var observation = angular.copy(local_observation);
            if(angular.isDefined(observation) && !angular.equals(observation, {})){
                var stageInfo = storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]', user, species, stage.id));
                observation.name = stageInfo.name;
                surveys.push(observation);
            }
        }
        surveys.sort(function(a, b){
          return (a.surveyDate > b.surveyDate);
        });
        return surveys;
    };
    this.getAreaSpecies = function(user){
        var areasLocal = storageTraverser.traverse(String.format('/users/{0}/areas', user))
        var areas = [];
        angular.forEach(areasLocal, function(area){
            var tmp = angular.copy(area);
            tmp.species = self.getSpecies(user, area.id);
            this.push(tmp);
        }, areas)
        return areas;
    }
})

.service('surveyService', function(storageTraverser, $log, toolService){
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
    this.storeSurvey = function(user, data) {
        var data = angular.copy(data);
        data.surveyDate = (data.when == 'before') ? data.beforeDate : toolService.today();
        delete data["stage"];
        delete data["identifier"];
        var surveyId = self.getSurveyId(data);
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId] = data;
        $log.debug("updated");
    };
    this.validateSurvey = function(user, data) {
        var surveyId = self.getSurveyId(data);
        $log.debug("validate");
        storageTraverser.traverse(String.format('/users/{0}/current_observations', user))[surveyId]['validated'] = true;
    };
    this.getSyncedObservations = function(user, surveyId){
        var all_observations = storageTraverser.traverse(String.format('/users/{0}/observations', user, surveyId));
        return all_observations.filter(function(d){
            return d.identifier === surveyId
        })
    }
    this.getSurveyLocalInfo = function(user, surveyId){
        // inject existing local data if any
        var data = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}', user, surveyId));

        var minDate = new Date();
        var maxDate = new Date();
        // we look on data between [today - one year, today + 9months]
        minDate.setMonth(minDate.getMonth() - 4);
        maxDate.setMonth(minDate.getMonth() + 4);

        if (angular.isUndefined(data)) {
            // if nothing local, get synced set of data
            var datas = self.getSyncedObservations(user, surveyId);
            // take the first survey that is
            if (angular.isDefined(datas)){
                for (var i = 0; i < datas.length; i++) {
                    var tmp_data = datas[i];
                    var surveyDate = new Date(tmp_data.surveyDate);
                    if(minDate < surveyDate && maxDate > surveyDate){
                        data = angular.copy(tmp_data);
                        data.when = data.answer;
                        if(data.when == 'isObserved') {
                            data.when = 'before';
                        }
                        break;
                    }
                };
            }
            if(angular.isUndefined(data)){
                return {};
            }
        }
        // set before or today according the current day
        data.beforeDate = data.surveyDate;
        if(data.when == 'today' && data.surveyDate != toolService.today()) {
            data.when = 'before';
        }
        if(data.when == 'before' && data.surveyDate == toolService.today()) {
            data.when = 'today';
        }
        return data;
    };
    this.deleteTmpSurvey = function(user, params){
        var survey = params;

        var surveyId = self.getSurveyId(survey);
        var obs = storageTraverser.traverse(String.format('/users/{0}/current_observations/{1}', user, surveyId),{
                            delete: true,
            });
    };
    this.getSurvey = function(user, params){
        var survey = params;

        var surveyId = self.getSurveyId(survey);

        var data = self.getSurveyLocalInfo(user, surveyId);
        angular.extend(survey, {
            beforeDate: data.beforeDate,
            surveyDate: data.surveyDate,
            isNever: data.isNever,
            isPassed: data.isPassed,
            isLost: data.isLost,
            when: data.when,
            identifier: data.identifier,
            status: data.status || [],
            id: data.id,
            validated: data.validated || false,
        })
        return survey;
    };
    this.getStage = function(stageId, species){
        // get stage
        var stage = undefined;
        if(!angular.isDefined(stageId)){
            stage = species.stages[0];
        }
        else{
            stage = species.stages.filter(function(item){return item.id==stageId;})[0];
        }
        stage = angular.copy(stage);
        stage.picture_before = toolService.getFullPictureUrl(stage.picture_before);
        stage.picture_current = toolService.getFullPictureUrl(stage.picture_current);
        stage.picture_after = toolService.getFullPictureUrl(stage.picture_after);

        return stage;
    };
    this.getAreaName=function(user, areaId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/name', user, areaId));
    };
    this.getSpeciesName=function(user, speciesId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/name', user, speciesId));
    };
    this.getStageName=function(user, speciesId, stageId){
        return storageTraverser.traverse(String.format('/users/{0}/species/[id="{1}"]/stages/[id="{2}"]/name', user, speciesId, stageId));
    };
    this.getIndivualName=function(user, areaId, speciesId, indId){
        return storageTraverser.traverse(String.format('/users/{0}/areas/[id="{1}"]/species/[id="{2}"]/individuals/[id="{3}"]/name',
                                                        user, areaId, speciesId, indId));
    };
});
