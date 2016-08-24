angular.module('app.controllers')

    .controller('menuCtrl', function ($scope, User, Diagnostics, $state, GPS) {
        $scope.isLoggedIn = User.isLoggedIn;

        $scope.$on('Compass.heading', function (e, result) {
            $scope.heading = result.trueHeading || result.magneticHeading;
            $scope.ionNavigationIconRotate = 360 - $scope.heading - 45;
        });

        $scope.$watch(function () {
            return GPS.getFix();
        }, function (val) {
            if (val > 0) {
                $scope.gpsFix = Math.round(val) + ' m';
            } else {
                $scope.gpsFix = 'no fix';
            }
        });

    });
   