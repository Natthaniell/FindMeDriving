var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'core/utils/utils', 'core/core-directive/core-directive', './comp/roads-paths-drawing/roads-paths-drawing'], function (require, exports, utils, CoreDirective, RoadsPathsDrawing) {
    var Map = (function (_super) {
        __extends(Map, _super);
        /*@ngInject*/
        function Map($interval, $timeout, $compile, $q, $http, API, $state, googleMapsSettings, googleMapsParseData, oldToNewConverter) {
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
        }
        Map.$inject = ['$interval', '$timeout', '$compile', '$q', '$http', 'API', '$state', 'googleMapsSettings', 'googleMapsParseData', 'oldToNewConverter'];
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
                center: { lat: 51.414937, lng: 0.014349 },
                //center: {lat: 51.444239, lng: -0.020235},
                scrollwheel: true,
                zoom: 16,
                disableDefaultUI: disableDefaultUI,
                options: { styles: [{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "lightness": 100 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "saturation": -100 }] }, { "featureType": "landscape.natural", "stylers": [{ "saturation": -56 }] }, { "featureType": "landscape.man_made", "stylers": [{ "saturation": -68 }] }, { "featureType": "poi.park", "stylers": [{ "saturation": -59 }] }, { "featureType": "road.arterial", "stylers": [{ "saturation": -71 }] }, { "featureType": "road.highway", "elementType": "labels", "stylers": [{ "hue": "#007fff" }, { "saturation": -45 }] }] }
            });
            // prepare road path drawing component
            this.roadsPathsDrawing = new RoadsPathsDrawing(this.map, this.googleMapsSettings.getSettings());
            // set a listener for a viewport change
            this.map.addListener('bounds_changed', this.gmViewportChange.bind(this));
            $scope.$on('maps:settings:change', function () {
                _this.gmChangeProfile();
            });
        };
        Map.prototype.gmChangeProfile = function () {
            var _this = this;
            var username = this.googleMapsSettings.getCurrentUser().username;
            var from = '2013-11-14 00:00:00';
            var to = '2016-11-14 00:00:00';
            // load the correct data, for chosen profile and date
            this.API.getLocations(username, from, to).then(function (res) {
                _this.googleMapsParseData.parse(res.data).then(function (locations) {
                    _this.locations = locations;
                    _this.gmViewportChange();
                });
            });
        };
        // when user change the viewport
        // we have to redraw everything
        Map.prototype.gmViewportChange = function () {
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
                if (zoom >= 0)
                    return 200;
            })();
            // bounds_changed
            this.roadsPathsDrawing.draw(this.locations, precision);
            this.roadsPathsDrawing.center();
        };
        Map.prototype.gmSyncLoop = function () {
        };
        Map.prototype.gmCreate = function ($element, settings) {
            this.map = new google.maps.Map($element[0], settings);
        };
        return Map;
    })(CoreDirective);
    utils.register('App').directive('moduleGoogleMaps', Map);
});
