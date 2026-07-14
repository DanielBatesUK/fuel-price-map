-- Build database from scratch with schema v3

-- ################################################################################################

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ################################################################################################

-- Drop Tables
DROP TABLE IF EXISTS metadata;
DROP TABLE IF EXISTS sync_status;
DROP TABLE IF EXISTS fuel_prices;
DROP TABLE IF EXISTS fuel_types;
DROP TABLE IF EXISTS opening_times;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS stations;

-- ################################################################################################

-- Create tables
CREATE TABLE "metadata" (
  name TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE sync_status (
  name TEXT PRIMARY KEY,
  last_updated DATETIME,
  last_batch INTEGER
);

CREATE TABLE stations (
  node_id TEXT PRIMARY KEY,
  trading_name TEXT,
  brand_name TEXT,
  address_line_1 TEXT,
  city TEXT,
  postcode TEXT,
  latitude REAL,
  longitude REAL,
  temporary_closure BOOLEAN DEFAULT 0
);

CREATE TABLE fuel_prices (
  node_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  price REAL NOT NULL,
  price_last_updated DATETIME,
  price_change_effective_timestamp DATETIME,
  PRIMARY KEY (node_id, fuel_type),
  FOREIGN KEY (node_id) REFERENCES stations(node_id) ON DELETE CASCADE
);

CREATE TABLE fuel_types (
  node_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  PRIMARY KEY (node_id, fuel_type),
  FOREIGN KEY (node_id) REFERENCES stations(node_id) ON DELETE CASCADE
);

CREATE TABLE opening_times (
  node_id TEXT NOT NULL,
  day_name TEXT NOT NULL,
  holiday_type TEXT DEFAULT NULL,
  opens TEXT NOT NULL,
  closes TEXT NOT NULL,
  is_24_hours BOOLEAN DEFAULT 0,
  PRIMARY KEY (node_id, day_name),
  FOREIGN KEY (node_id) REFERENCES stations(node_id) ON DELETE CASCADE
);

CREATE TABLE amenities (
  node_id TEXT NOT NULL,
  amenity TEXT NOT NULL,
  PRIMARY KEY (node_id, amenity),
  FOREIGN KEY (node_id) REFERENCES stations(node_id) ON DELETE CASCADE
);

-- ################################################################################################

-- populate metadata table
INSERT INTO metadata (name, value)
VALUES ('schema_version', '2');

INSERT INTO metadata (name, value)
SELECT 'total_stations', COUNT(*)
FROM stations;

INSERT INTO metadata (name, value)
SELECT 'total_fuel_prices', COUNT(*)
FROM fuel_prices;

INSERT INTO metadata (name, value)
VALUES ('database_created', CURRENT_TIMESTAMP);

-- ################################################################################################

COMMIT;

PRAGMA foreign_keys = ON;

PRAGMA foreign_key_check;