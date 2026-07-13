// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function getFuelPricesForStation(reqId, node_id) {
  try {
    console.log(`${logTime(reqId)} Database 'fuel_prices' data requested...`);
    // Select prices for stations
    console.log(`${logTime(reqId)} Querying 'fuel_prices' where node_id:'${node_id}'...`);
    const sqlResults = db
      .prepare(
        `
          SELECT
            node_id,
            fuel_type,
            price
          FROM
            fuel_prices
          WHERE
            node_id = ?
        `,
      )
      .all(node_id);
    console.log(
      `${logTime(reqId)} Query returned ${sqlResults.length} rows(s) from 'fuel_prices' where node_id:'${node_id}'...`,
    );
    sqlResults.fuel_prices = sqlResults.map((fuel) => ({
      fuel_type: fuel.fuel_type,
      price: fuel.price,
    }));
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function saveFuelPrice(reqId, price) {
  try {
    console.log(
      `${logTime(reqId)} Database 'fuel_prices' insert/update requested for node_id:'${price.node_id}' and fuel_type:'${price.fuel_type}'...`,
    );
    // Add or Update fuel price
    db.prepare(
      `
        INSERT INTO fuel_prices (
            node_id,
            fuel_type,
            price,
            price_last_updated,
            price_change_effective_timestamp
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(node_id, fuel_type) DO UPDATE SET
            fuel_type = excluded.fuel_type,
            price = excluded.price,
            price_last_updated = excluded.price_last_updated,
            price_change_effective_timestamp = excluded.price_change_effective_timestamp
    `,
    ).run(
      price.node_id,
      price.fuel_type,
      price.price,
      price.price_last_updated,
      price.price_change_effective_timestamp,
    );
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
