# Indonesia Tax Consultation & Filing App — Comprehensive Project Plan

> **Concept:** "Halodoc for Tax" — On-demand marketplace connecting taxpayers with certified tax consultants, plus integrated SPT filing, document management, and tax education.

---

## 1. Market Overview

### The Opportunity

- **Indonesia taxpayers (2025):** ~70M+ registered NPWP, ~19M+ SPT filers annually
- **Tax-to-GDP ratio:** ~10-12% (low vs regional peers) — government aggressively pushing compliance
- **Coretax migration:** DJP modernizing to Coretax system, opening API integrations (api-djp.pajak.go.id)
- **Digital literacy gap:** Most taxpayers (especially employees, freelancers, UMKM) find tax filing confusing
- **Consultant gap:** Many people go to formal tax firms (KAP) which are expensive and overkill for simple needs

### Key Pain Points

| Pain Point | Who Feels It |
|---|---|
| "I don't know how to fill my SPT" | Employees, freelancers |
| "I'm afraid of making mistakes & getting audited" | All segments |
| "Formal tax consultants are too expensive" | Individuals, UMKM |
| "I don't have time to learn tax regulations" | Busy professionals |
| "Tax apps are too enterprise-focused" | Individuals, small businesses |

### Market Size (TAM/SAM/SOM)

- **TAM:** 70M+ registered taxpayers in Indonesia — at least 40M need SOME assistance filing SPT annually
- **SAM:** Individuals + freelancers + UMKM who would pay for affordable tax assistance: ~15-20M
- **SOM (Year 1-2):** 10,000-50,000 users, focus on urban professionals + freelancers

---

## 2. Competitive Landscape

### Category A: Enterprise Tax SaaS (NOT direct competitors — too expensive, B2B focus)

| Platform | Backed By | Focus | Pricing |
|---|---|---|---|
| **OnlinePajak** | Private | Full-stack: invoicing, tax filing, payment automation | Freemium → paid tiers |
| **Klikpajak (Mekari)** | Mekari | e-Faktur, e-Bupot, PPh 21, SPT Tahunan | Free basic → premium |
| **Pajak.io** | Private | Deep tax automation for mid-large enterprises | Custom enterprise pricing |
| **PajakExpress** | Private | API integrations, enterprise tax compliance | Custom |
| **AyoPajak** | Private | API host-to-host tax filing | Custom |

**Insight:** These are SaaS tools for *companies*. They don't offer human consultation or serve individuals well.

### Category B: Consultant Marketplace (MOST DIRECT COMPETITORS)

| Platform | Model | Strengths | Weaknesses |
|---|---|---|---|
| **Tax Point** | AI + konsultan bersertifikat, web-based | Affordable, AI-assisted, educational focus | Still new (Mar 2024), web only, no mobile app |
| **Flazztax** | Connects to consultants nationwide | Broad coverage, individual + corporate | More of a directory/listing, not full marketplace |
| **Taxku** | Mobile app for individuals | Simple, easy for individuals | No corporate support, limited features |
| **Pajakku** | Web-based | Simulasi pajak | Low popularity, not well funded |

### Category C: Traditional Consultants (online presence)

| Firm | Focus | Pricing |
|---|---|---|
| MUC Consulting | Corporate + individual | Mid-high |
| DDTC | Elite/technical tax | High |
| SF Consulting | Boutique, young entrepreneurs | Mid |
| KAP Kanaka | Startups, fintech | Mid |
| Ideatax | Professional tax consulting | Mid-high |

### The Gap (YOUR OPPORTUNITY)

```
       Human Consultation
              │
   Tax Point  │    TRADITIONAL FIRMS (MUC, DDTC, EY)
   Flazztax   │        (expensive, formal)
      │       │
      ├───────┤────────────────►
      │       │              Technology
      │       │
   Typical    │
   user does  │
   it alone   │    OnlinePajak, Klikpajak, Pajak.io
   (DJP       │        (enterprise SaaS, no human touch)
   Online)    │
              │
```

**The white space:** Affordable, on-demand human consultation + tech-assisted filing — in a mobile app — for individuals and small businesses.

---

## 3. Target Users & Personas

### Persona A: "Budi the Employee" (Primary)
- **Age:** 25-40
- **Status:** Karyawan with single NPWP, monthly PPh 21 deducted by employer
- **Pain:** Needs to file SPT Tahunan in March. Has 1721-A1 from employer but doesn't know how to input it. Afraid of errors.
- **Willingness to pay:** Rp 100K-300K for someone to just "do it for me"
- **Behavior:** Uses Gojek, Tokopedia, mobile banking daily. Expects app-based solution.

### Persona B: "Sarah the Freelancer" (Primary)
- **Age:** 22-35
- **Status:** Freelancer/creator, multiple income sources, no employer withholding
- **Pain:** Needs to calculate, pay, and report her own taxes. Doesn't understand PPh final vs PPh 21. Worried about being audited.
- **Willingness to pay:** Rp 200K-500K/session for proper guidance + filing
- **Behavior:** Active on social media, uses digital nomad tools, price-sensitive but willing to pay for peace of mind

