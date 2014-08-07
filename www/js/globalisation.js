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
        'action.submit': 'Validez',
        'action.submited': 'Validé',
        'action.synchronize': 'Synchroniser mes données',
        'home.upcoming_tasks': 'Tâches en cours',
        'snowcover.title': 'Il a neigé !',
        'species': 'Espèce',
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
        'species': 'Species',
        'to': 'à',
        'Flowering': 'Floraison',
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