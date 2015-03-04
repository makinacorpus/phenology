'use strict';

angular.module('phenology.globalization', ['ngCordova', 'tmh.dynamicLocale'])

/// factory
.factory('globalizationFactory', ['$injector', '$window', '$log', '$q', function ($injector, $window, $log, $q) {

    var globalizationFactory;

    // choose factory in checking context
    if (angular.isDefined($window.cordova) && (!$window.ionic.Platform.isAndroid())) {
        globalizationFactory = $injector.get('globalizationDeviceService');
    }
    else {
        globalizationFactory = $injector.get('globalizationRemoteService');
    }

    globalizationFactory.detectLanguage = function() {

        var deferred = $q.defer();

        globalizationFactory.getPreferredLanguage()
        .then(function(language) {
            // We need only 2 chars for language, but globalization can return fr-FR for example
            try {
                if (!!language) {
                    language = language.substring(0, 2);
                }
            }
            catch(e) {
                $log.error(e);
                language = "en";
            }

            deferred.resolve(language);

        }, function(error) {
            deferred.resolve("en");
        });

        return deferred.promise;
    }

    return globalizationFactory;

}])

.config(['$translateProvider', 'tmhDynamicLocaleProvider', 'locales', function($translateProvider,  tmhDynamicLocaleProvider, locales) {

    // Initialize app languages
    $translateProvider.translations('fr', locales['fr']); //project context
    $translateProvider.translations('it', locales['it']); //project context
    $translateProvider.translations('en', locales['en']); //universal
    $translateProvider.preferredLanguage('en');

    tmhDynamicLocaleProvider.localeLocationPattern("lib/angular-i18n/angular-locale_{{locale}}.js");
}])

/** Used in browser Context **/
.service('globalizationRemoteService', ['$q', function ($q) {

    this.getPreferredLanguage = function() {
        var deferred = $q.defer(),
            preferredLanguage = navigator.language || navigator.userLanguage;

        deferred.resolve(preferredLanguage);

        return deferred.promise;
    };

}])

/** Used in mobile Context **/
.service('globalizationDeviceService', ['$q', '$cordovaGlobalization', function ($q, $cordovaGlobalization) {

    this.getPreferredLanguage = function() {
        return $cordovaGlobalization.getPreferredLanguage();
    };

}])

.service('globalizationService', ['$q', '$translate', 'globalizationFactory', '$localStorage', 'tmhDynamicLocale', function($q, $translate, globalizationFactory, $localStorage, tmhDynamicLocale) {
    var self = this;
    this.init = function() {
        var deferred = $q.defer();

        globalizationFactory.detectLanguage()
        .then(function(language) {
        $translate.use(language);
            self.translateTo(language);
            deferred.resolve(language);
        }, function(error){
            console.log(error);
        });

        return deferred.promise;
    };

    this.translateTo = function(language) {
        $translate.use(language);
        tmhDynamicLocale.set(language);
    };

}])

