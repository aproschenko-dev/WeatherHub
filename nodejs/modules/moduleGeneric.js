function moduleGeneric(sid, model, databaseHelper) {
    this.databaseHelper = databaseHelper;
    this.sid = sid;
    this.model = model;
    this.events = [];
}

moduleGeneric.prototype.getJsonParam = function(json, paramName) {
    var param = json[paramName];
    if (param === undefined || param == "undefined") {
        return null;
    }
    return param;
};

moduleGeneric.prototype.setDatabaseHelper = function(helper) {
    this.databaseHelper = helper;
};

moduleGeneric.prototype.onMessage = function(cmd, json) {
    var short_id = this.getJsonParam(json, "short_id");
    var messageData = this.getJsonParam(json, "data");
    var messageDataJson = messageData ? JSON.parse(messageData) : null;
    var voltage = messageDataJson ? messageDataJson['voltage'] : null;

    this.databaseHelper.updateHubData(cmd, this.model, this.sid, short_id, voltage);

    switch (cmd) {
        case "read_ack":
            this.onReadAck(json);
            break;
        case "get_id_list_ack":
            this.onGetIdListAck(json);
            break;
        case "iam":
            this.onIam(json);
            break;
        case "report":
            this.onReport(json);
            break;
        case "heartbeat":
            this.onHeartbeat(json);
            break;
        default:
            break;
    }
};

moduleGeneric.prototype.onIam = function(json) {
};

moduleGeneric.prototype.onReadAck = function(json) {
};

moduleGeneric.prototype.onGetIdListAck = function(json) {
};

moduleGeneric.prototype.onReport = function(json) {
};

moduleGeneric.prototype.onHeartbeat = function(json) {
};

module.exports = moduleGeneric;