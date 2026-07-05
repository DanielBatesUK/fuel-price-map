// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function databaseSchema() {
  try {
    console.log(`${logTime("databaseSchema")} Database schema build request...`);

    // Select stations
    console.log(`${logTime("databaseSchema")} Applying schema for database...`);
    const stationsResults = db.exec(
      `
        DROP TABLE IF EXISTS sync_status;
        DROP TABLE IF EXISTS fuel_prices;
        DROP TABLE IF EXISTS stations;

        CREATE TABLE "sync_status" (
          name TEXT PRIMARY KEY,
          last_updated DATETIME,
          last_batch INTEGER
        );
        
        CREATE TABLE "stations" (
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
      `,
    );
    console.log(`${logTime("databaseSchema")} Completed building database schema`);
    // Return results
    return { data: stationsResults };
  } catch (error) {
    console.error(`${logTime("databaseSchema")} Database error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
