angular.module('app.services')
    .factory('Location', ['$q', '$ionicPlatform', 'Settings', 'DB', '$http', 'Log', function ($q, $ionicPlatform, Settings, DB, $http, Log) {
        function Location(data) {
            _.extend(this, data);
        }

        Location.prototype.save = function () {
            var q = $q.defer(), bindings = [], sql;

            if (this.id) {
                bindings = [JSON.stringify(this.json), this.lat, this.lng, this.synced, this.sync_error, this.sync_failures, this.id];
                sql = "UPDATE location SET json = ?, lat = ?, lng = ?, synced = ?, sync_error = ?, sync_failures = ? WHERE id = ?"
            } else {
                bindings = [JSON.stringify(this.json), this.lat, this.lng];
                sql = "INSERT INTO location (json, lat, lng) VALUES(?, ?, ?)"
            }

            DB.query(sql, bindings)
                .then(function (result) {
                    q.resolve(result)

                }, function (err) {
                    q.reject(err);
                });

            return q.promise;
        };

        Location.prototype.sync = function () {
            var q = $q.defer(),
                self = this;

            $http({method: 'POST', url: Settings.get('SERVER_ADDRESS') + '/api/locations', data: self.json}).then(function (response) {
                Log.info("Location Upload Success");
                self.synced = 1;
                self.sync_error = '';
                self.json = response.data;
                self.save();
                q.resolve();

            }, function (response) {
                Log.info("Location Upload Failed");
                self.sync_error = JSON.stringify(response.data);
                console.log(response);
                if (response && response.status === 400) {
                    self.sync_failures++;
                    self.save();
                }
                q.reject(response);
            });

            return q.promise;
        };

        function getAll() {
            return select('SELECT * FROM location');
        }

        function getUnsynced() {
            return select('SELECT * FROM location WHERE synced = 0');
        }

        function getCountUnsynced() {
            var q = $q.defer();
            DB.query('SELECT COUNT(*) as count FROM location WHERE synced = 0')
                .then(function (result) {
                    q.resolve(result.rows.item(0).count)
                }, function (err) {
                    q.reject(err);
                });
            return q.promise;
        }

        function select(sql) {
            var q = $q.defer();
            DB.query(sql)
                .then(function (result) {
                    q.resolve(_.map(DB.fetchAll(result), function (row) {
                        row.json = JSON.parse(row.json);
                        return new Location(row);
                    }));
                }, function (err) {
                    q.reject(err);
                });
            return q.promise;
        }

        function sync() {
            var q = $q.defer();

            getUnsynced().then(function (results) {
                if (!results.length) {
                    q.resolve();
                    return;
                }

                // chain through rows to sync
                var promise = results[0].sync();
                _.every(results.slice(1), function (row) {
                    promise = promise.then(row.sync, function (err) {
                        q.reject(err);
                    });
                });

                promise.then(q.resolve, q.reject);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        return {
            create: function (data) {
                return new Location(data)
            },

            // retrieval methods
            getAll: getAll,
            getUnsynced: getUnsynced,
            getCountUnsynced: getCountUnsynced,

            // sync
            sync: sync
        }
    }

    ])
;