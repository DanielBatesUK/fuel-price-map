// ################################################################################################

// Imports
import Database from "better-sqlite3";
import logTime from "../utils/log_time.js";

// ################################################################################################

const db = new Database(process.env.FUEL_PRICE_MAP_DATABASE_PATH);
console.log(
  `${logTime("database")} Database connected - SQLite:`,
  db.prepare("SELECT sqlite_version() AS version").get(),
);

// ################################################################################################

export default db;
