define(["require", "exports", 'core/utils/utils'], function (require, exports, utils) {
    var GoogleMapsSettings = (function () {
        /*@ngInject*/
        function GoogleMapsSettings($rootScope, API) {
            var _this = this;
            this.usersList = [];
            this.userAvailableDates = [];
            this.$rootScope = $rootScope;
            this.API = API;
            this.API.getAvailableUsers().then(function (res) {
                angular.forEach(res.data, function (user) {
                    _this.usersList.push(user);
                });
            });
        }
        GoogleMapsSettings.$inject = ['$rootScope', 'API'];
        GoogleMapsSettings.prototype.getSettings = function () {
            return {
                snapToRoad: true,
                interpolate: true,
                interpolatePrecision: 1
            };
        };
        GoogleMapsSettings.prototype.setCurrentUser = function (username) {
            console.info('username: ' + username);
            this.currentUser = username;
            this.setAvailableDates();
        };
        GoogleMapsSettings.prototype.getCurrentUser = function () {
            return this.currentUser;
        };
        GoogleMapsSettings.prototype.getUsersList = function () {
            return this.usersList;
        };
        GoogleMapsSettings.prototype.setSelectedDate = function (date) {
            this.selectedDate = date;
        };
        GoogleMapsSettings.prototype.setAvailableDates = function () {
            var _this = this;
            this.API.getAvailableDates(this.currentUser).then(function (res) {
                angular.forEach(res.data, function (date) {
                    _this.userAvailableDates.push(date);
                });
            });
        };
        GoogleMapsSettings.prototype.getAvailableDates = function () {
            return this.userAvailableDates;
        };
        GoogleMapsSettings.prototype.change = function () {
            this.$rootScope.$broadcast('maps:settings:change');
        };
        return GoogleMapsSettings;
    })();
    var SettingsAsideController = (function () {
        /*@ngInject*/
        function SettingsAsideController($scope, googleMapsSettings) {
            $scope.model = googleMapsSettings;
            $scope.$watch("selectedUsername", function (newValue) {
                googleMapsSettings.setCurrentUser(newValue);
            });
            $scope.$watch("selectedDate", function (newValue) {
                googleMapsSettings.setSelectedDate(newValue);
            });
        }
        SettingsAsideController.$inject = ['$scope', 'googleMapsSettings'];
        return SettingsAsideController;
    })();
    utils.register('App').factory('googleMapsSettings', GoogleMapsSettings);
    utils.register('App').controller('SettingsAsideController', SettingsAsideController);
});
