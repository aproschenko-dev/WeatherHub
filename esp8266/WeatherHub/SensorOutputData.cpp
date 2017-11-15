#include "SensorOutputData.h"

float SensorOutputData::getTempForJson(float value)
{
    return (isnan(value) || value > 70) ? 0 : value;
}

float SensorOutputData::getHumidityForJson(float value)
{
    return (isnan(value) || value > 100) ? 0 : value;
}

String SensorOutputData::getParamName(String param, int sensorCounter)
{
    String paramName = "";
    paramName += param;
    paramName += sensorCounter;
    return paramName;
}

void SensorOutputData::formatJson(JsonObject& json, int sensorCounter)
{
    if (this->hasTemperature)
    {
        String paramName = getParamName("temperature", sensorCounter);
        json[paramName] = getTempForJson(this->temperature);
    }

    if (this->hasHumidity)
    {
        String paramName = getParamName("humidity", sensorCounter);
        json[paramName] = getHumidityForJson(this->humidity);
    }
}