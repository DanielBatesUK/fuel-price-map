-- Build database from scratch schema v2

-- ################################################################################################

-- Drop Tables
DROP TABLE IF EXISTS metadata;
DROP TABLE IF EXISTS sync_status;
DROP TABLE IF EXISTS fuel_prices;
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
  FOREIGN KEY (node_id) REFERENCES stations(node_id)
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