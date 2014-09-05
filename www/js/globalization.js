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
        return $cordovaGlobalization.getPreferredLanguage(options);
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
        // nav
        'nav.home': 'Accueil',
        'nav.survey': 'Observations',
        'nav.snowcover': 'Enneigement',
        'nav.last_surveys': 'Mes dernières saisies',
        'nav.upload': 'Synchronization',
        'nav.protocol': 'Le protocole',
        'nav.help': 'Aide',
        'nav.credits': 'Crédits',
        'nav.change_user': 'Changer utilisateur',
        'nav.subheader.list': 'Liste',
        'nav.subheader.map': 'Carte',
        // button labels
        'action.submit': 'Valider',
        'action.submited': 'Validé',
        'action.synchronize': 'Synchroniser mes données',
        'action.close': 'Fermer',
        // login section
        'login.title': 'Login',
        'login.username': 'Identifiant',
        'login.password': 'Mot de passe',
        'login.action': 'S\'identifier',
        // home section
        'home.upcoming_tasks': 'Tâches en cours',
        // survey section
        'survey.picture.before': 'AVANT',
        'survey.picture.current': 'PENDANT',
        'survey.picture.after': 'APRES',
        'survey.status.observed': 'Observé un autre jour',
        'survey.status.today': 'Observé Aujourd\'hui',
        'survey.status.lost': 'Individu perdu',
        'survey.status.alreadypassed': 'Stade déjà passé',
        // snowcover section
        'snowcover.title': 'Il a neigé !',
        // area select
        'area.choose': 'Choisir une zone',
        // species section
        'species': 'Espèce',
        'species.choice.see_all': 'Voir tout les Individus',
        'species.choice.see_to_observed': 'Voir les individus à observer',
        'species.change_area': 'Changer zone',
        // general
        'phenology': 'Phénologie',
        'areas': 'Zones',
        'area': 'Zone',
        'survey': 'Observation',
        'survey.change_stage': 'Choisir un autre stade',
        'survey.date.title': 'Choisir une date',
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
        'sucess.title': 'Succès',
        'message.snowing_success': 'Les données sont enregistrées sur le mobile'
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
        // button labels
        'action.submit': 'Validate',
        'action.submited': 'Validated',
        'action.synchronize': 'Synchronize my data',
        'action.close': 'Close',
        // login section
        'login.title': 'Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.action': 'Login',
        // home section
        'home.upcoming_tasks': 'Upcoming tasks',
        // survey section
        'survey.picture.before': 'BEFORE',
        'survey.picture.current': 'CURRENT',
        'survey.picture.after': 'AFTER',
        'survey.status.observed': 'Observed',
        'survey.status.today': 'Today',
        'survey.status.lost': 'Individual lost',
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
        label: 'Italian',
        locale: 'it'
    }
});