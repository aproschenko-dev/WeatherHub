const express = require('express');

var serverHelper = function() {

    var modulesFactory;
    var commandHelper;

    this.setModulesFactory = function(factory) {
        modulesFactory = factory;
    };

    this.setCommandHelper = function(helper) {
        commandHelper = helper;
    };

    function getGateway() {
        return modulesFactory.getGateway();
    }

    function init() {
        const app = express();
        const port = 3000;

        app.get('/', (request, response) => {
            response.send('Hello from Express!');
        });

        app.get('/devices', (request, response) => {
            response.header('Content-Type', 'application/json');
            response.send(modulesFactory.getDevices());
        });
        
        app.get('/color', (request, response) => {
            response.send('Calling color.');
            var gateway = getGateway();
            var command = {
                cmd: "write",
                model: "gateway",
                sid: gateway.sid,
                data: {rgb: 1677734911, illumination: 1200}
            };
            commandHelper.sendWriteCommand(gateway.sid, command, gateway.port, gateway.ip, gateway.token);
        });

        app.get('/sound', (request, response) => {
            response.send('Calling sound.');
            var gateway = getGateway();
            var command = {
                cmd: "write",
                model: "gateway",
                sid: gateway.sid,
                data: {mid: '8', volume: '5'}
            };
            commandHelper.sendWriteCommand(gateway.sid, command, gateway.port, gateway.ip, gateway.token);
        });
        
        app.get('/on', (request, response) => {
            response.send('Calling on.');
            var deviceSid = "158d00024d89fb";
            var gateway = getGateway();
            var command = {
                cmd: "write",
                model: "plug",
                sid: deviceSid,
                data: {status: "on", key: ""}
            };
            commandHelper.sendWriteCommand(deviceSid, command, gateway.port, gateway.ip, gateway.token);
        });

        app.get('/off', (request, response) => {
            response.send('Calling off.');
            var deviceSid = "158d00024d89fb";
            var gateway = getGateway();
            var command = {
                cmd: "write",
                model: "plug",
                sid: deviceSid,
                data: {status: "off", key: ""}
            };
            commandHelper.sendWriteCommand(deviceSid, command, gateway.port, gateway.ip, gateway.token);
        });
        
        app.listen(port, (err) => {
            if (err) {
                return console.log('Something bad happened: ', err);
            }
            console.log(`Server is listening on ${port}`);
        });
    }

    init();

};

var helper = new serverHelper();
module.exports = helper;