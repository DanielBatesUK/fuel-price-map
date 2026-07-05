// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function saveSyncStatus(tableName, batchNumber) {
  try {
    console.log(`${logTime("saveSyncStatus")} Database 'sync_status' request for '${tableName}'...`);
    // Add or Update
    db.prepare(
      `
        INSERT INTO sync_status (
            name,
            last_updated,
            last_batch
        )
        VALUES (?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(name) DO UPDATE SET
            last_updated = excluded.last_updated,
            last_batch = excluded.last_batch
    `,
    ).run(tableName, batchNumber);
  } catch (error) {
    return Promise.reject(new Error(error));
  }
}

// ################################################################################################
