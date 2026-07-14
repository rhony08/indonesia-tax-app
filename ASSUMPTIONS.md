# Implementation Assumptions & Decision Log

> **Date:** 2026-07-14
> **Phase:** MVP Implementation
> **Purpose:** Track all assumptions made during implementation so the human can review and correct if needed.

---

## 1. Environment & Tooling

| # | Assumption | Rationale | Alternatives |
|---|---|---|---|
| 1 | **pnpm** as package manager | Modern, fast, disk-efficient | npm, yarn |
| 2 | **Node.js v22.18.0** (available in env) | Matches project requirement v20+ | n/a |
| 3 | **NestJS CLI** installed locally per-project | Cleaner, avoids global dependency | Global install via `npm i -g @nestjs/cli` |
| 4 | **SQLite** for local development | No PostgreSQL running in this environment; SQLite works out of box | PostgreSQL via Docker, or use an external PG instance |
| 5 | **No Redis** for local dev | In-memory store used instead; Redis not available in this env | Redis via Docker |
| 6 | **No actual OAuth credentials** | Google Cloud Console setup not available; mock/placeholder used | Real credentials would need Google Cloud project setup |
| 7 | **Midtrans sandbox** mocked | No actual Midtrans account available | Real Midtrans sandbox credentials |
| 8 | **gh CLI authenticated** | Assuming `gh auth status` will confirm or we'll use HTTPS + token | Manual repo creation on github.com |
| 9 | **No Docker** for local dev | Direct Node.js execution; Docker would need Docker daemon | Docker Compose for all services |

---

## 2. Backend Architecture Decisions

| # | Decision | Rationale | Options Considered |
|---|---|---|---|
| 1 | **Drizzle ORM + better-sqlite3** for SQLite | Drizzle supports SQLite; we can swap to PostgreSQL later with Drizzle's dialect system | Prisma (heavier), TypeORM (NestJS default but less type-safe), Knex |
| 2 | **JWT + Google OAuth2** auth | Matches plan; JWT for sessions, Google for SSO | Passport local, Firebase Auth, Auth0 |
| 3 | **Socket.io** for chat | Best real-time chat support in NestJS ecosystem | ws (raw WebSocket), SSE, polling |
| 4 | **Class-validator + class-transformer** for DTOs | NestJS standard; works alongside Zod for external interfaces | Zod-only, Joi |
| 5 | **In-memory cache** instead of Redis | No Redis in dev; NestJS cache-manager with in-memory store | Redis, Memcached |
| 6 | **File uploads to local disk** for dev | No S3 available; files stored in `/uploads/` directory | S3-compatible (IDCloudHost), MinIO |
| 7 | **REST API + OpenAPI/Swagger** | Specified in plan; TanStack Query compatible | GraphQL, tRPC |
| 8 | **Modular NestJS structure** with `src/modules/*` | Clean separation of concerns | Flat structure, feature-based |

---

## 3. Frontend Architecture Decisions

| # | Decision | Rationale | Options Considered |
|---|---|---|---|
| 1 | **TanStack Start** attempted first | Specified in plan | Next.js (more stable), Vite + React Router (backup) |
| 2 | **If TanStack Start fails**, fall back to **Vite + React Router v7** | Accepted risk from plan; Vite+RR is stable alternative | Next.js, Remix |
| 3 | **shadcn/ui** components | Specified in plan; pre-built accessible components | Ant Design, MUI, Chakra UI |
| 4 | **Tailwind CSS v4** | Latest; specified in plan | CSS Modules, styled-components |
| 5 | **react-i18next** for i18n | Specified bilingual (ID/EN) requirement | @lingui/core, next-intl |
| 6 | **Zustand** for client state | Specified in plan; lightweight | Redux Toolkit, Jotai, Recoil |
| 7 | **Zod** for validation | Shared schema between FE/BE | Yup, joi |
| 8 | **Vitest + Testing Library + Playwright** | Specified in plan for testing | Jest, Cypress |

---

## 4. Feature Scope (MVP)

| # | In MVP | In Phase 2-3 |
|---|---|---|
| 1 | User registration (Google SSO) | Phone OTP |
| 2 | Consultant discovery + profiles | AI matching algorithm |
| 3 | Text chat consultation | Video call |
| 4 | Document upload (PDF/JPG/PNG, max 10MB) | Document vault, annotation |
| 5 | Order system + Midtrans payment (mocked) | E-billing, direct tax payment |
| 6 | Rating & review | - |
| 7 | SPT status tracking | Actual DJP filing via PJAP |
| 8 | Push notifications (mocked) | WhatsApp notifications, real push |
| 9 | Admin dashboard (full) | - |
| 10 | Blog (MDX files) | DB-driven blog, CMS |
| 11 | Tax categories/rates | Tax calculator, SPT submission |
| 12 | Consultant dashboard | Advanced analytics |
| 13 | Bilingual (ID + EN) | - |

---

## 5. Unsolved / Needs Clarification

| # | Question | Current Approach | Options |
|---|---|---|---|
| 1 | **PostgreSQL availability?** | Using SQLite for dev; Drizzle dialect swap later | Set up PostgreSQL via Docker or external |
| 2 | **Google OAuth credentials?** | Using mock JWT auth for dev | Create Google Cloud project for OAuth2 |
| 3 | **Midtrans account?** | Mock payment endpoint | Set up Midtrans sandbox account |
| 4 | **gh CLI logged in?** | Will try `gh auth status`; if not, use HTTPS | Manual repo creation |
| 5 | **TanStack Start stability?** | Will attempt; if issues, fallback to Vite+RR | Next.js |
| 6 | **What exact NestJS version?** | Using latest stable (11.x) | v10 (LTS) |

---

## 6. File Upload Configuration

| Setting | Value |
|---|---|
| Max file size | 10 MB |
| Allowed types | PDF, JPG, PNG |
| Storage (dev) | Local `./uploads/` directory |
| Storage (prod) | S3-compatible (IDCloudHost) |

---

## 7. Rate Limiting (Default)

| Rule | Limit |
|---|---|
| Auth endpoints | 10 req/min per IP |
| API general | 100 req/min per user |
| File upload | 20 req/min per user |
| Chat messages | 60 req/min per user |

---

*Last updated: 2026-07-14 during initial implementation setup*
