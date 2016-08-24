angular.module('app.controllers')
    .controller('statusCtrl', ['$scope', '$interval', 'Diagnostics', function ($scope, $interval, Diagnostics) {

        $scope.$watch(Diagnostics.getStatus, function (status) {
            $scope.status = status;
        },true);

        $scope.goToSettings = function () {
            cordova.plugins.diagnostic.switchToSettings(function () {
                console.log("Successfully switched to Settings app");
            }, function (error) {
                console.error("The following error occurred: " + error);
            });
        };

    }]);