// ################################################################################################

// Imports
// none

// ################################################################################################

function getScriptFileName() {
  const err = new Error();
  Error.prepareStackTrace = (_, stack) => stack;
  const { stack } = err;
  Error.prepareStackTrace = undefined;
  return stack[2].getFileName().replace(/^.*[\\\/]/, "");
}

export default function logTime(id = false, showScriptFile = false) {
  const newDate = new Date();
  return `[${newDate.toISOString().replace(/T/, " ").replace(/\..+/, "")}]${id ? `[${id}]` : ""}${showScriptFile ? `[${getScriptFileName()}]` : ""}`;
}

// ################################################################################################
