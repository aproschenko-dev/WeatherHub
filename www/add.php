<?php

include_once("dbconfig.php");
include_once("requester.php");

////////////////////////////////////////////////////////////////////////////////////////////

function getParam($object, $name)
{
    if (isset($object[$name]) && !empty($object[$name]))
        return $object[$name];
    return null;
}

function valueOrNull($value)
{
    if ($value == 0)
        return 'null';
    return $value;
}

$id = 0;
$input = file_get_contents('php://input');

if (empty($input)) {
    $data = array(
        'error' => 'Please use JSON to add data.'
    );
    print json_encode($data);
    return;
}

////////////////////////////////////////////////////////////////////////////////////////////

$object = json_decode($input, true);

$moduleId = (int)getParam($object, "moduleid");
$moduleName = getParam($object, "modulename");
$code = getParam($object, "code");

$ip = getParam($object, "ip");
$mac = getParam($object, "mac");
$delay = (int)getParam($object, "delay");

$isAqara = valueOrNull((int)getParam($object, "isaqara"));

$temperature1 = valueOrNull((float)getParam($object, "temperature1"));
$humidity1 = valueOrNull((float)getParam($object, "humidity1"));
$pressure1 = valueOrNull((float)getParam($object, "pressure1"));

$temperature2 = valueOrNull((float)getParam($object, "temperature2"));
$humidity2 = valueOrNull((float)getParam($object, "humidity2"));
$pressure2 = valueOrNull((float)getParam($object, "pressure2"));

$temperature3 = valueOrNull((float)getParam($object, "temperature3"));
$humidity3 = valueOrNull((float)getParam($object, "humidity3"));
$pressure3 = valueOrNull((float)getParam($object, "pressure3"));

$temperature4 = valueOrNull((float)getParam($object, "temperature4"));
$humidity4 = valueOrNull((float)getParam($object, "humidity4"));
$pressure4 = valueOrNull((float)getParam($object, "pressure4"));

$illumination = valueOrNull((float)getParam($object, "illumination"));
$co2level = valueOrNull((float)getParam($object, "co2"));

////////////////////////////////////////////////////////////////////////////////////////////

$weatherData = (object) [];
$weatherData->mac = $mac;
$weatherData->temperature1 = $temperature1;
$weatherData->temperature2 = $temperature2;
$weatherData->temperature3 = $temperature3;
$weatherData->temperature4 = $temperature4;
$weatherData->humidity1 = $humidity1;
$weatherData->humidity2 = $humidity2;
$weatherData->humidity3 = $humidity3;
$weatherData->humidity4 = $humidity4;
$weatherData->pressure1 = $pressure1;
$weatherData->pressure2 = $pressure2;
$weatherData->pressure3 = $pressure3;
$weatherData->pressure4 = $pressure4;
$weatherData->illumination = $illumination;
$weatherData->co2 = $co2level;

////////////////////////////////////////////////////////////////////////////////////////////

$moduleData = (object) [];
$moduleData->mac = $mac;
$moduleData->ip = $ip;
$moduleData->moduleName = $moduleName;
$moduleData->moduleId = $moduleId;
$moduleData->code = $code;
$moduleData->delay = $delay;
$moduleData->isAqara = $isAqara;

////////////////////////////////////////////////////////////////////////////////////////////

$requester = new Requester;
$id = $requester->addWeatherData($weatherData);
$requester->updateModuleData($moduleData);

////////////////////////////////////////////////////////////////////////////////////////////

$data = array(
    'id' => $id,
    'moduleid' => $moduleId,
    'modulename' => $moduleName,
    'temperature1' => $temperature1,
    'temperature2' => $temperature2,
    'temperature3' => $temperature3,
    'temperature4' => $temperature4,
    'humidity1' => $humidity1,
    'humidity2' => $humidity2,
    'humidity3' => $humidity3,
    'humidity4' => $humidity4,
    'pressure1' => $pressure1,
    'pressure2' => $pressure2,
    'pressure3' => $pressure3,
    'pressure4' => $pressure4,
    'illumination' => $illumination,
    'co2' => $co2level,
    'year' => (int)date('Y'),
    'month' => (int)date('m'),
    'day' => (int)date('d'),
    'hour' => (int)date('H'),
    'minute' => (int)date('i'),
    'second' => (int)date('s')
);

print json_encode($data);

?>