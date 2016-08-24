angular.module('app.services')
    .factory('Settings', ['$ionicPlatform','Store', function ($ionicPlatform, Store) {
        var platform = ionic.Platform.platform,
            SETTINGS = {
                NETWORK_DATA: true,
                BACKGROUND_GPS: 'always',
                MAXIMUM_ACCURACY: 30,
                MINIMUM_LOCATIONS: 5,
                COMPASS_FREQUENCY: 15,
                PERMISSION_CHECK_INTERVAL: 1000 * 60 * 30,
                SAVE_TO_PHOTO_ALBUM: true,
                SERVER_ADDRESS: 'https://api.croplands.org'
            };        

        $ionicPlatform.ready(function () {

            switch (platform()) {
                case 'ios':
                    SETTINGS.FILE_LOCATION = cordova.file.dataDirectory;
                    SETTINGS.BACKUP_FILE_LOCATION = cordova.file.dataDirectory;
                    break;

                case 'android':
                    SETTINGS.FILE_LOCATION = cordova.file.dataDirectory;
                    SETTINGS.BACKUP_FILE_LOCATION = cordova.file.externalDataDirectory;
                    break;
            }
        });

        function get(setting) {
            if (Store.getItem(setting) !== null) {
                return Store.getItem(setting);
            }

            if (SETTINGS[setting] !== undefined) {
                return SETTINGS[setting];
            }
        }

        function getAll() {
            var results = {};

            _.each(SETTINGS, function (value, key) {
                value = get(key);
                results[key] = value;
            });
            return results;
        }

        function set(setting, value) {
            Store.setItem(setting, value);
        }

        function setAll(settings) {
            _.each(settings, function (value, key) {
                set(key, value);
            });

            return getAll();
        }

        return {
            get: get,
            set: set,
            getAll: getAll,
            setAll: setAll
        }

    }]);