angular.module('app.services')
    .factory('Camera', [ '$cordovaCamera', '$q', '$ionicPlatform', 'File','Settings', function ($cordovaCamera, $q, $ionicPlatform, File, Settings) {
        var defaults = {
            quality: 75,
            saveToPhotoAlbum: Settings.get("SAVE_TO_PHOTO_ALBUM"),
            correctOrientation: true,
            targetWidth: 1000,
            targetHeight: 1000
        };

        function getPicture(options) {
            var q = $q.defer();
            defaults.saveToPhotoAlbum = Settings.get("SAVE_TO_PHOTO_ALBUM");

            options = _.merge(defaults, options);

            $cordovaCamera.getPicture(options).then(function (imageURI) {
                window.resolveLocalFileSystemURL(imageURI, resolveFileSystemSuccess, resolveFileSystemError);

                function resolveFileSystemSuccess(fileEntry) {
                    q.resolve(fileEntry.toURL())
                }
                function resolveFileSystemError(err) {
                    q.reject(err);
                }

                q.resolve(imageURI);
            }, function (err) {
                q.reject(err);
            });

            return q.promise;
        }


        function init() {
            $ionicPlatform.ready().then(function () {
                var platform = ionic.Platform.platform();
//                switch (platform) {
//                    case 'ios':
//                        defaults.destinationType = Camera.DestinationType.FILE_URI;
//
//                        break;
//                    case 'android':
//                        defaults.destinationType = Camera.DestinationType.FILE_URI;
//                        break;
//                }

                defaults.destinationType = Camera.DestinationType.FILE_URI;
            });


        }

        init();


        return {
            getPicture: getPicture
        }

    }]);