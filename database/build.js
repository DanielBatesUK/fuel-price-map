// ################################################################################################

// Imports
import fs from "fs";
import path from "path";

// My Imports
import logTime from "../utils/log_time.js";
import sleep from "../utils/sleep.js";
import db from "./database.js";
import syncStations from "../fuel-finder/sync_stations.js";
import syncFuelPrices from "../fuel-finder/sync_fuel_prices.js";

// ################################################################################################

async function buildSchema() {
  try {
    console.log(`${logTime("buildSchema")} Database schema build request...`);
    const sql = fs.readFileSync(path.join("database", "migrations", "000_build.sql"), "utf8");
    db.exec(sql);
  } catch (error) {
    console.error(`${logTime("buildSchema")} Database build error...`, error.message);
    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################

export default async function databaseBuild() {
  try {
    console.log(`${logTime("databaseBuild")} Database build started...`);
    await buildSchema();
    await syncStations(true);
    await syncFuelPrices(true);
    console.log(`${logTime("databaseBuild")} Database build finished.`);
  } catch (error) {
    console.error(`${logTime("databaseBuild")} Database build error:`, error);
  }
}

// ################################################################################################
