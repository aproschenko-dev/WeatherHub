#ifndef SensorBH1750_H
#define SensorBH1750_H

#include "SensorBase.h"

class SensorBH1750 : public SensorBase
{
  public:
    virtual void setup(int pin);
    virtual SensorOutputData getData();

  private:
	uint16_t readLightLevel(bool maxWait = false);
	void configure(uint8_t mode);
	uint8_t BH1750_MODE;
};

#endif
