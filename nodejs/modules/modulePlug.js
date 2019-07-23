var moduleGeneric = require('./moduleGeneric');
var util = require('util');

function modulePlug() {
    moduleGeneric.apply(this, arguments);
    this.events = [
        {
            event: "on",
            data: {status: "on"}
        },
        {
            event: "off",
            data: {status: "off"}
        }
    ];
}

util.inherits(modulePlug, moduleGeneric);

module.exports = modulePlug;