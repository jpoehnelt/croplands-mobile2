angular.module('app.routes', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('menu.collect', {
                url: '/collect',
                views: {
                    'app': {
                        templateUrl: 'templates/collect.html',
                        controller: 'collectCtrl'
                    }
                }
            })

            .state('menu.dashboard', {
                url: '/dashboard',
                views: {
                    'app': {
                        templateUrl: 'templates/dashboard.html',
                        controller: 'dashboardCtrl'
                    }
                }
            })

            .state('menu.data', {
                url: '/data',
                views: {
                    'app': {
                        templateUrl: 'templates/data.html',
                        controller: 'dataCtrl'
                    }
                }
            })

            .state('menu.settings', {
                url: '/settings',
                views: {
                    'app': {
                        templateUrl: 'templates/settings.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('menu.status', {
                url: '/status',
                views: {
                    'app': {
                        templateUrl: 'templates/status.html',
                        controller: 'statusCtrl'
                    }
                }
            })

            .state('menu.help', {
                url: '/help',
                views: {
                    'app': {
                        templateUrl: 'templates/help.html',
                        controller: 'helpCtrl'
                    }
                }
            })

            .state('menu.privacy', {
                url: '/privacy',
                views: {
                    'app': {
                        templateUrl: 'templates/privacy.html',
                        controller: 'privacyCtrl'
                    }
                }
            })

            .state('menu.login', {
                url: '/account/login',
                views: {
                    'app': {
                        templateUrl: 'templates/account/login.html',
                        controller: 'loginCtrl'
                    }
                }
            })

            .state('menu.register', {
                url: '/account/register',
                views: {
                    'app': {
                        templateUrl: 'templates/account/register.html',
                        controller: 'registerCtrl'
                    }
                }
            })

            .state('menu.forgot', {
                url: '/account/forgot',
                views: {
                    'app': {
                        templateUrl: 'templates/account/forgot.html',
                        controller: 'forgotCtrl'
                    }
                }
            })

            .state('menu.logout', {
                url: '/account/logout',
                views: {
                    'app': {
                        templateUrl: 'templates/account/logout.html',
                        controller: 'logoutCtrl'
                    }
                }
            })
            .state('menu', {
                url: '/app',
                templateUrl: 'templates/menu.html',
                controller: 'menuCtrl'
            });

        $urlRouterProvider.otherwise('/app/dashboard')


    })
;