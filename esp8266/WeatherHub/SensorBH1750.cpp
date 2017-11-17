#include <Wire.h>
#include "SensorBH1750.h"

// code from here: https://github.com/claws/BH1750

#define BH1750_I2CADDR 0x23

// No active state
#define BH1750_POWER_DOWN 0x00

// Wating for measurment command
#define BH1750_POWER_ON 0x01

// Reset data register value - not accepted in POWER_DOWN mode
#define BH1750_RESET 0x07

// Start measurement at 1lx resolution. Measurement time is approx 120ms.
#define BH1750_CONTINUOUS_HIGH_RES_MODE  0x10

// Start measurement at 0.5lx resolution. Measurement time is approx 120ms.
#define BH1750_CONTINUOUS_HIGH_RES_MODE_2  0x11

// Start measurement at 4lx resolution. Measurement time is approx 16ms.
#define BH1750_CONTINUOUS_LOW_RES_MODE  0x13

// Start measurement at 1lx resolution. Measurement time is approx 120ms.
// Device is automatically set to Power Down after measurement.
#define BH1750_ONE_TIME_HIGH_RES_MODE  0x20

// Start measurement at 0.5lx resolution. Measurement time is approx 120ms.
// Device is automatically set to Power Down after measurement.
#define BH1750_ONE_TIME_HIGH_RES_MODE_2  0x21

// Start measurement at 1lx resolution. Measurement time is approx 120ms.
// Device is automatically set to Power Down after measurement.
#define BH1750_ONE_TIME_LOW_RES_MODE  0x23

// Define milliseconds delay for ESP8266 platform
#if defined(ESP8266)

  #include <pgmspace.h>
  #define _delay_ms(ms) delayMicroseconds((ms) * 1000)

// Use _delay_ms from utils for AVR-based platforms
#elif defined(__avr__)
  #include <util/delay.h>
// Use Wiring's delay for compability with another platforms
#else
  #define _delay_ms(ms) delay(ms)
#endif


// Legacy Wire.write() function fix
#if (ARDUINO >= 100)
  #define __wire_write(d) Wire.write(d)
#else
  #define __wire_write(d) Wire.send(d)
#endif


// Legacy Wire.read() function fix
#if (ARDUINO >= 100)
  #define __wire_read() Wire.read()
#else
  #define __wire_read() Wire.receive()
#endif

void SensorBH1750::setup(int pin)
{
	Wire.begin(SDA_PIN, SCK_PIN);
	configure(BH1750_CONTINUOUS_HIGH_RES_MODE);
}

SensorOutputData SensorBH1750::getData()
{
	uint16_t lightLevel = readLightLevel(false);

	SensorOutputData sensorData = SensorOutputData();
	sensorData.lightness = lightLevel;
	sensorData.hasLightness = true;
	return sensorData;
}

uint16_t SensorBH1750::readLightLevel(bool maxWait)
{
  // Measurment result will be stored here
  uint16_t level;

  // One-Time modes need to be re-applied after power-up. They have a maximum
  // measurement time and a typical measurement time. The maxWait argument
  // determines which measurement wait time is used when a one-time mode is
  // being used. The typical (shorter) measurement time is used by default and
  // if maxWait is set to True then the maximum measurement time will be used.
  // See data sheet pages 2, 5 and 7 for more details.
  switch (BH1750_MODE) {

    case BH1750_ONE_TIME_HIGH_RES_MODE:
    case BH1750_ONE_TIME_HIGH_RES_MODE_2:
    case BH1750_ONE_TIME_LOW_RES_MODE:

      // Send mode to sensor
      Wire.beginTransmission(BH1750_I2CADDR);
      __wire_write((uint8_t)BH1750_MODE);
      Wire.endTransmission();

      // wait for measurement time
      if (BH1750_MODE == BH1750_ONE_TIME_LOW_RES_MODE) {
        maxWait ? _delay_ms(24) : _delay_ms(16);
      }
      else {
        maxWait ? _delay_ms(180) :_delay_ms(120);
      }

      break;
  }

  // Read two bytes from sensor
  Wire.requestFrom(BH1750_I2CADDR, 2);

  // Read two bytes, which are low and high parts of sensor value
  level = __wire_read();
  level <<= 8;
  level |= __wire_read();

  // Convert raw value to lux
  level /= 1.2;

  return level;
}

void SensorBH1750::configure(uint8_t mode)
{
  // Check measurment mode is valid
  switch (mode) {

    case BH1750_CONTINUOUS_HIGH_RES_MODE:
    case BH1750_CONTINUOUS_HIGH_RES_MODE_2:
    case BH1750_CONTINUOUS_LOW_RES_MODE:
    case BH1750_ONE_TIME_HIGH_RES_MODE:
    case BH1750_ONE_TIME_HIGH_RES_MODE_2:
    case BH1750_ONE_TIME_LOW_RES_MODE:

      // Save mode so it can be restored when One-Time modes are used.
      BH1750_MODE = mode;

      // Send mode to sensor
      Wire.beginTransmission(BH1750_I2CADDR);
      __wire_write((uint8_t)BH1750_MODE);
      Wire.endTransmission();

      // Wait a few moments to wake up
      _delay_ms(10);
      break;

    default:
      break;
  }

}