import utils = require('core/utils/utils');
import CoreDirective = require('core/core-directive/core-directive');
import app = require('app');

class OldToNewConverter{

    private API     : any;
    private $http   : ng.IHttpService;
    private $q      : ng.IQService;
    private deferred: any;
    private $timeout: any;


    /*@ngInject*/
    constructor(API, $http, $q, $timeout){
        this.API = API;
        this.$http = $http;
        this.$q = $q;
        this.$timeout = $timeout;
    }

    public convert(){
        console.warn('convert start');

        var convertedLocations = [];

        this.$http.get('api/json/getLocations.json').then((res) => {

            angular.forEach(res.data, (location) => {
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
                    username : username,
                    datetime : datetime,
                    gps_lat : gps_lat,
                    gps_lng : gps_lng,
                    isFixedLocation : isFixedLocation,
                    gps_provider : gps_provider
                })
            });

            this.API.saveLocations(convertedLocations);
        })
    }

}



utils.register('App').factory('oldToNewConverter', OldToNewConverter);
