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
import logTime from "./lib/log_time.js";
import updateStations from "./lib/update_stations.js";

// ################################################################################################

// Routes
import routeIndex from "./routes/index.js";
import routeAPI from "./routes/api.js";
import updateFuelPrices from "./lib/update_fuel_prices.js";

// ################################################################################################

// Starting
console.log(`${logTime()} Server Starting`);
if (process.DEBUGPORT) console.log(`${logTime()} Debug on port ${process.DEBUGPORT}`);

// ################################################################################################

// Database updates
// Stations
const stationsUpdateIntervalTime = 1 * 60 * 60 * 1000; // 1hr
setInterval(updateStations, stationsUpdateIntervalTime);
updateStations();
// Fuel prices (delayed to avoid api conflict with stations)
const pricesUpdateIntervalTime = 15 * 60 * 1000; // 15mins
const pricesUpdateDelayTime = 7.5 * 60 * 1000; // 7.5mins
setTimeout(() => {
  setInterval(updateFuelPrices, pricesUpdateIntervalTime);
  updateFuelPrices();
}, pricesUpdateDelayTime);

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
