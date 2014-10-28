var path = require('canonical-path');
var projectRoot = path.resolve(__dirname, '..');

exports.config = {

  capabilities: {
    'browserName': 'chrome',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'chromeOptions': {
      args: ['lang=en'] // don't work
    }   
  },

  sauceUser: 'davisp1',
  sauceKey: 'a151e8a4-3829-4875-b8b0-c6fcd35f3b5e',

  // Spec patterns are relative to the location of the spec file. They may
  // include glob patterns.
  specs: [
    path.resolve(projectRoot, 'test/e2e/*.scenario.js'),
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
    defaultTimeoutInterval: 120000,
    isVerbose: true
  },

  onPrepare: function() {

    // Set the browser size with this
    // browser.driver.manage().window().setSize(1200, 800);

    // Disable Animations with this
    var disableNgAnimate = function() {
      angular.module('disableNgAnimate', []).run(function($animate) {
        $animate.enabled(false);
      });
    };
    browser.addMockModule('disableNgAnimate', disableNgAnimate);

    // Mock backend
    var mocks = require('./utils/httpBackendMock.js');
    if(process.env.BACKEND !== "real"){
      browser.addMockModule('httpBackendMock', mocks.httpBackendMock);
    }
  },

  // The file path to the selenium server jar ()
  // tip to load automatically the selenium server
  //seleniumServerJar: path.resolve(projectRoot, 'node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar'),

};
