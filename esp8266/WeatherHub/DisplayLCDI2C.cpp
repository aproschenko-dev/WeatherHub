#include "DisplayLCDI2C.h"

byte termoIcon[8] = //icon for termometer
{
    B00100,
    B01010,
    B01010,
    B01110,
    B01110,
    B11111,
    B11111,
    B01110
};

byte hydroIcon[8] = //icon for water droplet
{
    B00100,
    B00100,
    B01010,
    B01010,
    B10001,
    B10001,
    B10001,
    B01110,
};

void DisplayLCDI2C::setup(DisplayConfig config)
{
  this->display = new LiquidCrystal_I2C(config.address, config.cols, config.rows);
  this->display->begin(config.sda, config.scl);
  this->display->backlight();
  this->display->createChar(1, termoIcon);
  this->display->createChar(2, hydroIcon);

  this->printSensorTitle = config.printSensorTitle;
}

void DisplayLCDI2C::clear()
{
  this->display->clear();
}

void DisplayLCDI2C::printData(SensorOutputData sensorData)
{
  DisplayBase::printData(sensorData);

  this->display->setCursor(0, sensorData.sensorOrder);

  if (this->printSensorTitle)
  {
    this->display->print("S");
    this->display->print(sensorData.sensorOrder);
    this->display->print(": ");
  }

  this->display->print((char)1);
  this->display->print(" ");
  this->display->print(sensorData.temperature, 1);
  this->display->print((char)223);
  this->display->print(" ");

  this->display->print((char)2);
  this->display->print(" ");
  this->display->print(sensorData.humidity, 1);
  this->display->print("%");
}

void DisplayLCDI2C::printLine(String text, int row)
{
  while (text.length() < 20)
  {
    text += " ";
  }
  this->display->setCursor(0, row);
  this->display->print(text);
}