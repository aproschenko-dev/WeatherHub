var moduleGeneric = require('./moduleGeneric');
var util = require('util');

function moduleTemperature() {
    moduleGeneric.apply(this, arguments);
}

util.inherits(moduleTemperature, moduleGeneric);

moduleTemperature.prototype.onReadAck = function(json) {
    var data = JSON.parse(json['data']);
    var temperature = data['temperature'] ? data['temperature'] / 100.0 : 100;
    var humidity = data['humidity'] ? data['humidity'] / 100.0 : 0;

    this.databaseHelper.insertTemperatureHumidityData(this.sid, temperature, humidity);
};

module.exports = moduleTemperature;