const crypto = require('crypto');
var config = require('./config');

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

var commandHelper = function() {

    const iv = Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]);
    var serverSocket = null;

    this.setServerSocket = function(socket) {
        serverSocket = socket;
    };

    this.sendCommand = function(jsonObject, port, address) {
        var cmdString = JSON.stringify(jsonObject);
        var message = new Buffer(cmdString);
        serverSocket.send(message, 0, cmdString.length, port, address);
        console.log('Sending \x1b[33m%s\x1b[0m to \x1b[36m%s:%d\x1b[0m.', cmdString, address, port);
    };
    
    this.sendWriteCommand = function(deviceSid, jsonObject, port, address, token) {
        var cipher = crypto.createCipheriv('aes-128-cbc', config.gatewayPassword, iv);
        var key = cipher.update(token, "ascii", "hex");
        cipher.final('hex'); // Useless data, don't know why yet.
        var serialNumber = new Date().Format("yyyyMMddhhmmss");
    
        jsonObject.data.key = key;
        var msgTag = 'write_' + deviceSid + "_t" + serialNumber;
    
        this.sendCommand(jsonObject, port, address);
    };    

};

var helper = new commandHelper();
module.exports = helper;