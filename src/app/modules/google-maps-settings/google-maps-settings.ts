import utils = require('core/utils/utils');
import CoreDirective = require('core/core-directive/core-directive');
import app = require('app');
import moment = require('moment');

class GoogleMapsSettings{

    currentUser : any;
    usersList   : Array<string> = [];
    userAvailableDates : Array<any> = [];
    userAvailableJourneys : Array<string> = [];
    selectedDate    : string;
    refreshTime : any = new Date();

    // settings
    snapToRoad : boolean = true;

    /*@ngInject*/
    constructor(private $rootScope : any, private API : any){
        this.$rootScope = $rootScope;
        this.API = API;
        this.API.getAvailableUsers().then((res) => {
            this.usersList = [];
            angular.forEach(res.data, (user) => {
                this.usersList.push(user);
            })
        });
    }

    public setCurrentUser(username){
        if(!angular.isDefined(username)) return;
        this.currentUser = username;
        this.apiGetAvailableDates(username.username);
    }

    public getCurrentUser(){
        return this.currentUser;
    }

    public getUsersList(){
        return this.usersList;
    }


    public getSelectedDate(){
        return this.selectedDate;
    }

    public setSelectedDate(date){
        this.selectedDate = date;
    }


    // Get Available dates - API Call
    // get available dates for a username
    private apiGetAvailableDates(username){
        if(!angular.isDefined(username)) return;
        this.API.getAvailableDates(username).then((res) => {
            var lastDate = null;
            this.userAvailableDates = [];
            angular.forEach(res.data, (dateArr) => {
                angular.forEach(dateArr, (date) => {
                    let momentDate = moment(date, 'YYYY-MM-DD HH:mm:ss');
                    if(!lastDate || lastDate.format('YYYY-MM-DD') !== momentDate.format('YYYY-MM-DD')){

                        var label = momentDate.format('YYYY-MMM-DD');
                        if(moment.duration(moment().diff(momentDate)).asHours() <= 2){
                            label += ' ongoing';
                        }

                        this.userAvailableDates.push({
                            label   : label,
                            datatime : momentDate.format('YYYY-MM-DD'),
                            fulldate: momentDate.format('YYYY-MM-DD HH:mm:ss')
                        });
                    }
                    lastDate = momentDate;
                });
            })
        });
    }


    public getAvailableDates(){
        return this.userAvailableDates;
    }

    public getAvailableJourneys(){
        return this.userAvailableJourneys;
    }

    public refresh(){
        this.$rootScope.$broadcast('maps:settings:clear');
        this.usersList = [];
        this.userAvailableDates = [];
        this.userAvailableJourneys = [];
        this.selectedDate = '';
        this.currentUser = '';
        this.API.getAvailableUsers().then((res) => {
            angular.forEach(res.data, (user) => {
                this.usersList.push(user);
            })
        });
    }

    public change(){
        this.$rootScope.$broadcast('maps:settings:change');
    }

}


class SettingsAsideController{

    /*@ngInject*/
    constructor($timeout, $scope, googleMapsSettings){

        $scope.model = googleMapsSettings;

        $scope.selectedUsername = googleMapsSettings.currentUser;
        $scope.selectedDate     = googleMapsSettings.selectedDate;

        $scope.$watch("selectedUsername", (newValue) => {
            if(!angular.isDefined(newValue)) return;
            googleMapsSettings.setCurrentUser(newValue);
        });

        $scope.$watch("selectedDate", (newValue) => {
            if(!angular.isDefined(newValue)) return;
            googleMapsSettings.setSelectedDate(newValue);
        })


    }

}


utils.register('App').factory('googleMapsSettings', GoogleMapsSettings);
utils.register('App').controller('SettingsAsideController', SettingsAsideController);