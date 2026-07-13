// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import formatFuelFinderTimestamp from "./format_timestamp.js";
import requestStations from "./request_stations.js";
import { saveStation } from "../models/stations.js";
import { saveTotalStations } from "../models/metadata.js";
import { getSyncStatusForTable, saveSyncStatus } from "../models/sync_status.js";

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
    while (true) {
      // Next batch number
      batchNumber += 1;
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
      for (const station of stations) {
        await saveStation("syncStations", station);
      }
      // Update sync status
      await saveSyncStatus("syncStations", "stations", batchNumber);
      // Update metadata
      saveTotalStations("syncStations");
      //Done
      console.log(
        `${logTime("syncStations")} Synced stations data to database from batch-number:'${batchNumber}' timestamp:'${timestamp}'...`,
      );
      // Slow your row on API calls
      await sleep(5000, true, "to slow API call rate");
    }
    console.log(`${logTime("syncStations")} Sync stations completed`);
  } catch (error) {
    console.error(`${logTime("syncStations")} Error:`, error);
  }
}
