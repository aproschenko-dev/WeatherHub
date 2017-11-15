#include "WebServer.h"
#include "Common.h"

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML lines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const char stylesInclude[] PROGMEM = "<link rel='stylesheet' type='text/css' href='/styles.css' />";

const char mainMenu[] PROGMEM = "<div class='header'><ul>\
<li><a href='/'>Home</a></li>\
<li><a href='/setup'>Setup</a></li>\
<li><a class='reboot' href='/reboot?reboot_delay=%d'>Reboot</a></li>\
</ul></div>";

const char stylesBootstrap[] PROGMEM =
"a {text-decoration: none;}\
hr {margin-top: 20px; margin-bottom: 20px; border: 0; border-top: 1px solid #eee;}\
.input-group {position: relative; display: table; border-collapse: separate; margin: 10px;}\
.input-group-addon:first-child {border-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;}\
.input-group .form-control:last-child {border-top-left-radius: 0; border-bottom-left-radius: 0;}\
.input-group-addon {padding: 6px 12px; font-size: 14px; font-weight: 400; line-height: 1; color: #555; text-align: center; background-color: #eee; border: 1px solid #ccc; border-radius: 4px;}\
.input-group-addon {width: 200px; white-space: nowrap; vertical-align: middle;}\
.input-group .form-control, .input-group-addon {display: table-cell;}\
.input-group .form-control {position: relative; z-index: 2; float: left; width: 200px; margin-bottom: 0;}\
.form-control {display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; color: #555; background-color: #fff;\
background-image: none; border: 1px solid #ccc; border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\
box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075); -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;\
-o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s; transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;}\
.form-control:focus {border-color: #66afe9; outline: 0; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\
box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);}\
.marginTop0 { margin-top: 0 !important;}\
.btn { display: inline-block; padding: 6px 12px; margin: 20px; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center;\
white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer;\
-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; border-radius: 4px;}\
.btn-default { color: #333; background-color: #fff; border-color: #ccc;}\
.btn-default {text-shadow: 0 -1px 0 rgba(0,0,0,.2); -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.15),0 1px 1px rgba(0,0,0,.075);\
box-shadow: inset 0 1px 0 rgba(255,255,255,.15),0 1px 1px rgba(0,0,0,.075);}\
.btn-default {text-shadow: 0 1px 0 #fff; background-image: -webkit-linear-gradient(top,#fff 0,#e0e0e0 100%);\
background-image: -o-linear-gradient(top,#fff 0,#e0e0e0 100%); background-image: -webkit-gradient(linear,left top,left bottom,from(#fff),to(#e0e0e0));\
background-image: linear-gradient(to bottom,#fff 0,#e0e0e0 100%); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe0e0e0', GradientType=0);\
background-repeat: repeat-x; border-color: #dbdbdb; }\
";

const char stylesBootstrapAlerts[] PROGMEM = "\
.alert {padding: 15px; margin-bottom: 20px; margin-top: 20px; border: 1px solid transparent; border-radius: 4px; }\
.alert-danger {color: #a94442; background-color: #f2dede; border-color: #ebccd1; }\
.alert-info { color: #31708f; background-color: #d9edf7; border-color: #bce8f1; }\
.alert {text-shadow: 0 1px 0 rgba(255,255,255,.2); -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 2px rgba(0,0,0,.05); box-shadow: inset 0 1px 0 rgba(255,255,255,.25),0 1px 2px rgba(0,0,0,.05); }\
.alert-danger {background-image: -webkit-linear-gradient(top,#f2dede 0,#e7c3c3 100%); background-image: -o-linear-gradient(top,#f2dede 0,#e7c3c3 100%);\
background-image: -webkit-gradient(linear,left top,left bottom,from(#f2dede),to(#e7c3c3)); background-image: linear-gradient(to bottom,#f2dede 0,#e7c3c3 100%);\
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff2dede', endColorstr='#ffe7c3c3', GradientType=0); background-repeat: repeat-x; border-color: #dca7a7; }\
.alert-info { background-image: -webkit-linear-gradient(top,#d9edf7 0,#b9def0 100%); background-image: -o-linear-gradient(top,#d9edf7 0,#b9def0 100%);\
background-image: -webkit-gradient(linear,left top,left bottom,from(#d9edf7),to(#b9def0)); background-image: linear-gradient(to bottom,#d9edf7 0,#b9def0 100%);\
filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffd9edf7', endColorstr='#ffb9def0', GradientType=0); background-repeat: repeat-x; border-color: #9acfea; }\
";

