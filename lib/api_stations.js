// ################################################################################################

// My Imports
import logTime from "./log_time.js";
import httpRequest from "./http_request.js";
import getToken from "./api_access_token.js";
import apiFuelFinderRequest from "./api_fuel_finder_request.js";

// ################################################################################################

export default function apiPrices(batchNumber = 1, timeStamp = null) {
  const url = `https://www.fuel-finder.service.gov.uk/api/v1/pfs`;
  return apiFuelFinderRequest(url, batchNumber, timestamp);
}

// ################################################################################################
