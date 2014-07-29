'use strict';

angular.module('ngAuthApiClient', ['ngResource', 'base64', 'ngStorageTraverser'])
    .service('authApiClient', ["$resource", "$base64", "$http", "storageTraverser", function ($resource, $base64, $http, storageTraverser) {
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
            return resource.get().$promise.then(function(data){
                storageTraverser.traverse('/sessions/current',{
                    create: true,
                    data: {username: username, password: password}
                })
                storageTraverser.traverse('/sessions/' + username,{
                    create: true,
                    data: {username: username, password: password}
                })
            });
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