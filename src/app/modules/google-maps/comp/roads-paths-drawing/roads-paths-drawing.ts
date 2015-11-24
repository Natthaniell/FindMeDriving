///<reference path="../../../../typing/all.d.ts"/>

import utils = require('core/utils/utils');
import moment = require('moment');

/**
 * Snap To Road Component
 * It will snap the points to the cloasest road,
 * just pass through points as an Array of objects :
 * [
 *  {
 *      lat : 0.0,
 *      lng : 0.0
 *  }
 * ]
 */
class RoadsPathsDrawing{

    private map         : google.maps.Map;
    private locations   : Array<any>;
    private settings    : any;
    private time        : any = 1;
    private drawnPolylines  : any = [];
    private precision   : number;
    private lastDrawLocationsLocation : location;
    private totalLocations : number;
    private positionMarker : any = [];
    private $rootScope  : any;

    private count : number = 0;
    private locationMarkerTimeout : any = null;
    /**
     * Prepare, by groups of 100 polylines
     * @param pointsArray Array
     */
    constructor($rootScope, map, settings){
        this.$rootScope = $rootScope;
        this.map = map;
        this.settings = settings;
    }


    public center(){

    }

    // THE LIGHTEST THIS FUNCTION IS THE BETTER,
    // ALL HEAVY CALCULATIONS SHOULD BE OUTSIDE OF IT ( in google-maps-parse-data for example ? )
    public draw(locations, precision, status){

        this.time = 0;

        this.locations = locations;

        this.precision = precision;

        this.clearMap();

        // we need to store last point to be able to draw continue line
        this.lastDrawLocationsLocation = null;
        this.totalLocations = 0;
        var lastOutOfBoundLocation = null;
        var nextOutOfBoundLocation = null;

        angular.forEach(this.locations, (location, locationIndex) => {



            var boundsLocation;
            if(this.settings.snapToRoad){
                boundsLocation = new google.maps.LatLng((location.gps_lat), (location.gps_lng));
            }else{
                boundsLocation = new google.maps.LatLng((location.org_gps_lat), (location.org_gps_lng));
            }

            // draw only if is in bound
            if(!this.map.getBounds().contains(boundsLocation)) {
                lastOutOfBoundLocation = location;
                if(this.lastDrawLocationsLocation){
                    this.drawLocation(location);
                    this.lastDrawLocationsLocation = null;
                }
                return;
            }

            if(lastOutOfBoundLocation){
                this.drawLocation(lastOutOfBoundLocation);
                lastOutOfBoundLocation = null;
            }

            this.drawPeriodicTimesMarkers(location, locationIndex);
            this.drawLocation(location);

        });

        // if profile change, center map on the beginning of path
        if(status === 'status:profile:change' || status === 'status:data:sync'){
            if(this.settings.autoSyncCenter || status === 'status:profile:change'){
                let lastLocation = this.locations[this.locations.length - 1];
                this.map.setCenter({lat : lastLocation.org_gps_lat, lng : lastLocation.org_gps_lng});
            }
        }

        angular.forEach(this.positionMarker, (marker)=>{
            marker.setMap(null);
        });
        this.positionMarker = [];
        this.drawLocationMarker();
    }




