DROP TABLE IF EXISTS WeatherSensor;

CREATE TABLE IF NOT EXISTS WeatherSensor (
  ID int(11) NOT NULL,
  SensorName varchar(50) NOT NULL,
  Description varchar(50) DEFAULT NULL,
  Units varchar(50) DEFAULT NULL,
  ChartTitle varchar(50) DEFAULT NULL,
  SortOrder int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

INSERT INTO `WeatherSensor`(`ID`, `SensorName`, `Description`, `Units`, `ChartTitle`, `SortOrder`) VALUES
(1, 'Temperature1', 'Температура 1', '°C', 'Температура (°C)', 1),
(2, 'Temperature2', 'Температура 2', '°C', 'Температура (°C)', 2),
(3, 'Temperature3', 'Температура 3', '°C', 'Температура (°C)', 3),
(4, 'Temperature4', 'Температура 4', '°C', 'Температура (°C)', 4),
(5, 'Humidity1', 'Влажность 1', '%', 'Относительная влажность (%)', 5),
(6, 'Humidity2', 'Влажность 2', '%', 'Относительная влажность (%)', 6),
(7, 'Humidity3', 'Влажность 3', '%', 'Относительная влажность (%)', 7),
(8, 'Humidity4', 'Влажность 4', '%', 'Относительная влажность (%)', 8),
(9, 'Pressure1', 'Давление 1', 'mmHg', 'Атмосферное давление (mmHg)', 9),
(10, 'Pressure2', 'Давление 2', 'mmHg', 'Атмосферное давление (mmHg)', 10),
(11, 'Pressure3', 'Давление 3', 'mmHg', 'Атмосферное давление (mmHg)', 11),
(12, 'Pressure4', 'Давление 4', 'mmHg', 'Атмосферное давление (mmHg)', 12),
(13, 'Illumination', 'Освещенность', 'lx', 'Освещенность (lx)', 13),
(14, 'CO2', 'Уровень CO2', 'ppm', 'Уровень CO2', 14);

ALTER TABLE WeatherSensor
  ADD PRIMARY KEY (ID);

ALTER TABLE WeatherSensor
  MODIFY ID int(11) NOT NULL AUTO_INCREMENT;