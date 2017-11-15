#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>

extern "C"
{
    #include "user_interface.h"
}

#include <Wire.h>

#include "SensorEntity.h"
#include "DisplayEntity.h"
#include "JsonConfig.h"
#include "WebServer.h"

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Server init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

WebServer server = WebServer();
ESP8266WebServer webServer(80);
const int maxConnectAttempts = 20;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle and config stuff
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JsonConfig config;

unsigned long previousMillis = 0;
bool isRebooting = false;
int currentSensorCycle = 0;
int currentRebootCycle = 0;
const int ONE_SECOND = 1000;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sensors init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#define sensorsCount 1
int sensorTypes[sensorsCount] = {SENSOR_DHT11};
int sensorPins[sensorsCount] = {4};
SensorEntity** sensorEntities;
SensorOutputData* outputDatas;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Display init
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

DisplayEntity display = DisplayEntity(DISPLAY_OLED);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reboot routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void handleTimerWhileRebooting()
{
    int periods = atoi(config.reboot_delay);
    if (currentRebootCycle == periods)
    {
        ESP.restart();
        return;
    }

    int secsToReboot = periods - currentRebootCycle;

    String messageText = "Reboot in ";
    messageText += secsToReboot;
    messageText += " sec";
    display.printLine(messageText);

    Serial.printf("Reboot ESP in %d sec.\r\n", secsToReboot);
}

