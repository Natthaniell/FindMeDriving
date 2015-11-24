///<reference path="../typing/all.d.ts"/>

require.config({
    waitSeconds: 0,
    urlArgs: 'v=' + Math.floor((Math.random() * 1000) + 1),
    baseUrl: './app/',
    paths: {

        // not angular modules
        jquery      : '../lib/jquery-2.1.4.min',
        angular     : '../lib/angular',
        ngAnimate   : '../lib/angular-animate',
        ngResource  : '../lib/angular-resource',
        ngSanitize  : '../lib/angular-sanitize',
        ngStorage   : '../lib/angular-storage',
        ngTouch     : '../lib/angular-touch',
        ngUiRouter  : '../lib/angular-ui-router',
        ngMultiTransclude : '../lib/angular-multi-transclude',
        utils       : 'core/utils/utils',
        moment      : '../lib/moment',
        q           : '../lib/q',
        qtip        : '../lib/jquery.qtip.min',
        ngStrap     : '../lib/angular-strap',
        ngStrapTpl  : '../lib/angular-strap-tpl',
        switchery   : '../lib/switchery',
        ngSwitchery : '../lib/angular-switchery',
        ngNya       : '../lib/angular-nya',
        labelmarkers: '../lib/labelmarkers'
    },
    shim: {
        ngNya : {
            deps : ['angular'],
            exports : 'angular'
        },
        qtip : {
            deps : ['jquery']
        },
        ngSwitchery : {
            deps : ['switchery', 'angular'],
            exports : 'angular'
        },
        ngMultiTransclude : {
            deps : ['angular'],
            exports : 'angular'
        },
        ngStrap : {
            deps : ['angular'],
            exports : 'angular'
        },
        ngStrapTpl : {
            deps : ['angular', 'ngStrap'],
            exports : 'angular'
        },
        ngStorage: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngUiRouter: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngResource: {
            deps: ['angular'],
            exports: 'angular'
        },
        //ngTemplates: {
        //    deps: ['app'],
        //    exports: 'angular'
        //},
        ngSanitize: {
            deps: ['angular'],
            exports: 'angular'
        },
        ngTouch : {
            deps: ['angular'],
            exports: 'angular'
        },
        ngAnimate : {
            deps: ['angular'],
            exports: 'angular'
        },
        angular: {
            exports: 'angular'
        }
    }
});

// Preinitialize Angular Application
require(['app', 'core/utils/utils', 'labelmarkers'], function(app : any) {

    require([

    ], function(){

        // Start angular
        require([
            'core/core-data/core-data',
            'modules/google-maps/google-maps',
            'modules/google-maps/google-maps-parse-data',
            'modules/google-maps-settings/google-maps-settings',
            'modules/google-maps/old-to-new-converter'
        ], function(){
            app.init(document);
        });
    });
});