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
            public_phone_number,
            trading_name,
            is_same_trading_and_brand_name,
            brand_name,
            temporary_closure,
            permanent_closure,
            permanent_closure_date,
            is_motorway_service_station,
            is_supermarket_service_station,
            address_line_1,
            address_line_2,
            city,
            county,
            postcode,
            country,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(node_id) DO UPDATE SET
            public_phone_number = excluded.public_phone_number,
            trading_name = excluded.trading_name,
            is_same_trading_and_brand_name = excluded.is_same_trading_and_brand_name,
            brand_name = excluded.brand_name,
            temporary_closure = excluded.temporary_closure,
            permanent_closure = excluded.permanent_closure,
            permanent_closure_date = excluded.permanent_closure_date,
            is_motorway_service_station = excluded.is_motorway_service_station,
            is_supermarket_service_station = excluded.is_supermarket_service_station,
            address_line_1 = excluded.address_line_1,
            address_line_2 = excluded.address_line_2,
            city = excluded.city,
            county = excluded.county,
            postcode = excluded.postcode,
            country = excluded.country,
            latitude = excluded.latitude,
            longitude = excluded.longitude
    `,
    ).run(
      station.node_id,
      station.public_phone_number,
      station.trading_name,
      Number(station.is_same_trading_and_brand_name),
      station.brand_name,
      Number(station.temporary_closure),
      Number(station.permanent_closure),
      station.permanent_closure_date,
      Number(station.is_motorway_service_station),
      Number(station.is_supermarket_service_station),
      station.location.address_line_1,
      station.location.address_line_2,
      station.location.city,
      station.location.county,
      station.location.postcode,
      station.location.country,
      station.location.latitude,
      station.location.longitude,
    );
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
