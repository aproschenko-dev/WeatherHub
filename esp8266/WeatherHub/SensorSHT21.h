#ifndef SensorSHT21_H
#define SensorSHT21_H

#include "SensorBase.h"

class SensorSHT21 : public SensorBase
{
  public:
    virtual void setup(int pin);
    virtual SensorOutputData getData();

  private:
	uint16_t readSHT21(uint8_t command);
	float getHumidity();
	float getTemperature();
};

#endif
