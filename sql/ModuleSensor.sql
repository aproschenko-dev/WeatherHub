DROP TABLE IF EXISTS ModuleSensor;

CREATE TABLE IF NOT EXISTS ModuleSensor (
  ID int(11) NOT NULL,
  ModuleID int(11) NOT NULL,
  SensorID int(11) NOT NULL,
  IsActive bit(1) DEFAULT NULL,
  Description text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE ModuleSensor
  ADD PRIMARY KEY (ID);

ALTER TABLE ModuleSensor
  MODIFY ID int(11) NOT NULL AUTO_INCREMENT;
