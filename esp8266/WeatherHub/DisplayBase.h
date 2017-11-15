#ifndef DisplayBase_H
#define DisplayBase_H

#include <Arduino.h>
#include "SensorOutputData.h"
#include "DisplayConfig.h"
#include "Common.h"

#define DISPLAY_BASE 0
#define DISPLAY_LCD_I2C 1

class DisplayBase
{
	protected:
		bool printSensorTitle;

	public:
		virtual void setup(DisplayConfig config);
		virtual void clear();
		virtual void printData(SensorOutputData sensorData);
		virtual void printLine(String text, int row);
};

#endif
