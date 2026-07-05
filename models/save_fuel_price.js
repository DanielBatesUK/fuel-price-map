// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function saveFuelPrice(price) {
  try {
    console.log(
      `${logTime("saveFuelPrice")} Database 'saveFuelPrice' request for type '${price.fuel_type}' for '${price.node_id}'...`,
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
    return Promise.reject(new Error(error));
  }
}

// ################################################################################################
