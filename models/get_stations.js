// ################################################################################################

// My Imports
import logTime from "../lib/log_time.js";
import db from "../lib/database.js";

// ################################################################################################

export default async function getStations(reqId, north, east, south, west) {
  try {
    console.log(`${logTime(reqId)} Database 'stations' data SELECT request...`);

    // Select stations
    console.log(`${logTime(reqId)} Querying database for stations...`);
    const stationsResults = db
      .prepare(`SELECT * FROM stations WHERE latitude <= ? AND latitude >= ? AND longitude <= ? AND longitude >= ?`)
      .all(north, south, east, west);
    console.log(`${logTime(reqId)} Query returned data for ${stationsResults.length} station(s)...`);
    // Return results
    return { data: stationsResults };
  } catch (error) {
    console.error(`${logTime(reqId)} Database SELECT error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
