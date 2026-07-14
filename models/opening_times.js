// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function saveOpeningTimeForStation(reqId, openingTime) {
  try {
    console.log(
      `${logTime(reqId)} Database 'opening_times' insert/update requested for node_id:'${openingTime.node_id}' and day_name:'${openingTime.day_name}'...`,
    );
    // Add or Update Station
    db.prepare(
      `
        INSERT INTO opening_times (
            node_id,
            day_name,
            holiday_type,
            opens,
            closes,
            is_24_hours
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(node_id, day_name) DO UPDATE SET
            day_name = excluded.day_name,
            holiday_type = excluded.holiday_type,
            opens = excluded.opens,
            closes = excluded.closes,
            is_24_hours = excluded.is_24_hours
    `,
    ).run(
      openingTime.node_id,
      openingTime.day_name,
      openingTime.holiday_type,
      openingTime.opens,
      openingTime.closes,
      Number(openingTime.is_24_hours),
    );
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
