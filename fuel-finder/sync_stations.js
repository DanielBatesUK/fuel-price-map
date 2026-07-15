// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import formatFuelFinderTimestamp from "./format_timestamp.js";
import requestStations from "./request_stations.js";
import { getSyncStatusForTable } from "../models/sync_status.js";
import transactionStationsBatch from "../database/transactions/stations_batch.js";

// ################################################################################################

export default async function syncStations(fullSync = false) {
  try {
    console.log(`${logTime("syncStations")} Syncing stations data...`);
    let batchNumber = 0;
    let timestamp = null;
    if (!fullSync) {
      // 5mins previous to latest update
      const syncStatusResults = (await getSyncStatusForTable("syncStations", "stations")).data[0];
      const syncDate = new Date(syncStatusResults.last_updated.replace(" ", "T") + "Z");
      syncDate.setSeconds(syncDate.getSeconds() - 300);
      timestamp = formatFuelFinderTimestamp(syncDate);
    }
    // Collect api data
    while (true) {
      // Next batch number
      batchNumber += 1;
      // Slow your row on API calls
      await sleep("syncStations", 5000, true, "Slowing API call rate");
      // API request
      console.log(
        `${logTime("syncStations")} Sending request to stations api for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
      const results = await requestStations(batchNumber, timestamp);
      // Add response to database
      if (results.statusCode === 404) {
        console.log(
          `${logTime("syncStations")} No stations data found for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
        );
        break;
      }
      const stations = JSON.parse(results.body);
      if (stations.length === 0) {
        console.log(
          `${logTime("syncStations")} Stations data empty for batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
        );
        break;
      }
      // Save batch via database transaction
      transactionStationsBatch(stations, batchNumber);
      //Done
      console.log(
        `${logTime("syncStations")} Synced stations data to database from batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
    }
    console.log(`${logTime("syncStations")} Sync stations completed`);
  } catch (error) {
    console.error(`${logTime("syncStations")} Error:`, error);
  }
}
