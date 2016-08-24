angular.module('app.services')
    .factory('Sync', ['$q', 'Diagnostics', 'Settings', 'Location', 'Log', '$interval', function ($q, Diagnostics, Settings, Location, Log, $interval) {

        function canSync() {
            return Diagnostics.isOnline();
        }

        function needSync() {
            var q = $q.defer();

            Location.getUnsynced().then(function (locations) {
                if (locations.length > 0) {
                    q.resolve(locations);
                } else {
                    q.reject(locations);
                }
            }, function (err) {
                console.log(err);
                q.reject(false);
            });
            return q.promise;
        }

        function sync(locations) {
            _.each(locations, function (location) {
                console.log(location);
                location.sync()
            })
        }

        $interval(function () {
            if (canSync()) {
                Log.debug("[Sync] canSync() true");
                needSync().then(sync)
            } else {
                Log.debug("[Sync] canSync() false");
            }
        }, 1000 * 60 * .1);


        return {
            canSync: canSync,
            needSync: needSync,
            sync: sync
        }
    }

    ])
;