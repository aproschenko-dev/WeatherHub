#ifndef SensorEntity_H
#define SensorEntity_H

#include "SensorBase.h"

class SensorEntity
{  
  SensorBase* sensor;
  public:
    SensorEntity(int sensorType);
    virtual SensorOutputData getData();
    virtual void setup(int pin);
};

#endif
