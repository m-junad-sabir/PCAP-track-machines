---
title: Architecture
description: High-level components, data flow and the proposed (non-final) technology stack.
source_sections: "5, 11"
status: draft
---

# Architecture (High-Level)

A **central database** is shared by the Android app and the MIS portal. A **machine-type configuration layer** sits between the core application and checklist/sampling content, so Super Seeder's 49-parameter spec is *data, not code*.

```
 Android app (FE) ──REST/JWT──►  API layer  ◄──  MIS web portal
  offline store + sync              │            (Lead / Admin / Conveners*)
  QR decode + GPS + camera          ▼
                          Central relational DB
                    ┌──────────────┼───────────────┐
              Machine-type      QIC / DIC        Object storage
              configuration     records,         (geo-tagged photos)
              (versioned)       certificates,
                                audit log
```
\* convener portal access is unresolved — see `open-questions.md` OQ-01.

## Components

1. **Android app (FE)** — guides QIC or DIC workflow for the machine's configured type; captures data, photos, GPS; uploads via secure APIs. Also enters baseline/midline/endline data and rental-subsidy (TPV) data.
2. **Machine-Type Configuration Engine** — stores parameter set, sampling table and required photo list per machine type (Super Seeder first).
3. **Central Database & API layer** — committee, machine, manufacturer, farmer, QIC, DIC data; role-based access; serves app and portal.
4. **MIS web portal** — review, discrepancy management, machine-type configuration, report export.
5. **Design progress entry** — a Design Engineer enters progress of suggested design modifications (surface unspecified; OQ-04).

External (not built here): the **departmental portal** where conveners upload signed certificates; UID-plate/tracker issuance.

## Data flow summary

See `workflow.md` for the full lifecycle. In short: lot assigned to QIC → FE logs intimation → eligibility gate → sampling → checklist + identity cross-checks → 8 photos + sign-off → upload (or offline queue) → approved machines delivered → DIC at farmer's premises → tamper gate → pull QIC record, chain-of-custody check → farmer identity + proxy handling → 8 photos + sign-off → Project Lead reviews linked QIC+DIC records on MIS portal and exports reports.

## Proposed technology stack (starting point, adjustable to PCAP hosting preferences)

| Layer | Proposed approach |
|---|---|
| Android app | React Native or other cross-platform framework; local offline storage, background sync, camera QR decoding, GPS geo-tagging |
| MIS web portal | Responsive web app (desktop + mobile browsers) |
| Backend & APIs | REST API with role-based auth (e.g., JWT) |
| Central database | Cloud-hosted relational DB (PostgreSQL or MySQL): machine types, machines, manufacturers, farmers, committees, QIC, DIC |
| Machine-type configuration | Versioned, data-driven checklist/sampling/photo definitions, editable from portal admin |
| QR decoding | On-device QR/barcode decoding library (UID plate and tracker QR) |
| File storage | Cloud object storage for geo-tagged photos, linked to records |
| Reporting/export | Excel engine for monthly progress reports; PDF/CSV for general dashboards and summaries |
| Notifications | SMS/push for meeting intimations and status updates to engineers, conveners, leads |

> Open: hosting/infrastructure constraints from PCAP (OQ-15). Do not treat the stack above as a decision.
