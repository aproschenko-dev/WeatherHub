#include "JsonConfig.h"

bool JsonConfig::printConfig()
{
    Serial.println("\r\nConfig: printing");

    Serial.print(F("module_id         : "));   Serial.println(module_id);
    Serial.print(F("module_name       : "));   Serial.println(module_name);
    Serial.print(F("sta_ssid          : "));   Serial.println(sta_ssid);
    Serial.print(F("sta_pwd           : "));   Serial.println(sta_pwd);

    Serial.print(F("static_ip_mode    : "));   Serial.println(static_ip_mode);
    Serial.print(F("static_ip         : "));   Serial.println(static_ip);
    Serial.print(F("static_gateway    : "));   Serial.println(static_gateway);
    Serial.print(F("static_subnet     : "));   Serial.println(static_subnet);

    Serial.print(F("get_data_delay    : "));   Serial.println(get_data_delay);
    Serial.print(F("reboot_delay      : "));   Serial.println(reboot_delay);

    Serial.print(F("add_data_url      : "));   Serial.println(add_data_url);
    Serial.print(F("validation_code   : "));   Serial.println(validation_code);

    Serial.println("\r\nConfig: printed");

    return true;
}

bool JsonConfig::loadConfig()
{
    Serial.println("\r\nConfig: loading");

    File configFile = SPIFFS.open("/config.json", "r");
    if (!configFile)
    {
        Serial.println("Config: failed to open config file for reading");
        return false;
    }

    size_t size = configFile.size();
    if (size > 2048)
    {
        Serial.println("Config: file size is too large");
        SPIFFS.remove("/config.json");
        saveConfig();
        return false;
    }

    // Allocate a buffer to store contents of the file.
    std::unique_ptr<char[]> buf(new char[size]);

    // We don't use String here because ArduinoJson library requires the input
    // buffer to be mutable. If you don't use ArduinoJson, you may as well
    // use configFile.readString instead.
    configFile.readBytes(buf.get(), size);

    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.parseObject(buf.get());

    if (!json.success())
    {
        Serial.println("Failed to parse config file");
        SPIFFS.remove("/config.json");
        saveConfig();
        return false;
    }

    if (json.containsKey("module_id")) { const char* module_id_char = json["module_id"]; sprintf_P(module_id, ("%s"), module_id_char); }
    if (json.containsKey("module_name")) { const char* module_name_char = json["module_name"]; sprintf_P(module_name, ("%s"), module_name_char); }
    if (json.containsKey("sta_ssid")) { const char* sta_ssid_char = json["sta_ssid"]; sprintf_P(sta_ssid, ("%s"), sta_ssid_char); }
    if (json.containsKey("sta_pwd")) { const char* sta_pwd_char = json["sta_pwd"]; sprintf_P(sta_pwd, ("%s"), sta_pwd_char); }

    if (json.containsKey("static_ip_mode")) { const char* static_ip_mode_char = json["static_ip_mode"]; sprintf_P(static_ip_mode, ("%s"), static_ip_mode_char); }
    if (json.containsKey("static_ip")) { const char* static_ip_char = json["static_ip"]; sprintf_P(static_ip, ("%s"), static_ip_char); }
    if (json.containsKey("static_gateway")) { const char* static_gateway_char = json["static_gateway"]; sprintf_P(static_gateway, ("%s"), static_gateway_char); }
    if (json.containsKey("static_subnet")) { const char* static_subnet_char = json["static_subnet"]; sprintf_P(static_subnet, ("%s"), static_subnet_char); }

    if (json.containsKey("get_data_delay")) { const char* get_data_delay_char = json["get_data_delay"]; sprintf_P(get_data_delay, ("%s"), get_data_delay_char); }
    if (json.containsKey("reboot_delay")) { const char* reboot_delay_char = json["reboot_delay"]; sprintf_P(reboot_delay, ("%s"), reboot_delay_char); }

    if (json.containsKey("add_data_url")) { const char* add_data_url_char = json["add_data_url"]; sprintf_P(add_data_url, ("%s"), add_data_url_char); }
    if (json.containsKey("validation_code")) { const char* validation_code_char = json["validation_code"]; sprintf_P(validation_code, ("%s"), validation_code_char); }

    configFile.close();

    Serial.println("Config: loaded");

    return true;
}

bool JsonConfig::saveConfig()
{
    Serial.println("\r\nConfig: saving");

    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile)
    {
        Serial.println("Config: failed to open config file for writing");
        return false;
    }

    json["module_id"] = module_id;
    json["module_name"] = module_name;
    json["sta_ssid"] = sta_ssid;
    json["sta_pwd"] = sta_pwd;

    json["static_ip_mode"] = static_ip_mode;
    json["static_ip"] = static_ip;
    json["static_gateway"] = static_gateway;
    json["static_subnet"] = static_subnet;

    json["get_data_delay"] = get_data_delay;
    json["reboot_delay"] = reboot_delay;

    json["add_data_url"] = add_data_url;
    json["validation_code"] = validation_code;

    json.printTo(configFile);
    configFile.close();

    Serial.println("Config: saved");

    return true;
}

