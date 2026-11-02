# How to Run

## Prerequisites

- Node.js with npm
- Docker with Docker Compose
- PostgreSQL client tools, if direct database access is needed

## Start PostgreSQL and PostGIS

From the repository root:

```powershell
npm run db:up
```

The service listens on port `5432` and uses the database settings configured in `.env` or the repository defaults.

Stop it with:

```powershell
docker compose down
```

## Apply migrations and seed data

```powershell
npm run db:migrate
npm run db:seed
```

## Environment file

Copy the example before application startup:

```powershell
Copy-Item .env.example .env
```

Replace development values and keep `.env` out of source control.

## Application scripts

Start the applications from the repository root:

```powershell
npm run dev:api
npm run dev:field
npm run dev:dash
```
