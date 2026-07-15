// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import formatFuelFinderTimestamp from "./format_timestamp.js";
import requestFuelPrices from "./request_fuel_prices.js";
import { getSyncStatusForTable } from "../models/sync_status.js";
import transactionFuelPricesBatch from "../database/transactions/fuel_prices_batch.js";

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
      // Slow your row on API calls
      await sleep("syncFuelPrices", 5000, true, "Slowing API call rate");
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
      // Save batch via database transaction
      transactionFuelPricesBatch(stations, batchNumber);
      // Done
      console.log(
        `${logTime("syncFuelPrices")} Synced fuel_prices data to database from batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
    }
    console.log(`${logTime("syncFuelPrices")} Sync fuel_prices completed`);
  } catch (error) {
    console.error(`${logTime("syncFuelPrices")} Error:`, error.message);
  }
}

// ################################################################################################
