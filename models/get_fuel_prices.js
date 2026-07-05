// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function getFuelPrices(reqId, node_id) {
  try {
    console.log(`${logTime(reqId)} Database 'prices' data SELECT request...`);
    // Select prices for stations
    console.log(`${logTime(reqId)} Querying database for fuel prices for '${node_id}'...`);
    const fuelTypeResults = db.prepare(`SELECT * FROM fuel_prices WHERE node_id=?`).all(node_id);
    console.log(`${logTime(reqId)} Query returned data for ${fuelTypeResults.length} fuel type(s)...`);
    fuelTypeResults.fuel_prices = fuelTypeResults.map((fuel) => ({
      fuel_type: fuel.fuel_type,
      price: fuel.price,
    }));
    // Return results
    return { data: fuelTypeResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database SELECT error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
