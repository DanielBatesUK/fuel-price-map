// ################################################################################################

// My Imports
import apiRequest from "./api_request.js";

// ################################################################################################

export default function requestStations(batchNumber = 1, timestamp = null) {
  const url = `https://www.fuel-finder.service.gov.uk/api/v1/pfs`;
  return apiRequest(url, batchNumber, timestamp);
}

// ################################################################################################
