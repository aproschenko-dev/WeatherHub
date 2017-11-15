#include "SensorDHT11.h"

#define DHTTYPE DHT11

void SensorDHT11::setup(int pin)
{
	this->sensor = new DHT(pin, DHTTYPE);
	this->sensor->begin();
}
