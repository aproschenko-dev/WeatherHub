var mysql = require('mysql');
var config = require('./config');
const dgram = require('dgram');

const serverPort = config.serverPort;
const serverSocket = dgram.createSocket('udp4');
const multicastAddress = config.multicastAddress;
const multicastPort = config.multicastPort;
const sensorDelay = config.sensorDelay;

var sidToAddress = {};
var sidToPort = {};
var gatewayAddress;

var con = mysql.createConnection({
    host: "localhost",
    user: "phpmyadmin",
    password: "root",
    database: "homehub"
});
  
con.connect(function(err) {
    if (err) {
        throw err;
    }
    console.log("Database connected!");
});

function getJsonParam(json, paramName) {
    var param = json[paramName];
    if (param === undefined || param == "undefined") {
        return null;
    }
    return param;
};

serverSocket.on('message', function (msg, rinfo) {

    console.log('Received \x1b[33m%s\x1b[0m (%d bytes) from client \x1b[36m%s:%d\x1b[0m.', msg, msg.length, rinfo.address, rinfo.port);
    var json;
    try {
        json = JSON.parse(msg);
    }
    catch (e) {
        console.log('\x1b[31mUnexpected message: %s\x1b[0m.', msg);
        return;
    }

    var cmd = json['cmd'];
    var messageData = getJsonParam(json, "data");
    var messageDataJson = messageData ? JSON.parse(messageData) : null;
    var voltage = messageDataJson ? messageDataJson['voltage'] : null;
    var model = getJsonParam(json, "model");
    var sid = getJsonParam(json, "sid");
    var short_id = getJsonParam(json, "short_id");

    // clear DB for old rows
    var deleteSql = "delete from HubData where sid = '" + sid + "'";
    con.query(deleteSql);

    var sql = "insert into HubData (cmd, model, sid, shortid, voltage) values (?)";
    var hubValue = [cmd, model, sid, short_id, voltage];
    con.query(sql, [hubValue], function (err, result) {
        if (err) {
            throw err;
        }
    });

    if (cmd === 'iam') {

        var address = json['ip'];
        var port = json['port'];

        gatewayAddress = address;

        var command = {
            cmd: "get_id_list"
        };
        var cmdString = JSON.stringify(command);
        var message = new Buffer(cmdString);
        serverSocket.send(message, 0, cmdString.length, port, address);

        console.log('Requesting devices list...');
    }
    else if (cmd === 'get_id_list_ack') {

        var data = JSON.parse(json['data']);
        console.log('Received devices list: %d device(s) connected.', data.length);
        for (var index in data) {
            var sid = data[index];
            var command = {
                cmd: "read",
                sid: new String(sid)
            };

            sidToAddress[sid] = rinfo.address;
            sidToPort[sid] = rinfo.port;

            var cmdString = JSON.stringify(command);
            var message = new Buffer(cmdString);
            serverSocket.send(message, 0, cmdString.length, rinfo.port, rinfo.address);

            console.log('Sending \x1b[33m%s\x1b[0m to \x1b[36m%s:%d\x1b[0m.', cmdString, rinfo.address, rinfo.port);
        }
    }
    else if (cmd === 'read_ack') {
        var data = JSON.parse(json['data']);
        var status = data['status'];

        if (model === 'sensor_ht') {
            var temperature = data['temperature'] ? data['temperature'] / 100.0 : 100;
            var humidity = data['humidity'] ? data['humidity'] / 100.0 : 0;
            var sensorSql = "insert into SensorData (sid, temperature, humidity) values (?)";
            var sensorValue = [sid, temperature, humidity];
            con.query(sensorSql, [sensorValue]);
        }
    }
    else if (cmd === 'report') {
        var data = JSON.parse(json['data']);
        var status = data['status'];

        if (model === "plug" || model === "magnet" || model === "motion" || model === "sensor_wleak.aq1") {
            var sensorSql = "insert into SensorData (sid, status) values (?)";
            var sensorValue = [sid, status];
            con.query(sensorSql, [sensorValue]);
        }
    }
    else if (cmd === 'heartbeat') {
    }
});

// err - Error object, https://nodejs.org/api/errors.html
serverSocket.on('error', function (err) {
    console.log('Error, message - %s, stack - %s.', err.message, err.stack);
});

serverSocket.on('listening', function () {
    console.log('Starting a UDP server, listening on port %d.', serverPort);
    serverSocket.addMembership(multicastAddress);
})

console.log('Starting Aqara daemon...');

serverSocket.bind(serverPort);

function sendWhois() {
    var command = {
        cmd: "whois"
    };
    var cmdString = JSON.stringify(command);
    var message = new Buffer(cmdString);
    serverSocket.send(message, 0, cmdString.length, multicastPort, multicastAddress);

    console.log('Sending WhoIs request to a multicast address \x1b[36m%s:%d\x1b[0m.', multicastAddress, multicastPort);
}

sendWhois();

setInterval(function () {
    console.log('Requesting data...');
    sendWhois();
}, sensorDelay * 1000);
