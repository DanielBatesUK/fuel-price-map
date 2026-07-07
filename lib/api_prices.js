// ################################################################################################

// My Imports
import apiFuelFinderRequest from "./api_fuel_finder_request.js";

// ################################################################################################

export default function apiPrices(batchNumber = 1, timeStamp = null) {
  const url = `https://www.fuel-finder.service.gov.uk/api/v1/pfs/fuel-prices`;
  return apiFuelFinderRequest(url, batchNumber, timeStamp);
}

// ################################################################################################
