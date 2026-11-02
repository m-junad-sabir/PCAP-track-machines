# Architecture

## Components

- `apps/field-app`: QIC/DIC field workflows and offline inspection drafts
- `apps/dashboard`: MIS dashboard, records, reporting, mapping, and administration
- `apps/api`: authentication, synchronized records, reports, GIS, and staff administration
- `packages/shared`: shared TypeScript contracts
- `db`: migrations, boundaries, and seed-related database tooling

## Database

Docker Compose starts PostgreSQL with PostGIS on port `5432`. The migration creates users, districts, assignments, QIC/DIC records, certificates, attachments, surveys, TPV records, and audit structures. Seed data creates fixed field engineers, dashboard users, districts, and assignments.

## Current status

The API, dashboard, and field app are runnable workspaces. The dashboard includes record, report, discrepancy, map, machine configuration, and Master Data views. Authorized administrators can create and update staff, assign activities and districts, change passwords, and deactivate or reactivate accounts. Functional screens do not contain prototype autofill or reset controls.
