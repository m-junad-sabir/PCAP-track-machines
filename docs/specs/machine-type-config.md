---
title: Machine-Type Configuration and Super Seeder Reference Model
description: How machine types are configured as versioned data, and what is known about the Super Seeder configuration.
source_sections: "5.1, 6.3.2, 10"
status: draft — Super Seeder content not included in source
---

# Machine-Type Configuration

A machine type = **parameter/checklist set + sampling table + required photo set**, stored as **versioned data** (BR-CFG-01). The Android app renders whatever the selected type's configuration says.

## Configuration contents
| Part | Description |
|---|---|
| Parameter checklist | Parameters grouped by assembly; each records required vs observed value per sampled machine. |
| Sampling table | Maps lot size → sample size and permissible defectives; separate scales for visual/dimensional tests and other tests (e.g., blade hardness). |
| Required photo set | Ordered list of required geo-tagged photos, separately for QIC and DIC. |

## Super Seeder (first configured type; reference model)
- **Sampling:** PSQCA scale-of-sampling scheme.
- **Checklist: 49 parameters** in 13 groups: General; Dimensional Requirements; Overall Dimensions; Frame Assembly; Three-Point Hitch Assembly; Power Transmission Assembly; Rotary Hoe Assembly; Furrow Opener/Coulter Assembly; Seed & Fertilizer Assembly; Press Roller Assembly; Tracking System; Branding; Miscellaneous (origin, accessories, O&M manual, paint, nuts & bolts, bearings, lubrication, warranty).
- **Photo sets:** 8 at QIC, 8 at DIC (different compositions) — see `qic-module.md`, `dic-module.md`.

> ⚠️ **The 49 individual parameters (names, units, required values, tolerances) and the PSQCA sampling table are NOT in the source document.** Obtain the approved Super Seeder technical specification and PSQCA scheme from PCAP (OQ-03) and load them as seed data. Do not fabricate them.

## Onboarding another machine type
Candidates: tractors, threshers, rotavators, laser land levelers, etc. Prerequisite: an **approved technical specification and sampling scheme confirmed with PCAP** (BR-CFG-02). Process and access rules for onboarding are an open item (OQ-13). The second onboarding should be used to validate the configuration engine's extensibility.

## Design guidance (derived)
- Version configuration so existing QIC/DIC records keep pointing at the config version they were captured under.
- Keep gate logic (BR-QIC-01, BR-DIC-01) in core code; checklist content and sampling lookups in configuration.
