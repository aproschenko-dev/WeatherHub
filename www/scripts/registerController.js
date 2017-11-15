
var registerController = function(params) {

    var userNameField = null;
    var passwordField = null;
    var btnRegister = null;
    var errorPane = null;

    function initData() {
        userNameField = ge("username");
        passwordField = ge("password");
        btnRegister = ge("btnRegister");
        errorPane = ge("errorPane");
    }

    function disableForm(disable) {
        userNameField.disabled = passwordField.disabled = btnRegister.disabled = disable;
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
        if (password.length < 6) {
            errors.push("Введите пароль (минимум 6 символов)");
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

    function registerUser() {
        var email = userNameField.value;
        var password = passwordField.value;
        queryHelper.requestUserData({ action: "register", email: email, password: password }, registerUserCallback);
    }

    function registerUserCallback(payload) {
        errorPane.style.visibility = "visible";

        if (payload.result === true) {
            errorPane.innerHTML = "На указанный e-mail отправлен проверочный код. Введите его в личном кабинете пользователя в течение трёх дней для окончания регистрации. Для продолжения работы перейдите на страницу <b><a href='/login.php'>входа</a></b>.";
        } else {
            disableForm(false);
            if (payload.alreadyRegistered) {
                errorPane.innerHTML = "Пользователь с указанным e-mail уже зарегистрирован. Введите другой e-mail.";
                userNameField.value = passwordField.value = "";
                userNameField.focus();
            }
        }
    }

    function doRegister(evt) {
        EventHelper.cancel(evt);
        if (validateForm(evt)) {
            disableForm(true);
            registerUser();
        }
    }

    function init() {
        initData();
        userNameField.focus();
        btnRegister.onclick = doRegister;
    }

    init();

};
