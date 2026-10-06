---
title: Project Overview
description: Program background, the five project assignments, objectives, scope and staffing for the PCAP Farm Machinery Monitoring System.
source_sections: "1, 2, 3"
status: draft
---

# Project Overview

## Background

**PCAP** = Punjab Clean Air Program (Agriculture Component). World Bank–funded, executed by the Government of the Punjab, Agriculture Department, through the Directorate General Agriculture (Field), Punjab, Lahore.

- Supplies **5,000 super seeder machines** at subsidized rates, **40:60** (40% farmer share, 60% government share).
- Machines are delivered in **35 districts** of the Punjab.
- Consultant: **NESPAK**. Field Engineers (FEs) represent the consultant on inspection committees.

## Project staff

One PM/TL, one Mechanization/Procurement Expert, one M&E Specialist, one Project Coordinator, one GIS Specialist (10 man-months), one IT Specialist (7 man-months), and **22 Field Engineers**. Source states: "5 of the FEs will look after 11 districts" (see `open-questions.md` OQ-09).

## The five assignments of project staff

1. **QIC inspection** of machines at the premises of **28 manufacturing firms**, by Quality Inspection Committees notified for 5 divisions (Gujranwala, Faisalabad, Lahore, Sahiwal, Multan). Convener: Director of Agricultural Engineering of the division; the FE represents the consultant. A QIC inspects a *lot* of newly manufactured machines.
2. **DIC verification** of delivered machines at farmers' premises, by District Inspection Committees notified for the 35 districts. Convener: Deputy Director of Agricultural Engineering of the district; the FE represents the consultant. A DIC verifies machine identity and condition at delivery to the allotted farmer.
3. **Surveys:** baseline survey of farmers before delivery of the 5,000 machines; midline survey of 500 farmers (10% of baseline) after one year of machine use; endline survey of 500 farmers after two years.
4. **TPV (third-party verification)** of 1,000 farmers who obtained machines on rent, to verify the rental subsidy of **Rs. 5,000 per acre, ceiling 25 acres**.
5. **Design optimization** of the super seeder: incorporate suggested modifications to the technical specification to reduce weight (currently over 1,000 kg) and cost (source: "at present is Rs. 1,350 million" — see OQ-04).

Today the QIC/DIC process runs on **paper and WhatsApp**. In both committees the FE is the **technical member**: hands-on inspection/verification, cross-checking machine identity (UID plate, QR codes, tracker device), capturing **8 geo-tagged photos**, and preparing the inspection/verification certificates the committee signs. **This project digitizes that entire process.**

## Generalization requirement

Super Seeder is the **first configured machine type**, using its approved technical specification (**49 inspection parameters**) and the **PSQCA** sampling scheme as the reference model. Other machine types (tractors, threshers, rotavators, laser land levelers, etc.) must be onboardable later by defining parameter sets — **without changing the app or portal**. The system must also support the other three activities (surveys, TPV, design optimization).

## Objectives

1. Digitize QIC (quality inspection) and DIC (delivery/district verification) end-to-end, replacing paper and WhatsApp submission.
2. Let FEs capture technical inspection data, identity cross-verification and geo-tagged photo evidence in the field, for any configured machine type.
3. Enforce current eligibility, sampling and cross-verification rules (UID plate, punched code, tracker device) as **hard gates** in the app.
4. Maintain a verifiable **chain of custody** from a machine's QIC record to its DIC record via UID plate signature and punched code.
5. Centralize all committee, inspection, verification and certificate data in one secure, auditable database.
6. Give PCAP leadership a web MIS portal to review committee activity, manage discrepancies, and generate monthly/quarterly/annual summary and progress reports (currently compiled manually).
7. Make the system extensible to more machine types without re-engineering the core.
8. Develop baseline, midline and endline survey tools (questionnaires) and data collection.
9. Develop a questionnaire to collect rental-subsidy data and conduct TPV.
10. Optimize the super seeder design.

## In scope

- Android app for FEs covering QIC, DIC and the other three field activities.
- Machine-type configuration framework, pre-loaded with the Super Seeder parameter set, sampling table and required photo set.
- MIS web portal for Project Lead, PCAP Admin and System Administrator.
- Central backend database and APIs.
- **QIC module:** eligibility gate, sampling assistant, technical checklist, bearings/lubrication register, identity cross-verification, geo-tagged photo capture; QIC certificate issued after the lot is accepted.
- **DIC module:** tamper-check gate, chain-of-custody cross-check against the QIC record, identity cross-verification, proxy/nominee handling, geo-tagged photo capture; DIC certificate issued after the machine is approved.
- Automated monthly/quarterly/annual summary reports and the 15-column monthly progress reports (Excel), matching existing manual formats for both QIC and DIC.
- Committee and user management: QIC/DIC committees, conveners, members, divisions/districts, FE assignments.

## Out of scope (this phase)

- Farmer-facing mobile app (farmers/allottees are data subjects, not users).
- Payment or subsidy disbursement processing.
- Manufacturing or modifying UID plates and tracking devices (the system consumes their printed/QR data; it does not manage issuance).
- Parameter sets and sampling tables for machine types other than Super Seeder (later phase).
