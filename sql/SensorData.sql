DROP TABLE IF EXISTS SensorData;

CREATE TABLE SensorData (
  ID int(11) NOT NULL,
  UserID int(11) NOT NULL,
  SensorID int(11) NOT NULL,
  ChartVisibility bit(1) DEFAULT NULL,
  TableVisibility bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE SensorData
  ADD PRIMARY KEY (ID);

ALTER TABLE SensorData
  MODIFY ID int(11) NOT NULL AUTO_INCREMENT;