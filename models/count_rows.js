// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export default async function getCountRowsInTable(reqId, tableName) {
  try {
    console.log(`${logTime(reqId)} Database '${tableName}' count rows request...`);

    // Check table names (to help stop possibility injection)
    const tables = db
      .prepare(
        `
        SELECT
          name
        FROM
          sqlite_schema
        WHERE
          type = 'table'
        ORDER BY
          name
      `,
      )
      .all();
    if (!tables.some((table) => table.name === tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    // Count rows
    console.log(`${logTime(reqId)} Querying '${tableName}' as count rows...`);
    const sqlResults = db
      .prepare(
        `
          SELECT
            COUNT(*) AS count
          FROM
            ${tableName}
        `,
      )
      .get();
    console.log(`${logTime(reqId)} Query returned ${sqlResults.count} row(s) from '${tableName}' as count rows...`);
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
