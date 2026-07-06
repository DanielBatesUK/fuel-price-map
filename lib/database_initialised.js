// ################################################################################################

// Imports
import db from "./database.js";

// ################################################################################################

export default function databaseInitialised() {
  try {
    const result = db.prepare("SELECT COUNT(*) AS count FROM sync_status").get();
    return result.count === 2;
  } catch (error) {
    if (error.message.includes("no such table")) {
      return false;
    }
    throw error;
  }
}

// ################################################################################################
