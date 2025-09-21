# Atenxion EMR

## Project Overview
Atenxion EMR is a reference implementation of an electronic medical record system. It aligns with the BRD by providing patient lookup, visit tracking and clinical insights via a JSON API protected by JWT and rate limiting.

## Local Development
1. Install dependencies with `npm install`.
2. Start both the API and web dev servers:
   ```bash
   npm run dev
   ```
   The API runs on `http://localhost:8080` and the web client on `http://localhost:5173`.

## Neon PostgreSQL Setup
Provision a PostgreSQL instance on [Neon](https://neon.tech) and set the `DATABASE_URL` and `DIRECT_URL` in `.env` (include `sslmode=require` for both). Enable the required extensions:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
```

## Migrations & Seeding
Apply migrations and load demo data:
```bash
npm run prisma:migrate
npm run seed:csv
```

## Staff Walkthrough
Try the scheduling workflow after seeding demo data:
1. Create an appointment for **Dr Tan** today from **10:00–10:30**.
2. Attempt to create another appointment for the same provider and timeslot — the system should block the double booking.
3. Mark the original appointment as complete and verify that the visit appears in the visit list.

## API Docs
The OpenAPI specification is served at `/api/docs/openapi.json`.

## Deploying to Render
1. Create a new Web Service and connect this repository.
2. Configure environment variables:
   - `DATABASE_URL` (with `sslmode=require`)
   - `DIRECT_URL` (with `sslmode=require`)
   - `JWT_SECRET`
   - `RATE_LIMIT_WINDOW_MIN`
   - `RATE_LIMIT_MAX`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

## Security Notes
- TLS is enforced by using `sslmode=require` for database connections.
- `express-rate-limit` protects patient and auth endpoints.
- Patient contact details are masked in logs and API responses.
