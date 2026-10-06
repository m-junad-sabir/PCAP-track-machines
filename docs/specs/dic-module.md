---
title: DIC Module Spec
description: Android-app District Inspection Committee module — tamper gate, chain-of-custody check, identity verification, proxy/nominee handover, photos, sign-off.
source_sections: "6.1.4, 7"
status: draft
---

# DIC Module — District Verification (Farmer's Premises)

**Purpose:** verify that the **correct machine**, in **acceptable condition**, reaches the **correct allottee**. Rules: BR-DIC-01…06.

## Flow

1. **Start:** FE logs the DIC meeting intimation.
2. **Tamper gate** (BR-DIC-01) — distinct from QIC's presence check, since the machine already passed QIC. Block if:
   - UID plate shows tampering (re-riveting, or the FE's QIC-stage signature is not in a natural, continuous flow)
   - punched code shows tampering (grinding or re-punching)
   - tracker is missing
3. **Chain-of-custody cross-check** (BR-DIC-02) — app pulls the machine's QIC record from the central DB; compares the QIC-captured UID-plate signature photo and punched-code photo with what the FE observes now.
4. **Identity cross-verification** (BR-DIC-03) — on the *downloaded DIC certificate's printed information*: farmer name and CNIC vs the **physical CNIC card**, UID plate, decoded UID QR, decoded tracker QR. Mismatch → **discrepancy note under the DIC convener's signature** (no portal edit). Machine may still be approved with the note visible in the audit trail.
5. **Proxy / nominee handover** (BR-DIC-04):
   - Allottee absent → capture nominee's WhatsApp or written authorization.
   - No authorization but convener authorizes handover under signature → **mandatory geo-tagged photo of the receiving person's CNIC**.
6. **Sign-off** (BR-DIC-05) — **Approved / Deferred**; FE signs digitally.
7. **Photos** (BR-DIC-06) — **8 geo-tagged photos**:
   1. CNIC card of farmer or nominee (**both sides** — one or two images: OQ-06)
   2. Machine with installed tracker, ideally with farmer/nominee standing beside it
   3. UID plate showing the FE's signature
   4. Punched 7-digit code
   5. Decoded UID-plate QR
   6. Decoded tracker QR — farmer / CNIC / implement
   7. Decoded tracker QR — **current** GPS location
   8. DIC team together with the farmer

## Outputs
DIC certificate (6 columns, same structure as QIC — `reports-and-certificates.md`); DIC record linked to QIC record; rows for Monthly DIC Summary and DIC Progress Report.

## After DIC (external)
Signed DIC certificate uploaded by the convener → manufacturer eligible for CDR (farmer's share) release by Director General Agriculture. See `../workflow.md`.
