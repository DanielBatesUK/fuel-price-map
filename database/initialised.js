// ################################################################################################

import getCountRowsInTable from "../models/count_rows.js";
import { getSyncStatusCountRows } from "../models/sync_status.js";

// Imports

// ################################################################################################

export default async function databaseInitialised() {
  try {
    const result = await getSyncStatusCountRows("databaseInitialised");
    return result.data.count === 2;
  } catch (error) {
    if (error.message.includes("no such table")) {
      return false;
    }
    throw error;
  }
}

// ################################################################################################
