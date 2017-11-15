DROP TABLE IF EXISTS WeatherModule;

CREATE TABLE IF NOT EXISTS WeatherModule (
  ID int(11) NOT NULL,
  ModuleID int(11) NOT NULL,
  ModuleName varchar(50) NOT NULL,
  MAC varchar(50) NOT NULL,
  IP varchar(15) NOT NULL,
  IsAqara bit(1) DEFAULT NULL,
  Description text,
  SensorDelay int(11) DEFAULT NULL,
  LastSeenDateTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  IsActive bit(1) DEFAULT b'1',
  TableVisibility bit(1) DEFAULT b'1',
  ChartVisibility bit(1) DEFAULT b'1',
  ValidationCode varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE WeatherModule
  ADD PRIMARY KEY (ID);

ALTER TABLE WeatherModule
  MODIFY ID int(11) NOT NULL AUTO_INCREMENT;
