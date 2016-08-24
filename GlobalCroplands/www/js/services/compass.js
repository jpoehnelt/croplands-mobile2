angular.module('app.services')
    .factory('Compass', ['$cordovaDeviceOrientation', '$rootScope', 'Log', 'Diagnostics','$ionicPlatform','Settings', function ($cordovaDeviceOrientation, $rootScope, Log, Diagnostics, $ionicPlatform, Settings) {
        var compassWatch, // global for turning watch on/off
            last = null,
            watchOptions = {
                frequency: Settings.get('COMPASS_FREQUENCY')
            };

        /**
         * Creates a watch on device orientation after close any open watches first.
         */
        function turnOn() {
            turnOff();
            try {

                if(!navigator.compass) {
                    Diagnostics.setStatus('compass', Diagnostics.constants.application.disabled);
                    Log.error("No compass on device.");
                    return;
                }

                compassWatch = $cordovaDeviceOrientation.watchHeading(watchOptions);
                Diagnostics.setStatus('compass', Diagnostics.constants.application.enabled);
                compassWatch.then(
                    null,
                    function (err) {
                        Log.error(err);
                        Diagnostics.setStatus('compass', Diagnostics.constants.application.disabled);

                    }, function (result) {
                        $rootScope.$broadcast('Compass.heading', result);
                        last = result;
                    }
                );
            } catch (err) {
                Diagnostics.setStatus('compass', Diagnostics.constants.application.disabled);
                Log.error(err);
            }
        }

        /**
         * Clears the watch on the geoLocation.
         */
        function turnOff() {
            if (isOn()) {
                $rootScope.$broadcast('Compass.off');
                compassWatch.clearWatch();
            }
            last = null;
        }

        /**
         * Checks if the watch exists.
         * @returns {boolean}
         */
        function isOn() {
            return compassWatch !== undefined;
        }

        function getHeading() {
            return last;
        }

        $ionicPlatform.ready(function () {
            turnOn();
        });

        // Interface
        return {
            isOn: isOn,
            turnOn: turnOn,
            turnOff: turnOff,
            getHeading: getHeading
        }
    }
    ]);