#include "DisplayBase.h"

void DisplayBase::setup(DisplayConfig config)
{
  // do nothing
}

void DisplayBase::clear()
{
  // do nothing
}

void DisplayBase::printLine(String text, int row)
{
  // do nothing
}

void DisplayBase::printData(SensorOutputData sensorData)
{
	if (sensorData.hasTemperature)
	{
		String tempStr = floatToString(sensorData.temperature, VALUE_TEMP);
		Serial.println(String("T: " + tempStr));
	}

	if (sensorData.hasHumidity)
	{
		String humidityStr = floatToString(sensorData.humidity, VALUE_HUMIDITY);
		Serial.println(String("H: " + humidityStr));
	}
}