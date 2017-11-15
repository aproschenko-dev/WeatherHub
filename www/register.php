<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if (!$publicServer || checkUser()) {
    header("Location: index.php");
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Регистрация</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/registerController.js" type="text/javascript"></script>
    <script>
        delete_cookie("username");
    </script>
</head>
<body>

<div class="container">
    <div class="row">
        <div class="absolute-center is-responsive">
            <div class="col-sm-12 col-md-12">
                <form method="post" id="loginForm">
                    <div class="form-group text-center">
                        <img src="images/home-icon.png" height="128" width="128" />
                    </div>
                    <div class="form-group text-center">
                        <p class="jumboLoginMessage">Домашняя метеостанция</p>
                    </div>
                    <div class="form-group input-group">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                        <input class="form-control" type="text" id="username" name='username' placeholder="e-mail"/>
                    </div>
                    <div class="form-group input-group">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                        <input class="form-control" type="password" id="password" name='password' placeholder="пароль"/>
                    </div>
                    <div class="form-group">
                        <button type="submit" id="btnRegister" class="btn btn-primary btn-block">Регистрация</button>
                    </div>
                    <div class="form-group text-center">
                        <a href="login.php">Войти на сайт</a>&nbsp;|&nbsp;<a href="restorePassword.php">Восстановление пароля</a>
                    </div>
                    <div id="errorPane" class="alert alert-info" role="alert" style="visibility: hidden;"></div>
                </form>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    var registerPage;
    $(document).ready(function() {
        registerPage = registerController();
    });
</script>

</body>
</html>