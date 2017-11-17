#include "SensorEntity.h"
#include "SensorDHT22.h"
#include "SensorAM2301.h"
#include "SensorDHT11.h"
#include "SensorSHT21.h"
#include "SensorBH1750.h"

SensorEntity::SensorEntity(int sensorType)
{
    if (sensorType == SENSOR_BASE)
    {
        this->sensor = new SensorBase();
    }
    else if (sensorType == SENSOR_DHT22)
    {
        this->sensor = new SensorDHT22();
    }
    else if (sensorType == SENSOR_DHT11)
    {
        this->sensor = new SensorDHT11();
    }
    else if (sensorType == SENSOR_DHT21 || sensorType == SENSOR_AM2301)
    {
        this->sensor = new SensorAM2301();
    }
    else if (sensorType == SENSOR_SHT21 || sensorType == SENSOR_HTU21)
    {
        this->sensor = new SensorSHT21();
    }
    else if (sensorType == SENSOR_BH1750)
    {
        this->sensor = new SensorBH1750();
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
