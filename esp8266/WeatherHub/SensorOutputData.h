#ifndef SensorOutputData_H
#define SensorOutputData_H

#include <Arduino.h>
#include <ArduinoJson.h>

class SensorOutputData
{
	private:
		float getTempForJson(float value);
		float getHumidityForJson(float value);
		String getParamName(String param, int sensorCounter);
	
	public:
		float temperature;
		bool hasTemperature;

		float humidity;
		bool hasHumidity;

		float pressure;
		bool hasPressure;

		float lightness;
		bool hasLightness;

		int sensorOrder;

		void formatJson(JsonObject& json, int sensorCounter);
};

#endif