### Persona C: "Pak Rudi the UMKM Owner" (Secondary)
- **Age:** 35-55
- **Status:** Local business owner (PP 23/2018 regime, turnover <4.8B)
- **Pain:** Knows he should pay PPh Final 0.5%. Needs help with monthly reporting and annual SPT. Also confused about PPN threshold.
- **Willingness to pay:** Rp 300K-1M/month for ongoing compliance
- **Behavior:** Not very tech-savvy, prefers WhatsApp-based communication, needs hand-holding

### Persona D: "PT ABC the Small Company" (Growth segment)
- **Status:** 5-50 employees, multiple tax types (PPh 21, 23, 4(2), PPN)
- **Pain:** Monthly reporting burden, needs dedicated consultant
- **Willingness to pay:** Rp 2-5M/month for full compliance service

---

## 4. Regulatory Framework

### Consultant Certification (PMK 111/2014 → PMK 175/2022)

- **3 levels of certification:**
  - **Level A:** Can serve individual taxpayers (except those with P3B treaties)
  - **Level B:** Can serve individuals + domestic corporations (except PMA/BUT)
  - **Level C:** Full scope, including foreign investment entities
- **Path to certification:** USKP exam (Ujian Sertifikasi Konsultan Pajak), held ≥2x/year by PPSKP
- **Izin praktik:** Required to legally practice as a tax consultant
- **Brevet A/B/C:** Legacy certification (no longer sufficient — must pass USKP)
- **Pensiunan DJP:** Can get certification through penyetaraan pathway

### Your App's Role

- **You don't need to BE a tax consultant** — you're a marketplace/platform
- **You DO need to verify** that consultants on your platform have valid Sertifikat Konsultan Pajak + Izin Praktik
- **Liability:** Ensure your ToS clearly state you're a platform, not a consulting firm
- **Data:** Must comply with UU PDP (Personal Data Protection Law)

### DJP Integration

- **PJAP (Penyedia Jasa Aplikasi Perpajakan):** Becoming a registered PJAP allows direct DJP system access
- **API-djp.pajak.go.id:** DJP's API gateway (currently in production)
- **Coretax System:** DJP's modernization project — new API interfaces being built
- **Existing PJAPs:** OnlinePajak, Klikpajak, Pajak.io, PajakExpress, AyoPajak — they already have the integration
- **Strategy:** Either become PJAP directly OR partner with existing PJAP (easier path to start)

---

## 5. Technical Architecture

### Platform Decision

> **Web app only** — No native mobile app. Single codebase using TanStack Start (React) with SSR/CSR hybrid rendering. Deploys to IDCloudHost for Indonesian data residency compliance.

---

### 5A. Frontend Architecture

#### Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | TanStack Start | Full-stack React framework, SSR/CSR, built on TanStack Router, lightweight, deploys anywhere |
| **Routing** | TanStack Router | Type-safe routing, file-based + code-based, search params as state |
| **Data Fetching** | TanStack Query | Caching, background refetch, optimistic updates, pagination |
| **Tables** | TanStack Table | Headless table for consultant listings, tax tables, admin data |
| **Forms** | TanStack Form (default) + React Hook Form (fallback) | Type-safe forms with validation; RHF as proven fallback |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + pre-built accessible components |
| **State (client)** | Zustand | Lightweight global state (auth, theme, locale) |
| **Validation** | Zod | Schema validation shared between FE and BE |
| **Icons** | Lucide Icons | Consistent with shadcn/ui, tree-shakeable |
| **Testing** | Vitest + Testing Library + Playwright | Unit, integration, E2E |

#### SSR vs CSR Page Strategy

| Page Type | Rendering | Reason |
|---|---|---|
| **Blog / Content** | SSR + SSG (MDX) | SEO-critical, Google indexing, tax education content |
| **Landing Pages** | SSR | SEO, marketing, social sharing previews |
| **Consultant Profiles** | SSR | SEO for consultant names, specialties, ratings |
| **Tax Category Pages** | SSR | SEO for tax type keywords (PPh 21, PPN, etc.) |
| **Dashboard** | CSR | Authenticated, dynamic, no SEO needed |
| **Chat / Consultation** | CSR | Real-time, WebSocket, interactive |
| **Booking Flow** | CSR | Multi-step wizard, form state, payment |
| **Settings / Profile** | CSR | User-specific, no SEO value |
| **Admin Panel** | CSR | Internal tool, no SEO |

**Implementation pattern (TanStack Start):**
```
app/
├── routes/
│   ├── _layout.tsx              # Shared layout (header, footer)
│   ├── _layout.blog.tsx         # Blog layout (SSR)
│   ├── _layout.blog.$slug.tsx   # Individual blog post (SSR)
│   ├── _layout.consultants.tsx  # Consultant listing (SSR)
│   ├── _layout.consultants.$id.tsx  # Consultant profile (SSR)
│   ├── dashboard.tsx            # Dashboard layout (CSR)
│   ├── dashboard.chat.tsx       # Chat page (CSR)
│   ├── dashboard.booking.tsx    # Booking flow (CSR)
│   └── dashboard.settings.tsx   # Settings (CSR)
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── consultant/              # Consultant-specific components
│   ├── booking/                 # Booking flow components
│   └── chat/                    # Chat components
├── lib/
│   ├── query-client.ts          # TanStack Query config
│   ├── api.ts                   # API client (fetch wrapper)
│   └── utils.ts                 # Shared utilities
└── styles/
    └── globals.css              # Tailwind + custom tokens
```

#### Blog Content Strategy

