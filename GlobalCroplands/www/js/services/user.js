angular.module('app.services')
    .factory('User', [ '$http', '$window', '$q', '$rootScope', 'Log', function ($http, $window, $q, $rootScope, Log) {
        var _user = {},
            _baseUrl = 'https://api.croplands.org';

        function getUser() {
            return _user;
        }

        function getRole() {
            var role;
            if (_user.role) {
                role = _user.role;
            } else {
                role = 'anon';
            }

            Log.debug('[User] getRole() : ' + role);

            return role;
        }

        function loadFromToken(token) {
            _user = JSON.parse($window.atob(token.split(".")[1]));
            _user.token = token;
            $window.localStorage.user = JSON.stringify(_user);
            // save token for future requests
            $http.defaults.headers.post.authorization = 'bearer ' + _user.token;
            $http.defaults.headers.put.authorization = 'bearer ' + _user.token;
            $http.defaults.headers.patch.authorization = 'bearer ' + _user.token;

            Log.debug('[User] Authorization Header: ' + $http.defaults.headers.post.authorization);
        }

        function isLoggedIn() {
            if (_user.expires && _user.token) {
                var secondsToExpiration = _user.expires - Math.floor((new Date).getTime() / 1000);
                return secondsToExpiration > 300;
            }

            return false;
        }

        function changePassword(token, password) {
            var deferred = $q.defer();
            $http.post("https://api.croplands.org/auth/reset", {
                token: token,
                password: password
            }).then(function (response) {
                deferred.resolve(true);
            }, function (error) {
                deferred.resolve(false);
            });
            return deferred.promise;
        }

        function login(email, password) {
            Log.info("[User] Logging in...");

            var deferred = $q.defer(),
                data = {email: email, password: password},
                headers = {'Content-Type': 'application/json'};


            $http.post(_baseUrl + "/auth/login", data, headers).then(function (r) {
                    Log.info("[User] Successfully Logged in.");
                    // Load user if token is present, may require confirmation before Logging in
                    if (r.data.data.token) {
                        loadFromToken(r.data.data.token);
                    }
                    deferred.resolve(r.data);
                    $rootScope.$emit('User.change');
                },
                function (r) {
                    if (r.data) {
                        deferred.reject(r.data);
                    }
                    else {
                        deferred.reject();
                    }
                }
            );

            return deferred.promise;
        }

        function register(data) {
            var deferred = $q.defer(),
                headers = { Accept: 'application/json', 'Content-Type': 'application/json'};

            $http.post(_baseUrl + "/auth/register", data, headers).then(function (r) {
                    Log.info("[User] Successfully registered.");
                    // Load user if token is present, may require confirmation before Logging in
                    if (r.data.data.token) {
                        loadFromToken(r.data.data.token);
                    }
                    deferred.resolve(r.data);
                    $rootScope.$emit('User.change');
                },
                function (r) {
                    if (r.data) {
                        deferred.reject(r.data);
                    }
                    else {
                        deferred.reject(r);
                    }
                }
            );

            return deferred.promise;
        }

        function forgot(email) {
            var data = {email: email},
                deferred = $q.defer(),
                headers = { Accept: 'application/json', 'Content-Type': 'application/json'};

            $http.post("https://api.croplands.org/auth/forgot", data, headers).then(function (r) {
                    Log.info("[User] Sending reset email.");
                    deferred.resolve(r.data);
                },
                function (r) {
                    if (r.data) {
                        deferred.reject(r.data);
                    }
                    else {
                        deferred.reject();
                    }
                }
            );

            return deferred.promise;
        }

        function reset(password, token) {
            var data = {password: password, token: token},
                deferred = $q.defer(),
                headers = { Accept: 'application/json', 'Content-Type': 'application/json'};

            $http.post("https://api.croplands.org/auth/reset", data, headers).then(function (r) {
                    Log.info("[User] Changing password.");
                    if (r.data.data.token) {
                        loadFromToken(r.data.data.token);
                    }
                    deferred.resolve(r.data);
                },
                function (r) {
                    if (r.data) {
                        deferred.reject(r.data);
                    }
                    else {
                        deferred.reject();
                    }
                }
            );

            return deferred.promise;
        }

        function logout() {
            Log.info("[User] Removing user token.");

            try{
                $window.localStorage.removeItem('user');
            } catch (e) {
                // no user
            }

            _user = {};
            delete $http.defaults.headers.common.authorization;
            delete $http.defaults.headers.post.authorization;
            delete $http.defaults.headers.put.authorization;
            delete $http.defaults.headers.patch.authorization;
            $rootScope.$emit('User.change');
        }

        function getFromStorage() {
            var user = JSON.parse($window.localStorage.user);
            loadFromToken(user.token);
            $rootScope.$emit('User.change');
        }

        // initialization
        function init() {
            // Check if user
            // information is available in local storage
            Log.info('[User] Checking for existence of user token.');
            if ($window.localStorage.user) {
                getFromStorage();

            }

            // Watch for changes in other tabs
            angular.element($window).on('storage', function (event) {
                if ($window.localStorage.user) {
                    getFromStorage();
                } else {
                    _user = {};
                }
            });
        }

        init();


        return {
            changePassword: changePassword,
            getRole: getRole,
            isLoggedIn: isLoggedIn,
            login: login,
            logout: logout,
            register: register,
            forgot: forgot,
            reset: reset,
            get: getUser
        };

    }]);