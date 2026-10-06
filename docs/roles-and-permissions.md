---
title: Roles and Permissions
description: User roles, platforms and responsibilities; includes the unresolved convener-portal-access contradiction.
source_sections: "4, 6.3.3"
status: draft
---

# Roles and Permissions

| Role | Platform | Responsibilities |
|---|---|---|
| **Field Engineer (FE)** | Android app | Technical member of QIC/DIC. Eligibility checks, sampling, technical inspection/verification, identity cross-checks, geo-tagged photos, certificate preparation; conducts surveys and TPV of rental subsidy. Sees only meetings/machines assigned or notified to them, plus survey and rental-subsidy status for their allotted district. |
| **QIC Convener** (Director Agri. Engineering — Division) | See conflict below | Chairs QIC meeting; reviews FE inspection data; corrects certificate discrepancies; approves or defers the lot. |
| **DIC Convener** (Deputy Director Agri. Engineering — District) | See conflict below | Chairs DIC meeting; reviews FE verification data; **cannot edit certificate data** — records discrepancies as a signed note; approves, defers, or authorizes proxy handover. |
| **Committee members** (QIC/DIC) | Attendee record only | Present at meeting; captured in group photo and optionally as named attendees. |
| **Manufacturer** | Data subject | QIC premises; source of machine, bearing and lubrication data; provides data of QIC-inspected machines in Excel. |
| **Farmer / Allottee** | Data subject | DIC premises; may authorize a nominee to receive the machine. |
| **Project Lead / PCAP Admin** | MIS web portal | Cross-division/district oversight; reviews committee activity; generates and exports monthly/quarterly/annual reports. |
| **System Administrator** | MIS web portal (Admin) | Manages users, roles, committees and machine-type configuration (parameter sets, sampling tables, required photo sets). |
| **Design Engineer** | (Android/portal — unspecified) | Appears once in the source: enters progress of suggested design modifications. See OQ-04. |

## ⚠️ Unresolved: convener access to the MIS portal (OQ-01)

The source contradicts itself:

- The role table and §6.3.3 give the **QIC convener portal edit access** and the **DIC convener view/sign-off only**.
- The same table rows then state that conveners (and all committee members except the FE) "have **nothing to do with our MIS based portal**".

**Treat as undecided.** Suggested default (not from source): model convener permissions as role-based configuration so convener access can be enabled or disabled without code changes, and do not build convener-facing UI until PCAP confirms.

## Permission invariants (stable regardless of OQ-01)

- DIC convener never edits certificate data; only signed discrepancy notes (BR-DIC-03).
- QIC corrections and DIC discrepancy notes are logged as different record types (BR-GEN-03).
- FE data visibility is scoped to assigned/notified meetings and machines (BR-GEN-04).
