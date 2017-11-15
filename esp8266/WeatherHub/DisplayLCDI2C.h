#ifndef DisplayLCDI2C_H
#define DisplayLCDI2C_H

#include "DisplayBase.h"
#include <LiquidCrystal_I2C.h>

class DisplayLCDI2C : public DisplayBase
{
	LiquidCrystal_I2C* display;

	public:
		virtual void setup(DisplayConfig config);
		virtual void clear();
		virtual void printData(SensorOutputData sensorData);
		virtual void printLine(String text, int row);
};

#endif
