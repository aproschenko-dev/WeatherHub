
var loginController = function(params) {

    var userNameField = null;
    var passwordField = null;
    var btnLogin = null;
    var errorPane = null;
    var rememberme = null;

    function initData() {
        userNameField = ge("username");
        passwordField = ge("password");
        btnLogin = ge("btnLogin");
        errorPane = ge("errorPane");
        rememberme = ge("rememberme");
    }

    function disableForm(disable) {
        userNameField.disabled = passwordField.disabled = btnLogin.disabled = disable;
    }

    function validateForm(evt) {

        var errors = [];
        var email = userNameField.value;
        var password = passwordField.value;

        var emailIsValid = true;
        var passwordIsValid = true;

        errorPane.innerHTML = "";

        if (isStringEmpty(email) || !validateEmail(email)) {
            errors.push("Введите валидный e-mail");
            emailIsValid = false;
        }
        if (isStringEmpty(password)) {
            errors.push("Введите пароль");
            passwordIsValid = false;
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

        if (!emailIsValid) {
            userNameField.focus();
        }
        else if (!passwordIsValid) {
            passwordField.focus();
        }

        errorPane.style.visibility = "visible";

        return false;
    }

    function doLogin(evt) {
        EventHelper.cancel(evt);
        if (validateForm(evt)) {
            disableForm(true);
            loginUser();
        }
    }

    function loginUser() {
        var email = userNameField.value;
        var password = passwordField.value;
        var setCookie = rememberme.checked;
        queryHelper.requestUserData({
            action: "login",
            email: email,
            password: password,
            setCookie: setCookie ? 1 : 0
        }, loginUserCallback);
    }

    function loginUserCallback(payload) {
        if (payload.result === true) {
            document.location = "index.php";
        } else {
            disableForm(false);
            errorPane.innerHTML = "Введены неверные e-mail и/или пароль.";
            errorPane.style.visibility = "visible";

            userNameField.value = passwordField.value = "";
            userNameField.focus();
        }
    }

    function init() {
        initData();
        userNameField.focus();
        btnLogin.onclick = doLogin;
    }

    init();

};
