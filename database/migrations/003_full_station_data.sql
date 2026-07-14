-- Database migration from schema v2 to schema v3

-- ################################################################################################

PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ################################################################################################

-- Create new stations table
CREATE TABLE stations_new (
  node_id TEXT PRIMARY KEY,
  public_phone_number TEXT,
  trading_name TEXT,
  is_same_trading_and_brand_name BOOLEAN DEFAULT 0,
  brand_name TEXT,
  temporary_closure BOOLEAN DEFAULT 0,
  permanent_closure BOOLEAN DEFAULT 0,
  permanent_closure_date TEXT,
  is_motorway_service_station BOOLEAN DEFAULT 0,
  is_supermarket_service_station BOOLEAN DEFAULT 0,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  county TEXT,
  postcode TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL
);

INSERT INTO stations_new (
  node_id,
  trading_name,
  brand_name,
  address_line_1,
  city,
  postcode,
  latitude,
  longitude,
  temporary_closure
)
SELECT
  node_id,
  trading_name,
  brand_name,
  address_line_1,
  city,
  postcode,
  latitude,
  longitude,
  temporary_closure
FROM
  stations;

DROP TABLE stations;

ALTER TABLE stations_new
RENAME TO stations;

-- ################################################################################################

-- Drop tables
DROP TABLE IF EXISTS fuel_types;
DROP TABLE IF EXISTS opening_times;
DROP TABLE IF EXISTS amenities;

-- ################################################################################################

-- Create new tables
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

-- Update schema version metadata
UPDATE metadata
SET
  VALUE = '3'
WHERE
  name = 'schema_version';

-- ################################################################################################

COMMIT;

PRAGMA foreign_keys = ON;

PRAGMA foreign_key_check;