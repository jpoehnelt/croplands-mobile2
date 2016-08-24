// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('app.controllers', ['ionic', 'ngCordova', 'croplands.mappings']);
angular.module('app.services', ['ionic', 'ngCordova']);
angular.module('app.directives', []);
angular.module('app', ['ionic', 'ionic.service.core', 'ionic.service.analytics', 'ngCordova', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

    .run(function ($ionicPlatform, $ionicAnalytics, $ionicHistory, $rootScope, Diagnostics, $state, $timeout, DB, Compass, GPS, Settings, Sync) {
        var watchApplicationStatusWatch;

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            $ionicAnalytics.register();

            // update status when user opens application
            Diagnostics.updateStatus()
                .then(Diagnostics.authorize)
                .then(function () {
                    watchApplicationStatus();
                    initSensors();
                });

            // update status when user returns to application
            $ionicPlatform.on("resume", function (event) {
                Diagnostics.updateStatus().then(Diagnostics.authorize).then(initSensors);
            });


            function initSensors() {
                    $timeout(function () {
                        GPS.turnOn();
                        Compass.turnOn();
                    }, 1000);
            }

            function watchApplicationStatus() {
                $timeout(function () {
                    if (!watchApplicationStatusWatch) {

                        watchApplicationStatusWatch = $rootScope.$watch(function () {
                            return Diagnostics.getStatus().application;
                        }, function (status) {
                            if (status !== Diagnostics.constants.application.enabled) {
                                $state.go('menu.status');
                            }
                            if (status === Diagnostics.constants.application.enabled && $state.state === 'menu.status') {
                                $state.go('menu.dashboard');
                            }
                        });
                    }
                }, Settings.get('PERMISSION_CHECK_INTERVAL'));
            }

            initSensors();
        });

        $ionicHistory.nextViewOptions({
//            disableAnimate: true,
            disableBack: true
        });

    }).config(function ($ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(0);
    });