const char styles[] PROGMEM =
"body {font-family: tahoma; font-size: 14px;}\
.header {height: 30px; width: 100%; border-bottom: 1px solid #ddd;}\
.header ul {list-style: none; padding: 0;}\
.header ul li {float: left;}\
.header ul li a {padding: 10px; font-weight: bold; font-size: 16px; text-decoration: none; color: black;}\
.header ul li a:hover {color: #007acc;}\
.reboot {color: red !important;}\
.container {border: 1px solid #ddd; width: 400px; border-radius: 4px;}\
";

const char rebootScripts[] PROGMEM =
"<script type='text/javascript'>\
function \
getUrlVars()\
{\
var vars = [], hash;\
var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');\
for(var i = 0; i < hashes.length; i++)\
{\
hash = hashes[i].split('=');\
vars.push(hash[0]);\
vars[hash[0]] = hash[1];\
}\
return vars;\
}\
window.onload = function() {\
var params = getUrlVars();\
var delay = parseInt(params['reboot_delay'], 10);\
console.log(delay);\
var txt = document.getElementById('info');\
var counter = delay;\
var id = setInterval(function () {\
txt.innerHTML = 'Module will reboot in ' + counter + ' second(s).';\
counter--;\
console.log(counter);\
if (counter < 0) {\
clearInterval(id);\
txt.innerHTML = 'Module was rebooted.';\
console.log('Reboot!');\
}\
}, 1000);\
}\
</script>";

const char scripts[] PROGMEM =
"<script type='text/javascript'>\
function \
setNowDateTime() {\
var today = new Date();\
var dd = today.getDate();\
var mm = today.getMonth() + 1;\
var yyyy = today.getFullYear();\
var h = today.getHours();\
var m = today.getMinutes();\
var s = today.getSeconds();\
document.getElementById('day').value = dd;\
document.getElementById('month').value = mm;\
document.getElementById('year').value = yyyy;\
document.getElementById('hour').value = h;\
document.getElementById('minute').value = m;\
document.getElementById('second').value = s;\
}\
function \
saveFormData(pageToRecall) {\
var data = [];\
var inputs = document.getElementsByTagName('input');\
for (var i = 0; i < inputs.length; i++) {\
var input = inputs[i];\
if (input.type == 'text' || input.type == 'password') {\
data.push({key: input.id, value: input.value});\
}\
}\
console.log(data);\
var url = pageToRecall + '?';\
for (var j = 0; j < data.length; j++) {\
var param = data[j];\
url += param.key + '=' + param.value + '&';\
}\
document.location = url;\
}\
</script>";

const char headEnd[] PROGMEM = "</head>";
const char bodyStart[] PROGMEM = "<body>";
const char bodyEnd[] PROGMEM = "</body></html>";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle requests
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void WebServer::webStyles()
{
    Serial.println("\r\nServer: request STYLES");

    String stylesText = String("") + FPSTR(styles) + FPSTR(stylesBootstrap) + FPSTR(stylesBootstrapAlerts);
    webServer->send(200, "text/css", stylesText);

    Serial.println("Server: request STYLES sent");
}

void WebServer::handleNotFound()
{
    Serial.println("\r\nServer: not found");

    String data =
        renderTitle(config->module_name, "Page not found") + FPSTR(stylesInclude) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config->reboot_delay) +
        renderAlert("danger", String("Page <strong>") + webServer->uri() + "</strong> not found.") +
        FPSTR(bodyEnd);

    webServer->send(404, "text/html", data);
}

void WebServer::webReboot()
{
    Serial.println("\r\nServer: request REBOOT");

    String data =
        renderTitle(config->module_name, "Reboot") + FPSTR(stylesInclude) +
        FPSTR(rebootScripts) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config->reboot_delay) +
        renderAlert("info", String("<strong id='info'>Module will reboot in ") + config->reboot_delay + " second(s).</strong>") +
        FPSTR(bodyEnd);

    webServer->send(200, "text/html", data);

    Serial.println("Server: request REBOOT sent");

    rebootFunction();
}

