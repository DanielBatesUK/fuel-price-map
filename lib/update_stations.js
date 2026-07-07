// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import sleep from "../lib/sleep.js";
import apiStations from "../lib/api_stations.js";
import apiPrices from "../lib/api_prices.js";
import saveStation from "../models/save_station.js";
import saveFuelPrice from "../models/save_fuel_price.js";
import saveSyncStatus from "../models/save_sync_status.js";
import getSyncStatus from "../models/get_sync_status.js";
import formatFuelFinderTimestamp from "./format_fuel_finder_timestamp.js";

// ################################################################################################

export default async function updateStations() {
  try {
    console.log(`${logTime("updateStations")} Updating stations database table...`);
    var batchNumber = 0;
    // 5mins previous to latest update
    const syncStatusResults = (await getSyncStatus("updateStations", "stations")).data[0];
    const syncDate = new Date(syncStatusResults.last_updated.replace(" ", "T") + "Z");
    syncDate.setSeconds(syncDate.getSeconds() - 300);
    const apiTimestamp = formatFuelFinderTimestamp(syncDate);
    while (true) {
      // Next batch number
      batchNumber += 1;
      // API request
      console.log(
        `${logTime("updateStations")} Sending request to stations api for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
      );
      const results = await apiStations(batchNumber, apiTimestamp);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(
          `${logTime("updateStations")} No stations data found for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
        );
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(
          `${logTime("updateStations")} Stations data empty for batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
        );
        break;
      }
      for (const station of stations) {
        await saveStation(station);
      }
      // Update sync status
      await saveSyncStatus("stations", batchNumber);
      //Done
      console.log(
        `${logTime("updateStations")} Updated stations table with data from batch-number:'${batchNumber}' timestamp:'${apiTimestamp}'...`,
      );
      // Slow your row on API calls
      await sleep(5000, true);
    }
    console.log(`${logTime("updateStations")} Updating stations completed`);
  } catch (error) {
    console.error(`${logTime("updateStations")} Error:`, error);
  }
}
