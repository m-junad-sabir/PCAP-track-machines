---
title: Open Questions, Assumptions and Source Inconsistencies
description: Gaps, contradictions and unconfirmed items in the source document. Check before implementing anything ambiguous; update when resolved.
source_sections: "12 + review of whole document"
status: living document
---

# Open Questions, Assumptions and Inconsistencies

Format: `OQ-nn` · status (open/resolved) · what is unclear · suggested handling. "Suggested handling" is **not from the source**.

## A. Items the source itself lists as next steps (§12.2)
- **OQ-11** (open) Minimum photo/GPS accuracy for geo-tagged evidence.
- **OQ-12** (open) Whether WhatsApp-based submission runs in parallel during transition, and for how long.
- **OQ-13** (open) Process and access rules for onboarding a second machine type.
- **OQ-14** (open) Exact data fields and validation rules for QIC/DIC certificates and the two progress reports.
- **OQ-15** (open) PCAP hosting/infrastructure requirements (affects stack choice; also proceed to UI/UX design and architecture sign-off).
- Confirm the discrepancy-handling workflow (QIC convener portal-edit vs DIC signed-note-only) → see OQ-01.

## B. Contradictions / ambiguities found in the source
- **OQ-01** (open) **Convener access to MIS portal.** Role table and §6.3.3 give QIC convener edit access and DIC convener view/sign-off, but the same rows say conveners and committee members "have nothing to do with our MIS based portal". *Handling:* make convener permissions configurable; defer convener UI.
- **OQ-02** (open) **Certificate flow wording.** §3.1 says the certificate "is downloaded by the convener"; §5.2 says the convener **uploads** the signed certificate on the **departmental portal**; §6.1.3/6.1.4 refer to the FE checking the "downloaded" certificate's printed info. The DIC scope bullet says the DIC certificate is downloaded "by the convener of the **QIC**" (likely a typo for DIC). Unclear: who generates the certificate (this system?), in what format, and whether any integration with the departmental portal is expected. *Handling:* treat the departmental portal as external; system generates a printable certificate; no integration until confirmed.
- **OQ-03** (open) **Missing reference data:** the 49 Super Seeder parameters and the PSQCA sampling table are referenced but not included. Required to seed configuration.
- **OQ-04** (open) **Surveys / TPV / design optimization lack detail** (questionnaires, fields, selection of farmers, Design Engineer role/surface, "surest modification" — read here as *suggested* modification). Also "cost reduction (which at present is Rs. 1,350 million)" — unit/meaning unclear (total programme cost vs per-machine).
- **OQ-05** (open) **"15-column" reports list 14 names each.** Lat/Lng split gives 15; confirm with existing Excel templates. QIC and DIC column sets differ (Division/Firm Name vs Father Name/Address).
- **OQ-06** (open) DIC photo #1 "CNIC card (both sides)": one image or two? If two, the DIC set is 9 images, not 8.
- **OQ-07** (open) **7-digit code vs CNIC:** source says the code check also involves the "central 7 digits of the CNIC #" — relationship (is the punched code derived from the CNIC?) is unexplained.
- **OQ-08** (open) **Report cadence:** objectives and scope mention monthly, quarterly and annual summary *and progress* reports; §6.3.4 and §9.4 define monthly progress reports only.
- **OQ-09** (open) **FE-to-district assignment:** 22 FEs, 35 districts, 5 divisions; "5 of the FEs will look after 11 districts" doesn't fully define the mapping. Assignment must be admin-configurable.
- **OQ-10** (open) **Manufacturer Excel data:** manufacturer provides QIC-inspected machine data in Excel; whether the system must import it (and its format) is unstated.

## C. Assumptions stated in the source (§12.1)
- FEs have Android smartphones capable of camera QR decoding and GPS geo-tagging.
- PCAP will confirm the final Super Seeder checklist, sampling table and photo requirements.
- UID plates and trackers (and QR encoding) are issued/installed outside this system; the app only reads and cross-verifies.
- Field connectivity is intermittent; offline capture and sync required for both QIC and DIC.

## D. How to use this file
Resolve an item → change status to `resolved`, record the decision and date, and update the affected spec and `business-rules.md` in the same change.
