angular.module('app.services')
    .factory('GPS', ['$cordovaGeolocation', '$rootScope', 'Log', '$timeout','Settings', function ($cordovaGeolocation, $rootScope, Log, $timeout, Settings) {
        var geoWatch, // global for turning watch on/off
            positions = [], // array of positions
            watchOptions = {
                frequency: 1000,
                timeout: 100000, // when to throw an exception
                enableHighAccuracy: true // use gps for higher resolution and when no network location is available
            }, currentAccuracy = -1,
            currentAccuracyExpiration, // timeout
            MAX_POSITIONS_LENGTH = 100,  // max positions to store
            POSITION_FREQUENCY = 1200, // frequency for collecting positions, milliseconds
            CURRENT_ACCURACY_TIMEOUT = 10000; // number of milliseconds that fix is good for

        function rotatePositionsArray() {
            positions = positions.slice(positions.length - MAX_POSITIONS_LENGTH, positions.length);
            Log.debug('[GPS] Slicing positions array to length: ' + positions.length.toString());
        }

        /**
         * Creates a watch on geoLocation after closing any open watches first.
         */
        function turnOn() {
            turnOff();


            geoWatch = $cordovaGeolocation.watchPosition(watchOptions);
            Log.debug('[GPS] Watch started.');

            geoWatch.then(
                null,
                function (err) {
                    Log.error(err);
                    $timeout(turnOn,2000);
                },
                _.throttle(function (position) {
                    if (position && position.coords) {
                        positions.push(position);

                        currentAccuracy = position.coords.accuracy;

                        // limit the current fix accuracy for CURRENT_ACCURACY_TIMEOUT milliseconds
                        if (currentAccuracyExpiration) {
                            $timeout.cancel(currentAccuracyExpiration);
                        }

                        currentAccuracyExpiration = $timeout(function () {
                            currentAccuracy = -1;
                        }, CURRENT_ACCURACY_TIMEOUT);

                        // rotate the array as necessary
                        if (positions.length > MAX_POSITIONS_LENGTH * 2) {
                            rotatePositionsArray();
                        }

                        Log.debug('[GPS] Received Position: ' + position.coords.latitude.toString() + ", " + position.coords.longitude.toString() + ", Accuracy: " + Math.round(position.coords.accuracy));
                        $rootScope.$broadcast('GPS.position', position);
                    }
                }, POSITION_FREQUENCY)
            );

        }

        /**
         * Clears the watch on the geoLocation.
         */
        function turnOff() {
            if (isOn()) {
                $rootScope.$broadcast('GPS.off');
                geoWatch.clearWatch();
                Log.debug('[GPS] Watch cleared.');

            }
        }

        /**
         * Checks if the watch exists.
         * @returns {boolean}
         */
        function isOn() {
            return geoWatch !== undefined;
        }

        /**
         * Clears array of capture positions from this session. These are not persisted nor uploaded.
         */
        function clearPositions() {
            positions = [];
        }

        /**
         * Returns the positions to the app for mapping purposes.
         * @returns {Array}
         */
        function getPositions() {
            return positions;
        }

        function getLast() {
            if (currentAccuracy > 0 && currentAccuracy <= Settings.get("MAXIMUM_ACCURACY")){
                return positions[positions.length - 1];
            }
        }

        /**
         * Check if  there is a gps fix and return accuracy. No fix is -1
         */
        function getFix() {
            return currentAccuracy;
        }

        // Interface
        return {
            isOn: isOn,
            turnOn: turnOn,
            turnOff: turnOff,
            clearPositions: clearPositions,
            getPositions: getPositions,
            position: getLast,
            getFix: getFix
        }
    }
    ]);