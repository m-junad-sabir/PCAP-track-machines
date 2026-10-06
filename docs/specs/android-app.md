---
title: Android App Spec (Field Engineer)
description: Login, machine-type selection, offline capture and sync behavior for the FE Android app.
source_sections: "6.1.1, 6.1.2, 6.1.5, 8, 11"
status: draft
---

# Android App — Field Engineer

Modules: Login → Machine-type selection → **QIC** (`qic-module.md`) / **DIC** (`dic-module.md`) / Surveys & TPV (`surveys-tpv-design-optimization.md`) → Upload & sync.

## Login & authentication (§6.1.1)
- Secure, role-based login for verified FEs.
- FE sees only QIC/DIC meetings and machines assigned or notified to them (BR-GEN-04).
- Optional capture of the meeting intimation (letter, e-mail, WhatsApp, memo, call) and proof, for the FE's record to the PM/TL.
- FE sees survey and rental-subsidy status for the district allotted to them.

## Machine-type selection (§6.1.2)
- Every inspection/verification starts with a machine type; **Super Seeder is pre-configured and default** this phase.
- Checklist, sampling table and required photo set are **driven by configuration**, not hard-coded (BR-CFG-01).

## Upload & sync (§6.1.5)
- Direct upload when connected; **offline capture with automatic sync** when back online (BR-GEN-07).
- Status indicator per item: **pending / synced / failed**.
- During the transition period, signed certificate + photo set may also be shared via **WhatsApp** alongside system upload (duration: OQ-12).

## Device requirements
Android with camera-based QR decoding and GPS geo-tagging (NFR-03). Local offline storage and background sync (proposed stack: `../architecture.md`).

## Localization
Urdu/English (BR-GEN-08).

## Validation at entry
CNIC and tracker IMEI formats; automatic UID plate vs QR vs tracker consistency checks (BR-GEN-05).
