// ################################################################################################

// My Imports
import db from "../database.js";
import { saveStation } from "../../models/stations.js";
import { saveTotalStations } from "../../models/metadata.js";
import { saveSyncStatus } from "../../models/sync_status.js";
import { saveAmenityForStation } from "../../models/amenities.js";
import { saveFuelTypeForStation } from "../../models/fuel_types.js";
import { saveOpeningTimeForStation } from "../../models/opening_times.js";

// ################################################################################################

const transactionStationsBatch = db.transaction((stations, batchNumber) => {
  // Update stations
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
  // Update sync status
  saveSyncStatus("syncStations", "stations", batchNumber);
  // Update metadata
  saveTotalStations("syncStations");
});

// ################################################################################################

export default transactionStationsBatch;
