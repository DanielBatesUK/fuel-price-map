// ################################################################################################

// Imports
// none

// ################################################################################################

export default function sleep(ms, logOutput = false, reason = "") {
  if (logOutput) console.log(`Zzzzz for ${ms} milliseconds${reason !== "" ? ` ${reason}` : ""}...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ################################################################################################
