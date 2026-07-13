-- Database migration from schema v1 to schema v2

-- ################################################################################################

-- Drop tables
DROP TABLE IF EXISTS metadata;

-- ################################################################################################

-- Create tables
CREATE TABLE metadata (
  name TEXT PRIMARY KEY,
  value TEXT
);

-- ################################################################################################

-- Populate metadata table
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