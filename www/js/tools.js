'use strict';

angular.module('phenology.tools', ['ngStorageTraverser', 'phenology.api', 'ngCordova'])

.service('toolService', function(storageTraverser, authApiClient, $cordovaFile, $cordovaFileTransfer, $http, $log, $q){
    var self = this;

    this.mobile_path = cordova.file.applicationStorageDirectory + '/phenology';
    this.mobile_path_tiles = this.mobile_path + '/tiles';
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

    this.getLimitDates = function(stage, monthdiff, year){
        monthdiff = monthdiff || 2;
        var year_start = +year || +(new Date().getFullYear());
        var day_start = +stage.day_start;
        var month_start = +stage.month_start;
        var day_end = +stage.day_end;
        var month_end = +stage.month_end;
        var year_end = +year_start;
        if(month_start > month_end){
          year_end = year_start + 1;
        }
        //console.log(stage, year_start, month_start, day_start)
        var date_start1 = new Date(year_start, month_start -1 , day_start);
        date_start1.setMonth(date_start1.getMonth() - monthdiff);

        var date_end1 = new Date(year_end, month_end - 1, day_end);
        date_end1.setMonth(date_end1.getMonth() + monthdiff);
        return {
            start: date_start1,
            end: date_end1
        }
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

    this.downloadTiles =function(filename){
        var path = self.getRootCordovaUrl() + "tiles";
        var url = self.getMediaUrl() + "tiles/" + filename;
        return self.downloadAndUnzip(url, path);
    }

    //thanks to Natsu
    this.downloadFile = function(url, filepath, forceDownload) {
        if (angular.isDefined(forceDownload) && forceDownload === false) {
            var filename = filepath.split('/').pop();
            var path = filepath.substring(0, filepath.lastIndexOf('/'));
            return $cordovaFile.checkFile(path, filename)
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
                // and cordova plugin file transfer doesn't manage it properly.
                // In case on 304, response body is empty, and cordova plugin overwrites previous data with empty file...
                // https://issues.apache.org/jira/browse/CB-7006
                return $http.get(url, config)
                .then(function(response) {
                    // Response is 2xx
                    // It means that server file is more recent than device one
                    // We download it so !
                    // We could have used $cordovaFile 'writeFile' function, as response contains our data,
                    // but we prefer 'download' call to be consistent with other cases.
                    return $cordovaFileTransfer.download(url, filepath);
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
                    $log.info('cannot read ' + filepath + ' so downloading it !' + url);
                    return $cordovaFileTransfer.download(url, filepath);
                });
        }
        else {
                $log.info('forcing download of ' + url);
                return $cordovaFileTransfer.download(url, filepath)
            }
        };

        this.unzip = function(zipLocalPath, toPath) {

            var deferred = $q.defer();

            // Calling unzip method from Zip Plugin (https://github.com/MobileChromeApps/zip)
            zip.unzip(zipLocalPath, toPath, function(result) {

                if (result == 0) {
                    deferred.resolve("unzip complete");
                }
                else {
                    deferred.reject("unzip failed");
                }

            });
            return deferred.promise;
        };

        this.downloadAndUnzip = function(url, folderPath) {
            var filename = url.split(/[\/]+/).pop();

            return self.downloadFile(url, folderPath + "/" + filename, false)
            .then(function(response) {
                 return self.unzip(folderPath + "/" + filename, folderPath);
            });
        };
});