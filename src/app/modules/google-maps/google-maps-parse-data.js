///<reference path="../../typing/all.d.ts"/>
define(["require", "exports", 'core/utils/utils', './comp/snap-to-road/snap-to-road', 'moment'], function (require, exports, utils, SnapToRoad, moment) {
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
                _this.detectGPSLost();
                _this.deferred.resolve(_this.locations);
            });
            return this.deferred.promise;
        };
        GoogleMapsParseData.prototype.convertLatLngToFloat = function () {
            angular.forEach(this.locations, function (location) {
                location.gps_lat = parseFloat(location.gps_lat);
                location.gps_lng = parseFloat(location.gps_lng);
                location.org_gps_lat = parseFloat(location.original_gps_lat);
                location.org_gps_lng = parseFloat(location.original_gps_lng);
                if (location.org_gps_lat == 0)
                    location.org_gps_lat = location.gps_lat;
                if (location.org_gps_lng == 0)
                    location.org_gps_lng = location.gps_lng;
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
                var polylinesLocationArraySnaped = [];
                if (location.interpolatedLocations.length) {
                    angular.forEach(location.interpolatedLocations, function (intLocation) {
                        if (angular.isDefined(intLocation.gps_lat) && angular.isDefined(intLocation.gps_lng)) {
                            polylinesLocationArraySnaped.push({ lat: intLocation.gps_lat, lng: intLocation.gps_lng });
                        }
                    });
                }
                polylinesLocationArraySnaped.push({ lat: location.gps_lat, lng: location.gps_lng });
                polylinesLocationArray.push({ lat: location.org_gps_lat, lng: location.org_gps_lng });
                location.polylinesLocations = polylinesLocationArray;
                location.polylinesLocationsSnaped = polylinesLocationArraySnaped;
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
                    location.draw.strokeOpacity = 1.0;
                    location.draw.strokeWeight = 5;
                    location.draw.icons = [];
                }
            });
        };
        GoogleMapsParseData.prototype.detectGPSLost = function () {
            var lastLocation = null;
            var lastLocationTime = null;
            angular.forEach(this.locations, function (location) {
                var currentLocationTime = moment(location.datatime, 'YYYY-MM-DD HH:mm:ss');
                if (lastLocation) {
                    if (moment.duration(currentLocationTime.diff(lastLocationTime)).asMinutes() >= 1) {
                        lastLocation.draw.linecolor = '#717171';
                        lastLocation.draw.strokeWeight = 0;
                        lastLocation.draw.icons = [{
                                icon: {
                                    path: 'M 0,-1 0,1',
                                    strokeOpacity: 1,
                                    scale: 4
                                },
                                offset: '0',
                                repeat: '20px'
                            }];
                    }
                }
                lastLocation = location;
                lastLocationTime = currentLocationTime;
            });
        };
        return GoogleMapsParseData;
    })();
    utils.register('App').factory('googleMapsParseData', GoogleMapsParseData);
});
