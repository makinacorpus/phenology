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
                if(!!language.value){
                  language = language.value;
                }
                language = language.substring(0, 2);
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
            self.language = language;
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

    this.getLanguage = function(){
        return self.language;
    }
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
        'action.cancel': 'Réinitialiser',
        'action.synchronized': 'Données synchronisées',
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
        'home.welcome': 'Bienvenue',
        'home.no_task': 'Il n\y a aucune tâche à traiter',
        'home.from': 'du',
        'home.to': 'au',
        // Survey
        'survey.change_stage': 'Choisir un autre stade',
        'survey.date.title': 'Choisir une date',
        'survey.no_survey': 'pas de saisie',
        'survey.last_survey': 'Dernière saisie',
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
      'nav.protocol': 'The protocol',
      'nav.help': 'Help',
      'nav.credits': 'Partners and Credits',
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
      'action.synchronized': 'Synchronized',
      // login section
      'login.title': 'Login',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.action': 'Login',
      'login.error.wrong': 'The username or the password is incorrect',
      'login.error.no_observer': 'The user is not deemed to be an observer',
      'login.error.no_connexion': 'The server is not accessible',
      // home section
      'home.upcoming_tasks': 'Upcoming tasks',
      'home.text': 'Before and after each entry in the field, update your data.',
      'home.welcome': 'Welcome',
      'home.no_task': 'There is no task to be handled',
      'home.from': 'from',
      'home.to': 'to',
      // survey section
      'survey.change_stage': 'Choose another stage',
      'survey.date.title': 'Choose a date',
      'survey.no_survey': 'no date',
      'survey.last_survey': 'Last survey',
      'survey.picture.before': 'BEFORE',
      'survey.picture.current': 'CURRENT',
      'survey.picture.after': 'AFTER',
      'survey.status.observed': 'Observed another day',
      'survey.status.today': 'Observed today',
      'survey.status.lost': 'Individual lost or disappeared',
      'survey.status.never': 'Stage never happened',
      'survey.status.alreadypassed': 'Stage already completed',
      // snowcover section
      'snowcover.title': 'Snow depth today',
      'message.snowing_success': 'The data are recorded on the mobile',
      // area select
      'area.choose': 'Choose an area',
      // species section
      'species': 'Species',
      'species.choice.see_all': 'See all my individuals',
      'species.choice.see_to_observed': 'See my individuals to be observed',
      'species.change_area': 'Change area',
      // general
      'phenology': 'Phenoclim',
      'areas': 'Areas',
      'area': 'Area',
      'survey': 'Survey',
      'snowcover': 'Snow cover',
      'to': 'to',
      'Flowering': 'Flowering',
      'Blooming': 'Budburst',
      'Leafing': 'Foliation',
      'status.in_mobile': 'on mobile',
      'status.in_server': 'on the serveur',
      'error.at_least_one': 'At least one field is required',
      'error.not_number': 'Must be a number',
      'error.title': 'Error',
      'sucess.title': 'Success',
    },
    // italiano
    'it': {
        // nav
        'nav.home': 'Home',
        'nav.survey': 'Osservazioni',
        'nav.snowcover': 'Innevamento',
        'nav.last_surveys': 'I miei ultimi dati inseriti',
        'nav.upload': 'Sincronizzazione',
        'nav.protocol': 'Il protocollo',
        'nav.help': 'Aiuto',
        'nav.credits': 'Partner e crediti',
        'nav.change_user': 'Cambia utente',
        'nav.subheader.list': 'Lista',
        'nav.subheader.map': 'Carta',
        'nav.button.back': 'Indietro',
        // button labels
        'action.submit': 'Conferma',
        'action.validated': 'Confermato',
        'action.submitted': 'Già sincronizzato',
        'action.unlock': '(clicca per sbloccare)',
        'action.synchronize': 'Sincronizza i miei dati',
        'action.close': 'Chiudi',
        'action.cancel': 'Annulla',
        'action.synchronized': 'sincronizzato',
        // login section
        'login.title': 'login',
        'login.username': 'Identificativo',
        'login.password': 'Password',
        'login.action': 'Nome utente',
        'login.error.wrong': 'L\'identificativo o la password non sono corretti',
        'login.error.no_observer': 'L\'utente non è un osservatore',
        'login.error.no_connexion': 'Il server non è accessibile',
        // home section
        'home.upcoming_tasks': 'Elaborazione in corso',
        'home.text': 'Prima e dopo ogni entrata in campo, aggiornare i dati.',
        'home.welcome': 'Benvenuto',
        'home.from': 'del',
        'home.to': 'al',
        // survey section
        'survey.change_stage': 'Scegli un altro stadio',
        'survey.date.title': 'Scegli una data',
        'survey.no_survey': 'no data',
        'survey.last_survey': 'Ultimo data',
        'survey.picture.before': 'PRIMA',
        'survey.picture.current': 'DURANTE',
        'survey.picture.after': 'DOPO',
        'survey.status.observed': 'Osservato in data diversa',
        'survey.status.today': 'Osservato oggi',
        'survey.status.lost': 'Esemplare morto o scomparso',
        'survey.status.never': 'Stadio assente',
        'survey.status.alreadypassed': 'Stadio già passato',
        // snowcover section
        'snowcover.title': 'Altezza della neve oggi',
        'message.snowing_success': 'I dati sono registrati sul cellulare',
        // area select
        'area.choose': 'Scegli un'area',
        // species section
        'species': 'Specie',
        'species.choice.see_all': 'Guarda tutti i miei esemplari',
        'species.choice.see_to_observed': 'Guarda miei esemplari da osservare',
        'species.change_area': 'Cambia area',
        // general
        'phenology': 'Phenoclim',
        'areas': 'Aree',
        'area': 'Area',
        'survey': 'Osservazione',
        'snowcover': 'Innevamento',
        'to': 'al',
        'Flowering': 'Fioritura',
        'Blooming': 'Germogliazione',
        'Leafing': 'Fogliazione',
        'status.in_mobile': 'sul cellulare',
        'status.in_server': 'sul server',
        'error.at_least_one': 'è obbligatorio almeno un campo',
        'error.not_number': 'Deve essere espresso in cifre',
        'error.title': 'Errore',
        'sucess.title': 'Operazione eseguita con successo',
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
