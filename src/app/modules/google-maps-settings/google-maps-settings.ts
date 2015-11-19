import utils = require('core/utils/utils');
import CoreDirective = require('core/core-directive/core-directive');
import app = require('app');

class GoogleMapsSettings{

    currentUser : string;
    usersList   : Array<string> = [];
    userAvailableDates : Array<string> = [];
    selectedDate    : string;

    /*@ngInject*/
    constructor($rootScope, API){
        this.$rootScope = $rootScope;
        this.API = API;
        this.API.getAvailableUsers().then((res) => {
            angular.forEach(res.data, (user) => {
                this.usersList.push(user);
            })
        });
    }

    public getSettings(){
        return {
            snapToRoad : true,
            interpolate: true,
            interpolatePrecision: 1
        }
    }

    public setCurrentUser(username){
        console.info('username: ' + username);
        this.currentUser = username;
        this.setAvailableDates();
    }

    public getCurrentUser(){
        return this.currentUser;
    }

    public getUsersList(){
        return this.usersList;
    }

    public setSelectedDate(date){
        this.selectedDate = date;
    }

    public setAvailableDates(){
        this.API.getAvailableDates(this.currentUser).then((res) => {
            angular.forEach(res.data, (date) => {
                this.userAvailableDates.push(date);
            })
        });
    }

    public getAvailableDates(){
        return this.userAvailableDates;
    }

    public change(){
        this.$rootScope.$broadcast('maps:settings:change');
    }

}


class SettingsAsideController{

    /*@ngInject*/
    constructor($scope, googleMapsSettings){

        $scope.model = googleMapsSettings;

        $scope.$watch("selectedUsername", (newValue) => {
            googleMapsSettings.setCurrentUser(newValue);
        });

        $scope.$watch("selectedDate", (newValue) => {
            googleMapsSettings.setSelectedDate(newValue);
        })
    }

}


utils.register('App').factory('googleMapsSettings', GoogleMapsSettings);
utils.register('App').controller('SettingsAsideController', SettingsAsideController);