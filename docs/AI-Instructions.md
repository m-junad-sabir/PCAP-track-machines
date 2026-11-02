# AI Development Instructions

## Scope

This repository is a TypeScript monorepo for the PCAP Super Seeder farm machinery monitoring system. It contains runnable API, dashboard, and field-app workspaces plus PostgreSQL/PostGIS database tooling.

## Repository structure

- `apps/api/src`: API modules
- `apps/dashboard/src`: MIS dashboard source
- `apps/field-app/src`: field application and QIC components
- `packages/shared/src`: shared TypeScript package
- `db/migrations`: ordered database migrations
- `db/seeds`: database seed data
- `db/boundaries`: GIS boundary data
- `docs`: project documentation

## Development rules

- Keep the repository structure and existing module boundaries intact.
- Follow the strict TypeScript settings in `tsconfig.base.json`.
- Reuse types and validation from `packages/shared` when an API and frontend contract is shared.
- Do not implement a feature or endpoint that is not part of the requested task.
- Do not assume that directories, placeholder components, or environment variables are complete implementations.
- Use the project-specific domain names already present in the repository, such as QIC, DIC, TPV, GIS, and MIS.
- Keep authentication input controls accessible, including labels and hide/show password actions.
- Keep dashboard staff assignment controls backed by seed/API district data; do not maintain a separate hard-coded district list.
- Keep prototype and demo autofill controls out of functional field and dashboard screens.
- Keep database changes in `db/migrations` and do not edit an existing deployed migration.
- Do not commit `.env` files, credentials, or generated uploads.

## Change validation

- Inspect nearby code before editing.
- Make the smallest change that satisfies the requirement.
- Run the relevant package build or tests after the implementation exists.
- Update documentation only when the repository structure or behavior changes.
