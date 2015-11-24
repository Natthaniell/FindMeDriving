define(["require", "exports", 'core/utils/utils'], function (require, exports, utils) {
    /**
     * Snap to road will prettify all the polylines drawn, by:
     * - snapping points to the road
     * - filling the gaps to make road smoother
     * It will take all the points, validate if they already had been snapped, if not they will be send to Google Maps API in pack of 100 points,
     * then they will be saved to mysql and merged back with original points.
     * Detecting if point has been already snap is to limit the request to Google Maps API.
     */
    var SnapToRoad = (function () {
        // constructor
        // Because this is not angular class, it has to get all dependencies in constructor
        function SnapToRoad(API, $http, $q) {
            this.API = API;
            this.$http = $http;
            this.$q = $q;
            // locations buffer to store locations that gonna be send to google maps api,
            // it can contain unlimited amounts of array, of maximum 100 elements
            this.locationsBuffer = [];
            // request buffer is a array with $http promises, made by each locationsBuffer, when google api has been called
            this.requestsBuffer = [];
            this.$http = $http;
            this.$q = $q;
            this.API = API;
        }
        // Snap,
        // execute the snap of all points passed through by addLocations method,
        SnapToRoad.prototype.snap = function () {
            var _this = this;
            // prepare a promise to return
            var deferred = this.$q.defer();
            // execute the requests for each of locationsBuffer
            angular.forEach(this.locationsBuffer, function (locationsGroup) {
                _this.doSnapRequests(locationsGroup);
            });
            // when requestsBuffer finish, resolve, and CLEAN
            this.$q.all(this.requestsBuffer).then(function (res) {
                deferred.resolve(res);
                _this.locationsBuffer = [];
                _this.requestsBuffer = [];
            });
            return deferred.promise;
            ;
        };
        // addLocations
        // Best to pass all the app known locations,
        // those will gonna be resolve if actually needs any snapping
        SnapToRoad.prototype.addLocations = function (locations) {
            // check if any points has been send over
            //if(!locations.length) { console.error('no points to add to snap in comp/snap-to-road'); return; };
            var _this = this;
            angular.forEach(locations, function (location, index) {
                // only if location has not been yet snap
                if (location.isFixedLocation == 0) {
                    // include previous FIXED location, for interpolation purpose ( will not be overwritten )
                    if (angular.isDefined(locations[index - 1]) && locations[index - 1].isFixedLocation == 1) {
                        _this.addToLocationsBuffer(locations[index - 1]);
                    }
                    // include previous NOT FIXED location
                    _this.addToLocationsBuffer(location);
                }
            });
        };
        SnapToRoad.prototype.doSnapRequests = function (locationsGroup) {
            var _this = this;
            // locations converted to GET format string [lat,lng]
            var bufferString = '';
            // convert location buffer to GET string
            angular.forEach(locationsGroup, function (location) {
                bufferString += location.gps_lat + ',' + location.gps_lng + '|';
            });
            bufferString = utils.removeLastChar(bufferString);
            // create uri to call SnapToRoad API
            var uri = 'https://roads.googleapis.com/v1/snapToRoads?key=' + utils.config.gmKey + '&path=' + bufferString + '&interpolate=true';
            // merge locations with locationsGroup
            var interpolatedLocations = [];
            var request = this.$http.get(uri).then(function (res) {
                var snappedLocations = res.data.snappedPoints;
                angular.forEach(snappedLocations, function (location, locIndex) {
                    // is location an original location
                    if (angular.isDefined(location.originalIndex)) {
                        var orgIndex = location.originalIndex;
                        if (locationsGroup[orgIndex].isFixedLocation == 1)
                            return;
                        // set location as fixed
                        locationsGroup[orgIndex].isFixedLocation = 1;
                        // store original lat and lng
                        locationsGroup[orgIndex].original_gps_lat = parseFloat(angular.copy(locationsGroup[orgIndex].gps_lat));
                        locationsGroup[orgIndex].original_gps_lng = parseFloat(angular.copy(locationsGroup[orgIndex].gps_lng));
                        // update raw location lat and lng
                        locationsGroup[orgIndex].gps_lat = location.location.latitude;
                        locationsGroup[orgIndex].gps_lng = location.location.longitude;
                        locationsGroup[orgIndex].placeId = location.placeId;
                        // push all previous interpolated points
                        locationsGroup[orgIndex].interpolatedLocations = angular.copy(interpolatedLocations);
                        interpolatedLocations = [];
                    }
                    else {
                        interpolatedLocations.push({
                            gps_lat: location.location.latitude,
                            gps_lng: location.location.longitude,
                            placeId: location.placeId
                        });
                    }
                });
                // set all skiped locations as fixed locations
                angular.forEach(locationsGroup, function (location) {
                    if (location.isFixedLocation == 0) {
                        //console.info('not fixed: ' + location.id);
                        // set location as fixed
                        location.isFixedLocation = 1;
                        // store original lat and lng
                        location.original_gps_lat = parseFloat(angular.copy(location.gps_lat));
                        location.original_gps_lng = parseFloat(angular.copy(location.gps_lng));
                        location.interpolatedLocations = [];
                    }
                });
                _this.updateMysql(locationsGroup);
            });
            this.requestsBuffer.push(request);
        };
        // Add location to snap buffer,
        // @results stored in snapToRoadBuffer
        // @array of locations, grouped by arrays of 100 elements max
        SnapToRoad.prototype.addToLocationsBuffer = function (location) {
            // if buffer is empty, create first group
            if (!this.locationsBuffer.length) {
                this.locationsBuffer.push([]);
            }
            // if exceed the 100 elements limit, create a new group
            if (this.locationsBuffer[this.locationsBuffer.length - 1].length >= 100) {
                var prevLocation = this.locationsBuffer[this.locationsBuffer.length - 1][this.locationsBuffer[this.locationsBuffer.length - 1].length - 1];
                this.locationsBuffer.push([]);
                this.locationsBuffer[this.locationsBuffer.length - 1].push(prevLocation);
            }
            // add to current buffer group
            this.locationsBuffer[this.locationsBuffer.length - 1].push(location);
        };
        SnapToRoad.prototype.updateMysql = function (locations) {
            angular.forEach(locations, function (location) {
                location.interpolatedLocations = JSON.stringify(location.interpolatedLocations);
            });
            this.API.updateLocations(locations);
        };
        return SnapToRoad;
    })();
    return SnapToRoad;
});
