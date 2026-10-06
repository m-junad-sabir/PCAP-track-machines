---
title: Business Rules
description: Numbered, testable rules (BR-*) that the system must enforce. Reference these IDs in code, tests and PRs.
source_sections: "5, 6, 8, 9, 10"
status: draft
---

# Business Rules

Use the IDs in code comments, test names and PR descriptions. Items marked ⚠️ depend on an open question.

## General (BR-GEN)
- **BR-GEN-01** Every inspection/verification starts with a **machine type**; Super Seeder is the default this phase. Checklist, sampling table and photo set come from that type's configuration.
- **BR-GEN-02** Every record, correction and signature is **timestamped and attributable to a user**.
- **BR-GEN-03** Corrections are **append-only** (never silent overwrites). QIC corrections (convener edit) and DIC signed discrepancy notes are **distinguishable record types**.
- **BR-GEN-04** An FE sees only QIC/DIC meetings and machines assigned or notified to them (plus survey/rental-subsidy status of their district).
- **BR-GEN-05** CNIC and tracker IMEI **formats are validated at entry**; cross-field consistency (UID plate vs QR vs tracker) runs automatically where possible.
- **BR-GEN-06** Role-based access; secure authentication; encrypted transfer.
- **BR-GEN-07** Checklist entries and up to **8 photos per inspection** can be captured **offline** and sync automatically; upload status (pending/synced/failed) is visible.
- **BR-GEN-08** FE-facing UI and generated certificates/reports support **Urdu and English**.

## Configuration (BR-CFG)
- **BR-CFG-01** Parameter sets, sampling tables and required photo lists are **versioned data per machine type**, editable from the portal admin area; adding a machine type requires **no app/backend code change**.
- **BR-CFG-02** A new machine type needs an approved technical specification and sampling scheme **confirmed with PCAP** before configuration.

## QIC (BR-QIC)
- **BR-QIC-01** *Eligibility gate (hard block):* inspection is blocked if the **UID plate (with QR)** is missing/not installed, the **7-digit code** is not punched/missing, or the **tracking device** is not installed under the mast frame.
- **BR-QIC-02** FE enters lot size; app computes **sample size** and **permissible defectives** from the configured sampling table (PSQCA for Super Seeder), for visual/dimensional tests and other tests (e.g., blade hardness).
- **BR-QIC-03** For each sampled machine, record **required vs observed** value for every checklist parameter (49 for Super Seeder).
- **BR-QIC-04** **Bearings & lubrication register** is captured **once per manufacturer** and reused.
- **BR-QIC-05** Certificate-printed **farmer name, CNIC, machine ID, tracker IMEI** are checked against the UID plate print, decoded UID-plate QR and decoded tracker QR; mismatches are flagged.
- **BR-QIC-06** ⚠️ **7-digit code check:** punched code on machine == code printed on UID plate; source adds "also central 7 digits of the CNIC #" (OQ-07).
- **BR-QIC-07** **Sign-off:** per-lot **Pass/Defer**; FE signs digitally; FE also signs the physical UID plate and machine frame, and the app logs that this physical sign-off was completed.
- **BR-QIC-08** **8 required geo-tagged photos** (see `specs/qic-module.md`).
- **BR-QIC-09** ⚠️ QIC convener corrects flagged certificate fields via portal edit (OQ-01).
- **BR-QIC-10** FE can optionally capture the meeting intimation (letter, e-mail, WhatsApp, memo, call) and proof.

## DIC (BR-DIC)
- **BR-DIC-01** *Tamper gate (hard block):* verification is blocked if the UID plate shows tampering (re-riveting, or the FE's QIC-stage signature not in a natural continuous flow), the punched code shows tampering (grinding or re-punching), or the tracker is missing.
- **BR-DIC-02** **Chain of custody:** app pulls the machine's QIC record and compares the QIC-stage UID-plate signature photo and punched-code photo with current observation.
- **BR-DIC-03** Farmer name and CNIC are checked against the **physical CNIC card**, UID plate, decoded UID QR and decoded tracker QR. Mismatches are recorded as a **discrepancy note under the DIC convener's signature**; the DIC convener has **no edit access** to certificate data. The machine can still be approved with the note visible in the audit trail.
- **BR-DIC-04** **Proxy/nominee:** if the allottee is absent, capture the nominee's WhatsApp or written authorization. If none exists but the convener authorizes handover under signature, a **geo-tagged photo of the receiving person's CNIC is mandatory**.
- **BR-DIC-05** **Sign-off:** committee result **Approved/Deferred**; FE signs digitally.
- **BR-DIC-06** **8 required geo-tagged photos** (see `specs/dic-module.md`).

## Reporting (BR-RPT)
- **BR-RPT-01** Monthly **QIC Progress Report** and **DIC Progress Report**: 15 columns, matching existing manual Excel formats, exported **as Excel only** — **no PDF or image export** for these two reports.
- **BR-RPT-02** Summary reports (QIC division-wise; DIC district-wise) are generated monthly, quarterly and annually. ⚠️ Cadence of progress reports: OQ-08.
- **BR-RPT-03** General dashboard summaries and ad-hoc filtered datasets are exportable as Excel/CSV or PDF.