void WebServer::webSetup()
{
    Serial.println("\r\nServer: request SETUP");

    bool config_changed = false;
    String payload = webServer->arg("module_id");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->module_id, sizeof(config->module_id));
        config_changed = true;
    }
    payload = webServer->arg("module_name");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->module_name, sizeof(config->module_name));
        config_changed = true;
    }
    payload = webServer->arg("sta_ssid");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->sta_ssid, sizeof(config->sta_ssid));
        config_changed = true;
    }
    payload = webServer->arg("sta_pwd");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->sta_pwd, sizeof(config->sta_pwd));
        config_changed = true;
    }
    payload = webServer->arg("add_data_url");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->add_data_url, sizeof(config->add_data_url));
        config_changed = true;
    }
    payload = webServer->arg("validation_code");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->validation_code, sizeof(config->validation_code));
        config_changed = true;
    }

    payload = webServer->arg("static_ip_mode");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->static_ip_mode, sizeof(config->static_ip_mode));
        config_changed = true;
    }
    payload = webServer->arg("static_ip");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->static_ip, sizeof(config->static_ip));
        config_changed = true;
    }
    payload = webServer->arg("static_gateway");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->static_gateway, sizeof(config->static_gateway));
        config_changed = true;
    }
    payload = webServer->arg("static_subnet");
    if (payload.length() > 0)
    {
        payload.toCharArray(config->static_subnet, sizeof(config->static_subnet));
        config_changed = true;
    }

    String data = 
        renderTitle(config->module_name, "Setup") + FPSTR(stylesInclude) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config->reboot_delay) +
        "<h2>Module Setup</h2>" +
        "<div class='container'>" +
        renderParameterRow("Module ID", "module_id", config->module_id, 4) + 
        renderParameterRow("Module Name", "module_name", config->module_name, 32) + 
        "<hr/>" +
        renderParameterRow("SSID", "sta_ssid", config->sta_ssid, 32) + 
        renderParameterRow("Password", "sta_pwd", config->sta_pwd, 32, false, true) + 
        "<hr/>" +
        renderParameterRow("Static IP Mode", "static_ip_mode", config->static_ip_mode, 1) + 
        renderParameterRow("Static IP", "static_ip", config->static_ip, 15) + 
        renderParameterRow("Gateway", "static_gateway", config->static_gateway, 15) + 
        renderParameterRow("Subnet", "static_subnet", config->static_subnet, 15) + 
        "<hr/>" +
        renderParameterRow("Add Data URL", "add_data_url", config->add_data_url, 200) + 
        renderParameterRow("Validation Code", "validation_code", config->validation_code, 16) + 
        "<hr/>" +
        "<a class='btn btn-default marginTop0' role='button' onclick='saveFormData(\"/setup\");'>Save</a>" +
        "</div>" +
        FPSTR(bodyEnd);

    webServer->send(200, "text/html", data);

    if (config_changed)
    {
        config->saveConfig();
    }

    Serial.println("Server: request SETUP sent");
}

void WebServer::webRoot()
{
    Serial.println("\r\nServer: request ROOT");

    String data = 
        renderTitle(config->module_name, "Home") + FPSTR(stylesInclude) + FPSTR(scripts) + FPSTR(headEnd) + FPSTR(bodyStart) + renderMenu(config->reboot_delay) +
        String(F("<h2>Welcome to ")) + config->module_name + String(F("</h2>")) +
        String(F("<div class='container'>")) +
        renderParameterRow("Module ID", "", config->module_id, true) + 
        renderParameterRow("Module Name", "", config->module_name, true) + 
        renderParameterRow("Module IP", "", getIpString(WiFi.localIP()), true) + 
        renderParameterRow("Module MAC", "", getMacString(), true) + 
        String(F("</div>")) +
        FPSTR(bodyEnd);

    webServer->send(200, "text/html", data);    
    Serial.println("Server: request ROOT sent");
}

void WebServer::setup(ESP8266WebServer* webServer, JsonConfig* config, WebServer::TRebootFunction rebootFunction)
{
    Serial.println("Server: starting");

    webServer->on("/", [this](){ webRoot(); });
    webServer->on("/setup", [this](){ webSetup(); });
    webServer->on("/reboot", [this](){ webReboot(); });
    webServer->on("/styles.css", [this](){ webStyles(); });
    webServer->onNotFound([this](){ handleNotFound(); });
    webServer->begin();

    this->webServer = webServer;
    this->config = config;
    this->rebootFunction = rebootFunction;

    Serial.println("Server: started");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Rendering routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

String WebServer::renderParameterRow(String paramName, String paramId, String paramValue, int maxLength, bool isReadonly, bool isPassword)
{
    String readonlyAttr = "readonly='readonly'";
    return String("<div class='input-group'><span class='input-group-addon'>" + paramName + ":</span><input maxlength='" + maxLength + "' type='" + (isPassword ? "password" : "text") + "' id='" + paramId + "' class='form-control' " + (isReadonly ? readonlyAttr : "") + " value='" + (isPassword ? "" : paramValue) + "' /></div>");
}

String WebServer::renderTitle(String moduleName, String pageName)
{
    return String("<html lang='en'><head><title>" + moduleName + " - " + pageName + "</title><meta charset='utf-8'/><meta name='viewport' content='width=device-width, initial-scale=1'/>");
}

String WebServer::renderAlert(String type, String text)
{
    return String("<div class='alert alert-" + type + "' role='alert'>" + text + "</div>");
}

String WebServer::renderStyles(String styles)
{
    return String("<style>" + styles + "</style>");
}

String WebServer::renderMenu(String delay)
{
    String text = FPSTR(mainMenu);
    text.replace("%d", delay);
    return text;
}