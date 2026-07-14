// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import formatFuelFinderTimestamp from "./format_timestamp.js";
import requestStations from "./request_stations.js";
import db from "../database/database.js";
import { saveStation } from "../models/stations.js";
import { saveTotalStations } from "../models/metadata.js";
import { getSyncStatusForTable, saveSyncStatus } from "../models/sync_status.js";
import { saveAmenityForStation } from "../models/amenities.js";
import { saveFuelTypeForStation } from "../models/fuel_types.js";
import { saveOpeningTimeForStation } from "../models/opening_times.js";

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
      // Update stations
      const transaction = db.transaction(() => {
        for (const station of stations) {
          // Save station
          saveStation("syncStations", station);
          // Save station amenities
          for (const amenity of station.amenities) {
            saveAmenityForStation("syncStations", { node_id: station.node_id, amenity: amenity });
          }
          // Save station usual opening times
          for (const usualDay of Object.entries(station.opening_times.usual_days)) {
            saveOpeningTimeForStation("syncStations", {
              node_id: station.node_id,
              day_name: usualDay[0],
              holiday_type: null,
              opens: usualDay[1].open,
              closes: usualDay[1].close,
              is_24_hours: usualDay[1].is_24_hours,
            });
          }
          // Save station bank holiday opening times
          saveOpeningTimeForStation("syncStations", {
            node_id: station.node_id,
            day_name: "bank_holiday",
            holiday_type: station.opening_times.bank_holiday.type,
            opens: station.opening_times.bank_holiday.open_time,
            closes: station.opening_times.bank_holiday.close_time,
            is_24_hours: station.opening_times.bank_holiday.is_24_hours,
          });
          // Save station fuel types
          for (const fuelType of station.fuel_types) {
            saveFuelTypeForStation("syncStations", { node_id: station.node_id, fuel_type: fuelType });
          }
        }
      });
      transaction();
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
