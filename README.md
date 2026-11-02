# PCAP Farm Machinery Monitoring System

| App | Folder | URL (dev) |
|---|---|---|
| API (NestJS) | `apps/api` | http://localhost:3000/api |
| Field app (PWA) | `apps/field-app` | https://localhost:5173 |
| MIS dashboard | `apps/dashboard` | http://localhost:5174 |

## First-time setup (PowerShell, from the project root)

```powershell
copy .env.example .env      # then edit JWT_SECRET
npm install
npm run db:up               # PostgreSQL + PostGIS in Docker (needs Docker Desktop)
npm run db:migrate          # creates all tables
npm run db:seed             # demo users, districts, manufacturers, certificates
```

No Docker? Install PostgreSQL 16 + PostGIS locally, create a database `pcap`
and put its URL in `.env` (`DATABASE_URL=...`).

## Run (3 terminals)

```powershell
npm run dev:api
npm run dev:field
npm run dev:dash
```

Demo logins (password `pcap123`): see [docs/Login-Credentials.md](docs/Login-Credentials.md).
In dev builds each QIC step has an "Autofill demo" button, like the prototype.

## Testing on a phone
Phone and PC on the same Wi-Fi. Open `https://<PC-IP>:5173` and accept the self-signed
certificate warning (HTTPS is required for GPS and camera). API calls go through the Vite
proxy, so nothing else is needed. Allow Node.js through Windows Firewall if prompted.
Offline test: switch the phone to airplane mode, finish an inspection, turn the network back on -> it uploads by itself.

## What is built (phase 1)
- DB: full schema (users, districts, manufacturers, assignments, certificates, QIC, attachments, DIC/survey/TPV tables, audit log)
- API: login + roles, field home/lookups, idempotent QIC sync, photo/worksheet upload, review, Excel export, GeoJSON for Map View
- Field app: activity select, sign-in, QIC home, 7-step QIC flow, offline storage, auto-sync
- Dashboard: records table + filters + status counts, record detail with photos, approve / flag, Excel export, Map View

## Next phases
DIC flow -> Surveys -> Rental TPV -> district/tehsil boundary import -> user management screens -> PDF/summary reports -> deployment.
