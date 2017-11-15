<?php

include_once("siteConfig.php");
include_once("requester.php");

// check whether has valid user cookie
function checkUser() {

    global $userSessionVarName;

    // already has logged-in user
    if (isset($_SESSION[$userSessionVarName]))
        return true;

    // don't have user cookie at all
    if (!isset($_COOKIE['username'])) {
        return false;
    }

    $userCookie = $_COOKIE['username'];
    $requester = new Requester;

    return $requester->validateCookie($userCookie);
}

?>