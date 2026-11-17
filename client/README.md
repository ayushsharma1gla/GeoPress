# GeoPress client

The GeoPress frontend is a React application built with Vite.

## Local development

1. Copy `.env.example` to `.env`.
2. Install dependencies with `npm ci`.
3. Start the development server with `npm run dev`.

When `VITE_API_URL` is empty, API requests use the `/api` Vite proxy to `http://localhost:5000`. For production, set `VITE_API_URL` to the Render API origin before building.

## Production build

- `npm run build` creates the deployable static site in `dist/`.
- Vercel should use `client/` as the project root. `vercel.json` enables client-side route fallback.
