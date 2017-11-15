#ifndef SensorDHT11_H
#define SensorDHT11_H

#include "SensorDHT22.h"

class SensorDHT11 : public SensorDHT22
{
  public:
    virtual void setup(int pin);
};

#endif
