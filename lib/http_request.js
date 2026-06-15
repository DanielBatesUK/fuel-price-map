// ################################################################################################

// Imports
import got from "got";

// My imports
import logTime from "./log_time.js";

// ################################################################################################

// HTTP requests
export default async function httpRequest(options, reqId = "http-request", expectStatusCode = 200) {
  try {
    // HTTP request for data
    console.log(`${logTime(reqId)} HTTP ${options.method} request sent to '${options.url}'`);

    // HTTP request
    const response = await got(options);

    // Validate response code
    if (expectStatusCode.toString().indexOf(response.statusCode.toString()) !== -1) {
      // Response good
      console.log(
        `${logTime(reqId)} HTTP ${options.method} response received from '${options.url}' with status code '${response.statusCode}'`,
      );
      return response;
    }
    // Response bad
    console.error(`${logTime(reqId)} HTTP ${options.method} request failed...`, response.body.trim());
    throw Error(`Status code expected:'${expectStatusCode}': Status code received:'${response.statusCode}'`);
  } catch (error) {
    // Error
    throw new Error(`HTTP ${options.method} request error... ${error.message}`);
  }
}

// ################################################################################################
