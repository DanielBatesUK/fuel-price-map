// ################################################################################################

// Imports
// none

// ################################################################################################

export function capitalizeFirstLetter(str, forceLowerCase = false) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (str.length === 0) return "";
  if (forceLowerCase) str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ################################################################################################

export function capitalizeWords(str, forceLowerCase = false) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  if (forceLowerCase) str.toLowerCase();
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ################################################################################################

export function toUpperCaseAll(str) {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }
  return str.toUpperCase();
}

// ################################################################################################
