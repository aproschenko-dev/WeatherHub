<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?datas");
        exit();
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Данные</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/datasController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div class="pageContainer">

    <div class="panel-group">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a data-toggle="collapse" href="#collapse1">Настроить параметры фильтрации &#8595;</a>
                </h4>
            </div>
            <div id="collapse1" class="panel-collapse collapse">
                <div class="panel-body">
                    <p>Отображать данные с выбранных модулей:</p>
                    <div id="modulesList"></div>
                    <hr/>
                    <p>Отображать данные с сенсоров:</p>
                    <div id="sensorsList"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="results"></div>
    <div id="pager"></div>

    <div id="jq-dropdown-1" class="jq-dropdown jq-dropdown-tip">
        <ul class="jq-dropdown-menu">
            <li><a class="pageSizeItem">10</a></li>
            <li><a class="pageSizeItem">20</a></li>
            <li><a class="pageSizeItem">40</a></li>
        </ul>
    </div>
</div>

<script type="text/javascript">
    var datasPage;
    $(document).ready(function() {
        datasPage = datasController();
    });
</script>

</body>
</html>