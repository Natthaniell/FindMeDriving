///<reference path="../../../typing/all.d.ts"/>
define(["require", "exports", 'core/utils/register', 'config'], function (require, exports, Register, config) {
    String.prototype.lowerCaseFirstLetter = function () {
        return this.charAt(0).toLowerCase() + this.slice(1);
    };
    var Utils = (function () {
        function Utils() {
            this.config = config;
            this.register = (new Register()).register;
        }
        Utils.prototype.setAngularComponents = function ($q, $http) {
            this.$q = $q;
            this.$http = $http;
        };
        Utils.prototype.plog = function (msg, attr) {
            var color = attr.color || 'red';
            var weight = attr.weight || 'normal';
            var size = attr.size || '18px';
            var style1 = 'background: #DB4437; color: white;';
            var style2 = "color:" + color + ";font-weight: " + weight + ";font-size: " + size + ";";
            console.log("%c Core: %c %s", style1, style2, msg);
        };
        Utils.prototype.safe = function (string) {
            return string.replace(/[\(\)\'\!\@\"\ \Ł\$\&\-\=\#\/\\]/g, '').toLowerCase();
        };
        Utils.prototype.index = function (obj, is, value) {
            if (typeof is.match === 'function') {
                if (is.match(/(\[\])/g) !== null)
                    return 'Array';
            }
            if (typeof is == 'string')
                return this.index(obj, is.split('.'), value);
            else if (is.length == 1 && value !== undefined)
                return obj[is[0]] = value;
            else if (is.length == 0)
                return obj;
            else
                return this.index(obj[is[0]], is.slice(1), value);
        };
        Utils.prototype.setAsync = function (variable, promise, cb) {
            promise.then(function (res) {
                console.info('set');
                variable = res;
                console.info(variable);
                cb();
            });
        };
        Utils.prototype.forEachFinalNodes = function (data, prevKey, cb) {
            var _this = this;
            angular.forEach(data, function (node, key) {
                if (angular.isObject(node)) {
                    data[key] = _this.forEachFinalNodes(data[key], key, cb);
                }
                else {
                    cb(data, key, prevKey);
                }
            });
            return data;
        };
        Utils.prototype.arrayObjectsToCordsArray = function (arr) {
            var newArray = [];
            angular.forEach(arr, function (obj) {
                var l = obj.location.split('|');
                newArray.push({
                    points: [{
                            lat: parseFloat(l[0]),
                            lng: parseFloat(l[1])
                        }]
                });
            });
            return newArray;
        };
        Utils.prototype.removeLastChar = function (str) {
            return str.substring(0, str.length - 1);
        };
        return Utils;
    })();
    var utils = new Utils();
    return utils;
});
