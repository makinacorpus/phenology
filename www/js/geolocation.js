'use strict';


angular.module('phenology.geolocation', ['ngCordova', ])

.factory('geolocationFactory', ['$injector', '$window', '$q', '$rootScope', '$log', function ($injector, $window, $q, $rootScope, $log) {

    var geolocationFactory;
    var cached_position;
    // On Android, HTML5 geolocation is better than native one, support for android
    // has been dropped (https://issues.apache.org/jira/browse/CB-5977)
    // That's why we test if platform is Android
    if (angular.isDefined($window.cordova) && (!$window.ionic.Platform.isAndroid())) {
        geolocationFactory = $injector.get('geolocationDeviceService');
    }
    else {
        geolocationFactory = $injector.get('geolocationRemoteService');
    }

    // Code from http://www.w3schools.com/html/html5_geolocation.asp
    function convertError(error) {
        var msg,
            // Following http://dev.w3.org/geo/api/spec-source.html#geolocation_interface for error codes
            PERMISSION_DENIED = 1,
            POSITION_UNAVAILABLE = 2,
            TIMEOUT = 3;

        switch(error.code) {
            case PERMISSION_DENIED:
                msg = "User denied the request for Geolocation."
                break;
            case POSITION_UNAVAILABLE:
                msg = "Location information is unavailable."
                break;
            case TIMEOUT:
                msg = "The request to get user location timed out."
                break;
            default:
                if (error.message) {
                    msg = error.message;
                }
                else {
                    msg = "An unknown error occurred.";
                }

                break;
        }
        return {message: msg};
    }

    geolocationFactory.getLatLngPosition = function(options, watchCallback) {

        var deferred = $q.defer();
        var now = new Date();
        // Cleaning watch to resolve weird no-callback issue
        // See MapController for more precisions
        if (!!$rootScope.watchID) {
            console.log('There is a watch, cleaning it before getting user LatLng position');
            geolocationFactory.clearWatch($rootScope.watchID);
        }

        if(cached_position && cached_position.timestamp && ((now - new Date(cached_position.timestamp)) < (5 * 60000))){
            deferred.resolve({'lat': cached_position.coords.latitude, 'lng': cached_position.coords.longitude});
            if (watchCallback) {
                watchCallback();
            }
        }
        else{
            geolocationFactory.getCurrentPosition(options)
                .then(function(position) {
                    cached_position = position;
                    if (watchCallback) {
                        watchCallback();
                    }
                    deferred.resolve({'lat': position.coords.latitude, 'lng': position.coords.longitude});
                }, function(error) {
                    console.log(error);
                    if (watchCallback) {
                        watchCallback();
                    }
                    deferred.reject(convertError(error));
                });
        }
        return deferred.promise;
    }

    return geolocationFactory;

}]).service('geolocationDeviceService', ['$q', '$cordovaGeolocation', function ($q, $cordovaGeolocation) {

    // There variables are used to limit watchPosition callbacks
    var iterNum = 0, maxIterNum = 1;

    this.getCurrentPosition = function(options) {
        return $cordovaGeolocation.getCurrentPosition(options);
    };

    this._broadcast = function($scope, dataToBroadcast) {
        if (iterNum === maxIterNum) {
            $scope.$broadcast('watchPosition', dataToBroadcast);
            iterNum = 0;
        }
        else {
            iterNum += 1;
        }
    };

    this.watchPosition = function($scope, options) {
        var deferred = $q.defer(),
            watchResult = $cordovaGeolocation.watchPosition(options),
            _this = this;

        watchResult.promise
        .then(function(position) {
            _this._broadcast($scope, 'ngcordova geolocation watch uses notify, not resolve');
        }, function(positionError) {
            //console.log(positionError);
            _this._broadcast($scope, positionError);
        }, function(position) {
            _this._broadcast($scope,  {'lat': position.coords.latitude, 'lng': position.coords.longitude});
        });

        return watchResult.watchId;
    };

    this.clearWatch = function(watchID) {
        return $cordovaGeolocation.clearWatch(watchID);
    };

}]).service('geolocationRemoteService', ['$q', '$timeout', function ($q, $timeout) {

    // There variables are used to limit watchPosition callbacks
    var iterNum = 0, maxIterNum = 10;

    this.getCurrentPosition = function(options) {

        var deferred = $q.defer();

        // On some weird cases, there is no callback on getCurrentPosition when used together with watchPosition...
        // Adding a timeout to be sure that app is not blocked on these cases
        options = options || {};
        options['timeout'] = 40 * 1000; // 10s

        //console.log(options);
        //console.log("getposition")
        // Using HTML5 geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    deferred.resolve(position);
                }, function(positionError) {
                    //console.log(positionError)
                    deferred.reject(positionError);
              }, options);
        } else {
            deferred.reject({message: 'Your browser does not support HTML5 geolocation API.'});
        }

        return deferred.promise;
    };

    // We broadcast to scope only 1 data on each <maxIterNum> watchPosition callback
    this._broadcast = function($scope, dataToBroadcast) {
        if (iterNum === maxIterNum) {
            $scope.$broadcast('watchPosition', dataToBroadcast);
            iterNum = 0;
        }
        else {
            iterNum += 1;
        }
    };

    this.watchPosition = function($scope, options) {
        var _this = this;

        if (navigator.geolocation) {
            return navigator.geolocation.watchPosition(
                function(position) {
                    _this._broadcast($scope, {'lat': position.coords.latitude, 'lng': position.coords.longitude});
                }, function(positionError) {
                    console.log("watchposition error", positionError);
                    _this._broadcast($scope, positionError);
              }, options);
        } else {
            $scope.$broadcast('watchPosition', 'Your browser does not support HTML5 geolocation API.');
        }
    };

    this.clearWatch = function(watchID) {
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchID);
        }
    };
}]);