| Phase | Source | Migration Path |
|---|---|---|
| **MVP** | MDX files in repo | Git-based workflow, developer-managed |
| **Phase 2** | MDX + database hybrid | Some posts from admin panel |
| **Phase 3** | Headless CMS (Strapi/Sanity) or DB-driven | Full CMS for content team |

#### Component Library (shadcn/ui)

Pre-built components to install:
- `button`, `input`, `select`, `textarea`, `checkbox`, `radio-group`
- `card`, `dialog`, `sheet`, `drawer`, `popover`
- `table`, `data-table` (with TanStack Table integration)
- `form` (with React Hook Form integration)
- `tabs`, `accordion`, `collapsible`
- `avatar`, `badge`, `tooltip`, `toast`
- `calendar`, `date-picker` (for scheduling)
- `command`, `combobox` (for search/filter)

---

### 5B. Backend Architecture

#### Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js (v20+) | JavaScript/TypeScript shared with FE, large ecosystem |
| **Framework** | NestJS | Enterprise-grade, modular, TypeScript-first, good for API-heavy workloads |
| **Database** | PostgreSQL (primary) | ACID-compliant, complex queries, JSON support |
| **Cache / Queue** | Redis | Session cache, rate limiting, pub/sub for real-time |
| **ORM** | Drizzle ORM | Type-safe, lightweight, SQL-first, great with TypeScript |
| **File Storage** | S3-compatible (IDCloudHost Object Storage) | Document vault, receipts, SPT PDFs |
| **Real-time Chat** | Socket.io or ws (WebSocket) | Consultant-user chat |
| **Video Call** | Agora / Twilio SDK | Video consultation (Phase 2) |
| **Payment** | Midtrans / Xendit | Indonesia-specific payment gateway |
| **Notification** | WhatsApp API (WABA) + Email (Resend/SendGrid) | Multi-channel notifications |
| **Auth** | Google SSO (MVP), Phone OTP (Phase 2) | Secure auth, low friction |
| **AI/ML** | OpenAI API / Gemini | Basic tax Q&A bot (Phase 3) |
| **Validation** | Zod | Shared schema with FE |
| **API Style** | REST (OpenAPI spec) | Standard, well-documented, TanStack Query compatible |

#### API Design

```
/api/v1/
├── /auth
│   ├── POST   /register          # User registration
│   ├── POST   /login             # Login (phone/email)
│   ├── POST   /logout            # Logout
│   └── POST   /refresh           # Refresh token
├── /users
│   ├── GET    /me                # Current user profile
│   ├── PATCH  /me                # Update profile
│   └── GET    /me/documents      # User documents
├── /consultants
│   ├── GET    /                  # List/search consultants
│   ├── GET    /:id               # Consultant profile
│   ├── GET    /:id/availability  # Available time slots
│   ├── GET    /:id/reviews       # Consultant reviews
│   └── POST   /:id/book          # Book consultation
├── /consultations
│   ├── GET    /                  # User's consultations
│   ├── GET    /:id               # Consultation detail
│   ├── POST   /:id/message       # Send message in chat
│   ├── GET    /:id/messages      # Get chat history
│   └── PATCH  /:id/status        # Update status
├── /orders
│   ├── GET    /                  # User's orders
│   ├── POST   /                  # Create order
│   ├── GET    /:id               # Order detail
│   └── POST   /:id/pay           # Initiate payment
├── /payments
│   ├── POST   /callback          # Midtrans webhook
│   └── GET    /:id/status        # Payment status
├── /tax
│   ├── GET    /categories        # Tax categories
│   ├── GET    /rates             # Tax rate tables
│   ├── POST   /calculate         # Tax calculator
│   └── POST   /spt/submit        # SPT submission (via PJAP)
├── /blog
│   ├── GET    /posts             # List blog posts (if DB-driven)
│   └── GET    /posts/:slug       # Blog post detail
└── /admin
    ├── /consultants              # Consultant management
    ├── /orders                   # Order management
    ├── /analytics                # Dashboard analytics
    └── /content                  # Content management
```

#### Database Schema (Core Tables)

```sql
-- Users
users (id, phone, email, name, npwp, role, created_at, updated_at)

-- Consultants
consultants (id, user_id, cert_level, cert_number, izin_praktik, 
             specializations, bio, price_per_session, rating, 
             total_reviews, is_verified, is_online, created_at)

-- Consultant Availability
consultant_schedules (id, consultant_id, day_of_week, start_time, end_time)

-- Consultations
consultations (id, user_id, consultant_id, type, status, 
               started_at, ended_at, created_at)

-- Messages
messages (id, consultation_id, sender_id, content, type, created_at)

-- Orders & Payments
orders (id, user_id, consultant_id, consultation_id, service_type, 
        amount, platform_fee, status, created_at)
payments (id, order_id, method, external_id, status, paid_at)

-- Documents
documents (id, user_id, consultation_id, filename, url, type, created_at)

-- Reviews
reviews (id, consultation_id, user_id, consultant_id, rating, comment, created_at)

-- Blog Posts (for future DB-driven)
blog_posts (id, slug, title, content, excerpt, author_id, 
            status, published_at, created_at, updated_at)
```

