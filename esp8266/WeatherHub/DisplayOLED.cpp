#include "DisplayOLED.h"

#define FONT_HEIGHT 16
#define LINE_GAP 4
#define SCREEN_HEIGHT 64
#define SCREEN_WIDTH 128

void DisplayOLED::setup(DisplayConfig config)
{
  this->display = new SSD1306(config.address, config.sda, config.scl);
  this->display->init();
  this->display->setTextAlignment(TEXT_ALIGN_LEFT);
  this->display->setFont(ArialMT_Plain_16);

  this->printSensorTitle = config.printSensorTitle;
}

void DisplayOLED::clear()
{
  this->display->clear();
}

void DisplayOLED::printData(SensorOutputData sensorData)
{
  DisplayBase::printData(sensorData);

  String text = "";
  text += sensorData.temperature;
  text += (char)247;
  text += " ";
  text += sensorData.humidity;
  text += "%";

  this->printLine(text, sensorData.sensorOrder);
}

void DisplayOLED::printLine(String text, int row)
{
  this->display->setColor(BLACK);
  this->display->fillRect(0, row * (FONT_HEIGHT + LINE_GAP), SCREEN_WIDTH, (FONT_HEIGHT + LINE_GAP));
  this->display->setColor(WHITE);
  this->display->drawString(0, row * (FONT_HEIGHT + LINE_GAP), text);
  this->display->display();
}