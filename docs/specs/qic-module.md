---
title: QIC Module Spec
description: Android-app Quality Inspection Committee module — eligibility gate, sampling, checklist, bearings register, identity checks, photos, sign-off.
source_sections: "6.1.3, 7"
status: draft
---

# QIC Module — Quality Inspection (Manufacturer's Premises)

**Purpose:** help the QIC accept or defer a *lot* of newly manufactured machines before delivery clearance. Rules: BR-QIC-01…10.

## Flow

1. **Start:** FE selects/logs the meeting (optionally captures intimation + proof — BR-QIC-10); machine type defaults to Super Seeder.
2. **Eligibility gate** (BR-QIC-01) — block if any of:
   - UID plate (with QR) not installed / missing
   - 7-digit code not punched / missing
   - tracking device not installed under the mast frame
3. **Sampling assistant** (BR-QIC-02) — FE enters lot size → app shows required sample size and permissible number of defectives from the configured sampling table (PSQCA scheme for Super Seeder).
4. **Technical parameter checklist** (BR-QIC-03) — configurable, grouped by assembly. Super Seeder groups: General, Dimensional, Overall Dimensions, Frame Assembly, Three-Point Hitch, Power Transmission, Rotary Hoe, Furrow Opener/Coulter, Seed & Fertilizer Assembly, Press Roller, Tracking System, Branding, Miscellaneous — **49 parameters**. Record **required vs observed** per sampled machine.
5. **Bearings & lubrication register** (BR-QIC-04) — once per manufacturer, reused.
6. **Identity cross-verification** (BR-QIC-05) — on the *downloaded QIC certificate's printed information*: farmer name, CNIC, machine ID, tracker IMEI vs UID plate print, decoded UID-plate QR, decoded tracker QR. Mismatches flagged for the QIC convener (correction path: OQ-01).
7. **7-digit code check** (BR-QIC-06) — punched code == UID-plate printed code (also compare central 7 digits of CNIC — OQ-07).
8. **Sign-off** (BR-QIC-07) — committee result **Pass / Defer** per lot; FE digital signature; FE physically signs UID plate + machine frame; app logs that physical signing was done.
9. **Photos** (BR-QIC-08) — **8 geo-tagged photos**:
   1. Manufacturer signboard
   2. Machine with installed tracker
   3. UID plate showing the FE's signature
   4. Punched 7-digit code
   5. Decoded UID-plate QR
   6. Decoded tracker QR — farmer / CNIC / implement
   7. Decoded tracker QR — manufacturer's GPS location
   8. QIC team with the manufacturer
10. **Upload/sync** per `android-app.md`.

## Inputs from manufacturer
Manufacturer provides data of QIC-inspected machines in Excel (ingestion mechanism: OQ-10).

## Outputs
QIC certificate (6 columns — `reports-and-certificates.md`); QIC record linked to each machine for later DIC chain-of-custody check; rows for Monthly QIC Summary and QIC Progress Report.

## After QIC (external)
See `../workflow.md`: signed certificate uploaded on the departmental portal → DIC convener informed; manufacturer may bill the government share.
