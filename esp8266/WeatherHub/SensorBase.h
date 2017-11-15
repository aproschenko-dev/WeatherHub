#ifndef SensorBase_H
#define SensorBase_H

#include "SensorOutputData.h"

#define SENSOR_BASE 0
#define SENSOR_DHT22 1
#define SENSOR_DHT21 2
#define SENSOR_AM2301 2

class SensorBase
{
	public:
		virtual void setup(int pin);
		virtual SensorOutputData getData();
};

#endif
