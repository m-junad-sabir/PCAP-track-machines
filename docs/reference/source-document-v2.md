---
title: Source Document v2 (full conversion)
description: Lossless markdown conversion of the original DOCX. Archival reference — prefer the topic files; load only to verify wording.
status: reference
---

**PCAP FARM MACHINERY**

**MONITORING SYSTEM**

**Project Detail Document — Version 2**

*Updated to reflect the QIC (Quality Inspection Committee) and DIC (District Inspection Committee) protocol/SOPs as practiced by the Field Engineers*

Android Field App

Central Database

MIS Web Portal

Prepared for: PCAP (Punjab Clean Air Program – (Agriculture Component)

Document Type: Functional Overview & System Design Reference

Date: September 28th, 2026.

# **1. Project Overview**

PCAP (Punjab Clean Air Program – (Agriculture Component) a World Bank funded project by government of the Punjab, Agriculture Department through the Directorate General Agriculture (Field), Punjab Lahore for providing 5,000 super seeder machines on subsidized rates @ 40: 60 (40% farmer share, 60% Government share). PCAP project staff includes one PM/TL, one Mechanization/ procurement Expert, one M&E Specialist, one project coordinator, one GIS Specialist (10 man-months), one IT specialist (7 man-months) and 22 field Engineers, Machines will be delivered in 35 districts of the Punjab, therefore 5 of the FEs will look after 11 districts.

Project staff has to undertake following 5 types of assignments; 

- Inspection of machines at the premises of the manufacturing firms (28 Nos.) by respective QICs (Quality Inspection Committees) notified for 5 divisions of the Punjab (Gujranwala, Faisalabad, Lahore, Sahiwal and Multan). Convener of the QIC is Director of Agricultural Engineering of the respective division while the respective FE represents the consultant (NESPAK). The respective QICs inspects a lot of newly manufactured machines at the manufacturer's premises.

- Verification of the delivered machines at the premises of the farmers by the DICs (District Inspection Committees) notified for the 35 districts. Convener of the DIC is Deputy Director of Agricultural Engineering of the respective district while the respective FE represents the consultant (NESPAK).  The respective DICs verifies a machine's identity and condition at the point of delivery to the allotted farmer.

- Conduct of baseline survey of farmers before delivery of 5000 machines, conduct of midline survey of 500 (10% of baseline farmers) farmers after one year of use of machine, conduct of endline survey of 500 farmers after two years of use of machine;

- TPV of 1000 farmers who obtained machines on rent for verification of rental subsidy @ Rs. 5000 per acre with a ceiling of 25 acres.

- Design optimization by incorporate surest modification in the technical specifications of super seeder machine for the purpose of weight reduction (which at present is over 1000 kg) and cost reduction (which at present is Rs. 1,350 million). 

Today this process of QIC and DIC runs on paper and WhatsApp, coordinated around two statutory field committees: QICs and DICs.

- In both committees, PCAP's Field Engineer (FE) participates as the technical member, responsible for the hands-on inspection/verification work, cross-checking machine identity (via UID plate, QR codes, and tracker device), capturing 8 geo-tagged photographic evidence, and inspection and verification certificates that the committee signs off on. This project digitizes that entire process.

This version of the document updates the original system design to reflect the actual QIC/DIC field SOPs, and generalizes the system so it can support multiple machine types over time and other 3 activities (field survey, TPV and design optimization). Super Seeder is configured as the first machine type, using its existing approved technical specification (49 inspection parameters) and PSQCA sampling scheme as the reference model; additional machine types (tractors, threshers, rotavators, laser land levelers, etc.) can be onboarded later by defining their own parameter sets, without changing the underlying app or portal.

# **2. Objectives**

- Digitize the QIC (quality inspection data) and DIC (delivery/district verification data) processes end-to-end, replacing paper forms and WhatsApp-based submission.

- Enable Field Engineers to capture technical inspection data, identity cross-verification, and geo-tagged photographic evidence directly from the field, for any configured machine type.

- Enforce the same eligibility, sampling, and cross-verification rules used today (UID plate, punched code, tracker device) as hard gates in the app, to prevent invalid inspections from proceeding.

- Maintain a verifiable chain of custody linking a machine's QIC record to its later DIC record via UID plate signature and punched code.

- Centralize all committee, inspection, verification, and certificate data in a single, secure, auditable database.

- Give PCAP leadership a web-based MIS portal to review committee activity, manage discrepancies, and generate the monthly, quarterly and annual summary and monthly, quarterly and annual progress reports currently compiled manually.

- Design the system to be extensible to additional machine types beyond Super Seeder without re-engineering the core application.

- Develop baseline, midline and endline survey tools (questionnaires) and collection of data.

- Develop questionnaire to collect rental subsidy data and conduct TPV of rental subsidy.

- Optimize design of super seeder machine.

# **3. Project Scope**

## **3.1 In Scope**

- Android mobile application for Field Engineers, covering both QIC and DIC workflows and other 3 field activities.

- A machine-type configuration framework, pre-loaded with the Super Seeder parameter set, sampling table, and required photo set.

- MIS web portal for the Project Lead, PCAP Admin, and System Administrator.

- Central backend database and APIs connecting the app and the portal.

QIC (Quality Inspection Committee) module: eligibility gate, sampling assistant, technical checklist, bearings/lubrication register, identity cross-verification, geo-tagged photo capture, QIC certificate is downloaded by the convener of the QIC after lot inspected is accepted.

- DIC (District Inspection Committee) module: temper -check gate, chain-of-custody cross-check against the QIC record, identity cross-verification, proxy/nominee handover handling, geo-tagged photo capture, DIC certificate is downloaded by the convener of the QIC after machine is approved.

- Automated generation of the monthly, quarterly and annual summary reports and the 15-column monthly progress reports (Excel export), matching the existing manual formats both for QIC and DIC data.

- Committee and user management: QIC/DIC committees, conveners, members, divisions/districts, Field Engineer assignments.

## **3.2 Out of Scope (for this phase)**

- Farmer-facing mobile application (farmers/allottees are recorded as data subjects, not app users).

- Payment or subsidy disbursement processing not to be considered by the PCAP project FEs.

- Manufacturing of, or physical modification to, UID plates and tracking devices — the system consumes their printed and QR-encoded data but does not manage their issuance.

- Defining technical parameter sets and sampling tables for machine types other than Super Seeder (to be scoped in a later phase, per Section 12).

# **4. User Roles & Responsibilities**

| **Role** | **Platform** | **Responsibilities** |
| --- | --- | --- |
| Field Engineer (FE) | Android App | Technical member of QIC/DIC; performs eligibility checks, sampling, technical inspection/verification, identity cross-checks, geo-tagged photo capture, and certificate preparation and conduct of surveys and TPV of rental subsidy. |
| QIC Convener (Director Agri. Engineering — Division) | MIS Web Portal (edit access) | Chairs the QIC meeting; reviews the FE's inspection data; has portal access to correct certificate discrepancies; approves or defers the lot. Convener of the QIC has nothing to do with our MIS based portal |
| DIC Convener (Deputy Director Agri. Engineering — District) | MIS Web Portal (view / sign-off only) | Chairs the DIC meeting; reviews the FE's verification data; cannot edit certificate data directly — records discrepancies as a signed note; approves, defers, or authorizes proxy handover. Convener of the DIC has nothing to do with our MIS based portal |
| Committee Members (QIC/DIC) | Attendee record only | Present at the inspection/verification meeting; captured in the group photo and, optionally, as named attendees. Committee members except our FE have nothing to do with our MIS based portal |
| Manufacturer | Data subject | Premises where QIC inspection occurs; source of machine, bearing, and lubrication data and provision of data of machines inspected by the QIC on Excell. |
| Farmer / Allottee | Data subject | Premises where DIC verification occurs; may authorize a nominee to receive the machine on their behalf. |
| Project Lead / PCAP Admin | MIS Web Portal | Cross-division/district oversight; reviews committee activity; generates and exports monthly, quarterly and annual reports. |
| System Administrator | MIS Web Portal (Admin area) | Manages users, roles, committees, and the machine-type configuration (parameter sets, sampling tables, required photo sets). |

# **5. System Architecture (High-Level)**

The system is built around a central database that both the Android app and the MIS portal connect to. A machine-type configuration layer sits between the core application and the actual checklist/sampling content, so that Super Seeder's 49-parameter specification is data, not code — and additional machine types can be added the same way. System architecture will also include baseline, midline and endline data collection and TPV data for monitoring of rental subsidy.

## **5.1 Components**

- Android App (Field Engineer) — guides the FE through the QIC or DIC workflow for the machine's configured type; captures data, photos, and GPS; uploads via secure APIs.

- Machine-Type Configuration Engine — stores the parameter/checklist set, PSQCA-style sampling table, and required photo list per machine type; Super Seeder is the first configured type.

- Central Database & API Layer — stores committee, machine, manufacturer, farmer, QIC, and DIC data; enforces role-based access; serves both the app and the portal.

- MIS Web Portal (Lead / Admin / Conveners) — reviews, manages discrepancies, configures machine types, and exports reports from the same central database.

- Android App (Field Engineer) — enters baseline, midline and endline data 

- Android App (Field Engineer) — enters rental subsidy data

- Design Engineer enters progress of surest modifications

## **5.2 Data Flow (Summary)**

- A machine lot is assigned to a QIC for inspection at the manufacturer's premises; the FE receives official intimation and logs it in the app.

- The FE runs the eligibility gate (UID plate, punched code, tracker device present); ineligible machines are excluded before inspection begins.

- The app calculates the required sample size from the lot size per the configured sampling table (PSQCA scheme for sampling).

- The FE completes the technical parameter checklist (worksheet) for each sampled machine, plus the one-time bearings and lubrication register for the manufacturer. 

- The FE cross-verifies farmer name, CNIC, machine ID, and tracker IMEI against the UID plate print and the decoded UID/tracker QR codes, flagging any mismatch.

- The FE captures the required 8 geo-tagged photo set, signs off digitally

- data is uploaded to the central database (or queued offline).

- Once approved, the machine becomes eligible for delivery. As the signed QIC certificate is uploaded by the convener of the QIC on the departmental portal, the convener of the DIC immediately receives information through the departmental portal that how many machines and to which farmers the machines will be delivered by the manufacturers. Upon uploading of signed QIC certificate the manufacturer can generate his bill for release of subsidy amount (government share) At delivery, a DIC is convened at the farmer's premises.

- The FE runs the DIC eligibility (temper free UID plate and punched code) gate, then pulls the machine's QIC record from the central database to cross-check the UID-plate signature and punched-code photo (chain of custody).

- The FE cross-verifies farmer identity (including the CNIC card, now available in person), handles any proxy/nominee authorization to be approved by the convener of the DIC under his signatures, captures the DIC photo set, signs off,. As soon as the signed DIC certificate is uploaded by the convener of the DIC, the manufacturer becomes eligible to get CDR (share of the farmer) released by the Director General Agriculture.The Project Lead reviews QIC and DIC records together on the MIS portal, resolves flagged discrepancies, and exports monthly reports for PCAP.

# **6. Functional Modules**

## **6.1 Android App — Field Engineer**

### **6.1.1 Login & Authentication**

- Secure, role-based login for verified Field Engineers.

- FE sees only the QIC/DIC meetings and machines they have been assigned to or notified of.

- Optional capture of the meeting intimation (letter, e-mail, WhatsApp, memo, or call) and proof, for the FE's record to the Project Manager/Team Leader.

- FEs also see status of surveys and rental subsidy of the district allotted to them

### **6.1.2 Machine Type Selection**

- Every inspection/verification starts with a machine type; Super Seeder is pre-configured and selected by default for this phase.

- The technical checklist, sampling table, and required photo set shown to the FE are all driven by the selected machine type's configuration — not hard-coded.

### **6.1.3 QIC Module — Quality Inspection (at Manufacturer's Premises)**

Purpose: assist the Quality Inspection Committee in accepting or deferring a lot of newly manufactured machines before they are cleared for delivery.

- Eligibility gate — blocks inspection if the UID plate (with QR code) is not installed/missing, the 7-digit code is not punched/missing, or the tracking device is not installed under the mast frame.

- Sampling assistant — FE enters the lot size; the app calculates the required sample size and permissible number of defectives from the configured sampling table (PSQCA scheme for Super Seeder).

- Technical parameter checklist — configurable, grouped by assembly (for Super Seeder: General, Dimensional, Overall Dimensions, Frame Assembly, Three-Point Hitch, Power Transmission, Rotary Hoe, Furrow Opener/Coulter, Seed & Fertilizer Assembly, Press Roller, Tracking System, Branding, and Miscellaneous — 49 parameters in total), recording required vs. observed values per sampled machine.

- Bearings & lubrication register — collected once per manufacturer and reused across future inspections rather than re-captured each time.

- Identity cross-verification of downloaded QIC certificate printed information— farmer name, CNIC, machine ID, and tracker IMEI as printed on the inspection certificate are checked against the UID plate print, the decoded UID-plate QR, and the decoded tracker QR; mismatches are flagged for the QIC convener, who has portal access to correct the record.

- 7-digit code check — confirms the punched code on the machine matches the code printed on the UID plate. Also central 7 digits of the CNIC #

- Sign-off — FE records the committee's Pass / Defer result per lot, signs off digitally in the app, and (per SOP) signs the physical UID plate and machine frame; the app logs that this physical sign-off was completed.

- Geo-tagged photo capture (8 required) — manufacturer signboard; machine with installed tracker; UID plate showing FE's signature; punched 7-digit code; decoded UID-plate QR; decoded tracker QR (farmer/CNIC/implement); decoded tracker QR (manufacturer's GPS location); and the QIC team with the manufacturer.

### **6.1.4 DIC Module — District Verification (at Farmer's Premises)**

Purpose: assist the District Inspection Committee in verifying that the correct machine, in acceptable condition, reaches the correct allottee farmer.

- Eligibility (temper) gate — blocks verification if the UID plate shows signs of tampering (re-riveting, or the FE's QIC-stage signature is not in a natural, continuous flow), the punched code shows signs of tempering (grinding or re-punching), or the tracker is missing. This is a temper check, distinct from the QIC module's presence check, since the machine has already passed QIC.

- Chain-of-custody cross-check — the app pulls the machine's original QIC record from the central database and compares the UID-plate signature photo and punched-code photo captured at QIC against what the FE observes now at DIC.

- Identity cross-verification of downloaded DIC certificate printed information— farmer name and CNIC are checked against the farmer's physical CNIC card (available in person at this stage), the UID plate, the decoded UID QR, and the decoded tracker QR; mismatches are recorded as a discrepancy note under the DIC convener's signature, since the DIC convener has no portal edit access.

- Proxy / nominee handover — if the allottee farmer is not present, the app captures the nominee's WhatsApp or written authorization; if no authorization exists but the convener still authorizes handover under signature, the app requires a geo-tagged photo of the receiving person's CNIC as a mandatory condition.

- Sign-off — FE records the committee's Approved / Deferred result and signs off digitally.

- Geo-tagged photo capture (8 required) — CNIC card of the farmer or nominee (both sides); machine with installed tracker, ideally with the farmer/nominee standing beside it; UID plate showing FE's signature; punched 7-digit code; decoded UID-plate QR; decoded tracker QR (farmer/CNIC/implement); decoded tracker QR (current GPS location); and the DIC team together with the farmer.

### **6.1.5 Upload & Sync**

- Direct upload to the central database when connectivity is available; offline capture with automatic sync once back online, for low-connectivity rural areas.

- Upload status indicator (pending / synced / failed) visible to the FE.

- Signed certificate and photo set can also be shared via WhatsApp during the transition period, alongside the system upload, until manual channels are fully retired.

## **6.2 Central Database**

- Machine-Type Configuration Store — versioned parameter sets, sampling tables, and required photo lists per machine type (Super Seeder v1 pre-loaded).

- Machine Master — UID, chassis/serial number, engine number, manufacturer, batch/consignment, machine-type link.

- Manufacturer Master — bearings and lubrication reference data, captured once and reused.

- Farmer / Allottee Master — name, father name, CNIC, address, district, contact number.

- Committee Master — QIC (division-level, chaired by Director Agri. Engineering) and DIC (district-level, chaired by Deputy Director Agri. Engineering) committees, their members, and conveners.

- QIC and DIC Records — linked to each other via UID/machine ID, forming the chain of custody described in Section 5.2.

- Certificates and Discrepancy/Correction Log — append-only log of any correction (QIC, via convener portal edit) or signed discrepancy note (DIC, no portal edit), so nothing is silently overwritten.

- Full audit trail — every record, correction, and signature timestamped and attributable to a user.

## **6.3 MIS Web Portal — Project Lead / Admin / Conveners**

### **6.3.1 Data Review Dashboard**

- Real-time view of QIC and DIC records, survey and TPV data shown as a linked lifecycle per machine (Inspected → Delivered).

- Filter and search by machine type, engineer, manufacturer, farmer, division/district, status, or date range.

- Visual summary of inspection/verification progress (counts by status, by division/district).

### **6.3.2 Machine-Type & Checklist Configuration (Admin)**

- Define and version the technical parameter checklist, sampling table, and required photo set for a machine type.

- Onboard new machine types beyond Super Seeder without requiring changes to the Android app or backend code.

### **6.3.3 Certificate & Discrepancy Management**

- QIC convener — portal edit access to correct certificate fields flagged as mismatched during cross-verification.

- DIC convener — no portal edit access; discrepancies are recorded as a signed note attached to the record, and the machine can still be approved with the note visible in the audit trail.

- Full history of every correction or discrepancy note, with who made it and when.

### **6.3.4 Reporting & Export**

- Monthly QIC Summary — division-wise meetings held, machines inspected/approved/deferred, and reasons for deferment.

- Monthly DIC Summary — district-wise meetings held, machines verified/approved/deferred, and reasons for deferment.

- Monthly QIC Progress Report and Monthly DIC Progress Report — auto-populated 15-column reports matching the existing manual Excel formats (see Section 9); exported as Excel only, per current SOP requirements (no PDF or image export for these two reports).

- General dashboard summaries and ad-hoc filtered data sets remain exportable as Excel/CSV or PDF.

### **6.3.5 Committee & User Management (Admin)**

- Add/remove Field Engineers, conveners, and committee members; assign permissions.

- Maintain division and district structures used to route QIC and DIC meetings respectively.

# **7. End-to-End Workflow**

- A lot of machines (Super Seeder, initially) is scheduled for QIC inspection at the manufacturer's premises; the FE is notified and logs the intimation.

- On arrival, the FE runs the QIC eligibility gate; ineligible machines are excluded.

- The app determines the sample size from the lot size; the FE inspects the sampled machines against the 49-parameter checklist and completes the manufacturer's bearings/lubrication register (first time only).

- The FE cross-verifies identity data against the UID plate, decoded QR codes, and punched code; any mismatch is flagged for the QIC convener to correct via the portal.

- The FE captures the 8 required geo-tagged photos, signs off, and the QIC certificate is generated and uploaded.

- Approved machines proceed to delivery. A DIC is convened at the farmer's premises; the FE is notified and logs the intimation.

- The FE runs the DIC tamper-check gate, then cross-checks the UID-plate signature and punched code against the original QIC record pulled from the central database.

- The FE cross-verifies the farmer's identity (now including the physical CNIC card), handles any proxy/nominee authorization, captures the 8 required geo-tagged photos, and signs off; the DIC certificate is generated and uploaded.

- The Project Lead reviews both records as a linked pair on the MIS portal, resolves any flagged discrepancies, and generates the monthly summary and progress reports for PCAP.

# **8. Non-Functional Requirements**

- Reliability: offline capture (checklist entries and up to 8 photos per inspection) with sync-on-connectivity for rural, low-network areas.

- Security: role-based access, secure authentication, and encrypted data transfer, given this involves government, manufacturer, and farmer data — including CNIC numbers.

- Device capability: Android devices must support camera-based QR code decoding (UID plate and tracker device) and GPS geo-tagging.

- Extensibility: the machine-type configuration engine must allow a new machine type's parameter set, sampling table, and photo requirements to be added without code changes.

- Auditability: every record, correction, and discrepancy note must be timestamped and traceable to a user; QIC corrections and DIC discrepancy notes must be distinguishably logged, per their different authority levels.

- Data validation: CNIC and tracker IMEI formats validated at entry; cross-field consistency checks (UID plate vs. QR vs. tracker) run automatically wherever possible.

- Reporting constraint: the monthly QIC/DIC progress reports must be exportable strictly as Excel files, matching the current SOP requirement (no PDF or image export for these specific reports).

- Localization: support for Urdu/English for Field Engineers and generated certificates/reports.

- Scalability: the central database must handle growing volumes of machines, manufacturers, farmers, and machine types across divisions and districts.

# **9. Certificate & Report Formats (Reference)**

## **9.1 QIC Certificate (Manufacturer's Premises)**

| **Column** | **Field** |
| --- | --- |
| 1 | Allottee name (Farmer name) |
| 2 | CNIC number |
| 3 | Mailing address |
| 4 | Tehsil |
| 5 | Machine ID |
| 6 | Tracker IMEI number |

## **9.2 DIC Verification Certificate (Farmer's Premises)**

Same 6-column structure as the QIC certificate. At this stage, the farmer's physical CNIC card is also available on-site as an additional cross-check source.

## **9.3 Monthly Summary Reports**

QIC Summary — division-wise: number of QIC meetings held; number of machines inspected, approved, and deferred; reason for deferment.

DIC Summary — district-wise: number of DIC meetings held; number of machines verified, approved, and deferred; reason for deferment.

## **9.4 Monthly Progress Reports (Excel-only, 15 columns)**

QIC Progress Report columns: Sr. No., Division, District, Firm Name, Farmer Name, CNIC, Contact No., QIC Certificate #, Status of Inspection (Approved/Deferred), Unique ID, GIS Location (Lat./Lng.), Punched Code, Inspection Date, Name of FE.

DIC Progress Report columns: Sr. No., District, Farmer Name, Father Name, CNIC, Address, Contact No., DIC Certificate #, Status of Verification (Approved/Deferred), Unique ID, GPS Location (Latitude/Longitude), Punched Code, Verification/Inspection Date, Name of FE.

| **Note: **Both progress reports must be generated and exported strictly as Excel files, per current SOP — the portal should not offer PDF or image export for these two specific reports. |
| --- |

# **10. Machine-Type Configuration — Super Seeder (Reference Model)**

Super Seeder is the first machine type configured in the system and serves as the template for onboarding future machine types.

- Sampling table: PSQCA scale-of-sampling scheme, mapping lot size to sample size and permissible number of defectives, for both visual/dimensional tests and other tests (e.g., blade hardness).

- Technical parameter checklist: 49 parameters grouped under General, Dimensional Requirements, Overall Dimensions, Frame Assembly, Three-Point Hitch Assembly, Power Transmission Assembly, Rotary Hoe Assembly, Furrow Opener/Coulter Assembly, Seed & Fertilizer Assembly, Press Roller Assembly, Tracking System, Branding, and Miscellaneous (origin, accessories, O&M manual, paint, nuts & bolts, bearings, lubrication, warranty).

- Required photo set: 8 geo-tagged photos at QIC, 8 at DIC (different composition, per Sections 6.1.3 and 6.1.4).

| **Note: **Additional machine types (tractors, threshers, rotavators, laser land levelers, etc.) will need their own approved technical specification and sampling scheme confirmed with PCAP before being configured in the system — see Section 12. |
| --- |

# **11. Proposed Technology Stack**

| **Layer** | **Proposed Approach** |
| --- | --- |
| Android App | React native or cross-platform framework, with local offline storage, background sync, camera-based QR decoding, and GPS geo-tagging. |
| MIS Web Portal | Responsive web application accessible from desktop and mobile browsers. |
| Backend & APIs | REST API layer with role-based authentication (e.g., JWT-based access control). |
| Central Database | Cloud-hosted relational database (e.g., PostgreSQL/MySQL) with structured tables for machine types, machines, manufacturers, farmers, committees, QIC, and DIC records. |
| Machine-Type Configuration | Versioned, data-driven checklist/sampling/photo-requirement definitions, editable from the MIS portal admin area. |
| QR Decoding | On-device QR/barcode decoding library for reading UID-plate and tracker-device QR codes. |
| File Storage | Cloud object storage for geo-tagged inspection/verification photos, linked to each record. |
| Reporting/Export | Excel export engine for the monthly progress reports; PDF/CSV export for general dashboards and summaries. |
| Notifications | SMS/push notifications for meeting intimations and status updates to engineers, conveners, and leads. |

*Note: this stack is a proposed starting point and can be adjusted based on PCAP's hosting/infrastructure requirements and preferences.*

# **12. Assumptions & Next Steps**

## **12.1 Assumptions**

- Field Engineers will have Android smartphones capable of camera-based QR decoding and GPS geo-tagging.

- PCAP will confirm the final Super Seeder checklist, sampling table, and photo requirements as the system's first configured machine type.

- UID plates and tracker devices (and their QR encoding) continue to be issued and installed outside this system; the app only reads and cross-verifies their data.

- Internet connectivity in the field may be intermittent; offline capture and sync is required for both QIC and DIC modules.

## **12.2 Next Steps**

- Confirm the exact data fields and validation rules for the QIC and DIC certificates and the two monthly progress reports with PCAP.

- Define the process and access rules for onboarding a second machine type beyond Super Seeder, to validate the configuration engine's extensibility.

- Confirm the discrepancy-handling workflow: QIC convener portal-edit rights vs. DIC convener signed-note-only process.

- Confirm minimum photo/GPS accuracy requirements for geo-tagged evidence.

- Confirm whether WhatsApp-based submission should run in parallel with the system during a transition period, and for how long.

- Proceed to UI/UX design and technical architecture sign-off.