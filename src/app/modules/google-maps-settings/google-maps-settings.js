define(["require", "exports", 'core/utils/utils', 'moment'], function (require, exports, utils, moment) {
    var GoogleMapsSettings = (function () {
        /*@ngInject*/
        function GoogleMapsSettings($rootScope, API) {
            var _this = this;
            this.$rootScope = $rootScope;
            this.API = API;
            this.usersList = [];
            this.userAvailableDates = [];
            this.userAvailableJourneys = [];
            this.refreshTime = new Date();
            // settings
            this.snapToRoad = true;
            this.$rootScope = $rootScope;
            this.API = API;
            this.API.getAvailableUsers().then(function (res) {
                _this.usersList = [];
                angular.forEach(res.data, function (user) {
                    _this.usersList.push(user);
                });
            });
        }
        GoogleMapsSettings.$inject = ['$rootScope', 'API'];
        GoogleMapsSettings.prototype.setCurrentUser = function (username) {
            if (!angular.isDefined(username))
                return;
            this.currentUser = username;
            this.apiGetAvailableDates(username.username);
        };
        GoogleMapsSettings.prototype.getCurrentUser = function () {
            return this.currentUser;
        };
        GoogleMapsSettings.prototype.getUsersList = function () {
            return this.usersList;
        };
        GoogleMapsSettings.prototype.getSelectedDate = function () {
            return this.selectedDate;
        };
        GoogleMapsSettings.prototype.setSelectedDate = function (date) {
            this.selectedDate = date;
        };
        // Get Available dates - API Call
        // get available dates for a username
        GoogleMapsSettings.prototype.apiGetAvailableDates = function (username) {
            var _this = this;
            if (!angular.isDefined(username))
                return;
            this.API.getAvailableDates(username).then(function (res) {
                var lastDate = null;
                _this.userAvailableDates = [];
                angular.forEach(res.data, function (dateArr) {
                    angular.forEach(dateArr, function (date) {
                        var momentDate = moment(date, 'YYYY-MM-DD HH:mm:ss');
                        if (!lastDate || lastDate.format('YYYY-MM-DD') !== momentDate.format('YYYY-MM-DD')) {
                            var label = momentDate.format('YYYY-MMM-DD');
                            if (moment.duration(moment().diff(momentDate)).asHours() <= 2) {
                                label += ' ongoing';
                            }
                            _this.userAvailableDates.push({
                                label: label,
                                datatime: momentDate.format('YYYY-MM-DD'),
                                fulldate: momentDate.format('YYYY-MM-DD HH:mm:ss')
                            });
                        }
                        lastDate = momentDate;
                    });
                });
            });
        };
        GoogleMapsSettings.prototype.getAvailableDates = function () {
            return this.userAvailableDates;
        };
        GoogleMapsSettings.prototype.getAvailableJourneys = function () {
            return this.userAvailableJourneys;
        };
        GoogleMapsSettings.prototype.refresh = function () {
            var _this = this;
            this.$rootScope.$broadcast('maps:settings:clear');
            this.usersList = [];
            this.userAvailableDates = [];
            this.userAvailableJourneys = [];
            this.selectedDate = '';
            this.currentUser = '';
            this.API.getAvailableUsers().then(function (res) {
                angular.forEach(res.data, function (user) {
                    _this.usersList.push(user);
                });
            });
        };
        GoogleMapsSettings.prototype.change = function () {
            this.$rootScope.$broadcast('maps:settings:change');
        };
        return GoogleMapsSettings;
    })();
    var SettingsAsideController = (function () {
        /*@ngInject*/
        function SettingsAsideController($timeout, $scope, googleMapsSettings) {
            $scope.model = googleMapsSettings;
            $scope.selectedUsername = googleMapsSettings.currentUser;
            $scope.selectedDate = googleMapsSettings.selectedDate;
            $scope.$watch("selectedUsername", function (newValue) {
                if (!angular.isDefined(newValue))
                    return;
                googleMapsSettings.setCurrentUser(newValue);
            });
            $scope.$watch("selectedDate", function (newValue) {
                if (!angular.isDefined(newValue))
                    return;
                googleMapsSettings.setSelectedDate(newValue);
            });
        }
        SettingsAsideController.$inject = ['$timeout', '$scope', 'googleMapsSettings'];
        return SettingsAsideController;
    })();
    utils.register('App').factory('googleMapsSettings', GoogleMapsSettings);
    utils.register('App').controller('SettingsAsideController', SettingsAsideController);
});
