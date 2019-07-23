var mysql = require('mysql');

var databaseHelper = function() {

    var connection;

    this.init = function(config) {
        connection = mysql.createConnection({
            host: config.databaseHost,
            user: config.databaseUser,
            password: config.databasePassword,
            database: config.databaseBase
        });

        connection.connect(function(err) {
            if (err) {
                throw err;
            }
            console.log("Database connected!");
        });
    };

    this.updateHubData = function(cmd, model, sid, short_id, voltage) {
        // clear DB for old rows
        var deleteSql = "delete from HubData where sid = '" + sid + "'";
        connection.query(deleteSql);

        var sql = "insert into HubData (cmd, model, sid, shortid, voltage) values (?)";
        var hubValue = [cmd, model, sid, short_id, voltage];
        connection.query(sql, [hubValue], function (err, result) {
            if (err) {
                throw err;
            }
        });
    };

    this.insertTemperatureHumidityData = function(sid, temperature, humidity) {
        var sensorSql = "insert into SensorData (sid, temperature, humidity) values (?)";
        var sensorValue = [sid, temperature, humidity];
        connection.query(sensorSql, [sensorValue]);
    };

    this.insertStatusData = function(sid, status) {
        var sensorSql = "insert into SensorData (sid, status) values (?)";
        var sensorValue = [sid, status];
        connection.query(sensorSql, [sensorValue]);
    };

};

var helper = new databaseHelper();
module.exports = helper;