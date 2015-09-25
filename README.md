Phenology
=========

## Install
```bash
$ sudo easy_install nodeenv
$ nodeenv ./nenv
$ cd nenv
$ source bin/activate
$ npm config set cache ./.npm
$ npm install -g cordova ionic
$ git clone ....
$ cd phenology
$ npm install gulp
$ npm install
$ gulp install
```

### Protractor Webdriver
You have to update and start a standalone selenium server. [Please read the offical instructions](https://github.com/angular/protractor#appendix-a-setting-up-a-standalone-selenium-server).  

You can also ensure that the driver is installed by using the `webdriver_update` task. Have a look at the example folder.

Additional tip to install a webdriver:
```bash
 $ node_modules/protractor/bin/webdriver-manager update
```

You have 2 options to start the selenium server.  

The first one is to let Protractor handle it automatically, including stopping it once your tests are done.  
To do that, simply point to the selenium jar in the protractor config file (you will need to update the version number accordingly) instead of the address:

```javascript
  // The file path to the selenium server jar ()
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.39.0.jar',
  // seleniumAddress: 'http://localhost:4444/wd/hub',
```

The second option is to let the gulp task handle it with the built-in webdriver snippet.  
If you decide to start it that way, the task will keep running indefintely.

```javascript
var webdriver_standalone = require("gulp-protractor").webdriver_standalone;
gulp.task('webdriver_standalone', webdriver_standalone);
```


## Before doing anything
```bash
$ cd nenv
$ source bin/activate
$ cd phenology
```

## Install Android SDK

See http://doc.ubuntu-fr.org/android#installation_du_sdk_android

## Add a platform
```bash
$ ionic platform add android
```

## Add plugin to manipulate/transfert files
```bash
$ cordova plugin add org.apache.cordova.file@1.2.0
$ cordova plugin add org.apache.cordova.file-transfer@0.4.4
```

## Add zip plugin
```bash
$ cordova plugin add https://github.com/MobileChromeApps/zip.git
```

## Add white list plugin
```bash
$ cordova plugin add cordova-plugin-whitelist
```

## Build and run on a platform
```bash
$ ionic build android
$ ionic emulate android
```

## Run in Chrome for testing
```bash
$ ionic serve
```

To get SASS files automatically compiled:
```bash
$ gulp watch
```

## Run unit tests
```bash
$ gulp test
```

## Run functional tests
```bash
$ gulp e2e
```
[![Build Status](https://travis-ci.org/makinacorpus/phenology.svg?branch=phenology-test)](https://travis-ci.org/makinacorpus/phenology)