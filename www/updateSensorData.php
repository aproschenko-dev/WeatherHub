<?php

//update Sensor data in database

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

global $publicServer;
global $userSessionVarName;

if ($publicServer) {
    if (!checkUser()) {
        exit();
    }
}

include_once("requester.php");

$userId = 1;
if ($publicServer) {
    $userId = $_SESSION[$userSessionVarName]->userId;
}

$allData = (object) [];

$requester = new Requester;

$sensorId = null;
if (isset($_REQUEST["sensorId"])) {
    $sensorId = (int)$_REQUEST["sensorId"];
}

if (isset($_REQUEST["description"])) {

    // called from Setup page

    $mac = $_REQUEST["mac"];
    $description = $_REQUEST["description"];
    $description = iconv('utf-8', 'windows-1251', $description);

    $requester->updateData("UPDATE ModuleSensor SET Description = '$description' WHERE SensorID = $sensorId AND ModuleID = (SELECT ModuleID FROM WeatherModule WHERE MAC = '$mac')");
    $allData->moduleSensors = $requester->getData("SELECT ID, SensorID, Description FROM ModuleSensor WHERE SensorID = $sensorId AND ModuleID = (SELECT ModuleID FROM WeatherModule WHERE MAC = '$mac')");

} else {

    // called from Data or Charts pages

    $chartVisibility = null;
    $tableVisibility = null;

    if (isset($_REQUEST["chartVisibility"])) {
        $chartVisibility = (int)$_REQUEST["chartVisibility"];
    }

    if (isset($_REQUEST["tableVisibility"])) {
        $tableVisibility = (int)$_REQUEST["tableVisibility"];
    }

    $requester->updateSensorData($userId, $sensorId, $chartVisibility, $tableVisibility);
    $allData->sensorsData = $requester->getData("SELECT SensorID, TableVisibility, ChartVisibility FROM SensorData");

}

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>