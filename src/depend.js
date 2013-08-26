'use strict';

var fs = require('fs');
var path = require('path');

var injector = {};

injector.$$services = {};
injector.$$serviceInstances = {};

/* --------------------
 *  Public methods
 * -------------------- */

/* Add a service factory. */
injector.add = function (name, factory) {
    injector.$$services[name] = factory;
};

/* Inject a service instance. */
injector.inject = function (name, instance) {
    injector.$$serviceInstances[name] = instance;
};

/* Get a service instance. */
injector.get = function (name) {
    if (injector.$$serviceInstances[name] !== undefined) {
        return injector.$$serviceInstances[name];
    }
    if (injector.$$services[name] === undefined) {
        throw new Error('Undefined service ' + name);
    }

    var service = injector.$$services[name];
    var instance = injector.apply(service);

    injector.$$serviceInstances[name] = instance;
    return instance;
};

/* Call fn with dependent instances as arguments */
injector.apply = function (fn) {
    var $injects = injector.$inject(fn);
    return fn.apply(fn, $injects);
};

/* Load all services in specified folder */
injector.load = function (dirname) {
    var regex = /.js$/;
    dirname = path.resolve(dirname);
    var names = fs.readdirSync(dirname);
    names.forEach(function (filename) {
        var fullname = path.join(dirname, filename);
        if (fs.lstatSync(fullname).isFile() && filename.search(regex) !== -1) {
            var name = filename.replace(regex, '');
            var factory = require(fullname);
            if (typeof factory !== 'function') {
                throw new Error('Bad service ' + name + ' in file ' + fullname);
            }
            injector.add(name, factory);
        }
    });
};

/* --------------------
 *  Service methods
 * -------------------- */

injector.$inject = function (fn) {
    if (fn.$injects !== undefined) {
        return fn.$injects;
    }

    var $arguments = injector.$annotate(fn);
    var $injects = [];
    $arguments.forEach(function (name) {
        var inject = injector.get(name);
        $injects.push(inject);
    });

    fn.$injects = $injects;
    return $injects;
};

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

injector.$annotate = function (fn) {
    if (fn.$arguments !== undefined) {
        return fn.$arguments;
    }

    var $arguments = [];
    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach(function (arg) {
        arg.replace(FN_ARG, function (all, underscore, name) {
            $arguments.push(name);
        });
    });

    fn.$arguments = $arguments;
    return $arguments;
};

module.exports = injector;
