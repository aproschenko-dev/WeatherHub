#ifndef DisplayOLED_H
#define DisplayOLED_H

#include "DisplayBase.h"
#include "SSD1306.h"

class DisplayOLED : public DisplayBase
{
	SSD1306* display;

	public:
		virtual void setup(DisplayConfig config);
		virtual void clear();
		virtual void printData(SensorOutputData sensorData);
		virtual void printLine(String text, int row);
};

#endif
