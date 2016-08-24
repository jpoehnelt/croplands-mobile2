angular.module('app.services')
    .factory('File', [ '$cordovaFile', '$q', '$ionicPlatform', function ($cordovaFile, $q, $ionicPlatform) {
        var constants = {
            "FILE_SYSTEM": null,
            "SUB_DIRECTORIES": {
                "PHOTOS": "photos",
                "DATA": "data",
                "APP": "app",
                "LOG": "log",
                "TILES": "tiles"
            }
        };

        /**
         * Helper function for making directories if they do not exist.
         * @param fileSystem
         * @param directory
         * @returns {*}
         */
        function makeDirs(fileSystem, directory) {
            var q = $q.defer();
            $cordovaFile.checkDir(fileSystem, directory).then(function (obj) {
                q.resolve(obj);
            }, function () {
                $cordovaFile.createDir(fileSystem, directory, false).then(function (obj) {
                    q.resolve(obj);
                }, function (err) {
                    q.reject(err);
                })
            });

            return q.promise;
        }

        function init() {
            constants.FILE_SYSTEM = cordova.file.dataDirectory;

            var q = $q.defer(),
                promises = [];

            // make directories if they do not exist
            _.each(constants.SUB_DIRECTORIES, function (directory, key) {
                promises.push(makeDirs(constants.FILE_SYSTEM, directory));
            });

            $q.all(promises).then(function (results) {
                q.resolve(results);
            }, function (results) {
                q.reject(results);
            });

            return q.promise;
        }

        $ionicPlatform.ready().then(function () {
            init();
        });

        return {
            init: init,
            constants: constants
        }

    }]);