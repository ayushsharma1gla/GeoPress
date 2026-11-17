# GeoPress

GeoPress is a location-based news application. It combines an interactive map with a news feed, geocoding, and user accounts.

## Project structure

- `client/` — React 19, Vite, Tailwind CSS, and Leaflet frontend
- `server/` — Express API, Supabase database/storage integration, authentication, news, and geocoding routes
- `server/supabase_setup.sql` — database schema

## Local development

Requirements: Node.js and npm.

1. Copy `client/.env.example` to `client/.env`.
2. Copy `server/.env.example` to `server/.env` and set your Supabase URL, service-role key, and a unique JWT secret. Never commit `.env` files.
3. Run the SQL in `server/supabase_setup.sql` in the Supabase SQL editor.
4. In one terminal, run `cd server`, `npm ci`, then `npm run dev`.
5. In another terminal, run `cd client`, `npm ci`, then `npm run dev`.

The client uses the Vite `/api` development proxy when `VITE_API_URL` is empty. The API listens on port `5000` by default.

## Deployment

### Backend — Render

The root `render.yaml` defines the API service. Create a Render Blueprint from this repository and provide `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CLIENT_URL` in the Render dashboard. Render generates `JWT_SECRET`. Run the SQL schema in Supabase before the service starts.

### Frontend — Vercel

Import this repository into Vercel, set the project root directory to `client`, and add `VITE_API_URL` with the deployed Render service's base URL (for example, `https://geopress-api.onrender.com`, without a trailing slash). The `client/vercel.json` rewrite supports client-side routes.

After deployment, set `CLIENT_URL` in Render to the production Vercel origin, then redeploy the API. Do not put database keys or other secrets in Vercel's frontend environment variables or in Git.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Vercel/client | Public base URL of the API |
| `SUPABASE_URL` | Render/server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Render/server | Private server-side Supabase key |
| `JWT_SECRET` | Render/server | Signing key for authentication tokens |
| `CLIENT_URL` | Render/server | Allowed frontend origin for CORS |
