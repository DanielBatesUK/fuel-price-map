// ################################################################################################

// My Imports
import logTime from "./log_time.js";
import sleep from "./sleep.js";
import apiStations from "./api_stations.js";
import apiPrices from "./api_prices.js";
import saveStation from "../models/save_station.js";
import saveFuelPrice from "../models/save_fuel_price.js";
import saveSyncStatus from "../models/save_sync_status.js";
import getSyncStatus from "../models/get_sync_status.js";
import formatFuelFinderTimestamp from "./format_fuel_finder_timestamp.js";

// ################################################################################################

export default async function updateFuelPrices() {
  try {
    console.log(`${logTime("updateFuelPrices")} Updating fuel_prices table...`);
    var batchNumber = 0;
    // 5mins previous to latest update
    const syncStatusResults = (await getSyncStatus("updateFuelPrices", "fuel_prices")).data[0];
    const syncDate = new Date(syncStatusResults.last_updated.replace(" ", "T") + "Z");
    syncDate.setSeconds(syncDate.getSeconds() - 300);
    const apiTimestamp = formatFuelFinderTimestamp(syncDate);
    while (true) {
      // Next batch number
      batchNumber += 1;
      // API request
      console.log(
        `${logTime("updateFuelPrices")} Sending request to fuel prices api for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
      );
      const results = await apiPrices(batchNumber, apiTimestamp);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(
          `${logTime("updateFuelPrices")} No fuel price data found for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
        );
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(
          `${logTime("updateFuelPrices")} Fuel price data empty for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
        );
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
      // Done
      console.log(
        `${logTime("updateFuelPrices")} Updating fuel_prices table with data from batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
      );
      // Slow your row on API calls
      await sleep(5000, true);
    }
    console.log(`${logTime("updateFuelPrices")} Updating fuel_prices completed`);
  } catch (error) {
    console.error(`${logTime("updateFuelPrices")} Error:`, error.message);
  }
}

// ################################################################################################
