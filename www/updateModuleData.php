<?php

//update Module data in database

include_once("siteConfig.php");
include_once("include/common.php");

if (!isset($_SESSION))
    session_start();

if ($publicServer) {
    if (!checkUser()) {
        exit();
    }
}

include_once("requester.php");

$mac = $_REQUEST["mac"];
global $userSessionVarName;

$requester = new Requester;

if (isset($_REQUEST["description"])) {
    $description = $_REQUEST["description"];
    $description = iconv('utf-8', 'windows-1251', $description);
    $requester->updateData("UPDATE WeatherModule SET Description = '$description' WHERE MAC = '$mac'");
}

if (isset($_REQUEST["isActive"])) {
    $isActive = $_REQUEST["isActive"] == "true" ? 1 : 0;
    $requester->updateData("UPDATE WeatherModule SET IsActive = $isActive WHERE MAC = '$mac'");
}

if (isset($_REQUEST["tableVisibility"])) {
    $tableVisibility = (int)$_REQUEST["tableVisibility"];
    $requester->updateData("UPDATE WeatherModule SET TableVisibility = $tableVisibility WHERE MAC = '$mac'");
}

if (isset($_REQUEST["chartVisibility"])) {
    $chartVisibility = (int)$_REQUEST["chartVisibility"];
    $requester->updateData("UPDATE WeatherModule SET ChartVisibility = $chartVisibility WHERE MAC = '$mac'");
}

if (isset($_REQUEST["updateSensors"])) {
    $requester->updateModuleSensorData($mac);
}

$whereClause = "";
if ($publicServer) {
    $whereClause = "WHERE ValidationCode = '" . $_SESSION[$userSessionVarName]->verificationCode . "'";
}

$allData = (object) [];

$params = (object) [];
$params->whereClause = $whereClause;
$params->sortClause = "";
$params->getModuleSensors = (isset($_REQUEST["getModuleSensors"]) ? (int)$_REQUEST["getModuleSensors"] : 0) == 1;
$params->getModuleWeather = (isset($_REQUEST["getModuleWeather"]) ? (int)$_REQUEST["getModuleWeather"] : 0) == 1;

$allData->modules = $requester->getModulesData($params);

print json_encode($allData, JSON_UNESCAPED_UNICODE);

?>