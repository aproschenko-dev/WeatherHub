#include "SensorAM2301.h"

#define DHTTYPE DHT21

void SensorAM2301::setup(int pin)
{
  this->sensor = new DHT(pin, DHTTYPE);
  this->sensor->begin();
}

