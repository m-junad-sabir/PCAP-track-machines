# AGENTS.md

**Project:** PCAP Farm Machinery Monitoring System — digitizes QIC (quality inspection) and DIC (delivery verification) of subsidized farm machinery for the Punjab Clean Air Program (Agriculture Component). First machine type: **Super Seeder**.

**Status:** design stage (source document v2, 28 Sep 2026). UI/UX design and technical architecture sign-off are pending. The tech stack in `docs/architecture.md` is *proposed*, not final.

## What is being built

One central database + REST API, used by:
1. **Android field app** for Field Engineers (FEs): QIC, DIC, surveys, rental-subsidy TPV. Offline-first.
2. **MIS web portal** for Project Lead / PCAP Admin / System Admin: dashboards, discrepancy management, machine-type configuration, report export.
3. **Machine-type configuration engine**: checklists, sampling tables and photo requirements are *data*, not code.

## Read on demand (do not load everything)

| Need to know… | Read |
|---|---|
| Program background, scope, staffing | `docs/overview.md` |
| Terms and abbreviations (QIC, DIC, UID plate, PSQCA, TPV…) | `docs/glossary.md` |
| Who can do what | `docs/roles-and-permissions.md` |
| Components, data flow, proposed stack | `docs/architecture.md` |
| End-to-end lifecycle of a machine | `docs/workflow.md` |
| **Hard rules with IDs (BR-*)** | `docs/business-rules.md` |
| Entities and relationships | `docs/data-model.md` |
| QIC module | `docs/specs/qic-module.md` |
| DIC module | `docs/specs/dic-module.md` |
| Surveys, TPV, design optimization | `docs/specs/surveys-tpv-design-optimization.md` |
| Android app (login, sync, offline) | `docs/specs/android-app.md` |
| MIS portal | `docs/specs/mis-portal.md` |
| Machine-type config + Super Seeder reference | `docs/specs/machine-type-config.md` |
| Certificates and report formats | `docs/specs/reports-and-certificates.md` |
| Non-functional requirements | `docs/non-functional-requirements.md` |
| **Gaps, contradictions, assumptions** | `docs/open-questions.md` |
| Full original text (archival, large) | `docs/reference/source-document-v2.md` |

## Non-negotiable rules

Full list with IDs in `docs/business-rules.md`. Summary:

- **Machine types are data, not code.** Never hard-code Super Seeder's 49 parameters, sampling table or photo list. Store them as versioned configuration. (BR-CFG-01)
- **Eligibility gates are hard blocks.** QIC = presence check (UID plate+QR, 7-digit punched code, tracker). DIC = tamper check. Ineligible machines cannot proceed. (BR-QIC-01, BR-DIC-01)
- **Chain of custody:** a DIC record must pull and compare against the machine's QIC record via UID / machine ID. (BR-DIC-02)
- **Append-only audit.** Corrections and discrepancy notes never overwrite; QIC corrections and DIC signed notes are logged as distinct types. (BR-GEN-02, BR-GEN-03)
- **DIC convener has no edit right on certificate data**; discrepancies are signed notes only. (BR-DIC-03)
- **Offline-first.** Checklist entries and up to 8 photos per inspection must be captured offline and synced later, with visible pending/synced/failed status. (BR-GEN-07)
- **8 geo-tagged photos** per QIC and per DIC, with the fixed compositions in the specs. (BR-QIC-08, BR-DIC-06)
- **Monthly QIC and DIC progress reports: Excel only, 15 columns.** No PDF/image export for these two reports. (BR-RPT-01)
- **Urdu and English** for FE-facing UI and generated certificates/reports. (NFR-08)
- **CNIC numbers are sensitive PII**: validate format at entry, encrypt in transit, keep out of logs.

## Out of scope (do not build)

Farmer-facing app; payment/subsidy disbursement; issuing or managing UID plates and tracker devices (system only *reads* their printed/QR data); parameter sets for machine types other than Super Seeder.

## Conventions

- Use glossary terms exactly (FE, QIC, DIC, UID plate, punched code, tracker IMEI).
- Cite rule IDs (e.g. `BR-DIC-04`) in code comments, tests and PR descriptions.
- Do not invent missing specification details (the 49 parameters and the PSQCA sampling table are **not** in this repo). Check `docs/open-questions.md`; if a gap blocks you, record an assumption there and ask.
- When a decision resolves an open question, update `docs/open-questions.md` and the affected spec in the same change.

## Commands

Not defined yet — repo not scaffolded. Add install/build/test/lint commands here once the stack is finalized.
