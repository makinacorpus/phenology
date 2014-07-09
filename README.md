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

## Before doing anything
```bash
$ cd nenv
$ source bin/activate
$ cd phenology
```

## Add a platform
```bash
$ ionic platform android
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
