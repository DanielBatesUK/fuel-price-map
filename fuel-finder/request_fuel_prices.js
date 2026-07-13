// ################################################################################################

// My Imports
import apiRequest from "./api_request.js";

// ################################################################################################

export default function requestFuelPrices(batchNumber = 1, timestamp = null) {
  const url = `https://www.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices`;
  return apiRequest(url, batchNumber, timestamp);
}

// ################################################################################################
