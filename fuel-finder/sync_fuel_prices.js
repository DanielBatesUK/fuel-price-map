// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import formatFuelFinderTimestamp from "./format_timestamp.js";
import requestFuelPrices from "./request_fuel_prices.js";
import db from "../database/database.js";
import { saveFuelPrice } from "../models/fuel_prices.js";
import { saveTotalFuelPrices } from "../models/metadata.js";
import { getSyncStatusForTable, saveSyncStatus } from "../models/sync_status.js";

// ################################################################################################

export default async function syncFuelPrices(fullSync = false) {
  try {
    console.log(`${logTime("syncFuelPrices")} Syncing fuel_prices data...`);
    let batchNumber = 0;
    let timestamp = null;
    if (!fullSync) {
      // 5mins previous to latest update
      const syncStatusResults = (await getSyncStatusForTable("syncFuelPrices", "fuel_prices")).data[0];
      const syncDate = new Date(syncStatusResults.last_updated.replace(" ", "T") + "Z");
      syncDate.setSeconds(syncDate.getSeconds() - 300);
      timestamp = formatFuelFinderTimestamp(syncDate);
    }
    while (true) {
      // Next batch number
      batchNumber += 1;
      // API request
      console.log(
        `${logTime("syncFuelPrices")} Sending request to fuel_prices api for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
      const results = await requestFuelPrices(batchNumber, timestamp);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(
          `${logTime("syncFuelPrices")} No fuel_price data found for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
        );
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(
          `${logTime("syncFuelPrices")} Fuel_price data empty for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
        );
        break;
      }
      // Update fuel_prices
      const transaction = db.transaction(() => {
        for (const station of stations) {
          for (const fuel of station.fuel_prices) {
            const fuelPrice = {
              node_id: station.node_id,
              fuel_type: fuel.fuel_type,
              price: fuel.price,
              price_last_updated: fuel.price_last_updated,
              price_change_effective_timestamp: fuel.price_change_effective_timestamp,
            };
            saveFuelPrice("syncFuelPrices", fuelPrice);
          }
        }
      });
      transaction();
      // Update sync status
      await saveSyncStatus("syncFuelPrices", "fuel_prices", batchNumber);
      // Update metadata
      saveTotalFuelPrices("syncFuelPrices");
      // Done
      console.log(
        `${logTime("syncFuelPrices")} Synced fuel_prices data to database from batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
      // Slow your row on API calls
      await sleep(5000, true, "to slow API call rate");
    }
    console.log(`${logTime("syncFuelPrices")} Sync fuel_prices completed`);
  } catch (error) {
    console.error(`${logTime("syncFuelPrices")} Error:`, error.message);
  }
}

// ################################################################################################
