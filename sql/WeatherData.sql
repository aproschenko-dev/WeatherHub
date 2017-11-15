DROP TABLE IF EXISTS WeatherData;

CREATE TABLE IF NOT EXISTS WeatherData (
  ID int(11) NOT NULL,
  ModuleMAC varchar(50) NOT NULL,
  Temperature1 float DEFAULT NULL,
  Temperature2 float DEFAULT NULL,
  Temperature3 float DEFAULT NULL,
  Temperature4 float DEFAULT NULL,
  Humidity1 float DEFAULT NULL,
  Humidity2 float DEFAULT NULL,
  Humidity3 float DEFAULT NULL,
  Humidity4 float DEFAULT NULL,
  Pressure1 float DEFAULT NULL,
  Pressure2 float DEFAULT NULL,
  Pressure3 float DEFAULT NULL,
  Pressure4 float DEFAULT NULL,
  Illumination float DEFAULT NULL,
  CO2 float DEFAULT NULL,
  MeasuredDateTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE WeatherData
  ADD PRIMARY KEY (ID);

ALTER TABLE WeatherData
  MODIFY ID int(11) NOT NULL AUTO_INCREMENT;
