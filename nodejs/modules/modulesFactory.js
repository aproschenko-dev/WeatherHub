var modulesFactory = function() {

    var modules = [];
    var databaseHelper;

    var getJsonParam = function(json, paramName) {
        var param = json[paramName];
        if (param === undefined || param == "undefined") {
            return null;
        }
        return param;
    };

    var getModuleClass = function(model) {
        switch (model) {
            case "gateway":
                return require('./moduleGateway');
            case "plug":
                return require('./modulePlug');
            case "sensor_ht":
                return require('./moduleTemperature');
            case "motion":
            case "switch":
            case "magnet":
            case "sensor_wleak.aq1":
            case "sensor_switch.aq2":
            case "sensor_cube.aqgl01":
            case "86sw2":
                return require('./moduleGeneric');
            default:
                return require('./moduleGeneric');
        }
    };

    var getModuleBySid = function(sid) {
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            if (module.sid === sid) {
                return module;
            }
        }
        return null;
    };

    var getFirstModuleByModel = function(model) {
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];
            if (module.model === model) {
                return module;
            }
        }
        return null;
    };

    this.setDatabaseHelper = function(helper) {
        databaseHelper = helper;
    };

    this.onMessage = function(cmd, json) {
        var sid = getJsonParam(json, "sid");
        var model = getJsonParam(json, "model");

        var moduleObject = getModuleBySid(sid);
        if (moduleObject == null) {
            var moduleClass = getModuleClass(model);
            moduleObject = new moduleClass(sid, model, databaseHelper);
            modules.push(moduleObject);
        }

        modules.forEach(module => {
            if (module.sid === sid) {
                module.onMessage(cmd, json);
            }
        });
    };

    this.getGateway = function() {
        return getFirstModuleByModel("gateway");
    };

    this.getDevices = function() {
        var devices = [];
        modules.forEach(module => {
            devices.push({
                sid: module.sid,
                model: module.model,
                events: module.events
            });
        });
        return devices;
    };

};

var factory = new modulesFactory();
module.exports = factory;