/**
 * Include Typescript references
 * Those has been build to allow you to include only few .ts files
 */
///<reference path="../typing/all.d.ts"/>
///<reference path="main.ts"/>

/**
 * Amd-dependecy,
 * Include every module you would like to use in angular app,
 * this includes the modules you will create under the new angular module.
 * Please keep those in below order, seperated as it is now:
 * - external modules
 * - internal ( own ) modules
 */

// Angular extensions
///<amd-dependency path="angular"/>
///<amd-dependency path="ngResource"/>
///<amd-dependency path="ngSanitize"/>
///<amd-dependency path="ngAnimate"/>
///<amd-dependency path="ngTouch"/>
///<amd-dependency path="ngStorage"/>
///<amd-dependency path="ngUiRouter"/>
///<amd-dependency path="ngMultiTransclude"/>
///<amd-dependency path="jquery"/>
///<amd-dependency path="ngStrap"/>
///<amd-dependency path="ngStrapTpl"/>
import utils = require('core/utils/utils');

var app : appModule = angular.module('App', [
    'ngResource',           // ngResource
    'ngSanitize',           // ngSanitize
    'ngAnimate',            // ngAnimate
    'ngTouch',              // ngTouch
    'ngStorage',            // ngStorage
    'ui.router',            // ngUiRouter
    'multi-transclude',     // ngMultiTransclude
    'mgcrea.ngStrap',

    // internal common modules


    // internal specific modules
]);


app.init = function(container : HTMLElement) {
    angular.bootstrap(container, ['App']);
};

app.run(function($window : ng.IWindowService, $rootScope : ng.IScope, $q, $http) {
    utils.setAngularComponents($q, $http);
});

app.config(function($stateProvider : angular.ui.IStateProvider, $urlRouterProvider : angular.ui.IUrlRouterProvider){
    $stateProvider
        .state('android', {
            url: "/android"
        });
    $urlRouterProvider.otherwise("/");

});

// config-time dependencies can be injected here at .provider() declaration
app.provider('customStateProvider', function runtimeStates($stateProvider)  {
    // runtime dependencies for the service can be injected here, at the provider.$get() function.
    this.$get = function($q, $timeout, $state) { // for example
        return {
            addState: function(name, state) {
                $stateProvider.state(name, state);
            }
        }
    }
});

export = app;





