/**
 * Include Typescript references
 * Those has been build to allow you to include only few .ts files
 */
///<reference path="../typing/all.d.ts"/>
///<reference path="main.ts"/>
define(["require", "exports", 'core/utils/utils', "angular", "ngResource", "ngSanitize", "ngAnimate", "ngTouch", "ngStorage", "ngUiRouter", "ngMultiTransclude", "jquery", "ngStrap", "ngStrapTpl", "ngSwitchery", "ngNya"], function (require, exports, utils) {
    var app = angular.module('App', [
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngTouch',
        'ngStorage',
        'ui.router',
        'multi-transclude',
        'mgcrea.ngStrap',
        'NgSwitchery',
        'nya.bootstrap.select'
    ]);
    app.init = function (container) {
        angular.bootstrap(container, ['App']);
    };
    app.run(['$window', '$rootScope', '$q', '$http', function ($window, $rootScope, $q, $http) {
        utils.setAngularComponents($q, $http);
    }]);
    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('android', {
            url: "/android"
        });
        $urlRouterProvider.otherwise("/");
    }]);
    // config-time dependencies can be injected here at .provider() declaration
    app.provider('customStateProvider', ['$stateProvider', function runtimeStates($stateProvider) {
        // runtime dependencies for the service can be injected here, at the provider.$get() function.
        this.$get = ['$q', '$timeout', '$state', function ($q, $timeout, $state) {
            return {
                addState: function (name, state) {
                    $stateProvider.state(name, state);
                }
            };
        }];
    }]);
    return app;
});
