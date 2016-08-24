angular.module('app.controllers')
    .controller('settingsCtrl', ['$scope', '$stateParams', 'Settings', 'Log', 'Diagnostics', function ($scope, $stateParams, Settings, Log, Diagnostics) {
        angular.extend($scope, {
            settings: {}
        });
        $scope.$watch(function () {
            var settings = Settings.getAll();
            return _.map(_.keys(settings).sort(), function (key) {
                return settings[key];
            });
        }, function () {
            _.extend($scope.settings, Settings.getAll());
            console.log($scope.settings);
        }, true);

        $scope.changeToSettings = _.debounce(function (key, number) {
            var value = $scope.settings[key];
            if (number) {
                value = parseInt(value);
            }
            Settings.set(key, value);
        }, 3000);
    }]);