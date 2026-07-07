// ################################################################################################

// My Imports
import logTime from "./log_time.js";
import httpRequest from "./http_request.js";
import getToken from "./api_access_token.js";

// ################################################################################################

export default async function apiFuelFinderRequest(url, batchNumber = 1, timeStamp = null) {
  try {
    // Get access token
    let accessToken = await getToken();
    // API call options
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
    // Http request
    let response = await httpRequest(url, options, "apiFuelFinderRequest", [200, 404, 403]);
    // Access token rejected
    if (response.statusCode === 403) {
      console.warn(`${logTime("apiFuelFinderRequest")} Access token rejected, regenerating...`);
      accessToken = await getToken(true);
      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await httpRequest(url, options, "apiFuelFinderRequest", [200, 404]);
    }
    // Done
    return response;
  } catch (error) {
    console.error(`${logTime("apiFuelFinderRequest")} Error:`, error);
  }
}

// ################################################################################################
