// ################################################################################################

// Imports
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// My Imports
import logTime from "../utils/log_time.js";
import { getStationsWithinBounds } from "../models/stations.js";
import { getFuelPricesForStation } from "../models/fuel_prices.js";

// ################################################################################################

// Express
const router = express.Router();

// Route file name
const routeFilename = path.basename(fileURLToPath(import.meta.url), path.extname(fileURLToPath(import.meta.url)));

// ################################################################################################

// GET Request (Stations)
router.get("/stations", async (req, res) => {
  try {
    console.log(`${logTime(req.reqId)} Processing HTTP ${req.method} request with route '${routeFilename}'...`);
    const { north, east, south, west } = req.query;
    const stationResults = await getStationsWithinBounds(req.reqId, north, east, south, west);
    res.status(200).json(stationResults);
    console.log(`${logTime(req.reqId)} Completed HTTP ${req.method} request with route '${routeFilename}'`);
  } catch (error) {
    console.error(`${logTime(req.reqId)} Route '${routeFilename}' error...`, error.message);
    res.status(500).json({ error: `route ${routeFilename} error`, id: req.reqId });
  }
});

// ################################################################################################

// GET Request (Prices)
router.get("/prices", async (req, res) => {
  try {
    console.log(`${logTime(req.reqId)} Processing HTTP ${req.method} request with route '${routeFilename}'...`);
    const node_id = req.query.node_id;
    const priceResults = await getFuelPricesForStation(req.reqId, node_id);
    res.status(200).json(priceResults);
    console.log(`${logTime(req.reqId)} Completed HTTP ${req.method} request with route '${routeFilename}'`);
  } catch (error) {
    console.error(`${logTime(req.reqId)} Route '${routeFilename}' error...`, error.message);
    res.status(500).json({ error: `route ${routeFilename} error`, id: req.reqId });
  }
});

// ################################################################################################

// Exports
export default router;

// ################################################################################################
