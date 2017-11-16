#include "Common.h"

IPAddress stringToIp(String strIp)
{
    String temp;
    IPAddress ip;

    int count = 0;
    for (int i = 0; i <= strIp.length(); i++)
    {
        if (strIp[i] != '.')
        {
            temp += strIp[i];
        }
        else
        {
            if (count < 4)
            {
                ip[count] = atoi(temp.c_str());
                temp = "";
                count++;
            }
        }
        if (i == strIp.length())
        {
            ip[count] = atoi(temp.c_str());
        }
    }
    return ip;
}

bool isIPValid(const char * IP)
{
    //limited size
    int internalcount = 0;
    int dotcount = 0;
    bool previouswasdot = false;
    char c;

    if (strlen(IP) > 15 || strlen(IP) == 0)
    {
        return false;
    }
    //cannot start with .
    if (IP[0] == '.')
    {
        return false;
    }

    //only letter and digit
    for (int i = 0; i < strlen(IP); i++)
    {
        c = IP[i];
        if (isdigit(c))
        {
            //only 3 digit at once
            internalcount++;
            previouswasdot = false;
            if (internalcount > 3)
            {
                return false;
            }
        }
        else if (c == '.')
        {
            //cannot have 2 dots side by side
            if (previouswasdot)
            {
                return false;
            }
            previouswasdot = true;
            internalcount = 0;
            dotcount++;
        }//if not a dot neither a digit it is wrong
        else
        {
            return false;
        }
    }
    //if not 3 dots then it is wrong
    if (dotcount != 3)
    {
        return false;
    }
    //cannot have the last dot as last char
    if (IP[strlen(IP) - 1] == '.')
    {
        return false;
    }
    return true;
}

String floatToString(float f, int valueType, int digits, int decimals)
{
    if (isnan(f))
    {
        return "-";
    }
    if (valueType == VALUE_TEMP)
    {
        if (f > 70) return "-";
    }
    if (valueType == VALUE_HUMIDITY)
    {
        if (f > 100) return "-";
    }
    if (valueType == VALUE_ILLUMINATION)
    {
        if (f > 50000) return "-";
        return String((int)f);
    }

    char c[10];
    dtostrf(f, digits, decimals, c);
    return String(c);
}

String getUptimeData()
{
    int highMillis = 0;
    int rollover = 0;

    //** Making Note of an expected rollover *****//
    if (millis() >= 3000000000)
    {
        highMillis = 1;
    }
    //** Making note of actual rollover **//
    if (millis() <= 100000 && highMillis == 1)
    {
        rollover++;
        highMillis = 0;
    }

    long secsUp = millis() / 1000;
    long second = secsUp % 60;
    long minute = (secsUp / 60) % 60;
    long hour = (secsUp / (60 * 60)) % 24;
    long day = (rollover * 50) + (secsUp / (60 * 60 * 24));  //First portion takes care of a rollover [around 50 days]

    char value_buff[120];
    sprintf_P(value_buff, (const char *)F("%d day(s) %02d h %02d m"), day, hour, minute);
    return value_buff;
}

String getFreeMemory()
{
    return String(ESP.getFreeHeap());
}

String getIpString(IPAddress ip)
{
    String ipStr = String(ip[0]) + '.' + String(ip[1]) + '.' + String(ip[2]) + '.' + String(ip[3]);
    return ipStr;
}

String getMacString()
{
    uint8_t macData[6];
    WiFi.macAddress(macData);

    char value_buff[20];
    sprintf_P(value_buff, (const char *)F("%02x:%02x:%02x:%02x:%02x:%02x"), macData[0], macData[1], macData[2], macData[3], macData[4], macData[5]);
    return String(value_buff);
}
