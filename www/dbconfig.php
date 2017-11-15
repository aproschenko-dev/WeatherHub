<?php

include_once("siteConfig.php");

$databaseHost = "localhost";
$databaseName = "weatherDatabase";
$databaseLogin = "root";
$databasePassword = "";

if (!$publicServer) {
    $databaseHost = "localhost";
    $databaseName = "weatherDatabase";
    $databaseLogin = "root";
    $databasePassword = "";
}

?>