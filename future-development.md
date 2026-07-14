# Future Development Tracker

> Items deferred from MVP that need implementation in later phases.

---

## 1. NPWP Verification — DJP API Integration

**Current State (MVP):** Format validation only (15-digit check)
**Target:** Real-time NPWP validation via DJP API
**Phase:** Phase 2-3

### Implementation Path
- Partner with PJAP (OnlinePajak/Klikpajak/Pajak.io) who has DJP API access
- Use their API to validate NPWP number against DJP database
- Return: name matching, NPWP status (active/inactive), registration date

### Requirements
- [ ] PJAP partnership finalized
- [ ] API integration for NPWP lookup
- [ ] Error handling for invalid/not-found NPWP
- [ ] Rate limiting (DJP API may have limits)
- [ ] User consent for data verification (UU PDP)

### Notes
- Manual review fallback should remain even after API integration
- Admin dashboard should show verification status per user

---

## 2. Consultant Certification Database Lookup

**Current State (MVP):** Trust-based, auto-approved, manual rejection via admin dashboard
**Target:** Automated verification against PPSKP/IKPI certification database
**Phase:** Phase 2-3

### Implementation Path
- Check if PPSKP or IKPI has a public API or database for certified consultants
- Cross-reference: Sertifikat Konsultan Pajak number + Izin Praktik number
- Auto-flag consultants whose certification has expired or is not found

### Requirements
- [ ] Research PPSKP/IKPI database availability
- [ ] Build verification service (batch or real-time)
- [ ] Admin dashboard: show verification status, flag expired certs
- [ ] Notification to consultants when cert is expiring (30 days before)
- [ ] Auto-suspend consultants with expired certification

### Notes
- Manual review should remain as fallback
- Consider building relationship with IKPI for bulk verification
- Document the verification flow in compliance docs

---

## 3. Enhanced Chat Features

**Current State (MVP):** Text-only chat, file upload
**Target:** Rich chat with screen sharing, voice notes, tax document annotation
**Phase:** Phase 2

### Features to Add
- [ ] Voice messages
- [ ] Screen sharing (for showing how to fill forms)
- [ ] Document annotation (mark up SPT forms together)
- [ ] Chat search (find old conversations)
- [ ] Export chat as PDF (for record-keeping)

---

## 4. Video Consultation

**Current State (MVP):** Not included
**Target:** In-app video calls for premium sessions
**Phase:** Phase 2

### Implementation
- [ ] Integrate Agora or Twilio video SDK
- [ ] Video call UI (picture-in-picture, screen share)
- [ ] Recording (with consent) for compliance
- [ ] Premium pricing tier for video sessions

---

## 5. AI Tax Assistant

**Current State (MVP):** Not included
**Target:** Basic Q&A bot for common tax questions
**Phase:** Phase 3

### Features
- [ ] Train on UU PPh, PP 23/2018, common SPT questions
- [ ] Free tier: basic questions
- [ ] Paid tier: complex analysis, document review
- [ ] Handoff to human consultant when AI can't answer

---

## 6. Subscription Plans

**Current State (MVP):** Pay-per-session only
**Target:** Monthly/annual plans for regular compliance
**Phase:** Phase 3

### Tiers (Illustrative)
- **Free:** Browse consultants, basic tax calculator, limited AI Q&A
- **Individual (Rp 50K-150K/month):** 2 chat sessions/month, document vault, tax reminders
- **UMKM (Rp 300K-500K/month):** Monthly compliance check, dedicated consultant
- **Business (Rp 2-5M/month):** Full compliance, multi-NPWP, priority support

---

## 7. Phone OTP Authentication

**Current State (MVP):** Google SSO only
**Target:** Phone OTP (WhatsApp/SMS) + Google SSO
**Phase:** Phase 2

### Implementation
- [ ] WhatsApp Business API for OTP delivery
- [ ] SMS fallback (Twilio or local provider)
- [ ] Phone number verification flow
- [ ] Rate limiting on OTP requests
- [ ] Cost management (SMS costs per OTP)

---

*Last updated: 2026-07-14*
