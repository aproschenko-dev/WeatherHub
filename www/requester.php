<?php

if (!isset($_SESSION))
    session_start();

include_once("dbconfig.php");
include_once("emailConfig.php");
include_once("lib/password.php");

require 'lib/PHPMailer/PHPMailerAutoload.php';

class Requester
{
    ////////////////////////////////////////////////////////////////////////////////////////
    // private methods
    ////////////////////////////////////////////////////////////////////////////////////////

    public static function h_type2txt($type_id)
    {
        static $types;

        if (!isset($types))
        {
            $types = array();
            $constants = get_defined_constants(true);
            foreach ($constants['mysqli'] as $c => $n) if (preg_match('/^MYSQLI_TYPE_(.*)/', $c, $m)) $types[$n] = $m[1];
        }

        return array_key_exists($type_id, $types)? $types[$type_id] : NULL;
    }

    private function getGUID() {

        if (function_exists('com_create_guid')){
            return com_create_guid();
        }
        else {
            mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45);// "-"
            $uuid = chr(123)// "{"
                .substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12)
                .chr(125);// "}"

            return $uuid;
        }
    }

    private function floatOrNull($value) {
        if (isset($value))
            return (float)$value;

        return null;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // private database utility methods
    ////////////////////////////////////////////////////////////////////////////////////////

    private function getFieldsArray($result) {

        $fieldsArray = array();
        $fieldInfo = mysqli_fetch_fields($result);

        foreach ($fieldInfo as $meta)
        {
            if (!$meta)
            {
            }
            else
            {
                $metaData = array(
                    "name" => $meta->name,
                    "type" => $this->h_type2txt($meta->type)
                );
                array_push($fieldsArray, $metaData);
            }
        }

        return $fieldsArray;
    }

    private function getDataArray($result, $fieldsArray) {

        $dataArray = array();

        while ($line = mysqli_fetch_assoc($result))
        {
            $sensorData = (object)[];
            $i = 0;

            foreach ($line as $col_value)
            {
                $columnName = $fieldsArray[$i]["name"];
                $columnType = $fieldsArray[$i]["type"];

                if ($col_value == null)
                {
                    $sensorData->$columnName = null;
                }
                else {
                    if ($columnType == "VAR_STRING" || $columnType == "BLOB")
                        $sensorData->$columnName = $col_value;
                    if ($columnType == "FLOAT")
                        $sensorData->$columnName = (float)$col_value;
                    if ($columnType == "LONG" || $columnType == "BIT")
                        $sensorData->$columnName = (int)$col_value;
                    if ($columnType == "TIMESTAMP")
                        $sensorData->$columnName = $col_value;
                }

                $i++;
            }
            array_push($dataArray, $sensorData);
        }

        return $dataArray;
    }

    private function getDatabaseLink() {

        global $databaseHost;
        global $databaseName;
        global $databaseLogin;
        global $databasePassword;

        $link = mysqli_connect($databaseHost, $databaseLogin, $databasePassword, $databaseName);
        if (mysqli_connect_errno() != 0)
        {
            die("Could not connect: " . mysqli_connect_error());
        }

        mysqli_query($link, "SET CHARACTER SET 'utf8'");
        mysqli_query($link, "SET character_set_client = 'utf8'");
        mysqli_query($link, "SET character_set_results = 'utf8'");
        mysqli_query($link, "SET collation_connection = 'utf8_general_ci'");
        mysqli_query($link, "SET NAMES utf8");

        return $link;
    }

    private function closeDatabaseLink($link) {
        mysqli_close($link);
    }

    private function isDataExists($link, $query) {

        $result = mysqli_query($link, $query);
        $exists = false;

        while ($line = mysqli_fetch_assoc($result))
        {
            $count = $line["Total"];
            $exists = ($count == 1);
        }

        mysqli_free_result($result);

        return $exists;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // private auth methods
    ////////////////////////////////////////////////////////////////////////////////////////

    private function createSessionUser($userId, $userName, $verificationCode, $email, $isActive) {
        $sessionData = (object)[];
        $sessionData->userName = $userName;
        $sessionData->userEmail = $email;
        $sessionData->verificationCode = $verificationCode;
        $sessionData->isActive = $isActive;
        $sessionData->userId = $userId;
        return $sessionData;
    }

    private function sendEmail($to, $subject, $text) {

        global $emailLogin;
        global $emailPassword;
        global $emailServer;
        global $emailFrom;

        $mail = new PHPMailer;

        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->Host = $emailServer;                           // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = $emailLogin;                        // SMTP username
        $mail->Password = $emailPassword;                     // SMTP password
        $mail->Port = 25;                                     // TCP port to connect to

        $mail->setFrom($emailFrom, 'Домашняя метеостанция');
        $mail->addAddress($to, $to);                          // Add a recipient

        $mail->isHTML(true);                                  // Set email format to HTML

        $mail->Subject = $subject;
        $mail->Body    = $text;
        $mail->CharSet = 'utf-8';

        if(!$mail->send()) {
            return false;
        } else {
            return true;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // public methods
    ////////////////////////////////////////////////////////////////////////////////////////

    public function updateData($query) {

        $link = $this->getDatabaseLink();
        mysqli_query($link, $query);
        $this->closeDatabaseLink($link);
    }

    // update active sensors list for the selected module
    public function updateModuleSensorData($moduleMac) {

        $link = $this->getDatabaseLink();

        $query = "SELECT ID, SensorName FROM WeatherSensor";
        $result = mysqli_query($link, $query);

        // insert data for all selected sensors
        while ($line = mysqli_fetch_assoc($result))
        {
            $sensorId = $line["ID"];
            $sensorName = $line["SensorName"];

            $isSensorActive = 0;
            if (isset($_REQUEST[$sensorName])) {
                $isSensorActive = (int)$_REQUEST[$sensorName];
            }

            $sensorClause = "SELECT COUNT(*) as Total FROM ModuleSensor WHERE SensorID = $sensorId AND ModuleID = (SELECT ModuleID FROM WeatherModule WHERE MAC = '$moduleMac')";
            $sensorExists = $this->isDataExists($link, $sensorClause);

            if ($sensorExists) {
                $updateModuleSensorQuery = "UPDATE ModuleSensor SET IsActive = $isSensorActive WHERE ModuleID = (SELECT ModuleID FROM WeatherModule WHERE MAC = '$moduleMac') AND SensorID = $sensorId";
                mysqli_query($link, $updateModuleSensorQuery);
            } else {
                $insertModuleSensorQuery = "INSERT INTO ModuleSensor SET ModuleID = (SELECT ModuleID FROM WeatherModule WHERE MAC = '$moduleMac'), SensorID = $sensorId, IsActive = $isSensorActive";
                mysqli_query($link, $insertModuleSensorQuery);
            }
        }

        mysqli_free_result($result);
        $this->closeDatabaseLink($link);
    }

    // update or insert new SensorData record with given information
    public function updateSensorData($userId, $sensorId, $chartVisibility, $tableVisibility) {

        $link = $this->getDatabaseLink();

        $sensorClause = "SELECT COUNT(*) as Total FROM SensorData WHERE UserID = $userId AND SensorID = $sensorId";
        $sensorExists = $this->isDataExists($link, $sensorClause);

        if ($sensorExists) {

            $updateSensorQuery = "";
            if (!isset($chartVisibility)) {
                $updateSensorQuery = "UPDATE SensorData SET TableVisibility = $tableVisibility WHERE UserID = $userId AND SensorID = $sensorId";
            }
            if (!isset($tableVisibility)) {
                $updateSensorQuery = "UPDATE SensorData SET ChartVisibility = $chartVisibility WHERE UserID = $userId AND SensorID = $sensorId";
            }

            mysqli_query($link, $updateSensorQuery);

        } else {

            if (!isset($chartVisibility)) {
                $chartVisibility = "NULL";
            }
            if (!isset($tableVisibility)) {
                $tableVisibility = "NULL";
            }

            $insertSensorQuery = "INSERT INTO SensorData (UserID, SensorID, ChartVisibility, TableVisibility) VALUES ($userId, $sensorId, $chartVisibility, $tableVisibility)";
            mysqli_query($link, $insertSensorQuery);

        }

        $this->closeDatabaseLink($link);
    }

    private function getModuleSensorsData($moduleId) {

        $link = $this->getDatabaseLink();

        $query = "SELECT ID, SensorID, IsActive, Description FROM ModuleSensor WHERE ModuleID = $moduleId";
        $result = mysqli_query($link, $query);

        $moduleSensors = array();
        while ($line = mysqli_fetch_assoc($result))
        {
            $sensorId = $line["SensorID"];
            $isActive = $line["IsActive"];
            $description = $line["Description"];

            $moduleSensor = (object) [];
            $moduleSensor->sensorId = (int)$sensorId;
            $moduleSensor->description = $description;
            $moduleSensor->isActive = (int)$isActive;

            array_push($moduleSensors, $moduleSensor);
        }

        mysqli_free_result($result);
        $this->closeDatabaseLink($link);

        return $moduleSensors;
    }

    public function getData($query, $appendFieldsMetadata = false) {

        $link = $this->getDatabaseLink();

        $result = mysqli_query($link, $query);

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);

        $allData = (object) [];
        $allData->data = $dataArray;
        if ($appendFieldsMetadata) {
            $allData->fields = $fieldsArray;
        }

        mysqli_free_result($result);
        $this->closeDatabaseLink($link);

        return $allData;
    }

    private function getRecentModuleWeather($moduleMac) {

        $link = $this->getDatabaseLink();

        $query = "SELECT * FROM WeatherData WHERE ModuleMAC = '$moduleMac' ORDER BY ID DESC LIMIT 1";
        $result = mysqli_query($link, $query);

        $moduleWeather = (object) [];

        $line = mysqli_fetch_assoc($result);
        $moduleWeather->ID = $line["ID"];
        $moduleWeather->Temperature1 = $this->floatOrNull($line["Temperature1"]);
        $moduleWeather->Temperature2 = $this->floatOrNull($line["Temperature2"]);
        $moduleWeather->Temperature3 = $this->floatOrNull($line["Temperature3"]);
        $moduleWeather->Temperature4 = $this->floatOrNull($line["Temperature4"]);
        $moduleWeather->Humidity1 = $this->floatOrNull($line["Humidity1"]);
        $moduleWeather->Humidity2 = $this->floatOrNull($line["Humidity2"]);
        $moduleWeather->Humidity3 = $this->floatOrNull($line["Humidity3"]);
        $moduleWeather->Humidity4 = $this->floatOrNull($line["Humidity4"]);
        $moduleWeather->Pressure1 = $this->floatOrNull($line["Pressure1"]);
        $moduleWeather->Pressure2 = $this->floatOrNull($line["Pressure2"]);
        $moduleWeather->Pressure3 = $this->floatOrNull($line["Pressure3"]);
        $moduleWeather->Pressure4 = $this->floatOrNull($line["Pressure4"]);
        $moduleWeather->Illumination = $this->floatOrNull($line["Illumination"]);
        $moduleWeather->CO2 = $this->floatOrNull($line["CO2"]);

        mysqli_free_result($result);
        $this->closeDatabaseLink($link);

        return $moduleWeather;
    }

    public function addWeatherData($weatherData) {

        $link = $this->getDatabaseLink();

        $mac = $weatherData->mac;

        $temperature1 = $weatherData->temperature1;
        $temperature2 = $weatherData->temperature2;
        $temperature3 = $weatherData->temperature3;
        $temperature4 = $weatherData->temperature4;

        $humidity1 = $weatherData->humidity1;
        $humidity2 = $weatherData->humidity2;
        $humidity3 = $weatherData->humidity3;
        $humidity4 = $weatherData->humidity4;

        $pressure1 = $weatherData->pressure1;
        $pressure2 = $weatherData->pressure2;
        $pressure3 = $weatherData->pressure3;
        $pressure4 = $weatherData->pressure4;

        $illumination = $weatherData->illumination;
        $co2level = $weatherData->co2;

        $weatherClause =
            "INSERT INTO WeatherData ".
            "(ModuleMAC, Temperature1, Temperature2, Temperature3, Temperature4, Humidity1, Humidity2, Humidity3, Humidity4, Pressure1, Pressure2, Pressure3, Pressure4, Illumination, CO2) ".
            "VALUES ".
            "('$mac', $temperature1, $temperature2, $temperature3, $temperature4, $humidity1, $humidity2, $humidity3, $humidity4, $pressure1, $pressure2, $pressure3, $pressure4, $illumination, $co2level)";
        mysqli_query($link, $weatherClause);
        $id = mysqli_insert_id($link);

        $this->closeDatabaseLink($link);

        return $id;
    }

    public function updateModuleData($moduleData) {

        $link = $this->getDatabaseLink();

        $mac = $moduleData->mac;
        $ip = $moduleData->ip;
        $moduleName = $moduleData->moduleName;
        $moduleId = $moduleData->moduleId;
        $code = $moduleData->code;
        $delay = $moduleData->delay;
        $isAqara = $moduleData->isAqara;

        $moduleClause = "SELECT COUNT(*) as Total FROM WeatherModule where MAC = '$mac'";
        $moduleExists = $this->isDataExists($link, $moduleClause);

        if ($moduleExists) {
            $moduleUpdateClause = "UPDATE WeatherModule SET IP = '$ip', ModuleName = '$moduleName', ModuleID = $moduleId, IsAqara = $isAqara, ValidationCode = '$code', SensorDelay = $delay, LastSeenDateTime = CURRENT_TIMESTAMP WHERE MAC = '$mac'";
            mysqli_query($link, $moduleUpdateClause);
        } else {
            $moduleInsertClause = "INSERT INTO WeatherModule (ModuleID, ModuleName, IP, MAC, SensorDelay, ValidationCode, IsAqara) VALUES ($moduleId, '$moduleName', '$ip', '$mac', $delay, '$code', $isAqara)";
            mysqli_query($link, $moduleInsertClause);
        }

        $this->closeDatabaseLink($link);
    }

    public function getModulesData($params) {

        $query = "SELECT * FROM WeatherModule $params->whereClause $params->sortClause";
        $modulesData = $this->getData($query);

        if ($params->getModuleSensors) {

            $moduleSensorsData = array();
            for ($i = 0; $i < count($modulesData->data); $i++) {

                $data = $modulesData->data[$i];
                $moduleId = $data->ModuleID;
                $isActive = $data->IsActive;

                if ($isActive) {
                    $moduleSensorProxy = (object)[];
                    $moduleSensorProxy->sensors = $this->getModuleSensorsData($moduleId);
                    $moduleSensorProxy->moduleId = $moduleId;

                    array_push($moduleSensorsData, $moduleSensorProxy);
                }
            }
            $modulesData->moduleSensors = $moduleSensorsData;
        }

        if ($params->getModuleWeather) {

            $moduleWeatherData = array();
            for ($i = 0; $i < count($modulesData->data); $i++) {

                $data = $modulesData->data[$i];
                $moduleMac = $data->MAC;
                $moduleId = $data->ModuleID;
                $isActive = $data->IsActive;

                if ($isActive) {
                    $moduleWeatherProxy = (object)[];
                    $moduleWeatherProxy->weather = $this->getRecentModuleWeather($moduleMac);
                    $moduleWeatherProxy->moduleId = $moduleId;

                    array_push($moduleWeatherData, $moduleWeatherProxy);
                }
            }
            $modulesData->moduleWeather = $moduleWeatherData;

        }

        $modulesData->ServerDateTime = date("Y-m-d G:i:s");

        return $modulesData;
    }

    public function getWeatherData($params) {

        global $publicServer;
        global $userSessionVarName;

        $link = $this->getDatabaseLink();

        $macByUserFilter = "1 = 1";
        $whereClause = "1 = 1";
        if ($publicServer) {
            $verificationCode = $_SESSION[$userSessionVarName]->verificationCode;
            $macByUserFilter = "ValidationCode = '$verificationCode'";
            $whereClause = "wm.ValidationCode = '$verificationCode'";
        }

        $macByPageFilter = "";
        if ($params->fromDataPage == 1) {
            $macByPageFilter = "TableVisibility = 1";
        }
        if ($params->fromChartsPage == 1) {
            $macByPageFilter = "ChartVisibility = 1";
        }

        $macClause = "SELECT GROUP_CONCAT(MAC separator ',') as MACS FROM WeatherModule WHERE $macByPageFilter AND $macByUserFilter AND IsActive = 1";
        $macResult = mysqli_query($link, $macClause);
        $macLine = mysqli_fetch_assoc($macResult);
        $allMacs = $macLine["MACS"];
        mysqli_free_result($macResult);

        $macFilter = "LOCATE(wd.ModuleMAC, '$allMacs') > 0";

        if ($params->queryType == "all") {
            // called from Data page
            $rowsToSkip = $params->pageIndex * $params->pageSize;
            $query = "SELECT SQL_CALC_FOUND_ROWS wd.ID, wd.ModuleMAC,".
                     " wd.Temperature1, wd.Temperature2, wd.Temperature3, wd.Temperature4,".
                     " wd.Humidity1, wd.Humidity2, wd.Humidity3, wd.Humidity4,".
                     " wd.Pressure1, wd.Pressure2, wd.Pressure3, wd.Pressure4,".
                     " wd.Illumination, wd.CO2, wd.MeasuredDateTime".
                     " FROM WeatherData wd".
                     " WHERE $macFilter ORDER BY $params->sortBy $params->sortAscending LIMIT $rowsToSkip, $params->pageSize";
        } else {
            // called from Charts page
            $query = "SELECT wd.* FROM WeatherData wd JOIN WeatherModule wm ON wm.MAC = wd.ModuleMAC WHERE DATE_SUB(NOW(), INTERVAL $params->interval) < MeasuredDateTime AND $macFilter AND $whereClause";
        }

        $result = mysqli_query($link, $query);

        $queryRowsCount = "SELECT FOUND_ROWS()";
        $resultRowsCount = mysqli_query($link, $queryRowsCount);

        $fieldsArray = $this->getFieldsArray($result);
        $dataArray = $this->getDataArray($result, $fieldsArray);
        mysqli_free_result($result);

        $rowsCount = 0;
        while ($line = mysqli_fetch_assoc($resultRowsCount))
        {
            foreach ($line as $col_value)
            {
                $rowsCount = $col_value;
                break;
            }
        }
        mysqli_free_result($resultRowsCount);

        $allData = array(
            "data" => $dataArray,
            "sortBy" => $params->sortBy,
            "sortAscending" => $params->sortAscending == "ASC",
            "pageIndex" => $params->pageIndex,
            "pageSize" => $params->pageSize,
            "rowsCount" => (int)$rowsCount,
            "query" => $query
        );

        $this->closeDatabaseLink($link);

        return $allData;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // user methods
    ////////////////////////////////////////////////////////////////////////////////////////

    public function checkUser($email) {

        $link = $this->getDatabaseLink();

        $email = trim($email);
        $query = "SELECT ID FROM WeatherUser WHERE LOWER(Email) = LOWER('$email')";

        $result = mysqli_query($link, $query);
        $count = mysqli_num_rows($result);

        mysqli_free_result($result);
        $this->closeDatabaseLink($link);

        return $count;
    }

    public function registerUser($email, $password) {

        $link = $this->getDatabaseLink();

        $email = trim($email);
        $password = password_hash(trim($password), PASSWORD_DEFAULT);
        $code = substr(str_replace("-", "", trim($this->getGUID(), "{}")), 0, 16);

        $query = "INSERT INTO WeatherUser (UserName, Email, Password, VerificationCode) VALUES (LOWER('$email'), LOWER('$email'), '$password', UPPER('$code'))";
        mysqli_query($link, $query);

        $id = mysqli_insert_id($link);
        $this->closeDatabaseLink($link);

        $this->sendEmail($email, "Регистрация на сайте Домашней метеостанции",
            "Для окончания регистрации введите код валидации<br/><b>$code</b><br/>в личном кабинете пользователя в течение трёх дней.");

        return $id;
    }

    public function loginUser($email, $password, $setCookie) {

        global $userSessionVarName;

        $link = $this->getDatabaseLink();

        $email = trim($email);
        $password = trim($password);

        $query = "SELECT ID, Password, UserName, VerificationCode, Email, IsActive FROM WeatherUser WHERE LOWER('$email') = LOWER(Email)";
        $result = mysqli_query($link, $query);

        $line = mysqli_fetch_assoc($result);
        $databasePassword = $line["Password"];
        $databaseUserName = $line["UserName"];
        $verificationCode = $line["VerificationCode"];
        $databaseEmail = $line["Email"];
        $databaseIsActive = $line["IsActive"];
        $databaseUserId = $line["ID"];

        $result = password_verify($password, $databasePassword);

        if ($result) {

            $query = "UPDATE WeatherUser SET LastLoginDateTime = CURRENT_TIMESTAMP WHERE LOWER('$email') = LOWER(Email)";
            mysqli_query($link, $query);

            $_SESSION[$userSessionVarName] = $this->createSessionUser($databaseUserId, $databaseUserName, $verificationCode, $databaseEmail, $databaseIsActive);

            if ($setCookie == 1) {
                $ip = $_SERVER['REMOTE_ADDR'];
                $cookieValue = $databaseUserName . $ip;
                $cookieHash = password_hash(trim($cookieValue), PASSWORD_DEFAULT);
                setcookie("username", $cookieHash, strtotime('+1 year'));
            }
        }

        $this->closeDatabaseLink($link);

        return $result;
    }

    public function validateUser($code) {

        global $userSessionVarName;

        $link = $this->getDatabaseLink();

        $query = "UPDATE WeatherUser SET IsActive = 1, VerifiedDateTime = CURRENT_TIMESTAMP WHERE VerificationCode = '$code'";
        mysqli_query($link, $query);

        $query = "SELECT IsActive from WeatherUser WHERE UserName = '" . $_SESSION[$userSessionVarName]->userName . "'";
        $result = mysqli_query($link, $query);

        while ($line = mysqli_fetch_assoc($result))
        {
            $databaseIsActive = $line["IsActive"];
            $_SESSION[$userSessionVarName]->isActive = $databaseIsActive;
        }

        $this->closeDatabaseLink($link);
    }

    public function validateCookie($cookieHash) {

        global $userSessionVarName;

        $validationResult = false;
        $ip = $_SERVER['REMOTE_ADDR'];

        $link = $this->getDatabaseLink();

        $query = "SELECT ID, UserName, VerificationCode, Email, IsActive from WeatherUser";
        $result = mysqli_query($link, $query);

        while ($line = mysqli_fetch_assoc($result))
        {
            $databaseUserName = $line["UserName"];
            $verificationCode = $line["VerificationCode"];
            $databaseEmail = $line["Email"];
            $databaseIsActive = $line["IsActive"];
            $databaseUserId = $line["ID"];

            $cookieValue = $databaseUserName . $ip;

            $verifyResult = password_verify($cookieValue, $cookieHash);
            if ($verifyResult) {
                $_SESSION[$userSessionVarName] = $this->createSessionUser($databaseUserId, $databaseUserName, $verificationCode, $databaseEmail, $databaseIsActive);
                $validationResult = true;
                break;
            } else {
                // clear cookies for security
                if (isset($_COOKIE['username'])) {
                    unset($_COOKIE['username']);
                    setcookie('username', null, -1, '/');
                }
            }
        }

        $this->closeDatabaseLink($link);

        return $validationResult;
    }

}

?>