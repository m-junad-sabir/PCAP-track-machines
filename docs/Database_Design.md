# Database Design

## Platform

- PostgreSQL 16
- PostGIS 3.4
- Docker image: `postgis/postgis:16-3.4`
- Local service port: `5432`

## Current schema

`db/migrations/001_init.sql` creates the PostGIS and `pgcrypto` extensions, user and review enums, and the core application tables for districts, tehsils, manufacturers, users, assignments, certificates, QIC inspections, attachments, DIC inspections, surveys, TPV records, and audit logs.

Seeded users, districts, manufacturers, assignments, and certificates are created separately by `apps/api/src/database/seed.ts`.

## Seed identities and assignments

The seed contains fixed QIC and DIC field engineer accounts. Shared engineers retain one account with both QIC and DIC activities. Every seeded account uses `pcap123` during development and stores a bcrypt password hash; production credentials must be replaced.

QIC attachments are stored in `attachments` with an inspection, kind, slot, MIME type, location, and captured-time metadata. DIC uploads use the equivalent `dic_attachments` structure. Migration `002_dic_attachments.sql` creates the DIC attachment storage for existing databases.

District assignments are stored through `assignments`. Staff created or edited from the dashboard can receive one or more districts. Removing a staff account is implemented as deactivation, preserving audit and historical record relationships.

## Repository domain folders

The API module directories indicate planned areas for:

- assignments
- audit
- authentication and users
- certificates
- DIC
- discrepancies
- GIS and boundaries
- manufacturers
- QIC
- reports
- surveys
- synchronization
- TPV
- uploads

These folders do not imply that matching database tables have been created.

## Migration policy

- Add application schema changes through numbered SQL migrations in `db/migrations`.
- Do not change a migration after it has been deployed; add a new migration instead.
- Keep schema migrations in `db/migrations`.
- Keep seed implementation and seed execution separate from migration files.

## QIC certificate master fields

The `certificates` table stores the administrator-maintained QIC reference row used by field engineers:

- District
- Allottee name
- CNIC
- Mailing address
- Tehsil
- Unique ID
- Punched 7-digit code
- Tracker IMEI

`003_certificate_unique_fields.sql` adds `unique_id` and `punched_code` to existing databases. `004_certificate_district_unique_ids.sql` normalizes legacy/seed values with the district short code and machine ID. Dashboard updates in Master Data are delivered through `/field/lookups` and reflected on the field-app certificate cross-check screen. Unique IDs are validated against the selected district; Okara uses `OKR`, while the remaining Punjab districts use their configured short-form codes.
