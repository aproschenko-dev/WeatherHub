var mysql = require('mysql');
const crypto = require('crypto');
var config = require('./config');
const dgram = require('dgram');

const serverPort = config.serverPort;
const serverSocket = dgram.createSocket('udp4');
const multicastAddress = config.multicastAddress;
const multicastPort = config.multicastPort;
const sensorDelay = config.sensorDelay;

const iv = Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);
const gatewayPassword = '5uym4gcadgt4ph9f';
var gatewayToken;

const express = require('express');
const app = express();
const port = 3000;
app.get('/', (request, response) => {
    response.send('Hello from Express!');
});

app.get('/color', (request, response) => {
    response.send('Calling color.');
    var deviceSid = "f0b429cc178e";
    var command = {
        cmd: "write",
        model: "gateway",
        sid: deviceSid,
        data: {rgb: "1677734911", illumination: 1200, key: ""}
    };
    sendWriteCommand(deviceSid, command, "9898", "192.168.0.100");
});

app.get('/plug', (request, response) => {
    response.send('Calling plug.');
    var deviceSid = "158d000127883b";
    var command = {
        cmd: "write",
        model: "plug",
        sid: deviceSid,
        data: {status: "on", key: ""}
    };
    sendWriteCommand(deviceSid, command, "9898", "192.168.0.100");
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});

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

Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function sendCommand(jsonObject, port, address) {
    var cmdString = JSON.stringify(jsonObject);
    var message = new Buffer(cmdString);
    serverSocket.send(message, 0, cmdString.length, port, address);
    console.log('Sending \x1b[33m%s\x1b[0m to \x1b[36m%s:%d\x1b[0m.', cmdString, address, port);
};

function sendWriteCommand(deviceSid, jsonObject, port, address) {
    var cipher = crypto.createCipheriv('aes-128-cbc', gatewayPassword, iv);
    console.log("gatewayToken", gatewayToken);
    var key = cipher.update(gatewayToken, "ascii", "hex");
    cipher.final('hex'); // Useless data, don't know why yet.
    var serialNumber = new Date().Format("yyyyMMddhhmmss");

    jsonObject.data.key = key;
    var msgTag = 'write_' + deviceSid + "_t" + serialNumber;

    sendCommand(jsonObject, port, address);
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
    var token = getJsonParam(json, "token");
    var short_id = getJsonParam(json, "short_id");

    if (model === 'gateway' && token != null) {
        gatewayToken = token;
    }

    // clear DB for old rows
    var deleteSql = "delete from HubData where sid = '" + sid + "'";
    con.query(deleteSql);

    var sql = "insert into HubData (cmd, model, sid, shortid, token, voltage) values (?)";
    var hubValue = [cmd, model, sid, short_id, token, voltage];
    con.query(sql, [hubValue], function (err, result) {
        if (err) {
            throw err;
        }
    });

    if (cmd === 'iam') {
        var address = json['ip'];
        var port = json['port'];

        var command = {
            cmd: "get_id_list"
        };
        console.log('Requesting devices list...');
        sendCommand(command, port, address);
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

            sendCommand(command, rinfo.port, rinfo.address);
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
