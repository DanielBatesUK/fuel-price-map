// ################################################################################################

// My Imports
import logTime from "./log_time.js";
import httpRequest from "./http_request.js";
import getToken from "./api_access_token.js";

// ################################################################################################

export default async function apiStations(batchNumber = 1, timeStamp = null) {
  try {
    const accessToken = await getToken();
    const options = {
      throwHttpErrors: false,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      searchParams: {
        "batch-number": batchNumber,
        ...(timeStamp !== null && {
          "effective-start-timestamp": timeStamp,
        }),
      },
    };
    var response = await httpRequest(
      `https://www.fuel-finder.service.gov.uk/api/v1/pfs`,
      options,
      "apiStations",
      [200, 404],
    );
    return response;
  } catch (error) {
    console.error(`${logTime("apiStations")} Error:`, error);
  }
}

// ################################################################################################