#### System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────┐
│                  TANSTACK START (React)                   │
│  SSR: Blog, Landing, Consultant Profiles                 │
│  CSR: Dashboard, Chat, Booking, Settings                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ TanStack │  │ TanStack │  │ TanStack │  │ shadcn/ │ │
│  │  Query   │  │  Table   │  │  Form    │  │   ui    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (OpenAPI)
┌────────────────────────▼────────────────────────────────┐
│                   NESTJS API SERVER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │Consultant│  │  Order   │  │ Payment │ │
│  │  Module  │  │  Module  │  │  Module  │  │  Module │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Tax    │  │   Chat   │  │  Blog    │  │  Admin  │ │
│  │  Engine  │  │  Module  │  │  Module  │  │  Module │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────┘
          │              │              │
┌─────────▼──┐  ┌────────▼──┐  ┌────────▼──────────────┐
│ PostgreSQL │  │   Redis   │  │  S3-compatible        │
│  (primary) │  │  (cache)  │  │  (IDCloudHost)        │
└────────────┘  └───────────┘  └───────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ PJAP API │  │ Midtrans │  │ WhatsApp │  │OpenAI/  │ │
│  │ (DJP)    │  │ (Payment)│  │   API    │  │ Gemini  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────────────────────────────────────────┘
```

#### Integration Strategy for DJP

**Option A: Partner with existing PJAP (FASTER, RECOMMENDED for MVP)**
- Partner with OnlinePajak, Klikpajak, or Pajak.io via their API
- They handle direct DJP submission, you handle the marketplace layer
- Pros: Fast to market, no need to become PJAP, they handle compliance
- Cons: Revenue share, dependency on partner, limited control

**Option B: Become PJAP directly (SLOWER, LONG-TERM GOAL)**
- Register as PJAP with DJP
- Build direct integration with api-djp.pajak.go.id
- Pros: Full control, direct relationship with DJP, no revenue share
- Cons: Longer timeline, regulatory overhead, significant compliance requirements

**Recommendation:** Option A for MVP, transition to Option B in Year 2.

#### Infrastructure & Deployment

| Component | Technology | Notes |
|---|---|---|
| **Hosting** | IDCloudHost | Indonesian data residency (UU PDP compliance) |
| **Container** | Docker | Standard containers for FE + BE |
| **Reverse Proxy** | Nginx | SSL termination, routing, rate limiting |
| **CI/CD** | GitHub Actions | Build, test, deploy pipeline |
| **Monitoring** | Grafana + Prometheus | Metrics, alerts |
| **Logging** | Loki or ELK | Centralized logging |
| **Error Tracking** | Sentry | Error monitoring, performance |

---

### 5C. Design Style Guide

> **Primary Reference:** Halodoc (Indonesian healthcare marketplace) — closest UX pattern to our tax consultation marketplace.
> **Secondary Reference:** Preply (global tutor marketplace) — booking flow, consultant cards, review system.

#### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#e0004d` | Main CTA buttons, active states, brand |
| `--primary-hover` | `#b3003e` | Button hover |
| `--primary-active` | `#86002e` | Button pressed |
| `--primary-light` | `#fce6ed` | Light backgrounds, tags |
| `--info` | `#1f91bf` | Info badges, consultant verified |
| `--info-bg` | `#e9f4f9` | Info card backgrounds |
| `--warning` | `#e0340b` | Warning states |
| `--warning-bg` | `#f9f1e8` | Warning card backgrounds |
| `--success` | `#07875a` | Success states, payment confirmed |
| `--success-bg` | `#e6f3ef` | Success card backgrounds |
| `--critical-bg` | `#fcebe7` | Error card backgrounds |
| `--text-primary` | `#333333` | Primary text |
| `--text-secondary` | `#666666` | Secondary text, subtitles |
| `--text-disabled` | `#999999` | Disabled text |
| `--border` | `#d9d9d9` | Card borders |
| `--background` | `#ffffff` | Page background |
| `--background-gray` | `#f9f9f9` | Section backgrounds |

#### Typography

| Token | Value | Usage |
|---|---|---|
| **Font Family** | `Inter`, sans-serif | All text (self-hosted) |
| **Font Weights** | 400, 500, 600 | Body, medium emphasis, headings/buttons |
| **xs** | `12px` | Captions, button S |
| **sm** | `14px` | Body text, card titles |
| **base** | `16px` | Default body, button L |
| **lg** | `18px` | Section headers |
| **xl** | `20px` | Page headings |
| **2xl** | `24px` | Hero headings |

#### Spacing & Radius

| Token | Value |
|---|---|
| `radius-sm` | `4px` (cards, inputs) |
| `radius-md` | `8px` (dialogs, snackbars) |
| `radius-lg` | `12px` (bottom sheets) |
| `radius-xl` | `16px` (modals) |

#### Component Patterns (from Halodoc)

