angular.module('app.controllers')
    .controller('dataCtrl', ['$scope', '$interval', 'Location', function ($scope, $interval, Location) {
        Location.getAll().then(function (rows) {
            $scope.rows = rows;
        });
    }]);