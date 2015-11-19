///<reference path="../../typing/all.d.ts"/>
define(["require", "exports", 'core/utils/utils', './comp/snap-to-road/snap-to-road'], function (require, exports, utils, SnapToRoad) {
    var GoogleMapsParseData = (function () {
        /*@ngInject*/
        function GoogleMapsParseData(API, $http, $q, $timeout) {
            this.API = API;
            this.$http = $http;
            this.$q = $q;
            this.$timeout = $timeout;
            this.snapToRoad = new SnapToRoad(API, $http, $q);
        }
        GoogleMapsParseData.$inject = ['API', '$http', '$q', '$timeout'];
        // @return promise
        GoogleMapsParseData.prototype.parse = function (locations) {
            var _this = this;
            this.deferred = this.$q.defer();
            this.locations = locations;
            this.snapToRoad.addLocations(this.locations);
            this.snapToRoad.snap().then(function () {
                _this.convertLatLngToFloat();
                _this.createPolylinesLocations();
                _this.calculateSpeeds();
                _this.deferred.resolve(_this.locations);
            });
            return this.deferred.promise;
        };
        GoogleMapsParseData.prototype.convertLatLngToFloat = function () {
            angular.forEach(this.locations, function (location) {
                location.gps_lat = parseFloat(location.gps_lat);
                location.gps_lng = parseFloat(location.gps_lng);
                location.interpolatedLocations = JSON.parse(location.interpolatedLocations);
                if (!angular.isObject(location.interpolatedLocations)) {
                    angular.forEach(location.interpolatedLocations, function (intLocation) {
                        intLocation.gps_lat = parseFloat(intLocation.gps_lat);
                        intLocation.gps_lat = parseFloat(intLocation.gps_lat);
                    });
                }
            });
        };
        GoogleMapsParseData.prototype.createPolylinesLocations = function () {
            angular.forEach(this.locations, function (location) {
                var polylinesLocationArray = [];
                if (location.interpolatedLocations.length) {
                    angular.forEach(location.interpolatedLocations, function (intLocation) {
                        if (angular.isDefined(intLocation.gps_lat) && angular.isDefined(intLocation.gps_lng)) {
                            polylinesLocationArray.push({ lat: intLocation.gps_lat, lng: intLocation.gps_lng });
                        }
                    });
                }
                polylinesLocationArray.push({ lat: location.gps_lat, lng: location.gps_lng });
                location.polylinesLocations = polylinesLocationArray;
            });
        };
        GoogleMapsParseData.prototype.calculateSpeeds = function () {
            function getColor(speed) {
                var speedColor = null;
                speed = ((speed * 3600) / 1000);
                angular.forEach(utils.config.mapSpeedColors, function (colorObj) {
                    if (speedColor)
                        return;
                    var value = colorObj[0];
                    var color = colorObj[1];
                    if (speed <= value) {
                        speedColor = color;
                    }
                });
                return speedColor;
            }
            angular.forEach(this.locations, function (location) {
                if (angular.isDefined(location.gps_speed)) {
                    if (!angular.isDefined(location.draw))
                        location.draw = {};
                    var lineColor = getColor(location.gps_speed);
                    location.draw.linecolor = lineColor;
                }
            });
        };
        return GoogleMapsParseData;
    })();
    utils.register('App').factory('googleMapsParseData', GoogleMapsParseData);
});
