angular.module('app.services')
    .factory('Diagnostics', ['Settings', '$q', '$ionicPlatform', '$interval', '$cordovaNetwork', function (Settings, $q, $ionicPlatform, $rootScope, $cordovaNetwork) {
        var platform = ionic.Platform.platform,
            status = {
                location: null,
                camera: null,
                application: null
            },
            requestLocationAuthorization,
            requestCameraRollAuthorization,
            getCameraRollAuthorizationStatus,
            constants = {
                application: {
                    enabled: 'ENABLED',
                    disabled: 'DISABLED'
                }
            };


        function updateApplicationStatus() {
            try {
                if (_.every(_.map(status, function (status, key) {
                    if (key === 'application') {
                        return true;
                    }
                    return status === cordova.plugins.diagnostic.permissionStatus.GRANTED || status === cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE || status === constants.application.enabled;
                }), Boolean)) {
                    status.application = constants.application.enabled;
                } else {
                    status.application = constants.application.disabled;
                }
            } catch (err) {
                status.application = constants.application.disabled;
            }

            return status.application;
        }

        function updateStatus() {
            console.log('Diagnostics.updateStatus()');
            var q = $q.defer(),
                location = getLocationAuthorizationStatus(),
                camera = getCameraAuthorizationStatus();

            var permissions = [location, camera];

            if (platform() === 'ios') {
                permissions.push(getCameraRollAuthorizationStatus())
            }

            $q.all(permissions).then(function (statuses) {
                console.log(statuses);

                status.location = statuses[0];
                status.camera = statuses[1];

                if (platform() === 'ios') {
                    status.album = statuses[2];
                }

                q.resolve(status);
            }, function () {
                q.reject({});
            });
            return q.promise;
        }

        var authorize = function () {
            if (platform() === 'ios') {
                return requestLocationAuthorization()
                    .then(requestCameraAuthorization, requestCameraAuthorization)
                    .then(requestCameraRollAuthorization, requestCameraRollAuthorization)
                    .then(updateStatus, updateStatus);
            }

            return requestLocationAuthorization()
                .then(requestCameraAuthorization, requestCameraAuthorization)
                .then(updateStatus, updateStatus);
        };


        // conversion to promises from callbacks for subset of plugin
        var getPermissionsAuthorizationStatus = function (permission) {
            var q = $q.defer();
            permission = underscoreToSpace(permission);
            cordova.plugins.diagnostic.getPermissionsAuthorizationStatus(function (status) {
                console.log("LOCATION: ", status);
                q.resolve(status);
            }, function (error) {
                q.reject(error);
            });
            return q.promise;
        };

        var isLocationAuthorized = function () {
            var q = $q.defer();

            cordova.plugins.diagnostic.isLocationAuthorized(function (status) {
                console.log("LOCATION: ", status);
                q.resolve(status);
            }, function (error) {
                q.reject(error);
            });
            return q.promise;
        };

        var getLocationAuthorizationStatus = function () {
            var q = $q.defer();

            try {
                cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
                    console.log("LOCATION STATUS: ", status);
                    q.resolve(status);
                }, function (error) {
                    q.reject(error);
                });
            } catch (error) {
                q.reject(error);
            }
            return q.promise;
        };

        var isCameraAuthorized = function () {
            var q = $q.defer();

            cordova.plugins.diagnostic.isCameraAuthorized(function (status) {
                console.log("CAMERA: ", status);
                q.resolve(status);
            }, function (error) {
                q.reject(error);
            });
            return q.promise;
        };

        var getCameraAuthorizationStatus = function () {
            var q = $q.defer();

            try {
                cordova.plugins.diagnostic.getCameraAuthorizationStatus(function (status) {
                    console.log("GET CAMERA STATUS: ", status);
                    q.resolve(status);
                }, function (error) {
                    q.reject(error);
                });
            } catch (error) {
                q.reject(error);
            }
            return q.promise;
        };

        var isCameraPresent = function () {
            var q = $q.defer();

            try {
                cordova.plugins.diagnostic.isCameraPresent(function (status) {
                    q.resolve(status);
                }, function (error) {
                    q.reject(error);
                });
            } catch (error) {
                q.reject(error);
            }
            return q.promise;
        };

        var requestCameraAuthorization = function () {
            var q = $q.defer();

            if (status.camera !== cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED) {
                console.log("status is not 'NOT_REQUESTED'");
                q.reject("status is not 'NOT_REQUESTED'");
                return q.promise;
            }

            console.log('requesting camera authorization');
            cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
                status.camera = status;
                console.log("REQUST CAMERA AUTHORIZATION", status);
                q.resolve(status);
            }, function (error) {
                console.log(error);
                q.reject(error);
            });
            return q.promise;
        };

        switch (platform()) {
            case 'ios':
                requestCameraRollAuthorization = function () {
                    var q = $q.defer();

                    if (status.album !== cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED) {
                        q.reject("status is not 'NOT_REQUESTED'");
                        return q.promise;
                    }

                    console.log('requesting location authorization');

                    cordova.plugins.diagnostic.requestCameraRollAuthorization(
                        function (status) {
                            status.album = status;
                            q.resolve(status);
                        }, function (error) {
                            q.reject(error);
                        });
                    return q.promise;
                };

                getCameraRollAuthorizationStatus = function () {
                    var q = $q.defer();

                    try {
                        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function (status) {
                            console.log("GET CAMERA Roll STATUS: ", status);
                            q.resolve(status);
                        }, function (error) {
                            q.reject(error);
                        });
                    } catch (error) {
                        q.reject(error);
                    }
                    return q.promise;
                };

                requestLocationAuthorization = function () {
                    var q = $q.defer();

                    if (status.location !== cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED) {
                        q.reject("status is not 'NOT_REQUESTED'");
                        return q.promise;
                    }

                    console.log('requesting location authorization');

                    cordova.plugins.diagnostic.requestLocationAuthorization(
                        function (status) {
                            status.location = status;
                            q.resolve(status);
                        }, function (error) {
                            console.log(error);
                            q.reject(error);
                        }, Settings.get("BACKGROUND_GPS"));
                    return q.promise;
                };
                break;

            case 'android':
                requestLocationAuthorization = function () {
                    var q = $q.defer();

                    if (status.location !== cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED) {
                        q.reject("status is not 'NOT_REQUESTED'");
                        return q.promise;
                    }

                    console.log('requesting location authorization');

                    cordova.plugins.diagnostic.requestLocationAuthorization(
                        function (status) {
                            status.location = status;
                            q.resolve(status);
                        }, function (error) {
                            console.log(error);
                            q.reject(error);
                        });
                    return q.promise;
                };
                break;
        }

        function getStatus() {
            return status;
        }

        function setStatus(item, value) {
            status[item] = value;
            updateApplicationStatus();
            console.log("Application Status", status.application);
        }

        function getNetwork() {
            var network;
            try {
                network = $cordovaNetwork.getNetwork();
            } catch (e) {
                console.log(e);
                network = 'unknown';
            }
            return network;
        }

        /**
         * Checks for online state with additional filter
         * for network type based upon user setting.
         * @returns {*}
         */
        function isOnline() {
            try {
                var online = $cordovaNetwork.isOnline(),
                    isWifi = getNetwork() === 'wifi';

                console.log(online);
                if (Settings.get('NETWORK_DATA')) {
                    return online;
                } else {
                    return online && isWifi;
                }
            } catch (e) {
                console.log(e);
                return false;
            }
        }

        return {
            constants: constants,

            // status
            getStatus: getStatus,
            setStatus: setStatus,
            updateStatus: updateStatus,
            authorize: authorize,

            // location
            isLocationAuthorized: isLocationAuthorized,
            requestLocationAuthorization: requestLocationAuthorization,
            getLocationAuthorizationStatus: getLocationAuthorizationStatus,

            // camera
            isCameraPresent: isCameraPresent,
            isCameraAuthorized: isCameraAuthorized,
            getCameraAuthorizationStatus: getCameraAuthorizationStatus,
            requestCameraAuthorization: requestCameraAuthorization,

            // network
            getNetwork: getNetwork,
            isOnline: isOnline
        };

    }])
;