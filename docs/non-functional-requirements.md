---
title: Non-Functional Requirements
description: Reliability, security, device, extensibility, audit, validation, reporting, localization and scalability requirements.
source_sections: "8"
status: draft
---

# Non-Functional Requirements

| ID | Area | Requirement |
|---|---|---|
| **NFR-01** | Reliability | Offline capture of checklist entries and up to **8 photos per inspection**, with sync-on-connectivity for rural/low-network areas. |
| **NFR-02** | Security | Role-based access, secure authentication, **encrypted data transfer**; data includes government, manufacturer and farmer data **including CNIC numbers**. |
| **NFR-03** | Device capability | Android devices must support **camera-based QR decoding** (UID plate, tracker) and **GPS geo-tagging**. |
| **NFR-04** | Extensibility | A new machine type's parameter set, sampling table and photo requirements can be added **without code changes**. |
| **NFR-05** | Auditability | Every record, correction and discrepancy note is timestamped and traceable to a user; QIC corrections and DIC discrepancy notes are **distinguishably logged** (different authority levels). |
| **NFR-06** | Data validation | CNIC and tracker IMEI formats validated at entry; cross-field consistency checks (UID plate vs QR vs tracker) run automatically where possible. |
| **NFR-07** | Reporting constraint | Monthly QIC/DIC progress reports exportable **strictly as Excel** (no PDF/image). |
| **NFR-08** | Localization | **Urdu and English** for FEs and for generated certificates/reports. |
| **NFR-09** | Scalability | Central DB must handle growing volumes of machines, manufacturers, farmers and machine types across divisions/districts. |

Not specified in source (do not assume): minimum photo/GPS accuracy (OQ-11), performance/latency targets, backup/retention policy, hosting region.
