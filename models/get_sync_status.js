// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function getSyncStatus(reqId, tableName) {
  try {
    console.log(`${logTime(reqId)} Database 'sync_status' data SELECT request...`);

    // Select sync status
    console.log(`${logTime(reqId)} Querying database for sync_status of table:'${tableName}'...`);
    const syncStatusResults = db
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
      `${logTime(reqId)} Query returned sync_status data for ${syncStatusResults.length} table(s) for table:'${tableName}'...`,
    );
    // Return results
    return { data: syncStatusResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database SELECT error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
