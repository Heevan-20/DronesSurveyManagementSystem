CREATE TABLE IF NOT EXISTS drones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  status TEXT,
  battery INTEGER,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT,
  progress INTEGER DEFAULT 0,
  drone_id INTEGER,
  started_at DATETIME,
  ended_at DATETIME
);

DELETE FROM missions;
DELETE FROM drones;

INSERT INTO drones (name, status, battery, lat, lng)
VALUES ('Drone-1', 'IDLE', 100, 12.97, 77.59);
INSERT INTO drones (name, status, battery, lat, lng)
VALUES ('Drone-2', 'IDLE', 100, 20.24, 35.09);
INSERT INTO drones (name, status, battery, lat, lng)
VALUES ('Drone-3', 'IDLE', 100, 45.92, 84.67);

