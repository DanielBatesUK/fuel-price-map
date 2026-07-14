// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function saveFuelTypeForStation(reqId, fuelType) {
  try {
    console.log(
      `${logTime(reqId)} Database 'fuel_types' insert/update requested for node_id:'${fuelType.node_id}' and fuel_type:'${fuelType.fuel_type}'...`,
    );
    // Add or Update Station
    db.prepare(
      `
        INSERT INTO fuel_types (
            node_id,
            fuel_type
        )
        VALUES (?, ?)
        ON CONFLICT(node_id, fuel_type) DO UPDATE SET
            fuel_type = excluded.fuel_type
    `,
    ).run(fuelType.node_id, fuelType.fuel_type);
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
