angular.module('app.controllers')
    .controller("forgotCtrl", ['$scope', 'User','Log', function ($scope, User, Log) {
    function setMessage(message, success) {
        $scope.success = success;
        $scope.message = message;
    }
    console.log('hello');
    $scope.forgot = function () {
        $scope.busy = true;

        Log.debug('[ForgotController] Email: ' + $scope.email);

        User.forgot($scope.email).then(function (response) {
            setMessage(response.description, true);
            $scope.busy = false;
            $scope.email = '';
        }, function (response) {
            if (response && response.description) {
                setMessage(response.description, false);
            }
            else {
                setMessage('Something went wrong', false);
            }
            $scope.busy = false;
        });
    };
}]);