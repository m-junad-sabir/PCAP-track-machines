---
title: Conceptual Data Model
description: Entities and relationships stated in the source for the central database. Conceptual only — not a final schema.
source_sections: "6.2, 9"
status: draft
---

# Conceptual Data Model

> Derived from the source's description of the central database. Field lists include only what the source states. Do not treat as a final schema; confirm field-level rules with PCAP (OQ-14).

## Entities

| Entity | Stated contents / purpose |
|---|---|
| **MachineTypeConfig** (versioned) | Parameter set, sampling table, required photo list per machine type. Super Seeder v1 pre-loaded. |
| **Machine** (master) | UID, chassis/serial number, engine number, manufacturer, batch/consignment, link to machine type. |
| **Manufacturer** (master) | Bearings and lubrication reference data, captured once and reused. 28 firms. |
| **Farmer / Allottee** (master) | Name, father name, CNIC, address, district, contact number. |
| **Committee** (master) | QIC (division-level, chaired by Director Agri. Engineering) and DIC (district-level, chaired by Deputy Director Agri. Engineering); members and conveners. |
| **QICRecord** | Lot-level inspection: lot size, sample, checklist observations, identity checks, photos, result Pass/Defer, FE sign-off, certificate. |
| **DICRecord** | Delivery verification: tamper check, chain-of-custody comparison, identity checks, proxy/nominee data, photos, result Approved/Deferred, certificate. |
| **Certificate** | QIC and DIC certificates (6-column structure, see `specs/reports-and-certificates.md`). |
| **CorrectionLog / DiscrepancyLog** | **Append-only.** QIC convener corrections vs DIC signed discrepancy notes, distinguishable by type. |
| **AuditTrail** | Every record, correction and signature: timestamp + user. |
| **Survey responses** | Baseline / midline / endline farmer data (structure not specified — OQ-04). |
| **TPV / rental-subsidy data** | Rental subsidy verification data for 1,000 farmers (structure not specified — OQ-04). |
| **Design-modification progress** | Progress of suggested design changes (structure not specified — OQ-04). |

## Key relationships

- MachineType 1—* Machine; Manufacturer 1—* Machine.
- **QICRecord ↔ DICRecord linked per machine via UID / machine ID** (chain of custody).
- DICRecord references the QIC-stage **UID-plate signature photo** and **punched-code photo**.
- Committee (QIC by division, DIC by district) — * Members; each has one Convener.
- FE assignments to divisions/districts determine visibility (BR-GEN-04).
- Photos are stored in object storage, each linked to its record and geo-tagged.

## Lifecycle status per machine (portal view)
`Inspected (QIC) → Delivered/Verified (DIC)`; each side carries Approved/Pass or Deferred/Defer status.
