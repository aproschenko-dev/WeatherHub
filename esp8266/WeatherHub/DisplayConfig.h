#ifndef DisplayConfig_H
#define DisplayConfig_H

class DisplayConfig
{
	public:
		int address;
		int rows;
		int cols;
		int sda;
		int scl;
		bool printSensorTitle; // pring "S#:" at the line beginning or not
};

#endif
