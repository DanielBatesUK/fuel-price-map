// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import db from "../database/database.js";

// ################################################################################################

export async function getSchemaVersion(reqId) {
  try {
    console.log(`${logTime(reqId)} Database 'metadata' data requested for 'schema_version'...`);

    // Select sync status
    console.log(`${logTime(reqId)} Querying 'metadata' where name:'schema_version'...`);
    const sqlResults = db
      .prepare(
        `
        SELECT
          *
        FROM
          metadata
        WHERE
          name='schema_version';
      `,
      )
      .get();
    console.log(
      `${logTime(reqId)} Query returned ${sqlResults.length} row(s) from 'metadata' where name:'schema_version'...`,
    );
    // Return results
    return { data: sqlResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function saveTotalStations(reqId) {
  try {
    console.log(`${logTime(reqId)} Database 'metadata' insert/update requested for name:'total_stations'...`);
    // Add or Update
    db.exec(
      `
        INSERT INTO
          metadata (name, value)
        SELECT
          'total_stations',
          COUNT(*)
        FROM
          stations
        WHERE
          true
        ON CONFLICT(name) DO UPDATE SET
          value = excluded.value;
      `,
    );
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export async function saveTotalFuelPrices(reqId) {
  try {
    console.log(`${logTime(reqId)} Database 'metadata' insert/update requested for name:'total_fuel_prices'...`);
    // Add or Update
    db.exec(
      `
        INSERT INTO
          metadata (name, value)
        SELECT
          'total_fuel_prices',
          COUNT(*)
        FROM
          fuel_prices
        WHERE
          true
        ON CONFLICT(name) DO UPDATE SET
          value = excluded.value;
      `,
    );
  } catch (error) {
    console.error(`${logTime(reqId)} Database query error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
