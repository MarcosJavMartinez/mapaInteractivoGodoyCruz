# SQLite migration

## Goal

Move historical content out of `scripts/markerModule.js` and into a database-backed API while keeping the Three.js frontend focused on rendering and interaction.

## Current stage

The project now has the first scalable boundary:

- `data/muvi.sqlite` stores content locally.
- `server/database.js` owns the SQLite connection and schema migrations.
- `server/repositories/placeRepository.js` maps database rows to frontend-friendly place objects.
- `server/apiRouter.js` exposes `/api/places` and camera-view persistence.
- `scripts/apiClient.js` is the frontend boundary for API calls.
- `scripts/markerModule.js` can create markers from database place objects through `createMarkersFromPlaces`.

The existing hardcoded markers still work. This lets us migrate content gradually.

## Useful commands

```bash
npm run db:init
npm start
```

Then check:

```text
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/api/places
```

## Migration order

1. Insert 2 or 3 places into SQLite.
2. Render those places from `/api/places` in a test path.
3. Confirm marker click, info panel, images, and camera views behave the same.
4. Move the remaining hardcoded markers in batches by block or street.
5. Once every place is database-backed, remove the old hardcoded marker list.

## Future database upgrade

The frontend talks to `apiClient.js`, and route handlers talk to repository functions. If SQLite later becomes PostgreSQL/PostGIS, the main replacement should be inside the server database/repository layer, not in the Three.js rendering code.
