// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import sleep from "../lib/sleep.js";
import db from "../lib/database.js";
import apiStations from "../lib/api_stations.js";
import apiPrices from "../lib/api_prices.js";
import saveStation from "../models/save_station.js";
import saveFuelPrice from "../models/save_fuel_price.js";
import saveSyncStatus from "../models/save_sync_status.js";

// ################################################################################################

async function buildSchema() {
  try {
    console.log(`${logTime("buildSchema")} Database schema build request...`);

    // Select stations
    console.log(`${logTime("buildSchema")} Applying schema for database...`);
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
    console.log(`${logTime("buildSchema")} Completed building database schema`);
    // Return results
    return { data: stationsResults };
  } catch (error) {
    console.error(`${logTime("buildSchema")} Database error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

async function populateStations() {
  try {
    console.log(`${logTime("populateStations")} Populating stations database table...`);
    var batchNumber = 0;
    while (true) {
      // Next batch number
      batchNumber += 1;
      // API request
      console.log(`${logTime("populateStations")} Sending request to stations api batch-number:'${batchNumber}'...`);
      const results = await apiStations(batchNumber);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(`${logTime("populateStations")} No stations data found for batch-number:'${batchNumber}'...`);
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(`${logTime("populateStations")} Stations data empty for batch-number:'${batchNumber}'...`);
        break;
      }
      for (const station of stations) {
        await saveStation(station);
      }
      // Update sync status
      await saveSyncStatus("stations", batchNumber);
      // Done
      console.log(
        `${logTime("populateStations")} Populated stations table with data from batch-number:'${batchNumber}'...`,
      );
      // Slow your row on API calls
      await sleep(5000, true);
    }
  } catch (error) {
    console.error(`${logTime("populateStations")} Error:`, error.message);
  }
}

// ################################################################################################

async function populateFuelPrices() {
  try {
    console.log(`${logTime("populateFuelPrices")} Populating fuel_prices table...`);
    var batchNumber = 0;
    while (true) {
      // Next batch number
      batchNumber += 1;
      // API request
      console.log(
        `${logTime("populateFuelPrices")} Sending request to fuel prices api for batch-number:'${batchNumber}'...`,
      );
      const results = await apiPrices(batchNumber);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(`${logTime("populateFuelPrices")} No fuel price data found for batch-number:'${batchNumber}'...`);
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(`${logTime("populateFuelPrices")} Fuel price data empty for batch-number:'${batchNumber}'...`);
        break;
      }
      for (const station of stations) {
        for (const fuel of station.fuel_prices) {
          const fuelPrice = {
            node_id: station.node_id,
            fuel_type: fuel.fuel_type,
            price: fuel.price,
            price_last_updated: fuel.price_last_updated,
            price_change_effective_timestamp: fuel.price_change_effective_timestamp,
          };
          await saveFuelPrice(fuelPrice);
        }
      }
      // Update sync status
      await saveSyncStatus("fuel_prices", batchNumber);
      // Slow your row on API calls
      console.log(
        `${logTime("populateFuelPrices")} Populated fuel_prices table with data from batch-number:'${batchNumber}'...`,
      );
      await sleep(5000, true);
    }
  } catch (error) {
    console.error(`${logTime("populateFuelPrices")} Error:`, error.message);
  }
}

// ################################################################################################

export default async function databaseBuild() {
  try {
    console.log(`${logTime("databaseBuild")} Database build started...`);
    await buildSchema();
    await populateStations();
    await populateFuelPrices();
    console.log(`${logTime("databaseBuild")} Database build finished.`);
  } catch (error) {
    console.error(`${logTime("databaseBuild")} Database build error:`, error);
  }
}

// ################################################################################################
