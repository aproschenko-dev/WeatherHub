<?php
$uri = strtolower($_SERVER["REQUEST_URI"]);
$isIndex = $uri == "/" || strpos($uri, "index.php") !== false;
$isDatas = strpos($uri, "datas.php") !== false;
$isCharts = strpos($uri, "charts.php") !== false;
$isSetup = strpos($uri, "setup.php") !== false;
$isUser = strpos($uri, "user.php") !== false;
?>
<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                <span class="sr-only">Показать меню</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="index.php">Домашняя метеостанция</a>
        </div>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav">
                <li <?php echo($isIndex ? "class='active'" : ""); ?>><a href="index.php"><span class="glyphicon glyphicon-home" aria-hidden="true"></span>&nbsp;&nbsp;Главная</a></li>
                <li <?php echo($isDatas ? "class='active'" : ""); ?>><a href="datas.php"><span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>&nbsp;&nbsp;Данные</a></li>
                <li <?php echo($isCharts ? "class='active'" : ""); ?>><a href="charts.php"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>&nbsp;&nbsp;Графики</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li <?php echo($isSetup ? "class='active'" : ""); ?>><a href="setup.php"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span>&nbsp;&nbsp;Настройки</a></li>
                <?php if ($publicServer) { ?>
                <li <?php echo($isUser ? "class='active dropdown'" : "class='dropdown'"); ?>>
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <span class="glyphicon glyphicon-user" aria-hidden="true"></span>&nbsp;&nbsp;<?php echo $_SESSION[$userSessionVarName]->userName ?>&nbsp;<span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="user.php">Личный кабинет</a></li>
                        <li role="separator" class="divider"></li>
                        <li><a href="logout.php">Выход</a></li>
                    </ul>
                </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</nav>