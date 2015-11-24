///<reference path="../../typing/all.d.ts"/>
import utils = require('core/utils/utils');
import CoreDirective = require('core/core-directive/core-directive');
import app = require('app');
import moment = require('moment');

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
    $rootScope          : any;

    locations           : Array<location>;


    /*@ngInject*/
    constructor(protected $interval, protected $timeout, protected $compile, protected $q, protected $http, API, protected $state, $rootScope, googleMapsSettings, googleMapsParseData, oldToNewConverter){
        super($interval, $timeout, $compile);
        this.API = API;
        this.$http = $http;
        this.$q = $q;
        this.$state = $state;
        this.googleMapsParseData = googleMapsParseData;
        this.googleMapsSettings = googleMapsSettings;
        this.oldToNewConverter = oldToNewConverter;
        this.$rootScope = $rootScope;
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
            //center: {lat: 51.414937, lng: 0.014349},
            center: {lat: 51.444239, lng: -0.020235},
            scrollwheel:true,
            zoom: 16,
            disableDefaultUI: disableDefaultUI,
            options : { styles: [{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"lightness": 100}]}, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{"saturation": -100}]}, { "featureType": "landscape.natural", "stylers": [{"saturation": -56}]}, { "featureType": "landscape.man_made", "stylers": [{"saturation": -68}]}, { "featureType": "poi.park", "stylers": [{"saturation": -59}]}, { "featureType": "road.arterial", "stylers": [{"saturation": -71}]}, { "featureType": "road.highway", "elementType": "labels", "stylers": [{"hue": "#007fff"}, {"saturation": -45 }]}]}
        });

        // prepare road path drawing component
        this.roadsPathsDrawing = new RoadsPathsDrawing(this.$rootScope, this.map, this.googleMapsSettings);

        // set a listener for a viewport change
        this.map.addListener('bounds_changed', this.gmViewportChange.bind(this));


        $scope.$on('maps:settings:change', () => {
            this.gmChangeProfile();
        });

        $scope.$on('maps:settings:clear', () => {
           this.$timeout.cancel(this.nextSyncCall);
            this.$rootScope.sync = false;
        });

    }

    private nextSyncCall : any;

    private gmChangeProfile(){
        this.$timeout.cancel(this.nextSyncCall);
        var username = this.googleMapsSettings.getCurrentUser().username;
        var date    = this.googleMapsSettings.getSelectedDate().datatime;
        var fulldate = this.googleMapsSettings.getSelectedDate().fulldate;
        var from = date + ' 00:00:00';
        var to  = date + ' 23:59:59';

        // load the correct data, for chosen profile and date
        this.API.getLocations(username, from, to).then((res) => {

            this.googleMapsParseData.parse(res.data).then((locations) => {
                this.locations = locations;
                this.gmViewportChange('status:profile:change');

                // start a sync ? if same day only
                if(moment().format('YYYY-MM-DD') === moment(fulldate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')){
                    this.gmSyncStart();
                    this.$rootScope.sync = true;
                }else{
                    this.$rootScope.sync = false;
                }
            });

        });
    }

    // when user change the viewport
    // we have to redraw everything
    private gmViewportChange(status : string){

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
            if(zoom >=9)    return 40;
            if(zoom >= 7)   return 80;
            if(zoom >=0)    return 200;
        })();

        // bounds_changed
        this.roadsPathsDrawing.draw(this.locations, precision, status);
        this.roadsPathsDrawing.center();

    }

    private gmSyncStart(){
        console.warn('sync');
        this.nextSyncCall = this.$timeout(() => {
            var username = this.googleMapsSettings.getCurrentUser().username;
            var date     = this.googleMapsSettings.getSelectedDate().datatime;
            var to       = date + ' 23:59:59';

            // get last know point date, and add 1 extra second
            var lastLocation = this.locations[this.locations.length - 1].datatime;
            lastLocation = moment(lastLocation, 'YYYY-MM-DD HH:mm:ss').add(1, 'seconds').format('YYYY-MM-DD HH:mm:ss');;

            this.API.getLocations(username, lastLocation, to).then((res) => {
                this.googleMapsParseData.parse(res.data).then((locations) => {
                    angular.forEach(locations, (location)=>{
                        this.locations.push(location);
                    });
                    this.gmViewportChange('status:data:sync');
                    this.gmSyncStart();
                });
            });
        }, 5000);

    }

    private gmCreate($element, settings){
        this.map = new google.maps.Map($element[0],settings);
    }



}



utils.register('App').directive('moduleGoogleMaps', Map);