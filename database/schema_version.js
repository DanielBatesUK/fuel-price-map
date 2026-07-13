// ################################################################################################

// My Imports
import { getSchemaVersion } from "../models/metadata.js";

// ################################################################################################

export default async function databaseSchemaVersion() {
  try {
    const schemaVersion = await getSchemaVersion("databaseSchemaVersion");
    return Number(schemaVersion.data.value);
  } catch (error) {
    if (error.message.includes("no such table")) {
      return 1;
    }
    throw error;
  }
}

// ################################################################################################
