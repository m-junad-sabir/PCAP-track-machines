---
title: Certificate and Report Formats
description: Column definitions for QIC/DIC certificates, monthly summaries and the two 15-column Excel-only progress reports.
source_sections: "9, 6.3.4"
status: draft — exact field/validation rules to be confirmed (OQ-14)
---

# Certificate and Report Formats

## QIC certificate (manufacturer's premises) — 6 columns
| # | Field |
|---|---|
| 1 | Allottee name (farmer name) |
| 2 | CNIC number |
| 3 | Mailing address |
| 4 | Tehsil |
| 5 | Machine ID |
| 6 | Tracker IMEI number |

## DIC verification certificate (farmer's premises)
Same 6-column structure. The farmer's physical CNIC card is also available on-site as an extra cross-check source.

## Monthly summary reports
- **QIC Summary (division-wise):** number of QIC meetings held; machines inspected, approved, deferred; reason for deferment.
- **DIC Summary (district-wise):** number of DIC meetings held; machines verified, approved, deferred; reason for deferment.
- Cadence: monthly, quarterly and annual (BR-RPT-02).

## Monthly progress reports — **Excel only** (BR-RPT-01)

**QIC Progress Report columns**
Sr. No. · Division · District · Firm Name · Farmer Name · CNIC · Contact No. · QIC Certificate # · Status of Inspection (Approved/Deferred) · Unique ID · GIS Location (Lat./Lng.) · Punched Code · Inspection Date · Name of FE

**DIC Progress Report columns**
Sr. No. · District · Farmer Name · Father Name · CNIC · Address · Contact No. · DIC Certificate # · Status of Verification (Approved/Deferred) · Unique ID · GPS Location (Latitude/Longitude) · Punched Code · Verification/Inspection Date · Name of FE

> Source calls both "15-column" but lists 14 names each; splitting Latitude and Longitude into separate columns yields 15. Confirm against the existing manual Excel templates (OQ-05).
>
> **The portal must not offer PDF or image export for these two reports.**

## Other exports
Dashboard summaries and ad-hoc filtered datasets: Excel/CSV or PDF. Reports/certificates must support Urdu and English (BR-GEN-08).
