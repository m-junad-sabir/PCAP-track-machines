---
title: Glossary
description: Domain terms and abbreviations used across the PCAP Farm Machinery Monitoring System docs. Use these terms exactly.
source_sections: "1, 4, 5, 6, 9, 10"
status: draft
---

# Glossary

| Term | Meaning |
|---|---|
| **PCAP** | Punjab Clean Air Program (Agriculture Component). |
| **NESPAK** | The consultant; FEs represent it on committees. |
| **FE** | Field Engineer. Technical member of QIC/DIC; the primary Android app user. 22 FEs in the project. |
| **QIC** | Quality Inspection Committee. Division-level (5 divisions). Inspects a *lot* of new machines at the **manufacturer's premises**. Convener: Director Agricultural Engineering (division). |
| **DIC** | District Inspection Committee. District-level (35 districts). Verifies a delivered machine at the **farmer's premises**. Convener: Deputy Director Agricultural Engineering (district). |
| **Convener** | Chair of a QIC/DIC. Signs off certificates. |
| **Lot** | A batch of newly manufactured machines presented for QIC inspection. |
| **Sample** | Subset of a lot actually inspected; size derived from lot size via the sampling table. |
| **PSQCA** | Pakistan Standards and Quality Control Authority — source of the scale-of-sampling scheme used for Super Seeder. (Source uses the abbreviation only.) |
| **Super Seeder** | The first configured machine type; 49 inspection parameters. |
| **Machine type** | A configurable category (parameter set + sampling table + required photo set). |
| **UID plate** | Unique-ID plate fixed to the machine, printed with identity data and a **QR code**; the FE signs it at QIC. |
| **Punched code** | **7-digit** code punched on the machine; must match the code on the UID plate. |
| **Tracker (device)** | GPS tracking device installed **under the mast frame**; has an **IMEI** and a QR code. |
| **Tracker IMEI** | Tracker device identifier; format validated at entry. |
| **Decoded QR** | Data read from the UID-plate QR or tracker QR by the app's camera. |
| **CNIC** | Computerized National Identity Card number of farmer/allottee (sensitive PII). |
| **Allottee** | Farmer allotted a machine. A data subject, not an app user. |
| **Nominee / proxy** | Person who receives the machine on the allottee's behalf. |
| **Eligibility gate (QIC)** | Presence check; blocks inspection if UID plate/QR, punched code or tracker is missing. |
| **Temper (tamper) gate (DIC)** | Tamper check; blocks verification if UID plate, punched code or tracker show tampering/absence. Source spells it "temper". |
| **Chain of custody** | Link from a machine's QIC record to its DIC record via UID plate signature + punched code. |
| **Bearings & lubrication register** | Per-manufacturer reference data captured once and reused. |
| **Discrepancy note** | Signed note recorded at DIC when data mismatch is found (no portal edit by DIC convener). |
| **Correction** | Edit of a certificate field by the QIC convener via portal (see OQ-01). |
| **MIS portal** | The web portal built in this project (not the departmental portal). |
| **Departmental portal** | Government department's own portal where conveners upload signed certificates. External to this system. |
| **Baseline / midline / endline** | Farmer surveys: before delivery (5,000) / after 1 year (500) / after 2 years (500). |
| **TPV** | Third-party verification of rental subsidy for 1,000 farmers (Rs. 5,000/acre, max 25 acres). |
| **CDR** | Source: "CDR (share of the farmer)" released to the manufacturer by the Director General Agriculture after the signed DIC certificate. Abbreviation not expanded in source. |
| **Intimation** | Official notice of a QIC/DIC meeting (letter, e-mail, WhatsApp, memo or call). |
