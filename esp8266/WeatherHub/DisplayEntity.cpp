#include "DisplayEntity.h"
#include "DisplayLCDI2C.h"
#include "DisplayOLED.h"

DisplayEntity::DisplayEntity(int displayType)
{
  this->displayType = displayType;

  if (displayType == DISPLAY_BASE)
  {
    this->display = new DisplayBase();
  }
  if (displayType == DISPLAY_LCD_I2C)
  {
    this->display = new DisplayLCDI2C();
  }
  if (displayType == DISPLAY_OLED)
  {
    this->display = new DisplayOLED();
  }
}

void DisplayEntity::printData(SensorOutputData sensorData)
{
  this->display->printData(sensorData);
}

void DisplayEntity::setup(DisplayConfig config)
{
  this->display->setup(config);
}

void DisplayEntity::clear()
{
  this->display->clear();
}

void DisplayEntity::printLine(String text, int row)
{
  this->display->printLine(text, row);
}