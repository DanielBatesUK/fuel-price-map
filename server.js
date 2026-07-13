// ################################################################################################

// Fuel Price Map - A simple node.js project using the UK government's
// Fuel Finder API.
// Copyright (C) 2026  Daniel Bates

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// ################################################################################################

// Imports
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { v4 as uuidV4 } from "uuid";

// My Imports
import logTime from "./utils/log_time.js";
import syncStations from "./fuel-finder/sync_stations.js";
import syncFuelPrices from "./fuel-finder/sync_fuel_prices.js";
import databaseInitialised from "./database/initialised.js";
import databaseBuild from "./database/build.js";
import databaseSchemaVersion from "./database/schema_version.js";
import databaseMigrate from "./database/migrate.js";
import parseBoolean from "./utils/parse_boolean.js";

// ################################################################################################

// Routes
import routeIndex from "./routes/index.js";
import routeAPI from "./routes/api.js";

// ################################################################################################

// Starting
console.log(`${logTime()} Server Starting`);
if (process.DEBUGPORT) console.log(`${logTime()} Debug on port ${process.DEBUGPORT}`);

// ################################################################################################

// Database check
let dbInit;
try {
  console.log(`${logTime("databaseCheck")} Checking database...`);
  dbInit = await databaseInitialised();
  console.log(`${logTime("databaseCheck")} Database initialised: ${dbInit}`);
  if (!dbInit) {
    console.log(`${logTime("databaseCheck")} Running database build...`);
    await databaseBuild();
  }
} catch (error) {
  console.error(`${logTime("databaseCheck")} Error:`, error);
  process.exit(1);
}

// ################################################################################################

// Database schema version
const DATABASE_SCHEMA_VERSION = 2;
const currentSchemaVersion = await databaseSchemaVersion();
// Check database schema version used
if (currentSchemaVersion < DATABASE_SCHEMA_VERSION) {
  // Migrate database to new version
  await databaseMigrate(currentSchemaVersion);
}

// ################################################################################################

// Incrementally sync stations and fuel_prices tables
const apiCalls = process.env.FUEL_FINDER_API_CALLS || "true";
if (parseBoolean(apiCalls)) {
  // Stations
  const syncStationsInterval = 1 * 60 * 60 * 1000; // 1hr
  setInterval(syncStations, syncStationsInterval);
  syncStations();
  // Fuel prices (delayed to avoid api conflict with stations)
  const syncFuelPricesInterval = 15 * 60 * 1000; // 15mins
  const syncFuelPricesDelay = 7.5 * 60 * 1000; // 7.5mins
  setTimeout(() => {
    setInterval(syncFuelPrices, syncFuelPricesInterval);
    syncFuelPrices();
  }, syncFuelPricesDelay);
} else {
  console.log(`${logTime()} Fuel Finder Public API calls disabled`);
}

// ################################################################################################

// Express
const app = express();
app.enable("trust proxy");
app.use(cookieParser(process.env.FUEL_PRICE_MAP_SESSION_SECRET));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(express.static("./public"));
app.set("view engine", "pug");
app.use(
  session({
    secret: process.env.FUEL_PRICE_MAP_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// ################################################################################################

// HTTP requests all
app.all("*all", (req, res, next) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const originalUrl = `${protocol}://${host}${req.originalUrl}`;
  req.reqId = uuidV4();
  req.reqOriginalUrl = originalUrl;
  req.reqOriginalUrlNoQuery = originalUrl.split("?").shift();
  console.log(`${logTime(req.reqId)} Received HTTP ${req.method} request for '${originalUrl}'`);
  next();
});

// HTTP routes
app.get("/", routeIndex);

// API Endpoints
app.use("/api", routeAPI);

// ################################################################################################

// Listen for HTTP requests
const port = process.env.FUEL_PRICE_MAP_PORT || 3000;
app.listen(port, () => {
  console.log(`${logTime()} HTTP server started and listening to port ${port}`);
});

// ################################################################################################
