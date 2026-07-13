// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function getStationsWithinBounds(reqId, north, east, south, west) {
  try {
    console.log(`${logTime(reqId)} Database 'stations' data request...`);
    // Select stations
    console.log(`${logTime(reqId)} Querying 'stations' where within map bounds...`);
    const sqlResults = db
      .prepare(
        `
          SELECT
            node_id,
            brand_name,
            address_line_1,
            city,
            postcode,
            latitude,
            longitude,
            temporary_closure
          FROM
            stations
          WHERE
            latitude <= ?
            AND latitude >= ?
            AND longitude <= ?
            AND longitude >= ?
        `,
      )
      .all(north, south, east, west);
    console.log(
      `${logTime(reqId)} Query returned ${sqlResults.length} row(s) from 'stations' where within map bounds...`,
    );
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function saveStation(reqId, station) {
  try {
    console.log(`${logTime(reqId)} Database 'stations' insert/update requested for node_id:'${station.node_id}'...`);
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
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
