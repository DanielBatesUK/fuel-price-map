// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function saveAmenityForStation(reqId, amenity) {
  try {
    console.log(
      `${logTime(reqId)} Database 'amenities' insert/update requested for node_id:'${amenity.node_id}' and amenity:'${amenity.amenity}'...`,
    );
    // Add or Update Station
    db.prepare(
      `
        INSERT INTO amenities (
            node_id,
            amenity
        )
        VALUES (?, ?)
        ON CONFLICT(node_id, amenity) DO UPDATE SET
            amenity = excluded.amenity
    `,
    ).run(amenity.node_id, amenity.amenity);
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
