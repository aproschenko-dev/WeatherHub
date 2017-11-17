#ifndef SensorBase_H
#define SensorBase_H

#include "SensorOutputData.h"

#define SENSOR_BASE 0
#define SENSOR_DHT22 1
#define SENSOR_DHT21 2
#define SENSOR_AM2301 2
#define SENSOR_DHT11 3
#define SENSOR_SHT21 4
#define SENSOR_HTU21 4
#define SENSOR_BH1750 5

#define SDA_PIN D3
#define SCK_PIN D5

class SensorBase
{
	public:
		virtual void setup(int pin);
		virtual SensorOutputData getData();
};

#endif
