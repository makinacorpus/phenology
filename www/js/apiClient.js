'use strict';

angular.module('ngApiClient', ['ngResource', 'base64', 'ngStorageTraverser'])
    .factory('apiClient', ["$resource", "$base64", "$http", "storageTraverser", function ($resource, $base64, $http, storageTraverser) {

        // TODO : create a confValues
        var backend_url = "http://127.0.0.1:8000"

        // TODO : PUT/POST

        var resource =  $resource(backend_url + '/api/:action ',
          { action:'@action', id: '@id'},
          { 
            get_user_settings: { url: backend_url + '/user_settings/  ', method:'GET'},
            get_user_surveys: { url: backend_url + '/user_surveys/  ', isArray: true, method:'GET'},
            create_survey: { url: backend_url + '/user_surveys/ ', method:'POST'},
            save_survey: { url: backend_url + '/user_surveys/:id', method:'PUT'},
            create_snowcover: { url: backend_url + '/user_snowcover', method:'POST'}
          }
        );

        return resource;
}]);