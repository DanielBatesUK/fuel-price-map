# Fuel Price Map ⛽

A lightweight UK-focused fuel station finder built with Node.js, SQLite, and Leaflet.

[https://www.fuelpricemap.co.uk](https://www.fuelpricemap.co.uk)

---

## 🚀 Overview

Fuel Price Map is a simple but powerful web application for locating fuel stations across the UK. It combines a Node.js backend, a SQLite database, and an interactive Leaflet map restricted to UK boundaries for a focused and smooth user experience.

---

## ✨ Features

- 🗺️ Interactive UK-only map (Leaflet + OpenStreetMap)
- ⛽ Fuel station lookup from SQLite database
- 🔒 OAuth2 token management (access + refresh tokens)
- ⚡ Cached token system with request deduplication
- 📍 Map bounded to UK with mobile-friendly padding
- 🧠 Safe SQL queries using parameterised statements
- 🧩 Clean separation of API, services, and frontend

---

## 🧱 Tech Stack

- **Backend:** Node.js (ES Modules)
- **Database:** SQLite (better-sqlite3)
- **Frontend:** Leaflet.js
- **Map Tiles:** OpenStreetMap
- **Auth:** OAuth2-style token flow
- **HTTP Layer:** Custom request wrapper

---

## 🔐 Authentication Flow

Fuel Finder uses an OAuth2-style token system:

- Access tokens are cached in memory
- Refresh tokens are used when available
- Only one token request runs at a time
- Automatic token regeneration on expiry

---

## ⚙️ Setup

You must have a client id and client secret for the UK government's Fuel Finder Public API. For more information [look here](https://www.developer.fuel-finder.service.gov.uk/public-api).

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables required

```
FUEL_PRICE_MAP_PORT=3000
FUEL_PRICE_MAP_SESSION_SECRET="your_session_secret"
FUEL_PRICE_MAP_DATABASE_PATH="/path/to/database.db"
FUEL_FINDER_API_CLIENT_ID="your_fuel_finder_api_client_id"
FUEL_FINDER_API_CLIENT_SECRET="your_fuel_finder_api_client_secret"
```

### 4. Initialise and build the database

```bash
npm run db-build
```

or if using .env in root directory

```bash
npm run dev-db-build
```

### 3. Run the server

```bash
node server.js
```

or if using .env in root directory

```bash
npm run dev-start
```

---

## 🧠 Design Notes

- Token logic is centralised to prevent duplicate refresh calls
- Prepared statements used for all DB queries
- Map is intentionally constrained for UX clarity
- Separation of concerns kept lightweight and maintainable

---

## 🛠️ Future Improvements

- Persistent token storage (survives server restarts)
- Station clustering for dense regions
- Filtering by fuel type and price
- Query caching for performance
- Progressive Web App (PWA) support

---

## 📄 License

- This project is [GNU v3.0](https://github.com/DanielBatesUK/fuel-finder/blob/81b90a854cba461336668c46c16b02f595b5d20a/LICENSE) licensed.

---

## Author

### **Daniel Bates**

- Website: [danielbates.co.uk](https://danielbates.co.uk)
- GitHub: [@DanielBatesUK](https://github.com/DanielBatesUK)
- X/Twitter: [@DanielBatesUK](https://twitter.com/DanielBatesUK)
- BlueSky: [@danielbates.co.uk](https://bsky.app/profile/danielbates.co.uk)
- Mastodon: [@DanielBatesUK](https://mastodon.social/@DanielBatesUK)
- LinkedIn: [@DanielBatesUK](https://linkedin.com/in/DanielBatesUK)
