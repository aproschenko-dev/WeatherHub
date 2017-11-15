#ifndef SensorAM2301_H
#define SensorAM2301_H

#include "SensorDHT22.h"

class SensorAM2301 : public SensorDHT22
{
  public:
    virtual void setup(int pin);
};

#endif
