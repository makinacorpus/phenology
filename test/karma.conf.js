// Karma configuration
module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
//      '../www/lib/angular/angular.js',
      '../www/lib/ionic/js/ionic.bundle.js',
      '../www/lib/angular-base64/angular-base64.js',
      '../www/lib/angular-resource/angular-resource.js',
      '../www/lib/angular-mocks/angular-mocks.js',
      '../www/lib/ngCordova/dist/ng-cordova.js',
      '../www/lib/leaflet-dist/leaflet.js',
      '../www/lib/leaflet.locatecontrol/src/L.Control.Locate.js',
      '../www/lib/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      '../www/lib/angular-translate/angular-translate.js',
      '../www/lib/angular-pickadate/src/angular-pickadate.js',
      '../www/lib/ngstorage/ngStorage.min.js',
      '../www/lib/angular-dynamic-locale/tmhDynamicLocale.min.js',
      '../www/lib/ngGeolocation/ngGeolocation.min.js',
      '../www/js/*.js',
      './unit/*.js',
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: 'LOG_INFO',

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
