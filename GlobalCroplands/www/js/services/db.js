angular.module('app.services')
    .factory('DB', ['$q', '$ionicPlatform', 'Diagnostics', function ($q, $ionicPlatform, Diagnostics) {
        var db,
            constants = {
                name: 'database.db',
                tables: [
                    {
                        name: 'location',
                        columns: [
                            {name: 'id', type: 'integer primary key'},
                            {name: 'json', type: 'text'},
                            {name: 'lat', type: 'float'},
                            {name: 'lng', type: 'float'},
                            {name: 'synced', type: 'integer default 0'},
                            {name: 'sync_failures', type: 'integer default 0'},
                            {name: 'sync_error', type: 'text'}
                        ]
                    },
                    {
                        name: 'photo',
                        columns: [
                            {name: 'id', type: 'integer primary key'},
                            {name: 'location_id', type: 'integer'},
                            {name: 'filename', type: 'text'},
                            {name: 'json', type: 'text'},
                            {name: 'lat', type: 'float'},
                            {name: 'lng', type: 'float'},
                            {name: 'heading', type: 'float'},
                            {name: 'synced', type: 'integer default 0'},
                            {name: 'sync_failures', type: 'integer default 0'},
                            {name: 'sync_error', type: 'text'},
                            {name: 'FOREIGN KEY(location_id) REFERENCES location(id)', type: ''}
                        ]}
                ]};


        function init() {
            console.log("DB.init()");
            var q = $q.defer();
            try {
                db = window.sqlitePlugin.openDatabase({name: constants.name, location: 'default'}, function (result) {
                    var promises = [];

                    _.each(constants.tables, function (table) {
                        var columns = [];

                        _.each(table.columns, function (column) {
                            columns.push(column.name + ' ' + column.type);
                        });

                        var sql = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';

                        promises.push(query(sql));
                    });

                    $q.all(promises).then(function (results) {
                        q.resolve(results);
                    }, function (err) {
                        q.reject(err);
                    });

                }, function (err) {
                    q.reject(err);
                });
            } catch(err) {
                q.reject(err);
            }
            return q.promise;
        }

        function query(query, bindings) {
            bindings = typeof bindings !== 'undefined' ? bindings : [];
            var q = $q.defer();
            console.log(query);
            db.transaction(function (transaction) {
                transaction.executeSql(query, bindings, function (transaction, result) {
                    q.resolve(result);
                }, function (transaction, error) {
                    q.reject(error);
                });
            });

            return q.promise;
        }

        function fetchAll(result) {
            var output = [];

            for (var i = 0; i < result.rows.length; i++) {
                output.push(result.rows.item(i));
            }

            return output;
        }

        function fetch(result) {
            return result.rows.item(0);
        }


        $ionicPlatform.ready().then(function () {
            init().then(function (results) {
                Diagnostics.setStatus('db', Diagnostics.constants.application.enabled);
            }, function (err) {
                Diagnostics.setStatus('db', Diagnostics.constants.application.enabled);
            });
        });

        return {
            query: query,
            fetch: fetch,
            fetchAll: fetchAll,
            CONSTANTS: constants
        };
    }

    ])
;