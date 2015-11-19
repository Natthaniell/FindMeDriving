define(["require", "exports", 'core/utils/utils'], function (require, exports, utils) {
    var DataAPI = (function () {
        /*@ngInject*/
        function DataAPI($http) {
            this.$http = $http;
            this.baseUrl = 'http://fmd.rswiat.co.uk/';
            this.$http = $http;
        }
        DataAPI.$inject = ['$http'];
        DataAPI.prototype.updateLocations = function (locations) {
            return this.$http.post(this.baseUrl + 'api/updateLocations.php', $.param({
                locations: locations
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };
        DataAPI.prototype.saveLocations = function (locations) {
            return this.$http.post(this.baseUrl + 'api/saveLocations.php', $.param({
                locations: locations
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };
        DataAPI.prototype.getAvailableDates = function () {
            return this.$http.post(this.baseUrl + 'api/getAvailableDates.php', $.param({
                username: 'Radek'
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };
        DataAPI.prototype.getAvailableUsers = function () {
            return this.$http.post(this.baseUrl + 'api/getUsers.php', $.param({}), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };
        DataAPI.prototype.getLocations = function (username, from, to) {
            return this.$http.post(this.baseUrl + 'api/getLocations.php', $.param({
                username: username,
                date_from: from,
                date_to: to //"2015-11-15 23:59:59"
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };
        DataAPI.prototype.get = function () {
            return this.$http.get(this.baseUrl + 'api/json/getLocations.json');
        };
        return DataAPI;
    })();
    utils.register('App').factory('API', DataAPI);
});
