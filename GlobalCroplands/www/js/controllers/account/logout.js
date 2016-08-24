angular.module('app.controllers')
    .controller("logoutCtrl", ['$scope', 'Log', 'User', '$state', function ($scope, Log, User, $state) {

        User.logout();

        $scope.$watch(function () {
            return User.isLoggedIn();
        }, function (isLoggedIn) {
            if (!isLoggedIn) {
                $state.go('menu.dashboard');
            }
        });

    }]);