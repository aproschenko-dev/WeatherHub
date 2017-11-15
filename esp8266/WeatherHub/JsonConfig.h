#ifndef JSONCONFIG_H
#define JSONCONFIG_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "FS.h"

class JsonConfig
{
public:
    bool saveConfig();
    bool loadConfig();
    bool printConfig();

    // numeric value between 1 and 1024 which will identify module
    char module_id[5] = "1";
    // module name
    char module_name[32] = "Module-01";
    // wifi network SSID
    char sta_ssid[32] = "AndroidAP";
    // wifi network password
    char sta_pwd[32] = "qwertyui";

    // 0 - using static IP mode, 1 - dynamic IP mode
    char static_ip_mode[2] = "0";
    // statis IP to set
    char static_ip[16] = "192.168.1.200";
    // gateway to use
    char static_gateway[16] = "192.168.1.1";
    // subnet mask to use
    char static_subnet[16] = "255.255.255.0";

    // delay to retrieve data from sensors in seconds, max - 999 seconds
    char get_data_delay[5] = "10";
    // delays in seconds before rebooting module, max - 999 seconds
    char reboot_delay[5] = "10";

    // address to push module data
    char add_data_url[200] = "http://weatherhub.ru/add.php";
    // validation code used to identify user's module - 16 alpha-digits
    char validation_code[17] = "0000000000000000";

private:
};

#endif
