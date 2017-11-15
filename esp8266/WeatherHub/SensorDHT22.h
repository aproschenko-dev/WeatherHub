#ifndef SensorDHT22_H
#define SensorDHT22_H

#include "SensorBase.h"
#include <DHT.h>

class SensorDHT22 : public SensorBase
{
  protected:
    DHT* sensor;
  public:
    virtual void setup(int pin);
    virtual SensorOutputData getData();
};

#endif