| Component | Pattern |
|---|---|
| **Consultant Card** | Photo (circle) + Name + Specialization + Rating + Price + "Chat"/"Book" CTA |
| **Status Cards** | Info (blue), Warning (orange), Success (green), Critical (red) |
| **Buttons** | Primary (filled), Secondary (outlined), Plain (text) — 4 sizes (S/M/L/XL) |
| **Dialogs** | Desktop: 16px radius + shadow. Mobile: bottom sheet (12px top radius) |
| **Snackbar/Toast** | Dark bg (#333), 8px radius, centered, max 3 lines |
| **Skeleton Loading** | Shimmer gradient, 4px radius, circular for avatars |

#### Trust Signals (from Halodoc)

- Verified badge (blue info color) on certified consultants
- Certification level display (A/B/C)
- Star ratings with review count
- Status cards for order states
- Professional credentials visible on profiles

#### Booking Flow (from Preply)

1. Consultant discovery (search + filters)
2. Consultant profile (details, reviews, availability)
3. Time slot selection (calendar picker)
4. Payment (Midtrans: GoPay, OVO, QRIS, Bank Transfer)
5. Confirmation (summary + next steps)

---

## 6. Product Features & Roadmap

### Phase 1: MVP (Month 1-4) — "The Core Loop"

**Purpose:** Validate the simplest value proposition: "Upload documents, get paired with a consultant, get your SPT done."

| Feature | Details |
|---|---|
| **User Registration** | Phone/email + NPWP verification. Google/Apple SSO optional. |
| **Consultant Discovery** | List of verified consultants with profiles, certification level, ratings, price/session |
| **Chat Consultation** | Text-based chat with consultant. Session-based (not infinite). |
| **Basic Document Upload** | Upload photos/PDFs of 1721-A1, receipts, etc. |
| **Order System** | Book a consultation session. Pay via Midtrans. |
| **Consultant Dashboard** | Accept/reject orders, manage sessions, track earnings |
| **Rating & Review** | 5-star rating + text review after session |
| **SPT Status Tracking** | "In Progress → Submitted → Completed" |
| **Push Notifications** | Session reminders, status updates |
| **In-app Payment** | Midtrans integration (GoPay, OVO, Transfer Bank, QRIS) |

**NOT in MVP:**
- Video call (text chat only)
- AI chatbot
- Tax calculator
- Document vault
- B2B features

### Phase 2: Core Enhancement (Month 5-8)

| Feature | Details |
|---|---|
| **Video/Audio Call** | In-app video consultation for premium sessions |
| **SPT Filing Service** | Consultant prepares and submits SPT on behalf of user via PJAP partner |
| **E-Billing Integration** | Pay tax directly through app |
| **Scheduling System** | Book specific time slots with preferred consultants |
| **Enhanced Document Vault** | Secure cloud storage for all tax documents |
| **Multi-NPWP Management** | One account can manage family/company NPWPs |
| **Basic Tax Calculator** | Simple PPh 21 calculation for employees |

### Phase 3: Growth & Retention (Month 9-12)

| Feature | Details |
|---|---|
| **AI Tax Assistant** | Basic Q&A bot for common tax questions (trained on UU PPh, PP 23/2018, etc.) |
| **Subscription Plans** | Monthly/annual plans for regular compliance needs |
| **Tax Calendar & Reminders** | Deadlines for PPh 21, PPN, SPT Tahunan |
| **Consultant Matching Algorithm** | Smart matching based on user profile, tax complexity, budget |
| **Referral Program** | "Refer a friend" with credits |
| **B2B Dashboard** | For companies: manage all employee tax needs in one place |
| **WhatsApp Integration** | Users can receive updates and communicate via WA |

### Phase 4: Scale (Year 2)

| Feature | Details |
|---|---|
| **Direct PJAP Registration** | Become registered PJAP, reduce dependency |
| **Full AI-Powered Self-Service** | Users can file simple SPT entirely via AI (no consultant needed) |
| **Corporate Tax Module** | Monthly PPh 21, PPN reporting automation |
| **Tax Planning & Advisory** | Proactive consultation (not just reactive filing) |
| **API for Partners** | Allow other platforms (Gojek, Tokopedia, etc.) to integrate tax services |
| **Expansion** | Coverage for foreign workers (WNA), PMA companies |

---

## 7. Business Model

### Revenue Streams

| Stream | Detail | Target Margin |
|---|---|---|
| **Commission per session** | Platform takes 15-25% of consultation fee | High (60%+ gross margin) |
| **SPT Filing Fee** | Flat fee per SPT submission (Rp 50K-200K) | High |
| **Freemium → Premium** | Free limited chat → paid consultation sessions | Conversion-driven |
| **Subscription (Monthly)** | Rp 50K-150K/month for individuals (reminders, vault, basic calculator) | Recurring |
| **Subscription (Business)** | Rp 500K-5M/month for companies (monthly compliance, multi-NPWP) | Recurring |
| **Premium Placement** | Consultants pay for featured/priority listing | Advertising |
| **AI Bot (Freemium)** | Free basic Q&A, paid for advanced analysis | Upsell |

### Pricing Strategy (Illustrative)

| Service | Price to User | Consultant Gets | Platform Gets |
|---|---|---|---|
| Chat consultation (30 min) | Rp 100K | Rp 75K (75%) | Rp 25K (25%) |
| Video consultation (60 min) | Rp 300K | Rp 225K (75%) | Rp 75K (25%) |
| SPT Tahunan filing (individual) | Rp 150K-350K | Rp 120K-280K (80%) | Rp 30K-70K (20%) |
| Monthly compliance (UMKM) | Rp 500K/month | Rp 400K (80%) | Rp 100K (20%) |
| Monthly compliance (small co) | Rp 3M/month | Rp 2.4M (80%) | Rp 600K (20%) |

### Unit Economics

| Metric | Value (Year 1 Target) |
|---|---|
| CAC (Customer Acquisition Cost) | Rp 30K-50K (organic + referral heavy) |
| Average Revenue Per User (ARPU)/month | Rp 100K (individual), Rp 500K (UMKM) |
| Gross Margin | 60-70% |
| Customer Lifetime Value (LTV) | Rp 500K-2M (individual), Rp 5M-30M (B2B) |
| LTV:CAC Ratio Target | 10:1+ |

### Cost Structure (Monthly Run Rate at Scale)

- **Engineering & Product:** Rp 300M-500M (4-6 engineers, 1 PM, 1 designer)
- **Operations & Support:** Rp 50M-100M (customer support, consultant vetting)
- **Marketing:** Rp 50M-200M (digital ads, partnerships, content)
- **Infrastructure:** Rp 20M-50M (cloud, API fees, payment gateway)
- **Legal & Compliance:** Rp 10M-30M
- **PJAP Partner Revenue Share:** Variable (negotiable)

---

## 8. Go-to-Market Strategy

### Pre-Launch (Month 1-3)

- **Consultant recruitment:** Target 20-50 certified consultants (Level A/B/C). Recruit from IKPI, ATPI associations. Offer competitive commission (75%+).
- **Early adopter program:** 100 users get free consultation in exchange for feedback.
- **Content marketing:** Start tax education content (blog, TikTok, Instagram) — "Tax tips for freelancers," "SPT guide for employees"
- **Partnerships:** Co-working spaces, freelancer communities, UMKM hubs

### Launch (Month 4)

- **Target cities:** Jakarta, Bandung, Surabaya, Yogyakarta (highest density of target users)
- **Launch channels:** Instagram/TikTok content, Google Ads (high-intent keywords), referral program
- **PR / media:** Pitch to tech media (DailySocial, TechInAsia), tax media (DDTCNews, Ortax)

### Growth (Month 5-12)

- **Referral program:** "Give Rp 50K, get Rp 50K" for both referrer and referee
- **Seasonal push:** Heavy marketing in January-March (SPT Tahunan season) — this is THE moment
- **Partnerships:** Integrate with fintech apps (Gojek, Gopay, DANA, Jenius), coworking spaces, bank partners
- **Content engine:** Regular tax guides, regulation updates, case studies

### Key Marketing Messages

- "Urus pajakmu #LewatKamiAja" (Tax Point's great tagline — adapt yours)
- "Satu aplikasi untuk semua urusan pajak"
- "Gak perlu jadi ahli pajak — kami yang urus"
- "Dari konsultasi sampai lapor, selesai dalam genggaman"

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Low consultant supply** | Medium | High | Pre-launch recruitment drive. Start with 20-50 consultants. Competitive commission structure. |
| **Trust/security concerns** | High | Critical | ISO 27001 certification. Clear data policy. UU PDP compliance. Bank-grade encryption. Transparent consultant vetting. |
| **Regulatory changes** | Medium | Medium | Liaise with IKPI/ATPI. Legal counsel specializing in tax. Monitor PMK changes quarterly. |
| **Seasonal demand spikes** | High | Medium | Scale consultant pool before Jan-Mar. Pre-book feature. Surge pricing model. |
| **Competition (copycat)** | Medium | Medium | Build defensible moat: consultant network, brand trust, integrations, data. First-mover in mobile marketplace. |
| **DJP API changes/outages** | Medium | High | Partner with multiple PJAPs for redundancy. Graceful degradation mode. |
| **Churn after filing season** | High | High | Subscription model for monthly compliance. Year-round value (planning, reminders). Retention campaigns. |
| **Fraud (fake consultants)** | Medium | Critical | Strict verification before onboarding. Government certification database check. Buyer protection guarantee. |

---

## 10. Development Timeline

```
MONTH:   1    2    3    4    5    6    7    8    9   10   11   12
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
RESEARCH│ ████│    │    │    │    │    │    │    │    │    │    │    │
(DONE)  │    │    │    │    │    │    │    │    │    │    │    │    │
        ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
MVP DEV │    │████│████│ ██ │    │    │    │    │    │    │    │    │
        │    │    │    │    │    │    │    │    │    │    │    │    │
├────────────────────────┤    │    │    │    │    │    │    │    │    │
│ CONSULTANT RECRUITMENT │███ │ ███│ ███│    │    │    │    │    │    │
│ (20-50 consultants)    │    │    │    │    │    │    │    │    │    │
├────────────────────────┤    │    │    │    │    │    │    │    │    │
│ PRE-LAUNCH USER TEST   │    │    │ ███│ ███│    │    │    │    │    │
│ (100 early adopters)   │    │    │    │    │    │    │    │    │    │
├────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ MVP LAUNCH             │    │    │    │ ██ │ ███│    │    │    │    │
│ (Core marketplace)     │    │    │    │    │    │    │    │    │    │
├────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ PHASE 2 DEV            │    │    │    │    │    │████│████│ ██ │    │
│ (Video call, filing)   │    │    │    │    │    │    │    │    │    │
├────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ PHASE 3 DEV            │    │    │    │    │    │    │    │    │████│████│ ██ │
│ (AI, subscriptions)    │    │    │    │    │    │    │    │    │    │    │    │
├────────────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ PEAK SEASON           │    │    │    │    │    │    │    │    │    │    │    │    │
│ (SPT deadline is Mar) │                        ████████████████████    │
└────────────────────────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

### Key Milestones

| Milestone | Date (Target) |
|---|---|
| Research complete | Month 1 |
| MVP development start | Month 2 |
| Consultant recruitment done (min 20) | Month 3 |
| Pre-launch user testing | Month 3-4 |
| **MVP LAUNCH** | **Month 4** |
| Phase 2 launch (video + filing) | Month 7 |
| Phase 3 launch (AI + subs) | Month 11 |
| **First SPT season (SPT 2026)** | **Mar 2027 — CRITICAL** |

---

## 11. Team & Hiring Plan

### Core Team (MVP Phase)

| Role | # | Est. Monthly Cost (IDR) |
|---|---|---|
| Product Manager | 1 | 25-40M |
| Frontend Developer (TanStack/React) | 2 | 25-50M each |
| Backend Developer (NestJS/Node.js) | 2 | 20-40M each |
| UI/UX Designer | 1 | 15-25M |
| QA Engineer | 1 | 10-20M |
| Operations/Partnerships | 1 | 10-20M |
| Legal (part-time/firm) | 0.5 | 10-20M |
| **Total Estimated Monthly** | **8.5** | **~200-350M** |

### Post-MVP Additions

- Data scientist (for AI assistant)
- Customer support team (3-5 people)
- Marketing lead
- Community manager (consultant relations)
- Finance/accounting

---

## 12. Budget Estimate (Year 1)

| Category | Estimated Cost (IDR) |
|---|---|
| Engineering (team salaries, 12 months) | 2.4B - 4.2B |
| Infrastructure (cloud, APIs, 3rd party) | 240M - 600M |
| Marketing (digital ads, content, partnerships) | 500M - 2B |
| Legal & Compliance | 120M - 360M |
| Office & Operational | 360M - 600M |
| Consultant onboarding & subsidies | 200M - 500M |
| Contingency (15%) | 500M - 1.2B |
| **TOTAL YEAR 1 ESTIMATE** | **~4.3B - 9.5B IDR (~$265K - $585K USD)** |

---

## 13. Immediate Next Steps (This Week)

1. **Validate the idea further** — Interview 10-20 target users (freelancers, employees, UMKM). What exactly are they willing to pay? What's their #1 anxiety?
2. **Map out PJAP partnerships** — Approach OnlinePajak / Klikpajak / Pajak.io to discuss API partnership models. Get indicative pricing.
3. **Recruit 3-5 pilot consultants** — Find certified consultants willing to be part of a pilot program. Understand their needs (scheduling, payment expectations).
4. **Wireframe MVP** — Sketch the core user flow: Register → Find consultant → Chat → Pay → Rate.
5. **Assess funding** — Bootstrap vs angel vs VC? Based on budget estimate, you need either significant runway or a leaner MVP scope.
6. **Regulatory check** — Consult tax law specialist to verify platform model compliance (platform vs consulting firm liability).

---

## 14. Key Resources & References

### Competitors to study
- Tax Point — taxpoint.id
- Flazztax — flazztax.com
- OnlinePajak — online-pajak.com
- Mekari Klikpajak — klikpajak.id
- Pajak.io — pajak.io

### Regulatory references
- PMK 111/2014 → PMK 175/2022 (Tax consultant certification)
- PMK 239/2023 (PJAP — tax application service providers)
- UU PDP (Personal Data Protection Law, UU 27/2022)
- UU HPP (Harmonisasi Peraturan Perpajakan, UU 7/2021)

### API & technical
- DJP API gateway: api-djp.pajak.go.id
- PJAP API docs: Pajak.io (openapi-pajakio.readme.io), OnlinePajak, Klikpajak
- Payment gateway: Midtrans, Xendit

### Organizations
- IKPI (Ikatan Konsultan Pajak Indonesia)
- ATPI (Asosiasi Teknisi Perpajakan Indonesia)
- PPSKP (Panitia Penyelenggara Sertifikasi Konsultan Pajak)

---

> **Bottom line:** The "Halodoc for Tax" model fills a real gap. Existing solutions are either enterprise SaaS (OnlinePajak/Klikpajak) or traditional firms (MUC/DDTC). Tax Point is the closest competitor but web-only and still early. A web-first marketplace (TanStack Start + shadcn/ui) connecting users with certified consultants at transparent, affordable prices has strong product-market fit potential — especially if you time the launch to catch the January-March SPT season.

---

## 15. Flow Review & Gaps to Confirm

> The following items need clarification, confirmation, or adjustment before development starts.

### 🔴 Critical Gaps — RESOLVED

| # | Gap | Decision | Status |
|---|---|---|---|
| 1 | **NPWP verification** | Format validation (15-digit check) for MVP. Manual review support in admin dashboard. Future: DJP API integration via PJAP partner. | ✅ Resolved |
| 2 | **Consultant vetting** | Trust-based with manual review support. Auto-approved by default, admin can reject from dashboard. Future: PPSKP/IKPI database lookup. | ✅ Resolved |
| 3 | **Chat session management** | **Hybrid model:** (a) Chat-only = time-limited (30 min). (b) Task-based = consultant issues proforma invoice → user pays → escrow → released when task done. Task pricing varies per session. | ✅ Resolved |
| 4 | **DJP/PJAP partner** | Approach all three (OnlinePajak, Klikpajak, Pajak.io). Compare API docs, revenue share, integration complexity. Pick best offer. | ✅ Resolved |
| 5 | **Consultant payout** | Weekly batch payout to consultant bank account. | ✅ Resolved |

#### Session Model Detail (Gap #3)

```
User Request
    │
    ├── "Quick question" ──► Chat-only (30 min, fixed price, e.g., Rp 100K)
    │
    └── "I need help with X" ──► Task-based flow:
            │
            ├── Consultant reviews request
            ├── Consultant issues proforma invoice (task + price)
            ├── User reviews & pays (escrow)
            ├── Consultant executes task
            ├── User confirms completion
            └── Funds released to consultant (weekly batch)
```

### 🟡 Important Gaps — RESOLVED

| # | Gap | Decision | Status |
|---|---|---|---|
| 6 | **Consultant matching** | Hybrid: show recommended consultants first (by specialization, rating, availability), user can browse all with filters. | ✅ Resolved |
| 7 | **SPT filing liability** | Marketplace only. Consultant files SPT, platform has no liability. Must be clear in ToS. | ✅ Resolved |
| 8 | **Document retention** | 2-year default retention. User can extend or delete. Comply with UU PDP. | ✅ Resolved |
| 9 | **Commission structure** | By service type: Chat 25%, Video 20%, SPT filing 15%. | ✅ Resolved |
| 10 | **Multi-language** | Bilingual from launch (Indonesian + English). Setup i18n framework from start. | ✅ Resolved |

### 🟢 Nice-to-Confirm — RESOLVED

| # | Gap | Decision | Status |
|---|---|---|---|
| 11 | **Referral program** | 20% discount for both referrer and referee on next session. | ✅ Resolved |
| 12 | **Subscription tiers** | Defer to Phase 3. MVP = pay-per-session only. | ✅ Resolved |
| 13 | **Admin panel scope** | Full admin for MVP: consultant management, order management, refunds, content, analytics, payout management, system config. | ✅ Resolved |
| 14 | **Analytics/telemetry** | PostHog (self-hostable, privacy-friendly, free tier). | ✅ Resolved |
| 15 | **Error handling** | Auto-reconnect + message queue for chat. Graceful degradation for payment failures (retry + notify). | ✅ Resolved |

### Additional Decisions Resolved

| Area | Decision | Status |
|---|---|---|
| **Auth strategy** | Google SSO only for MVP. Add phone OTP in Phase 2. | ✅ Resolved |
| **File upload limits** | To be confirmed during implementation (max 10MB per file, PDF/JPG/PNG). | ⏳ Deferred |
| **Rate limiting** | To be confirmed during implementation. | ⏳ Deferred |
| **WebSocket scaling** | Redis pub/sub + Socket.io adapter for multi-instance. | ✅ Resolved |
| **TanStack Start stability** | Accepted risk. Backup: migrate to Vite + React Router if critical issues. | ✅ Resolved |
| **IDCloudHost capabilities** | To be confirmed: Docker support, managed PostgreSQL, S3-compatible storage. | ⏳ Deferred |

### Flow Gaps in User Journey — RESOLVED

| Step | Decision | Status |
|---|---|---|
| **Register** | Google SSO only for MVP. Users without NPWP can browse consultants but can't book. | ✅ Resolved |
| **Find Consultant** | Hybrid: recommended consultants shown first, user can browse all with filters (specialization, price, rating, online status). | ✅ Resolved |
| **Book Session** | Two modes: (a) Chat-only — pay fixed price, 30 min session. (b) Task-based — consultant issues proforma invoice, user pays, escrow, release on completion. | ✅ Resolved |
| **Chat Consultation** | Text-based + file sharing. Auto-reconnect + message queue on disconnect. No screen sharing in MVP (Phase 2). | ✅ Resolved |
| **SPT Filing** | Consultant files SPT on behalf of user via PJAP partner. User does not need to approve before submission. Platform is marketplace only, not liable. | ✅ Resolved |
| **Post-Session** | Rate + review. 20% discount referral program. Dispute resolution via admin (refund case-by-case). | ✅ Resolved |
| **Retention** | Tax deadline reminders, 20% referral discount, subscription plans (Phase 3). Bilingual notifications (ID + EN). | ✅ Resolved |

### Technical Gaps — RESOLVED

| Area | Decision | Status |
|---|---|---|
| **Auth strategy** | Google SSO only for MVP. Add phone OTP (WhatsApp/SMS) in Phase 2. | ✅ Resolved |
| **File upload limits** | Max 10MB per file. Allowed: PDF, JPG, PNG. S3-compatible storage (IDCloudHost). | ✅ Resolved |
| **Rate limiting** | Per-user + per-IP. To be configured during implementation. | ✅ Resolved |
| **WebSocket scaling** | Redis pub/sub + Socket.io adapter for multi-instance. | ✅ Resolved |
| **TanStack Start stability** | Accepted risk. Backup plan: migrate to Vite + React Router if critical issues arise. | ✅ Resolved |
| **IDCloudHost capabilities** | Must verify: Docker support, managed PostgreSQL, S3-compatible object storage. If not available, use alternative Indonesian cloud (Rumahweb Cloud, Biznet Gio). | ⏳ Verify before infra setup |
| **i18n setup** | Bilingual (ID + EN) from launch. Use `react-i18next` or `@lingui/core`. Indonesian as default locale. | ✅ Resolved |
