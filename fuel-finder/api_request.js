// ################################################################################################

// My Imports
import logTime from "../utils/log_time.js";
import httpRequest from "../utils/http_request.js";
import getToken from "./auth.js";

// ################################################################################################

export default async function apiRequest(url, batchNumber, timestamp) {
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
        ...(timestamp !== null && {
          "effective-start-timestamp": timestamp,
        }),
      },
    };
    // Http request
    let response = await httpRequest(url, options, "apiFuelFinderRequest", [200, 404, 403]);
    // Access token rejected
    if (response.statusCode === 403) {
      console.warn(`${logTime("apiFuelFinderRequest")} Access token rejected, attempting to regenerate...`);
      accessToken = await getToken(true);
      // Try again
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