    private drawLocation(location){

        var polylinesLocations = angular.copy(location.polylinesLocations);

        if(this.settings.snapToRoad){
            polylinesLocations = angular.copy(location.polylinesLocationsSnaped);
        }else{
            polylinesLocations = angular.copy(location.polylinesLocations);
        }

        // make a copy of polylines to draw


        // adjust by precision level
        for(var x = polylinesLocations.length; x >= 0; x--){
            if(x % this.precision) {
                polylinesLocations.splice(x, 1);
            }
        }

        // add lastDrawLocationsArray if exists
        if(this.lastDrawLocationsLocation !== null){
            polylinesLocations.unshift(this.lastDrawLocationsLocation);
        }

        this.lastDrawLocationsLocation = polylinesLocations[polylinesLocations.length-1];

        this.totalLocations += polylinesLocations.length;

        // draw
        //setTimeout(() => {
        var path = new google.maps.Polyline({
            path: polylinesLocations,
            geodesic: true,
            strokeColor: location.draw.linecolor,
            strokeOpacity: location.draw.strokeOpacity,
            strokeWeight: location.draw.strokeWeight,
            icons : location.draw.icons,
            map: this.map
        });

        // set mouse over for the locations
        path.addListener('mouseover', () => {
            this.$rootScope.locationStats = {};
            this.$rootScope.locationStats.speed = ((location.gps_speed*3600)/1000) + ' km/h';
            this.$rootScope.locationStats.time = moment(location.datatime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
            this.$rootScope.$apply();
        });

        this.drawnPolylines.push(path);
        //}, 4 * this.time);
        this.time++;
    }

    private clearMap(){
        angular.forEach(this.drawnPolylines, (polyline) => {
            polyline.setMap(null);
        });
        angular.forEach(this.periodicTimesMarkers, (marker)=>{
            marker.setMap(null);
        });
        this.drawnPolylines = [];
    }

    private periodicTimesMarkers : Array<any> = [];
    private drawPeriodicTimesMarkers(location, locationIndex){

        if(!this.settings.extraLocationsStats) return;

        if(locationIndex % (2 * this.precision) === 1){
            //var marker = new google.maps.Marker({
            //    position: {lat : location.org_gps_lat, lng : location.org_gps_lng},
            //    map: this.map,
            //    title : 'test'
            //});
            var goldStar = {
                //path: "m157,256c0,-101.65746 82.34254,-184 184,-184c101.65747,0 184,82.34254 184,184c0,101.65747 -82.34253,184 -184,184c-101.65746,0 -184,-82.34253 -184,-184z",
                path: "",
                fillColor: '#3F85F8',
                fillOpacity: 1,
                scale: 0.8 * this.precision,
                strokeColor: 'white',
                strokeWeight: 1,
                strokeOpacity: 0.20
            };
            var marker = new MarkerWithLabel({
                position: {lat : location.org_gps_lat, lng : location.org_gps_lng},
                draggable: true,
                raiseOnDrag: true,
                map: this.map,
                icon: goldStar,
                labelContent: moment(location.datatime, 'YYYY-MM-DD HH:mm:ss').format('HH:mm'),
                labelAnchor: new google.maps.Point(22, 0),
                labelClass: "markerLabels", // the CSS class for the label
                labelStyle: {opacity: 0.75}
            });
            this.periodicTimesMarkers.push(marker);
        }
    }

    private drawLocationMarker(){

        // clear animation timeout
        if(this.locationMarkerTimeout) clearTimeout(this.locationMarkerTimeout);

        // get last location
        var lastPosition = this.locations[this.locations.length - 1];

        // animate color
        var color = 'white';
        if(this.count % 2){
            color = 'gray';
        }

        var goldStar = {
            //path: "m157,256c0,-101.65746 82.34254,-184 184,-184c101.65747,0 184,82.34254 184,184c0,101.65747 -82.34253,184 -184,184c-101.65746,0 -184,-82.34253 -184,-184z",
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3F85F8',
            fillOpacity: 1,
            scale: 10,
            strokeColor: color,
            strokeWeight: 15,
            strokeOpacity: 0.20
        };

        var marker = new google.maps.Marker({
            position: {lat : lastPosition.org_gps_lat, lng : lastPosition.org_gps_lng},
            map: this.map,
            icon: goldStar
        });

        this.positionMarker.push(marker);

        // clear martker
        if(angular.isDefined(this.positionMarker[0]) && this.positionMarker[0]){
            this.positionMarker[0].setMap(null);
        }

        this.locationMarkerTimeout = setTimeout(() => {
            this.drawLocationMarker();
            this.count++;
        }, 500)
    }

    static distance(lat1, lng1, lat2, lng2) {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p)/2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((lng2 - lng1) * p))/2;
        return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }





}

export = RoadsPathsDrawing;