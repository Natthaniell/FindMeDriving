define(["require", "exports", 'core/utils/utils'], function (require, exports, utils) {
    var OldToNewConverter = (function () {
        /*@ngInject*/
        function OldToNewConverter(API, $http, $q, $timeout) {
            this.API = API;
            this.$http = $http;
            this.$q = $q;
            this.$timeout = $timeout;
        }
        OldToNewConverter.$inject = ['API', '$http', '$q', '$timeout'];
        OldToNewConverter.prototype.convert = function () {
            var _this = this;
            var convertedLocations = [];
            this.$http.get('api/json/getLocations.json').then(function (res) {
                angular.forEach(res.data, function (location) {
                    var username = 'Radek';
                    var datetime = location.time;
                    var gps_lat = location.location.split('|')[0];
                    var gps_lng = location.location.split('|')[1];
                    var gps_speed = 0;
                    var isFixedLocation = 0;
                    var gps_provider = 'gps';
                    var gps_accuracy = 0;
                    var hasPhoto = 0;
                    var emoticon = 0;
                    var interpolatedLocations = '';
                    var original_gps_lat = '';
                    var original_gps_lng = '';
                    var calc_speed = '';
                    convertedLocations.push({
                        username: username,
                        datetime: datetime,
                        gps_lat: gps_lat,
                        gps_lng: gps_lng,
                        isFixedLocation: isFixedLocation,
                        gps_provider: gps_provider
                    });
                });
                _this.API.saveLocations(convertedLocations);
            });
        };
        return OldToNewConverter;
    })();
    utils.register('App').factory('oldToNewConverter', OldToNewConverter);
});
