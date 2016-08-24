angular.module('app.services')
    .factory('Store', [function () {

        function setItem(key, value) {
            window.localStorage.setItem(key, JSON.stringify(value));
        }

        function getItem(key) {
            var value = window.localStorage.getItem(key);
            return value && JSON.parse(value);
        }

        return {
            setItem: setItem,
            getItem: getItem
        }
    }]);