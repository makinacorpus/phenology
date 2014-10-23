'use strict';

angular.module('phenology.tools', ['ngStorageTraverser', 'phenology.api', 'ngCordova'])

.service('toolService', function(storageTraverser, authApiClient, $cordovaFile, $http, $log, $q){
    var self = this;

    this.mobile_root_path = 'cdvfile://localhost/persistent';
    this.mobile_path = 'cdvfile://localhost/persistent/phenology';
    this.mobile_path_tiles = 'cdvfile://localhost/persistent/phenology/tiles';
    this.remote_background_url = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png';
    this.mobile_background_url = this.mobile_path_tiles + "/{z}/{x}/{y}.png";

    this.create_div_icon = function(additional_class) {
        return {
                type: 'div',
                iconSize: [34, 52],
                iconAnchor: [13, 52],
                popupAnchor: [0, -32],
                className: 'icon ion-android-location mymarker ' + additional_class,
                html: ''
            }
    }

    this.today = function() {
        var today = new Date();
        return today.toISOString().slice(0, 10);
    }

    this.getRootCordovaUrl = function(){
        return self.mobile_path + '/';
    }

    this.getMediaUrl = function(){
        return authApiClient.backend_url + '/media/';
    } 

    this.getFullPictureUrl = function(picture_url){
        var root_url = (angular.isDefined(window.cordova)) ? self.getRootCordovaUrl() : self.getMediaUrl();
        return root_url + picture_url;
    }

    this.downloadPicture = function(relativePath){
        var path = self.getRootCordovaUrl() + relativePath;
        var url = self.getMediaUrl() + relativePath;
        return self.downloadFile(url, path, false);
    }

    //thanks to Natsu
    this.downloadFile = function(url, filepath, forceDownload) {

        if (angular.isDefined(forceDownload) && forceDownload === false) {
            var relativePath = filepath.replace(self.mobile_root_path + '/', '');
            return $cordovaFile.readFileMetadata(relativePath)
            .then(function(file) {
                // If there is a file, we check on server if file was modified
                // by using HTTP header 'If-Modified-Since'
                var lastModifiedDate = new Date(file.lastModifiedDate),
                    config = {
                        headers: {
                        'If-Modified-Since': lastModifiedDate.toUTCString()
                        }
                    };
                // NOTICE
                // We have used $http service because we needed 'If-Modified-Since' HTTP header,
                // and cordova plugin file transfer (used by $cordovaFile.downloadFile) doesn't manage it properly.
                // In case on 304, response body is empty, and cordova plugin overwrites previous data with empty file...
                // https://issues.apache.org/jira/browse/CB-7006
                return $http.get(url, config)
                .then(function(response) {
                    // Response is 2xx
                    // It means that server file is more recent than device one
                    // We download it so !
                    // We could have used $cordovaFile 'writeFile' function, as response contains our data,
                    // but we prefer 'downloadFile' call to be consistent with other cases.
                    return $cordovaFile.downloadFile(url, filepath);
                }, function(response) {
                    var status = response.status,
                    deferred = $q.defer();
                    if (status === 304) {
                        // If status is 304, it means that server file is older than device one
                        // Do nothing.
                        var msg = 'File not changed (304) : ' + url + ' at ' + filepath;
                        $log.info(msg);
                        deferred.resolve({message: msg, type: 'connection', data: {status: status}});
                    }
                    else {
                        // If status is different than 304, there is a connection problem
                        // We can't connect to URL
                        if (status === 0) {
                            $log.info('Network unreachable');
                            deferred.reject({message: 'Network unreachable', type: 'connection', data: {status: status}});
                        }
                        else {
                            $log.info('Response error status ' + status);
                            deferred.reject({message: 'Response error ', type: 'connection', data: {status: status}});
                        }
                    }
                    return deferred.promise;
                });
                }, function() {
                    // If there is no file with that path, we download it !
                    $log.info('cannot read ' + filepath + ' so downloading it !' + relativePath);
                    return $cordovaFile.downloadFile(url, filepath);
                });
        }
        else {
                $log.info('forcing download of ' + url);
                return $cordovaFile.downloadFile(url, filepath)
            }
        };
});