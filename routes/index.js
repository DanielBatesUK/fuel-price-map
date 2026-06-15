// ################################################################################################

// Imports
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// My Imports
import logTime from "../lib/log_time.js";

// ################################################################################################

// Express
const router = express.Router();

// Route file name
const routeFilename = path.basename(fileURLToPath(import.meta.url), path.extname(fileURLToPath(import.meta.url)));

// ################################################################################################

// GET Request
router.get("/", (req, res) => {
  try {
    console.log(`${logTime(req.reqId)} Processing HTTP ${req.method} request with route '${routeFilename}'...`);
    res.status(200).render(routeFilename);
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
