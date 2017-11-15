#ifndef DisplayEntity_H
#define DisplayEntity_H

#include "DisplayBase.h"

class DisplayEntity
{
	int displayType;
	DisplayBase* display;

	public:
		DisplayEntity(int displayType);
		virtual void printData(SensorOutputData sensorData);
		virtual void setup(DisplayConfig config);
		virtual void clear();
		virtual void printLine(String text, int row = 0);
};

#endif
