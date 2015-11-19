///<reference path="../../typing/all.d.ts"/>
import utils = require('core/utils/utils');
import CoreDirective = require('core/core-directive/core-directive');
import app = require('app');

// import components
import SnapToRoad = require('./comp/snap-to-road/snap-to-road');
import RoadsPathsDrawing = require('./comp/roads-paths-drawing/roads-paths-drawing');

class Map extends CoreDirective{

    map                 : google.maps.Map;
    API                 : any;
    data                : any;
    googleMapsParseData : any;
    googleMapsSettings  : any;
    roadsPathsDrawing   : any;
    oldToNewConverter   : any;

    locations           : Array<location>;


    /*@ngInject*/
    constructor(protected $interval, protected $timeout, protected $compile, protected $q, protected $http, API, protected $state, googleMapsSettings, googleMapsParseData, oldToNewConverter){
        super($interval, $timeout, $compile);
        this.API = API;
        this.$http = $http;
        this.$q = $q;
        this.$state = $state;
        this.googleMapsParseData = googleMapsParseData;
        this.googleMapsSettings = googleMapsSettings;
        this.oldToNewConverter = oldToNewConverter;
    }

    protected link($scope, $element, $attr){

        this.$scope = $scope;
        this.$element = $element;
        this.$attr = $attr;
        //this.oldToNewConverter.convert();
        //return;

        // disable google maps default UI for android app ( run from android app )
        var disableDefaultUI = false;
        if(this.$state.current.name === 'android'){
            disableDefaultUI = true;
        }

        // create google map
        this.gmCreate(this.$element, {
            center: {lat: 51.414937, lng: 0.014349},
            //center: {lat: 51.444239, lng: -0.020235},
            scrollwheel:true,
            zoom: 16,
            disableDefaultUI: disableDefaultUI,
            options : { styles: [{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"lightness": 100}]}, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{"saturation": -100}]}, { "featureType": "landscape.natural", "stylers": [{"saturation": -56}]}, { "featureType": "landscape.man_made", "stylers": [{"saturation": -68}]}, { "featureType": "poi.park", "stylers": [{"saturation": -59}]}, { "featureType": "road.arterial", "stylers": [{"saturation": -71}]}, { "featureType": "road.highway", "elementType": "labels", "stylers": [{"hue": "#007fff"}, {"saturation": -45 }]}]}
        });

        // prepare road path drawing component
        this.roadsPathsDrawing = new RoadsPathsDrawing(this.map, this.googleMapsSettings.getSettings());

        // set a listener for a viewport change
        this.map.addListener('bounds_changed', this.gmViewportChange.bind(this));


        $scope.$on('maps:settings:change', () => {
            this.gmChangeProfile();
        });

    }

    private gmChangeProfile(){
        var username = this.googleMapsSettings.getCurrentUser().username;
        var from = '2013-11-14 00:00:00';
        var to = '2016-11-14 00:00:00';
        // load the correct data, for chosen profile and date
        this.API.getLocations(username, from, to).then((res) => {

            this.googleMapsParseData.parse(res.data).then((locations) => {
                this.locations = locations;
                this.gmViewportChange();
            });

        });
    }

    // when user change the viewport
    // we have to redraw everything
    private gmViewportChange(){

        // do we have anything to draw ?
        if(!angular.isDefined(this.locations)) return;
        if(!this.locations.length) return;

        // what is the zoom for new view port ?
        let zoom = this.map.getZoom();

        // what is the precision due to zoom ?
        let precision = (() => {
            if(zoom >= 15)  return 1;
            if(zoom >= 14)  return 3;
            if(zoom >= 13)  return 10;
            if(zoom >=12)   return 20;
            if(zoom >=0)    return 200;
        })();

        // bounds_changed
        this.roadsPathsDrawing.draw(this.locations, precision);
        this.roadsPathsDrawing.center();

    }

    private gmSyncLoop(){

    }

    private gmCreate($element, settings){
        this.map = new google.maps.Map($element[0],settings);
    }



}



utils.register('App').directive('moduleGoogleMaps', Map);