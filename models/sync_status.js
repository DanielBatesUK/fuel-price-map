// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function getSyncStatusForTable(reqId, tableName) {
  try {
    console.log(`${logTime(reqId)} Database 'sync_status' data request...`);

    // Select sync status
    console.log(`${logTime(reqId)} Querying 'sync_status' where name:'${tableName}'...`);
    const sqlResults = db
      .prepare(
        `
          SELECT
            name,
            last_updated
          FROM
            sync_status
          WHERE
            name = ?
        `,
      )
      .all(tableName);
    console.log(
      `${logTime(reqId)} Query returned ${sqlResults.length} rows(s) from 'sync_status' where name:'${tableName}'...`,
    );
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function getSyncStatusCountRows(reqId) {
  try {
    console.log(`${logTime(reqId)} Database 'sync_status' count rows request...`);

    // Select sync status
    console.log(`${logTime(reqId)} Querying 'sync_status' as count rows...`);
    const sqlResults = db
      .prepare(
        `SELECT
          COUNT(*) AS count
        FROM
          sync_status
      `,
      )
      .get();
    console.log(`${logTime(reqId)} Query returned '${sqlResults.count}' row(s) from 'sync_status' as count rows...`);
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function saveSyncStatus(reqId, tableName, batchNumber) {
  try {
    console.log(`${logTime(reqId)} Database 'sync_status' insert/update requested for name:'${tableName}'...`);
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
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
