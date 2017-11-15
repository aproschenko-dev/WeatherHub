#ifndef COMMON_H
#define COMMON_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <IPAddress.h>

#define VALUE_TEMP 0
#define VALUE_HUMIDITY 1
#define VALUE_PRESSURE 2
#define VALUE_ILLUMINATION 3

IPAddress stringToIp(String strIp);
bool isIPValid(const char * IP);
String floatToString(float f, int valueType, int digits = 4, int decimals = 1);
String getUptimeData();
String getFreeMemory();
String getIpString(IPAddress ip);
String getMacString();

#endif