// App translatable strings (.po/.mo equivalent)
.constant('locales', {
    // french
    'fr': {
        // menu
        'nav.home': 'Accueil',
        'nav.survey': 'Observations',
        'nav.snowcover': 'Enneigement',
        'nav.last_surveys': 'Mes dernières saisies',
        'nav.upload': 'Synchronization',
        'nav.protocol': 'Le protocole',
        'nav.help': 'Aide',
        'nav.credits': 'Partenaires et crédits',
        'nav.change_user': 'Changer utilisateur',
        'nav.subheader.list': 'Liste',
        'nav.subheader.map': 'Carte',
        'nav.button.back': 'Retour',
        // actions
        'action.submit': 'Valider',
        'action.validated': 'Validé',
        'action.submitted': 'Déjà synchronisé',
        'action.unlock': '(cliquer pour déverrouiller)',
        'action.synchronize': 'Synchroniser mes données',
        'action.close': 'Fermer',
        'action.cancel': 'Annuler',
        // login section
        'login.title': 'Login',
        'login.username': 'Identifiant',
        'login.password': 'Mot de passe',
        'login.action': 'S\'identifier',
        'login.error.wrong': 'L\'identifiant ou le mot de passe est incorrect',
        'login.error.no_observer': 'L\'utilisateur n\'est pas considéré comme observeur',
        'login.error.no_connexion': 'Le serveur n\'est pas accessible',
        // Home
        'home.upcoming_tasks': 'Observations en cours',
        'home.text': 'Avant et après chaque saisie sur le terrain, mettez vos données à jour.',
        'home.welcome': 'Bienvenu',
        'home.no_task': 'Il n\y a aucune tâche à traiter',
        'home.from': 'du',
        'home.to': 'au',
        // Survey
        'survey.change_stage': 'Choisir un autre stade',
        'survey.date.title': 'Choisir une date',
        'survey.picture.before': 'AVANT',
        'survey.picture.current': 'PENDANT',
        'survey.picture.after': 'APRES',
        'survey.status.observed': 'Observé un autre jour',
        'survey.status.today': 'Observé aujourd\'hui',
        'survey.status.lost': 'Individu mort ou disparu',
        'survey.status.never': 'Stade absent',
        'survey.status.alreadypassed': 'Stade déjà passé',
        // snowcover section
        'snowcover.title': 'Hauteur de neige aujourd\'hui',
        'message.snowing_success': 'Les données sont enregistrées sur le mobile',
        // area select
        'area.choose': 'Choisir une zone',
        // Species
        'species': 'Espèce',
        'species.choice.see_all': 'Voir tous mes individus',
        'species.choice.see_to_observed': 'Voir mes individus à observer',
        'species.change_area': 'Changer de zone',
        // general
        'phenology': 'Phenoclim',
        'areas': 'Zones',
        'area': 'Zone',
        'survey': 'Observation',
        'snowcover': 'Enneigement',
        'to': 'au',
        'Flowering': 'Floraison',
        'Blooming': 'Débourrement',
        'Leafing': 'Feuillaison',
        'status.in_mobile': 'sur mobile',
        'status.in_server': 'sur le serveur',
        'error.at_least_one': 'Au moins un champ est requis',
        'error.not_number': 'Doit être un chiffre',
        'error.title': 'Erreur',
        'sucess.title': 'Succès'
    },
    // english
    'en': {
      // nav
      'nav.home': 'Home',
      'nav.survey': 'Surveys',
      'nav.snowcover': 'Snow cover',
      'nav.last_surveys': 'My last surveys',
      'nav.upload': 'Synchronization',
      'nav.protocol': 'Protocol',
      'nav.help': 'Help',
      'nav.credits': 'Credits',
      'nav.change_user': 'Change user',
      'nav.subheader.list': 'List',
      'nav.subheader.map': 'Map',
      'nav.button.back': 'Back',
      // button labels
      'action.submit': 'Validate',
      'action.validated': 'Validated',
      'action.submitted': 'Already synchronized',
      'action.unlock': '(click to unlock)',
      'action.synchronize': 'Synchronize my data',
      'action.close': 'Close',
      'action.cancel': 'Cancel',
      // login section
      'login.title': 'Login',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.action': 'Login',
      // home section
      'home.upcoming_tasks': 'Upcoming tasks',
      'home.no_task': 'No task',
      'home.text': 'Before and after each entry in the field, update your data.',
      'home.welcome': 'Welcome',
      'home.from': 'to',
      'home.to': 'to',
      // survey section
      'survey.picture.before': 'BEFORE',
      'survey.picture.current': 'CURRENT',
      'survey.picture.after': 'AFTER',
      'survey.status.observed': 'Observed',
      'survey.status.today': 'Today',
      'survey.status.lost': 'Individual lost',
      'survey.status.never': 'Stage never happened',
      'survey.status.alreadypassed': 'Stage already passed',
      // snowcover section
      'snowcover.title': 'It snowed!',
      // area select
      'area.choose': 'Choose an area',
      // species section
      'species': 'Species',
      'species.choice.see_all': 'See all individuals',
      'species.choice.see_to_observed': 'See individuals to observe',
      'species.change_area': 'Change area',
      // general
      'areas': 'Areas',
      'area': 'Area',
      'survey': 'Survey',
      'survey.change_stage': 'Change stage',
      'snowcover': 'Snow cover',
      'to': 'to',
      'Flowering': 'Flowering',
      'error.at_least_one': 'At least one field has to be filled',
      'error.not_number': 'Need a number',
      'error.title': 'Error',
      'sucess.title': 'Success',
      'message.snowing_success': 'Done, need to synchronize to send it to the server'
    },
    // italiano
    'it': {
        // nav
        'nav.home': 'Home',
        'nav.survey': 'Surveys',
        'nav.snowcover': 'Snow cover',
        'nav.last_surveys': 'My last surveys',
        'nav.upload': 'Synchronization',
        'nav.protocol': 'Protocol',
        'nav.help': 'Help',
        'nav.credits': 'Credits',
        'nav.change_user': 'Change user',
        'nav.subheader.list': 'List',
        'nav.subheader.map': 'Map',
        'nav.button.back': 'Back',
        // button labels
        'action.submit': 'Validate',
        'action.validated': 'Validated',
        'action.submitted': 'Already synchronized',
        'action.unlock': '(click to unlock)',
        'action.synchronize': 'Synchronize my data',
        'action.close': 'Close',
        'action.cancel': 'Cancel',
        // login section
        'login.title': 'Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.action': 'Login',
        // home section
        'home.upcoming_tasks': 'Upcoming tasks',
        'home.no_task': 'No task',
        'home.text': 'Prima e dopo ogni entrata in campo, aggiornare i dati.',
        'home.welcome': 'Benvenuto',
        'home.from': 'to',
        'home.to': 'to',
        // survey section
        'survey.picture.before': 'BEFORE',
        'survey.picture.current': 'CURRENT',
        'survey.picture.after': 'AFTER',
        'survey.status.observed': 'Observed',
        'survey.status.today': 'Today',
        'survey.status.lost': 'Individual lost',
        'survey.status.never': 'Stage never happened',
        'survey.status.alreadypassed': 'Stage already passed',
        // snowcover section
        'snowcover.title': 'It snowed!',
        // area select
        'area.choose': 'Choose an area',
        // species section
        'species': 'Species',
        'species.choice.see_all': 'See all individuals',
        'species.choice.see_to_observed': 'See individuals to observe',
        'species.change_area': 'Change area',
        // general
        'areas': 'Areas',
        'area': 'Area',
        'survey': 'Survey',
        'survey.change_stage': 'Change stage',
        'snowcover': 'Snow cover',
        'to': 'to',
        'Flowering': 'Flowering',
        'error.at_least_one': 'At least one field has to be filled',
        'error.not_number': 'Need a number',
        'error.title': 'Error',
        'sucess.title': 'Success',
        'message.snowing_success': 'Done, need to synchronize to send it to the server'
    }
})

// Locale settings to allow user to change app locale
.constant('localeSettings', {
    'fr': {
        label: 'Français',
        locale: 'fr'
    },
    'en': {
        label: 'English',
        locale: 'en'
    },
    'it': {
        label: 'Italiano',
        locale: 'it'
    }
});
