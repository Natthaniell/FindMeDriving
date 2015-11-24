import utils = require('core/utils/utils');
import app = require('app');

class DataAPI {

    baseUrl : string = 'http://fmd.rswiat.co.uk/';
    map : google.maps.Map;

    /*@ngInject*/
    constructor(protected $http){
        this.$http = $http;
    }

    public updateLocations(locations){
        return this.$http.post(this.baseUrl + 'api/updateLocations.php', $.param({
            locations : locations
        }),{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    public saveLocations(locations){
        return this.$http.post(this.baseUrl + 'api/saveLocations.php', $.param({
            locations : locations
        }),{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    public getAvailableDates(username){
        return this.$http.post(this.baseUrl + 'api/getAvailableDates.php', $.param({
            username : username
        }),{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    public getAvailableUsers(){
        return this.$http.post(this.baseUrl + 'api/getUsers.php', $.param({}),{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    public getLocations(username, from, to){

        return this.$http.post(this.baseUrl + 'api/getLocations.php', $.param({
            username    : username,
            date_from   : from,     //"2015-11-15 00:00:00",
            date_to     : to        //"2015-11-15 23:59:59"
        }),{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    public get(){
        return this.$http.get(this.baseUrl + 'api/json/getLocations.json');
    }

}


utils.register('App').factory('API', DataAPI);