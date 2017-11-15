#include "SensorEntity.h"
#include "SensorDHT22.h"
#include "SensorAM2301.h"

SensorEntity::SensorEntity(int sensorType)
{
  if (sensorType == SENSOR_BASE)
  {
    this->sensor = new SensorBase();
  }
  if (sensorType == SENSOR_DHT22)
  {
    this->sensor = new SensorDHT22();
  }
  if (sensorType == SENSOR_DHT21 || sensorType == SENSOR_AM2301)
  {
    this->sensor = new SensorAM2301();
  }
}

SensorOutputData SensorEntity::getData()
{
  return this->sensor->getData();
}

void SensorEntity::setup(int pin)
{
  this->sensor->setup(pin);
}
