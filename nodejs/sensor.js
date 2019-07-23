const dgram = require('dgram');
var config = require('./config');
var databaseHelper = require('./databaseHelper');
var commandHelper = require('./commandHelper');
var serverHelper = require('./serverHelper');
var modulesFactory = require('./modules/modulesFactory');

const serverPort = config.serverPort;
const serverSocket = dgram.createSocket('udp4');
const multicastAddress = config.multicastAddress;
const multicastPort = config.multicastPort;
const sensorDelay = config.sensorDelay;

databaseHelper.init(config);
modulesFactory.setDatabaseHelper(databaseHelper);
commandHelper.setServerSocket(serverSocket);

serverHelper.setModulesFactory(modulesFactory);
serverHelper.setCommandHelper(commandHelper);

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
    modulesFactory.onMessage(cmd, json);

    if (cmd === 'iam') {
        var address = json['ip'];
        var port = json['port'];

        var command = {
            cmd: "get_id_list"
        };
        console.log('Requesting devices list...');
        commandHelper.sendCommand(command, port, address);
    }
    else if (cmd === 'get_id_list_ack') {
        var gatewaySid = json['sid'];
        var data = JSON.parse(json['data']);
        data.push(gatewaySid);
        console.log('Received devices list: %d device(s) connected.', data.length);
        for (var index in data) {
            var sid = data[index];
            var command = {
                cmd: "read",
                sid: new String(sid)
            };

            commandHelper.sendCommand(command, rinfo.port, rinfo.address);
        }
    }
});

serverSocket.on('error', function (err) {
    console.log('Error, message - %s, stack - %s.', err.message, err.stack);
});

serverSocket.on('listening', function () {
    console.log('Starting a UDP server, listening on port %d.', serverPort);
    serverSocket.addMembership(multicastAddress);
});

console.log('Starting Aqara daemon...');

serverSocket.bind(serverPort);

function sendWhois() {
    var command = {
        cmd: "whois"
    };
    commandHelper.sendCommand(command, multicastPort, multicastAddress);
}

sendWhois();

setInterval(function () {
    console.log('Requesting data...');
    sendWhois();
}, sensorDelay * 1000);
