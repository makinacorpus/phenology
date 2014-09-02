'use strict';

angular.module('phenology.api', ['ngResource', 'ngStorage', 'ngStorageTraverser'])

.factory('apiClient', ["$resource", function ($resource) {

        // TODO : create a confValues
        var backend_url = "http://192.168.1.45:8000";
        //var backend_url = "http://" + location.hostname + ":8000";
        //"http://192.168.1.45:8000"//"http://192.168.100.38:8000";//http://192.168.1.45:8000"//"http://192.168.56.1:8000" //http://127.0.0.1:8000"

        // TODO : PUT/POST

        var resource =  $resource(backend_url + '/api/:action ',
          { action:'@action', id: '@id'},
          { 
            get_user_settings: { url: backend_url + '/user_settings/  ', method:'GET'},
            get_user_surveys: { url: backend_url + '/user_surveys/  ', isArray: true, method:'GET'},
            create_survey: { url: backend_url + '/user_surveys/ ', method:'POST'},
            save_survey: { url: backend_url + '/user_surveys/:id', method:'PUT'},
            create_snowcover: { url: backend_url + '/user_snowcover', method:'POST'}
          },
          {
            timeout: '1000'
          }
        );

        return resource;
}])

.service('authApiClient', ["$resource", "$base64", "$http", "storageTraverser", "$q", function ($resource, $base64, $http, storageTraverser, $q) {
        var self = this;

        // TODO : create a confValues

        self.backend_url = "http://192.168.1.45:8000";
        //"http://" + location.hostname + ":8000";
        //"http://192.168.1.45:8000";//"http://192.168.100.38:8000";//"http://192.168.56.1:8000"//"http://127.0.0.1:8000"
        var username,
            password;
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
            username = undefined;
            password = undefined;
        }

        this.getUsername = function(){
            return username;
        }

        if(storageTraverser.traverse('/sessions/current')){
            var current = storageTraverser.traverse('/sessions/current');
            self.setCredentials(current.username, current.password)
        }
}]);