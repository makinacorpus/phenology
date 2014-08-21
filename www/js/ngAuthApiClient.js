'use strict';

angular.module('ngAuthApiClient', ['ngResource', 'base64', 'ngStorageTraverser'])
    .service('authApiClient', ["$resource", "$base64", "$http", "storageTraverser", "$q", function ($resource, $base64, $http, storageTraverser, $q) {
        var self = this;

        // TODO : create a confValues
        self.backend_url = "http://127.0.0.1:8000"
        var username = ""
        var password = ""

        // TODO : PUT/POST

        var resource =  $resource(self.backend_url + '/api/ ');
        
        if(!storageTraverser.traverse('/sessions')){
            storageTraverser.traverse('/')['sessions'] = {};
        }
        if(!storageTraverser.traverse('/users')){
            storageTraverser.traverse('/')['users'] = {};
        }
        this.login = function(){
            var promise = $q.defer();
            var local_data = storageTraverser.traverse('/sessions/' + username);
            if(angular.isDefined(local_data) && local_data.password === password){
                    storageTraverser.traverse('/sessions')["current"] = local_data;
                    promise.resolve();
            }
            else{
                resource.get().$promise.then(function(data){
                    storageTraverser.traverse('/sessions/current',{
                        create: true,
                        data: {username: username, password: password}
                    })
                    storageTraverser.traverse('/sessions/' + username,{
                        create: true,
                        data: {username: username, password: password}
                    })
                    promise.resolve();

                },function(event){
                    var current = storageTraverser.traverse('/sessions/current');
                    if(angular.isDefined(current)){
                        self.setCredentials(current.username, current.password);
                    }
                    else{
                        self.clearCredentials();
                    }
                    promise.reject(event);
                });
            }
            return promise.promise;
        }

        this.setCredentials = function(usr, pwd){
            username = usr;
            password = pwd;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $base64.encode( username + ':' + password)
        }

        this.clearCredentials = function(){
            delete storageTraverser.traverse("/sessions/current");
            username = "";
            password = "";
        }

        this.getUsername = function(){
            return username;
        }

        if(storageTraverser.traverse('/sessions/current')){
            var current = storageTraverser.traverse('/sessions/current');
            self.setCredentials(current.username, current.password)
        }
}]);