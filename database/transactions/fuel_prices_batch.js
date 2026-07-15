// ################################################################################################

// My Imports
import db from "../database.js";
import { saveFuelPrice } from "../../models/fuel_prices.js";
import { saveTotalFuelPrices } from "../../models/metadata.js";
import { saveSyncStatus } from "../../models/sync_status.js";

// ################################################################################################

const transactionFuelPricesBatch = db.transaction((stations, batchNumber) => {
  // Update fuel_prices
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
  // Update sync status
  saveSyncStatus("syncFuelPrices", "fuel_prices", batchNumber);
  // Update metadata
  saveTotalFuelPrices("syncFuelPrices");
});

// ################################################################################################

export default transactionFuelPricesBatch;
