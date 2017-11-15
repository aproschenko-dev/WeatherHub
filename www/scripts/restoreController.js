
var restoreController = function(params) {

    function validateForm(evt) {
        var errors = [];
        var email = ge("username").value;

        var errorPane = ge("errorPane");
        errorPane.innerHTML = "";

        if (isStringEmpty(email)) {
            errors.push("Введите e-mail, указанный при регистрации");
        }

        if (errors.length == 0) {
            errorPane.style.visibility = "hidden";
            return true;
        }

        for (var i = 0; i < errors.length; i++) {
            errorPane.innerHTML += errors[i];
            if (i != errors.length) {
                errorPane.innerHTML += "<br/>";
            }
        }

        if (isStringEmpty(email)) {
            ge("username").focus();
        }

        EventHelper.cancel(evt);
        errorPane.style.visibility = "visible";

        return false;
    }

    function doRestore(evt) {
        if (!validateForm(evt)) {
        }
    }

    function init() {
        ge("username").focus();
        ge("btnRestore").onclick = doRestore;
    }

    init();

};
