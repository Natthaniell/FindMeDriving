///<reference path="../../../typing/all.d.ts"/>

//import q = require('../../../lib/q');
import Register = require('core/utils/register');
import config   = require('config');

String.prototype.lowerCaseFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

class Utils{

    public register : any;
    public config   : any = config;
    public $q       : any;
    public $http    : any;

    constructor(){
        this.register = (new Register()).register;
    }

    public setAngularComponents($q, $http){
        this.$q = $q;
        this.$http = $http;
    }

    public plog(msg, attr) {
        var color   : string = attr.color   || 'red';
        var weight  : string = attr.weight  || 'normal';
        var size    : string = attr.size    || '18px';
        var style1 = 'background: #DB4437; color: white;';
        var style2 = "color:" + color + ";font-weight: " + weight +";font-size: "+size+";";
        console.log("%c Core: %c %s", style1 , style2, msg);
    }

    public safe(string){
        return string.replace(/[\(\)\'\!\@\"\ \Ł\$\&\-\=\#\/\\]/g, '').toLowerCase();
    }

    public index(obj,is, value?) {

        if(typeof is.match === 'function'){
            if(is.match(/(\[\])/g) !== null) return 'Array';
        }

        if (typeof is == 'string')
            return this.index(obj,is.split('.'), value);
        else if (is.length==1 && value!==undefined)
            return obj[is[0]] = value;
        else if (is.length==0)
            return obj;
        else
            return this.index(obj[is[0]],is.slice(1), value);
    }

    public setAsync(variable, promise, cb){
        promise.then(function(res){
            variable = res;
            cb();
        });
    }

    public forEachFinalNodes(data, prevKey, cb){
        angular.forEach(data, (node, key) =>{
            if(angular.isObject(node)){
                data[key] = this.forEachFinalNodes(data[key], key, cb);
            }else{
                cb(data, key, prevKey);
            }
        });
        return data;
    }

    public arrayObjectsToCordsArray(arr){
        var newArray = [];
        angular.forEach(arr, (obj) => {
            let l = obj.location.split('|');
            newArray.push({
                points : [{
                    lat: parseFloat(l[0]),
                    lng: parseFloat(l[1])
                }]
            });
        })
        return newArray;
    }

    public removeLastChar(str){
        return str.substring(0, str.length - 1);
    }
}



var utils = new Utils();
export = utils;