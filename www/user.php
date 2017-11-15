<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?user");
        exit();
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Личный кабинет</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/userController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div class="pageContainer userPageContainer" id="pageContainer">
    <div class="is-responsive">
        <div class="col-sm-12 col-md-12">
            <form>
                <div class="form-group row">
                    <label class="col-sm-3 form-control-label">Email:</label>
                    <div class="col-sm-6">
                        <p class="form-control-static"><?php echo $_SESSION[$userSessionVarName]->userEmail ?></p>
                    </div>
                </div>
                <?php if ($_SESSION[$userSessionVarName]->isActive == 1) { ?>
                <div class="form-group row">
                    <label class="col-sm-3 form-control-label">Код валидации:</label>
                    <div class="col-sm-6">
                        <p class="form-control-static"><?php echo $_SESSION[$userSessionVarName]->verificationCode ?></p>
                    </div>
                </div>
                <?php } else { ?>
                <div id="validationTextRow" class="form-group row" style="display: none;">
                    <label class="col-sm-3 form-control-label">Код валидации:</label>
                    <div class="col-sm-6">
                        <p class="form-control-static"><?php echo $_SESSION[$userSessionVarName]->verificationCode ?></p>
                    </div>
                </div>
                <div id="validationInputRow" class="form-group row">
                    <label for="validationCode" class="col-sm-3 form-control-label">Код валидации:</label>
                    <div class="col-sm-6">
                        <input type="text" maxlength="16" class="form-control" id="validationCode" placeholder="Код валидации" value="" />
                    </div>
                    <div class="col-sm-2">
                        <button id="btnValidate" class="btn btn-success">Проверить</button>
                    </div>
                </div>
                <div id="validationCodePane" class="bs-callout bs-callout-info" style="display: none;">
                    <p>
                        Код валидации введен верно.
                    </p>
                </div>
                <?php } ?>
                <div class="bs-callout bs-callout-warning">
                    <h4>Что такое код валидации?</h4>
                    <p>
                        Код валидации - это 16 цифр или букв, сгенерированных автоматически при создании пользователя.<br/>
                        Он используется для того, чтобы сайт знал о валидности введенного при регистрации пользователем email.<br/>
                        Также код используется для привязки модулей пользователя к его логину на сайте - для этого код валидации из письма следует указать в соответствующем поле на
                        странице Setup каждого подключаемого модуля на странице <a href="setup.php">Настройки</a>. Пока это не сделано - увидеть данные с модуля в Домашней метеостанции будет нельзя.<br/>
                        Никому не сообщайте свой код, если не хотите, чтобы данные с ваших модулей увидел кто-то еще.
                    </p>
                </div>
                <hr/>
                <div class="form-group row">
                    <div class="col-sm-offset-3 col-sm-6">
                        <button id="btnSave" class="btn btn-primary">Сохранить</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>


<script type="text/javascript">
    var userPage;
    $(document).ready(function() {
        userPage = userController();
    });
</script>

</body>
</html>