void rebootESP()
{
    handleTimerWhileRebooting();

    // clear 2nd line
    display.printLine("", 1);

    //ignore all messages to display while rebooting
    isRebooting = true;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Web server stuff
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void initWebServer()
{
    server.setup(&webServer, &config, rebootESP);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WiFi routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void handleWiFiEvent(WiFiEvent_t event)
{
    switch (event)
    {
        case WIFI_EVENT_STAMODE_CONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_CONNECTED");
            break;
        case WIFI_EVENT_STAMODE_DISCONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_DISCONNECTED");
            break;
        case WIFI_EVENT_STAMODE_AUTHMODE_CHANGE:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_AUTHMODE_CHANGE");
            break;
        case WIFI_EVENT_STAMODE_GOT_IP:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_GOT_IP");
            Serial.print("Wifi: connected, IP = ");
            Serial.print(WiFi.localIP());
            Serial.print(", MAC = ");
            Serial.print(getMacString());
            Serial.println();
            break;
        case WIFI_EVENT_STAMODE_DHCP_TIMEOUT:
            Serial.println("Wifi event: WIFI_EVENT_STAMODE_DHCP_TIMEOUT");
            break;
        case WIFI_EVENT_SOFTAPMODE_STACONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_SOFTAPMODE_STACONNECTED");
            break;
        case WIFI_EVENT_SOFTAPMODE_STADISCONNECTED:
            Serial.println("Wifi event: WIFI_EVENT_SOFTAPMODE_STADISCONNECTED");
            break;
        case WIFI_EVENT_SOFTAPMODE_PROBEREQRECVED:
            break;
        case WIFI_EVENT_MAX:
            Serial.println("Wifi event: WIFI_EVENT_MAX");
            break;
    }
}

int connectWiFi()
{
    Serial.println("Wifi: connecting");

    int connectAttempts = 0;

    while (connectAttempts < maxConnectAttempts)
    {
        Serial.printf("Wifi: connecting, attempt %d\r\n", connectAttempts);

        String messageText = "Starting Wifi";
        if (connectAttempts % 4 == 0)
        {
            messageText += "";
        }
        if (connectAttempts % 4 == 1)
        {
            messageText += ".";
        }
        if (connectAttempts % 4 == 2)
        {
            messageText += "..";
        }
        if (connectAttempts % 4 == 3)
        {
            messageText += "...";
        }
        display.printLine(messageText, 1);

        if (WiFi.status() == WL_CONNECTED)
        {
            Serial.println("Wifi: connected");
            return 1;
        }

        delay(450);
        connectAttempts++;

        yield();
    }

    Serial.println("Wifi: timeout");
    return 0;
}

void initWiFi()
{
    Serial.println("Wifi: starting");
    display.printLine("Starting Wifi", 1);

    delay(1000);
    WiFi.mode(WIFI_AP_STA);
    WiFi.onEvent(handleWiFiEvent);

    if (atoi(config.static_ip_mode) == 1)
    {
        Serial.println("Wifi: use static IP");
        IPAddress staticIP = stringToIp(config.static_ip);
        Serial.print("Wifi: preferred IP: ");
        Serial.println(staticIP);
        IPAddress staticGateway = stringToIp(config.static_gateway);
        Serial.print("Wifi: preferred gateway: ");
        Serial.println(staticGateway);
        IPAddress staticSubnet = stringToIp(config.static_subnet);
        Serial.print("Wifi: preferred subnet: ");
        Serial.println(staticSubnet);
        WiFi.config(staticIP, staticGateway, staticSubnet);
    }
    else
    {
        Serial.println("Wifi: using DHCP");
    }

    WiFi.begin(config.sta_ssid, config.sta_pwd);

    Serial.println(String("Wifi: connect to '") + config.sta_ssid + "' with password '" + config.sta_pwd + "'");

    connectWiFi();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println(String("Wifi: connected, creating AP '") + config.module_name + "'");
        WiFi.softAP(config.module_name, "temppassword");
        Serial.print("Wifi: connected, IP = ");
        Serial.print(WiFi.localIP());
        Serial.println();

        display.printLine("Wifi connected");
        display.printLine(getIpString(WiFi.localIP()), 1);
    }
    else
    {
        Serial.println(String("Wifi: not connected, creating AP '") + config.module_name + "'");
        WiFi.mode(WIFI_AP);
        WiFi.softAP(config.module_name, "temppassword");
        Serial.print("Wifi: created AP with IP = ");
        Serial.print(WiFi.softAPIP());
        Serial.println();

        display.printLine("No Wifi", 1);
    }

    Serial.println("Wifi: started\r\n");

    initWebServer();

    if (!MDNS.begin(config.module_name))
    {
        while (1)
        {
            delay(1000);
            yield();
        }
    }
    MDNS.addService("http", "tcp", 80);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup module
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void setup()
{
    Serial.begin(115200);

    isRebooting = false;
    currentSensorCycle = 0;
    currentRebootCycle = 0;

    setupSensors();
    setupDisplay();

    Serial.println("\r\nStarting module...");
    display.printLine("Starting module");

    if (!SPIFFS.begin())
    {
        Serial.println("Config: failed to mount file system");
    }
    else
    {
        if (!config.loadConfig())
        {
            Serial.println("Config: failed to load");
        }
        else
        {
            Serial.println("Config: loaded");
        }

        config.printConfig();
    }

    initWiFi();

    Serial.println("\r\nStarting complete.");
}

void setupSensors()
{
    outputDatas = new SensorOutputData[sensorsCount];
    sensorEntities = new SensorEntity*[sensorsCount];
    for (int i = 0; i < sensorsCount; i++)
    {
        int sensorType = sensorTypes[i];
        int pin = sensorPins[i];
        SensorEntity* entity = new SensorEntity(sensorType);
        entity->setup(pin);
        sensorEntities[i] = entity;
    }
}

void setupDisplay()
{
    DisplayConfig displayConfig = DisplayConfig();
    displayConfig.address = 0x3c;
    displayConfig.sda = D3;
    displayConfig.scl = D5;

    display.setup(displayConfig);
    display.clear();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Retrieve and render sensors data routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void requestSensorValues()
{
    for (int i = 0; i < sensorsCount; i++)
    {
        SensorEntity* entity = sensorEntities[i];
        SensorOutputData sensorData = entity->getData();
        sensorData.sensorOrder = i;
        outputDatas[i] = sensorData;
    }
}

void renderSensorValues()
{
    display.clear();
    for (int i = 0; i < sensorsCount; i++)
    {
        SensorOutputData sensorData = outputDatas[i];
        display.printData(sensorData);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Send data routines
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

String getSensorsDataJson()
{
    StaticJsonBuffer<1024> jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();

    json["moduleid"] = atoi(config.module_id);
    json["modulename"] = config.module_name;
    json["code"] = config.validation_code;

    for (int i = 0; i < sensorsCount; i++)
    {
        SensorOutputData sensorData = outputDatas[i];
        int sensorCounter = i + 1;
        sensorData.formatJson(json, sensorCounter);
    }

    json["ip"] = getIpString(WiFi.localIP());
    json["mac"] = getMacString();
    json["delay"] = config.get_data_delay;

    char buffer[2048];
    json.printTo(buffer, sizeof(buffer));

    return String(buffer);
}

void sendSensorsData()
{
    Serial.println("\r\nHTTPClient: starting");

    String payload = getSensorsDataJson();
    HTTPClient http;

    Serial.println(String("HTTPClient: request URL ") + config.add_data_url);
    Serial.println(String("HTTPClient: payload ") + payload);
    http.begin(config.add_data_url);
    Serial.println("HTTPClient: URL requested");

    int httpCode = http.POST(payload);

    if (httpCode > 0)
    {
        if (httpCode == HTTP_CODE_OK)
        {
            String payload = http.getString();
            Serial.println("HTTPClient: " + payload);
            Serial.printf("HTTPClient: server OK %d\r\n", httpCode);
        }
        else
        {
            Serial.printf("HTTPClient: server ERROR %d\r\n", httpCode);
        }
    }
    else
    {
        Serial.println("HTTPClient: server OFF");
    }

    http.end();

    Serial.println("HTTPClient: ended");

    yield();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Work routine
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void loop()
{
    webServer.handleClient();

    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= ONE_SECOND)
    {
        currentSensorCycle++;
        previousMillis = currentMillis;

        if (isRebooting)
        {
            currentRebootCycle++;
            handleTimerWhileRebooting();
        }
        else
        {
            if (currentSensorCycle % atoi(config.get_data_delay) == 0)
            {
                Serial.println("\r\nGetting sensors data...");
                requestSensorValues();
                renderSensorValues();
                if (WiFi.status() == WL_CONNECTED)
                {
                    sendSensorsData();
                }
            }
        }
    }
}
