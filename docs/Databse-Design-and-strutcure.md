# Database Design and Structure

The maintained database overview is [Database_Design.md](Database_Design.md).

## Current structure

- `docker-compose.yml`: PostgreSQL/PostGIS service
- `db/migrations/001_init.sql`: core application schema
- `apps/api/src/database/seed.ts`: seed implementation for users, districts, assignments, and development records
- `db/boundaries`: GIS boundary data location

Staff accounts are stored in `users`; district assignments are stored in `assignments`. Administrators can update staff activities, passwords, districts, and active status through the dashboard API. Seeded development accounts use bcrypt-hashed shared passwords and must be replaced for production.
