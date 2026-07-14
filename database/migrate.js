// ################################################################################################

// Imports
import fs from "fs";
import path from "path";

//My imports
import logTime from "../utils/log_time.js";
import db from "./database.js";
import syncStations from "../fuel-finder/sync_stations.js";
import syncFuelPrices from "../fuel-finder/sync_fuel_prices.js";

// ################################################################################################

const migrations = [
  { version: 1, file: "001_initial.sql", resync: true },
  { version: 2, file: "002_metadata_table.sql", resync: false },
  { version: 3, file: "003_full_station_data.sql", resync: true },
];

export default async function databaseMigrate(currentVersion) {
  try {
    for (const migration of migrations) {
      if (migration.version <= currentVersion) continue;
      // Database migration
      console.log(`${logTime("databaseMigrate")} Applying schema v${migration.version}...`);
      const sql = fs.readFileSync(path.join("database", "migrations", migration.file), "utf8");
      const results = db.exec(sql);
      console.log(`${logTime("databaseMigrate")} SQL results:`, results);
      // Resync database
      if (migration.resync) {
        console.log(`${logTime("databaseMigrate")} Schema v${migration.version} requires resync...`);
        await syncStations(true);
        await syncFuelPrices(true);
      }
      console.log(`${logTime("databaseMigrate")} Schema v${migration.version} successfully applied`);
    }
  } catch (error) {
    console.error(`${logTime("databaseMigrate")} Database migration error...`, error.message);

    return Promise.reject(new Error(error.message));
  }
}

// ################################################################################################
