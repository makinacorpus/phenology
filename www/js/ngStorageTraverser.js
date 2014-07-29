'use strict';

angular.module('ngStorageTraverser', ['ngStorage'])

.service('storageTraverser', function($localStorage){
    var self = this;

    this.traverse = function(path, options) {
        if(!options) {
            options = {};
        }
        
        // get the parent recursively
        if(path == "/") {
            return $localStorage;
        }
        var pos = path.lastIndexOf('/');
        var parent = self.traverse(pos == 0 ? "/" : path.substring(0, pos));
        if(!parent) {
            return undefined
            throw path.substring(0, pos) + " does not exist";
        }

        // get the object
        var obj = undefined;
        var index = -1;
        var arraycontext = false;
        var id = path.substr(pos+1);
        var match = /\[(.+)=(.+)\]/.exec(id);
        if(match) {
            arraycontext = true;
            var attr = match[1];
            var val = JSON.parse(match[2].replace(/'/g, '"'));
            for(var i=0;i<parent.length;i++) {
                var current = parent[i];
                if(current[attr] && current[attr] == val) {
                    var obj = current;
                    var index = i;
                    break;
                }
            }
        } else {
            obj = parent[id];
        }

        // creation
        if(options.create) {
            if(arraycontext) {
                if(index > -1) {
                    parent[index] = data;
                } else {
                    parent.push(data);
                }
            } else {
                parent[id] = options.data || {};
                obj = parent[id];
            }
        }
        if(obj) {
            // update
            if(options.update) {
                for(var key in options.data) {
                    obj[key] = options.data[key];
                }
            }

            // delete
            if(options.delete) {
                if(arraycontext) {
                    parent.splice(index, 1);
                } else {
                    delete parent[id]
                }
                obj = undefined;
            }
        }
        return obj;
    };

});