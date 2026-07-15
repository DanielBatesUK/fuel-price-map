// ################################################################################################

// My Imports
import logTime from "./log_time.js";

// ################################################################################################

export default function sleep(reqId, ms, logOutput = false, reason = "") {
  if (logOutput) console.log(`${logTime(reqId)} Zzzzz for ${ms} milliseconds${reason !== "" ? `: ${reason}` : ""}...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ################################################################################################
