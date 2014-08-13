'use strict';

angular.module('ngGlobalization', ['ngCordova'])

/// factoryZ
.factory('globalizationFactory', ['$injector', '$window', '$log', '$q', function ($injector, $window, $log, $q) {

    var globalizationFactory;

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

.config(['$translateProvider', 'locales', function($translateProvider, locales) {

    // Initialize app languages
    $translateProvider.translations('fr', locales['fr']);
    $translateProvider.translations('en', locales['en']);
    $translateProvider.translations('it', locales['it']);
    $translateProvider.preferredLanguage('en');
}])

.service('globalizationService', ['$q', '$translate', 'globalizationFactory', '$localStorage', function($q, $translate, globalizationFactory, $localStorage, userSettingsService) {

    this.init = function() {
        var deferred = $q.defer();

        globalizationFactory.detectLanguage()
        .then(function(language) {
            console.log(language);
            $translate.use(language);
            deferred.resolve(language);
        }, function(error){
            console.log(error);
        });

        return deferred.promise;
    };

    this.translateTo = function(language) {
        $translate.use(language);
    };

}])

.service('globalizationRemoteService', ['$q', function ($q) {

    this.getPreferredLanguage = function() {
        var deferred = $q.defer(),
            preferredLanguage = navigator.language || navigator.userLanguage;

        deferred.resolve(preferredLanguage);

        return deferred.promise;
    };

}])

// App translatable strings (.po/.mo equivalent)
.constant('locales', {
    'fr': {
        'area.choose': 'Choisir une zone',
        'areas': 'Zones',
        'snowcover': 'Enneigement',
        
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
        'action.submit': 'Validez',
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
        'survey.status.observed': 'Observé',
        'survey.status.today': 'Aujourd\'hui',
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
        'areas': 'Zones',
        'snowcover': 'Enneigement',
        'to': 'à',
        'Flowering': 'Floraison',

    },
    'en': {
        'nav.home': 'Home',
        'nav.survey': 'Surveys',
        'nav.snowcover': 'Snow cover',
        'nav.last_surveys': 'My last surveys',
        'nav.upload': 'Synchronization',
        'nav.protocol': 'Protocol',
        'nav.help': 'Help',
        'nav.credits': 'Credits',
        'nav.change_user': 'Change user',
        'action.submit': 'Validate',
        'action.submited': 'Validated',
        'action.synchronize': 'Synchronyze my data',
        'home.upcoming_tasks': 'Upcoming Tasks',
        'snowcover.title': 'It snowed !',
        // area select
        'area.choose': 'Choose an area',
        // species section
        'species': 'Species',
        'species.choice.see_all': 'See all indivuals',
        'species.choice.see_to_observed': 'See indivuals to observe',
        // general
        'areas': 'Areas',
        'snowcover': 'Snow cover',
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
})

.service('globalizationDeviceService', ['$q', '$cordovaGlobalization', function ($q, $cordovaGlobalization) {

    this.getPreferredLanguage = function() {
        return $cordovaGlobalization.getPreferredLanguage(options);
    };

}]);