# Technology Stack

## Repository

- npm workspaces
- strict TypeScript configuration
- ES2022 target
- monorepo layout with `apps` and `packages`

## Applications

### Field app
- React 18 and TypeScript
- Vite with PWA support
- React Router
- IndexedDB-based offline draft storage
- QIC workflow components under `apps/field-app/src/features/qic/steps`
- Hide/show password control on activity sign-in

### Dashboard
- React 18 and TypeScript
- Vite
- React Router
- Tailwind CSS utilities and custom light-theme CSS
- Staff administration with activity and district assignments
- Light MIS theme, glass login screen, password visibility controls, and searchable district checklist
- Feature folders for administration, discrepancies, map view, records, reports, and statistics

### API
- NestJS and TypeScript
- JWT authentication and role guards
- bcrypt password hashing
- SQL through the repository database service
- PDFKit for survey PDF reports
- Archiver for ZIP packages containing photos and worksheets
- ExcelJS for spreadsheet exports
- Dashboard staff CRUD endpoints
- Domain folders for assignments, audit, auth, users, certificates, GIS, reports, surveys, and synchronization

### Shared package

- Package name: `@pcap/shared`
- Entry point: `src/index.ts`
- Exports the placeholder `qic` module

## Database

- PostgreSQL 16
- PostGIS 3.4
- Docker Compose

## Configuration

`.env.example` lists database, JWT, upload, and API port settings. These settings do not activate an application until the API implementation is added.
