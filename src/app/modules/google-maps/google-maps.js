var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'core/utils/utils', 'core/core-directive/core-directive', 'moment', './comp/roads-paths-drawing/roads-paths-drawing'], function (require, exports, utils, CoreDirective, moment, RoadsPathsDrawing) {
    var Map = (function (_super) {
        __extends(Map, _super);
        /*@ngInject*/
        function Map($interval, $timeout, $compile, $q, $http, API, $state, $rootScope, googleMapsSettings, googleMapsParseData, oldToNewConverter) {
            _super.call(this, $interval, $timeout, $compile);
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$compile = $compile;
            this.$q = $q;
            this.$http = $http;
            this.$state = $state;
            this.API = API;
            this.$http = $http;
            this.$q = $q;
            this.$state = $state;
            this.googleMapsParseData = googleMapsParseData;
            this.googleMapsSettings = googleMapsSettings;
            this.oldToNewConverter = oldToNewConverter;
            this.$rootScope = $rootScope;
        }
        Map.$inject = ['$interval', '$timeout', '$compile', '$q', '$http', 'API', '$state', '$rootScope', 'googleMapsSettings', 'googleMapsParseData', 'oldToNewConverter'];
        Map.prototype.link = function ($scope, $element, $attr) {
            var _this = this;
            this.$scope = $scope;
            this.$element = $element;
            this.$attr = $attr;
            //this.oldToNewConverter.convert();
            //return;
            // disable google maps default UI for android app ( run from android app )
            var disableDefaultUI = false;
            if (this.$state.current.name === 'android') {
                disableDefaultUI = true;
            }
            // create google map
            this.gmCreate(this.$element, {
                //center: {lat: 51.414937, lng: 0.014349},
                center: { lat: 51.444239, lng: -0.020235 },
                scrollwheel: true,
                zoom: 16,
                disableDefaultUI: disableDefaultUI,
                options: { styles: [{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "lightness": 100 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "saturation": -100 }] }, { "featureType": "landscape.natural", "stylers": [{ "saturation": -56 }] }, { "featureType": "landscape.man_made", "stylers": [{ "saturation": -68 }] }, { "featureType": "poi.park", "stylers": [{ "saturation": -59 }] }, { "featureType": "road.arterial", "stylers": [{ "saturation": -71 }] }, { "featureType": "road.highway", "elementType": "labels", "stylers": [{ "hue": "#007fff" }, { "saturation": -45 }] }] }
            });
            // prepare road path drawing component
            this.roadsPathsDrawing = new RoadsPathsDrawing(this.$rootScope, this.map, this.googleMapsSettings);
            // set a listener for a viewport change
            this.map.addListener('bounds_changed', this.gmViewportChange.bind(this));
            $scope.$on('maps:settings:change', function () {
                _this.gmChangeProfile();
            });
            $scope.$on('maps:settings:clear', function () {
                _this.$timeout.cancel(_this.nextSyncCall);
                _this.$rootScope.sync = false;
            });
        };
        Map.prototype.gmChangeProfile = function () {
            var _this = this;
            this.$timeout.cancel(this.nextSyncCall);
            var username = this.googleMapsSettings.getCurrentUser().username;
            var date = this.googleMapsSettings.getSelectedDate().datatime;
            var fulldate = this.googleMapsSettings.getSelectedDate().fulldate;
            var from = date + ' 00:00:00';
            var to = date + ' 23:59:59';
            // load the correct data, for chosen profile and date
            this.API.getLocations(username, from, to).then(function (res) {
                _this.googleMapsParseData.parse(res.data).then(function (locations) {
                    _this.locations = locations;
                    _this.gmViewportChange('status:profile:change');
                    // start a sync ? if same day only
                    if (moment().format('YYYY-MM-DD') === moment(fulldate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')) {
                        _this.gmSyncStart();
                        _this.$rootScope.sync = true;
                    }
                    else {
                        _this.$rootScope.sync = false;
                    }
                });
            });
        };
        // when user change the viewport
        // we have to redraw everything
        Map.prototype.gmViewportChange = function (status) {
            // do we have anything to draw ?
            if (!angular.isDefined(this.locations))
                return;
            if (!this.locations.length)
                return;
            // what is the zoom for new view port ?
            var zoom = this.map.getZoom();
            // what is the precision due to zoom ?
            var precision = (function () {
                if (zoom >= 15)
                    return 1;
                if (zoom >= 14)
                    return 3;
                if (zoom >= 13)
                    return 10;
                if (zoom >= 12)
                    return 20;
                if (zoom >= 9)
                    return 40;
                if (zoom >= 7)
                    return 80;
                if (zoom >= 0)
                    return 200;
            })();
            // bounds_changed
            this.roadsPathsDrawing.draw(this.locations, precision, status);
            this.roadsPathsDrawing.center();
        };
        Map.prototype.gmSyncStart = function () {
            var _this = this;
            console.warn('sync');
            this.nextSyncCall = this.$timeout(function () {
                var username = _this.googleMapsSettings.getCurrentUser().username;
                var date = _this.googleMapsSettings.getSelectedDate().datatime;
                var to = date + ' 23:59:59';
                // get last know point date, and add 1 extra second
                var lastLocation = _this.locations[_this.locations.length - 1].datatime;
                lastLocation = moment(lastLocation, 'YYYY-MM-DD HH:mm:ss').add(1, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                ;
                _this.API.getLocations(username, lastLocation, to).then(function (res) {
                    _this.googleMapsParseData.parse(res.data).then(function (locations) {
                        angular.forEach(locations, function (location) {
                            _this.locations.push(location);
                        });
                        _this.gmViewportChange('status:data:sync');
                        _this.gmSyncStart();
                    });
                });
            }, 5000);
        };
        Map.prototype.gmCreate = function ($element, settings) {
            this.map = new google.maps.Map($element[0], settings);
        };
        return Map;
    })(CoreDirective);
    utils.register('App').directive('moduleGoogleMaps', Map);
});
