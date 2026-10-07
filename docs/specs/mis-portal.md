---
title: MIS Web Portal Spec
description: Dashboard, machine-type configuration, certificate/discrepancy management, reporting/export, and user/committee administration.
source_sections: "6.3"
status: draft
---

# MIS Web Portal

Audience: Project Lead, PCAP Admin, System Administrator. Convener access is **unresolved** (OQ-01) — see `../roles-and-permissions.md`.

## Data review dashboard
- Real-time view of QIC and DIC records, plus survey and TPV data, shown as a **linked lifecycle per machine** (Inspected → Delivered).
- Filter/search by machine type, engineer, manufacturer, farmer, division/district, status, date range.
- Visual summary of progress (counts by status, by division/district).

## Machine-type & checklist configuration (Admin)
- Define and **version** the parameter checklist, sampling table and required photo set per machine type.
- Onboard new machine types **without changes to the Android app or backend code** (BR-CFG-01). Details: `machine-type-config.md`.

## Certificate & discrepancy management
- **QIC convener:** edit access to correct certificate fields flagged as mismatched (BR-QIC-09, ⚠️ OQ-01).
- **DIC convener:** no edit access; discrepancies recorded as a **signed note** attached to the record; machine can still be approved with the note visible in the audit trail (BR-DIC-03).
- Full history of every correction/note: who and when (BR-GEN-02, BR-GEN-03).

## Reporting & export
- **Monthly QIC Summary** — division-wise: meetings held; machines inspected/approved/deferred; reasons for deferment.
- **Monthly DIC Summary** — district-wise: meetings held; machines verified/approved/deferred; reasons for deferment.
- **Monthly QIC Progress Report** and **Monthly DIC Progress Report** — auto-populated 15-column reports matching existing Excel formats; **Excel only** (BR-RPT-01).
- Dashboard summaries and ad-hoc filtered datasets: Excel/CSV or PDF (BR-RPT-03).
- Formats: `reports-and-certificates.md`.

## Committee & user management (Admin)
- Add/remove FEs, conveners, committee members; assign permissions.
- Maintain division and district structures used to route QIC (division) and DIC (district) meetings.

## Notifications
SMS/push for meeting intimations and status updates (proposed).
