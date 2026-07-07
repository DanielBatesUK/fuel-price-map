// ################################################################################################

// My Imports
import logTime from "./log_time.js";
import httpRequest from "./http_request.js";

// ################################################################################################

// Tokens
var accessToken = { token: null, expires: null };
var refreshToken = { token: null, expires: null };
let tokenPromise = null;

// Expiry time
function expiry(milliseconds) {
  return Date.now() + Number(milliseconds) * 1000 - 300000;
}

// ################################################################################################

export default async function getToken(forceGenerate = false) {
  const now = Date.now();

  // Return access token
  if (accessToken.token && accessToken.expires > now && !forceGenerate) {
    console.log(`${logTime("getToken")} Using cached access token`);
    return accessToken.token;
  }

  // Wait for previous request for token
  if (tokenPromise) {
    console.log(`${logTime("getToken")} Waiting for another request to obtain a token...`);
    await tokenPromise;
    return accessToken.token;
  }

  // Refresh access token
  if (refreshToken.token && refreshToken.expires > now && !forceGenerate) {
    console.log(`${logTime("getToken")} Refreshing access token...`);
    tokenPromise = regenerateToken();
  } else {
    // Generate new access and refresh tokens
    console.log(`${logTime("getToken")} Generating new access and refresh tokens...`);
    tokenPromise = generateToken();
  }

  // Return access token
  try {
    await tokenPromise;
    return accessToken.token;
  } finally {
    tokenPromise = null;
  }
}

// ################################################################################################

// Get new access token
async function generateToken() {
  console.log(`${logTime("generateToken")} Generating OAuth access token...`);
  try {
    const options = {
      throwHttpErrors: false,
      method: "POST",
      json: {
        client_id: process.env.FUEL_FINDER_API_CLIENT_ID,
        client_secret: process.env.FUEL_FINDER_API_CLIENT_SECRET,
      },
    };
    const response = await httpRequest(
      `https://www.fuel-finder.service.gov.uk/api/v1/oauth/generate_access_token`,
      options,
      "generateToken",
      200,
    );
    console.log(`${logTime("generateToken")} Access and refresh tokens generated`);
    const data = JSON.parse(response.body).data;
    // Set access token
    accessToken.token = data.access_token;
    accessToken.expires = expiry(data.expires_in);
    // Set refresh token
    refreshToken.token = data.refresh_token;
    refreshToken.expires = expiry(data.refresh_token_expires_in);
  } catch (error) {
    console.error(`${logTime("generateToken")} Error:`, error);
  }
}

// ################################################################################################

// Refresh access token
async function regenerateToken() {
  console.log(`${logTime("regenerateToken")} Regenerating OAuth access token using refresh token...`);
  try {
    const options = {
      throwHttpErrors: false,
      method: "POST",
      json: {
        client_id: process.env.FUEL_FINDER_API_CLIENT_ID,
        refresh_token: refreshToken.token,
      },
    };
    const response = await httpRequest(
      `https://www.fuel-finder.service.gov.uk/api/v1/oauth/regenerate_access_token`,
      options,
      "regenerateToken",
      200,
    );
    const data = JSON.parse(response.body).data;
    // Set refreshed access token
    console.log(`${logTime("regenerateToken")} Access token refreshed`);
    accessToken.token = data.access_token;
    accessToken.expires = expiry(data.expires_in);
  } catch (error) {
    console.error(`${logTime("regenerateToken")} Error:`, error);
  }
}
