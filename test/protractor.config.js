var path = require('canonical-path');
var projectRoot = path.resolve(__dirname, '..');

exports.config = {
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      args: ['lang=en'] // don't work
    }   
  },
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

  // The file path to the selenium server jar ()
  // tip to load automatically the selenium server
  seleniumServerJar: path.resolve(projectRoot, 'node_modules/protractor/selenium/selenium-server-standalone-2.42.2.jar'),

};
