var moduleGeneric = require('./moduleGeneric');
var util = require('util');

function moduleGateway() {
    moduleGeneric.apply(this, arguments);
    this.token = null;
    this.port = null;
    this.ip = null;
}

util.inherits(moduleGateway, moduleGeneric);

moduleGateway.prototype.onHeartbeat = function(json) {
    this.token = this.getJsonParam(json, "token");
};

moduleGateway.prototype.onGetIdListAck = function(json) {
    this.token = this.getJsonParam(json, "token");
};

moduleGateway.prototype.onIam = function(json) {
    this.ip = json['ip'];
    this.port = json['port'];
};

module.exports = moduleGateway;