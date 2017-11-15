
var queryHelper = new function() {

    var thisRef = this;

    function request(url, params, callback) {
        var request = $.ajax({
            url: url,
            type: "post",
            data: params
        });

        request.done(function (response){
            var payload = JSON.parse(response);
            callback(payload);
        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            console.error(
                "The following error occurred: " +
                textStatus, errorThrown
            );
        });
    }

    function updateSensorData(params, callback) {
        request("updateSensorData.php", params, callback);
    }
    thisRef.updateSensorData = updateSensorData;

    function updateModuleData(params, callback) {
        request("updateModuleData.php", params, callback);
    }
    thisRef.updateModuleData = updateModuleData;

    function requestUserData(params, callback) {
        request("queryUserData.php", params, callback);
    }
    thisRef.requestUserData = requestUserData;

    function requestData(params, callback) {
        request("queryData.php", params, callback);
    }
    thisRef.requestData = requestData;
};
