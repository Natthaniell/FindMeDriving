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

    /**
     * Prepare, by groups of 100 polylines
     * @param pointsArray Array
     */
    constructor(map, settings){
        this.map = map;
        this.settings = settings;
    }


    public center(){

    }

    // THE LIGHTEST THIS FUNCTION IS THE BETTER,
    // ALL HEAVY CALCULATIONS SHOULD BE OUTSIDE OF IT ( in google-maps-parse-data for example ? )
    public draw(locations, precision){

        this.time = 0;

        this.locations = locations;

        this.precision = precision;

        this.clearMap();

        // we need to store last point to be able to draw continue line
        this.lastDrawLocationsLocation = null;
        this.totalLocations = 0;
        var lastOutOfBoundLocation = null;
        var nextOutOfBoundLocation = null;

        angular.forEach(this.locations, (location) => {


            // draw only if is in bound
            if(!this.map.getBounds().contains(new google.maps.LatLng((location.gps_lat), (location.gps_lng)))) {
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


            this.drawLocation(location);

        });

    }


    private drawLocation(location){
            // make a copy of polylines to draw
            var polylinesLocations = angular.copy(location.polylinesLocations);

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
                strokeOpacity: 1.0,
                strokeWeight: 5,
                map: this.map
            });
            this.drawnPolylines.push(path);
            //}, 4 * this.time);
            this.time++;
    }

    private clearMap(){
        angular.forEach(this.drawnPolylines, (polyline) => {
            polyline.setMap(null);
        });
        this.drawnPolylines = [];
    }

    private calculateSpeedsForEveryPoint(){
        var maxSpeed = 0;
        var prevPoint = null;
        angular.forEach(this.pointsArray, (point, index) => {

            // if point has a speed, because not all of them has,
            // some points are from google snap to road service, and they dont have it
            if(angular.isDefined(point.time)){

                // set 0 as default
                point.speed = 0;

                // transfer time to moment
                let timeMoment = moment(point.time, 'YYYY-MM-DD HH:mm:ss');
                point.orgTime = point.time;
                point.time = timeMoment;

                // calculate speed from: time + road taken
                if(prevPoint){

                    // calculate time difference in hours, round up by 10000 ( 4 decimals )
                    var time = Math.round( ( point.time.diff(prevPoint.time) / 1000 / 3600) * 10000) / 10000;

                    // calculate distance in ???
                    //var distance = RoadsPathsDrawing.distance(point.lat, point.lng, prevPoint.lat, prevPoint.lng);

                    // distance in km
                    var _kCord = new google.maps.LatLng(point.lat, point.lng);
                    var _pCord = new google.maps.LatLng(prevPoint.lat, prevPoint.lng);
                    var distance = google.maps.geometry.spherical.computeDistanceBetween (_kCord, _pCord) / 1000;

                    // round speed to 0 decimals
                    var speed = Math.round(distance / time);

                    prevPoint.speed = speed;

                    // set max speed
                    if(maxSpeed < speed){
                        maxSpeed = speed;
                    }
                }

                // set current point as a prev point for next loop
                prevPoint = point;

            }
        });

        return maxSpeed;
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