// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function saveStation(station) {
  try {
    console.log(`${logTime("saveStation")} Database 'saveStation' request for '${station.node_id}'...`);
    // Add or Update Station
    db.prepare(
      `
        INSERT INTO stations (
            node_id,
            trading_name,
            brand_name,
            address_line_1,
            city,
            postcode,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ? ,?)
        ON CONFLICT(node_id) DO UPDATE SET
            trading_name = excluded.trading_name,
            brand_name = excluded.brand_name,
            address_line_1 = excluded.address_line_1,
            city = excluded.city,
            postcode = excluded.postcode,
            latitude = excluded.latitude,
            longitude = excluded.longitude
    `,
    ).run(
      station.node_id,
      station.trading_name,
      station.brand_name,
      station.location.address_line_1,
      station.location.city,
      station.location.postcode,
      station.location.latitude,
      station.location.longitude,
    );
  } catch (error) {
    return Promise.reject(new Error(error));
  }
}

// ################################################################################################
