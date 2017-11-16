#include <Wire.h>
#include "SensorSHT21.h"

// code taken here: https://github.com/markbeee/SHT21

#define SHT21_ADDRESS 0x40  //I2C address for the sensor
#define TRIGGER_TEMP_MEASURE_NOHOLD  0xF3
#define TRIGGER_HUMD_MEASURE_NOHOLD  0xF5

void SensorSHT21::setup(int pin)
{
	Wire.begin(SDA_PIN, SCK_PIN);
}

SensorOutputData SensorSHT21::getData()
{
	float h = getHumidity();
	float t = getTemperature();

	SensorOutputData sensorData = SensorOutputData();
	sensorData.temperature = t;
	sensorData.hasTemperature = true;
	sensorData.humidity = h;
	sensorData.hasHumidity = true;

	return sensorData;
}

uint16_t SensorSHT21::readSHT21(uint8_t command)
{
	uint16_t result;

	Wire.beginTransmission(SHT21_ADDRESS);
	Wire.write(command);
	Wire.endTransmission();
	delay(100);

	Wire.requestFrom(SHT21_ADDRESS, 3);
	while(Wire.available() < 3) {
	  delay(1);
	}

	// return result
	result = ((Wire.read()) << 8);
	result += Wire.read();
	result &= ~0x0003; // clear two low bits (status bits)
	return result;
}

float SensorSHT21::getHumidity()
{
	return (-6.0 + 125.0 / 65536.0 * (float)(readSHT21(TRIGGER_HUMD_MEASURE_NOHOLD)));
}

float SensorSHT21::getTemperature()
{
	return (-46.85 + 175.72 / 65536.0 * (float)(readSHT21(TRIGGER_TEMP_MEASURE_NOHOLD)));
}
