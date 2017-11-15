<?php

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        header("Location: /login.php?setup");
        exit();
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Домашняя метеостанция - Настройки</title>
    <?php include_once("include/header.php"); ?>
    <script src="scripts/setupController.js" type="text/javascript"></script>
</head>
<body>

<?php include_once("include/menu.php"); ?>

<div id="editModuleModal" class="modal fade" role="dialog">
    <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="moduleModalTitle">Modal Header</h4>
            </div>
            <div class="modal-body">
                <div class="form-group row">
                    <label for="inputDescription" class="col-sm-2 form-control-label">Описание:</label>
                    <div class="col-sm-10">
                        <input class="form-control" id="inputDescription" placeholder="Описание модуля" />
                    </div>
                </div>
                <div class="row">
                    <label class="col-sm-2">&nbsp;</label>
                    <div class="col-sm-10">
                        <div class="checkbox checkbox-warning no-top-bottom-margin">
                            <input type="checkbox" id="inputActive" />
                            <label for="inputActive">Модуль активен</label>
                        </div>
                    </div>
                </div>
                <hr/>
                <div class="form-group row">
                    <div class="col-sm-10 col-sm-offset-2">
                        Список активных сенсоров:
                    </div>
                </div>
                <div id="sensorsList">
                    <div class="row">
                        <label class="col-sm-2">&nbsp;</label>
                        <div class="col-sm-10">
                            <div class="checkbox checkbox-warning no-top-bottom-margin">
                                <input type="checkbox" id="inputAll" />
                                <label for="inputAll">Выбрать все</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="btnSaveModule">Сохранить</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>
            </div>
        </div>
    </div>
    <input id="inputMAC" type="hidden" />
</div>

<div class="pageContainer" id="pageContainer"></div>
<p class="jumboMessage" id="jumboMessage">Здесь будут отображаться карточки модулей, подключенных к Домашней метеостанции.</p>

<script type="text/javascript">
    var setupPage;
    $(document).ready(function() {
        setupPage = setupController();
    });
</script>

</body>
</html>