#include "SensorDHT22.h"

#define DHTTYPE DHT22

void SensorDHT22::setup(int pin)
{
	this->sensor = new DHT(pin, DHTTYPE);
	this->sensor->begin();
}

SensorOutputData SensorDHT22::getData()
{
	float h = this->sensor->readHumidity();
	float t = this->sensor->readTemperature();

	SensorOutputData sensorData = SensorOutputData();
	sensorData.temperature = t;
	sensorData.hasTemperature = true;
	sensorData.humidity = h;
	sensorData.hasHumidity = true;

	return sensorData;
}
