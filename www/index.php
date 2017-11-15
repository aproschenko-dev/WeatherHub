<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?index");
        exit();
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Главная</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/indexController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div class="bs-callout bs-callout-warning helpContainer" id="helpContainer">
    <h4>С чего начать?</h4>
    <p>
        На данной странице вы можете посмотреть данные со всех модулей, которые вы добавили в свою Домашнюю метеостанцию. Изначально вы увидете пустые карточки модулей, без данных с сенсоров.<br/>
        Чтобы увидеть данные с сенсоров - следуйте инструкции ниже.<br/>
        На странице <a href="setup.php">Настройки</a> вы можете увидеть все подключенные к системе модули в виде карточек.<br/>
        Для того, чтобы увидеть данные с сенсоров, подключенных к модулям, вам следует выбрать их в диалоговом окне, которое открывается при нажатии на кнопку "Параметры модуля" в списке ативных сенсоров.<br/>
        Отметив активные сенсоры, сохраните конфигурацию модуля, нажав кнопку "Сохранить". После этого на этой странице вы увидите получаемые с сенсоров данные.
    </p>
    <button id="btnHide" class="btn btn-success">Мне всё понятно</button>
</div>

<div class="pageContainer" id="pageContainer"></div>
<p class="jumboMessage" id="jumboMessage">Здесь будут отображаться карточки активных модулей, подключенных к Домашней метеостанции.</p>

<script type="text/javascript">
    var indexPage;
    $(document).ready(function() {
        indexPage = indexController();
    });
</script>

</body>
</html>