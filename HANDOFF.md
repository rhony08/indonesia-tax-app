# Handoff for Next AI Session

> **Date:** 2026-07-14  
> **Repo:** https://github.com/rhony08/indonesia-tax-app  
> **Branch:** master

---

## What Was Done

### Backend (be/) — NestJS
- **14 modules** fully implemented: Auth, Users, Consultants, Consultations, Orders, Payments, Reviews, Tax, Blog, Admin, Chat (WebSocket), Upload, Notifications
- **40+ API routes** all mapped and tested (builds, runs, responds correctly)
- **Auth:** Email/password + JWT + Google OAuth placeholder. Registration and login return access + refresh tokens.
- **Database:** SQLite via Drizzle ORM. Auto-migrates on startup. 16 tables: users, consultants, consultant_schedules, consultations, messages, orders, payments, documents, reviews, tax_categories, tax_rates, blog_posts, notifications, payout_accounts, payout_logs
- **Tax seed:** Auto-seeds on startup (OnModuleInit) with 5 categories (PPh 21, PPh 23, PPh Final, PPN, SPT Tahunan) and 7 rates (0.5%-35%)
- **Chat:** Socket.io WebSocket on `/chat` namespace with rooms, typing indicators, file messages
- **Payments:** Mock Midtrans integration with callback handler
- **Swagger:** Available at `http://localhost:3000/api/docs`

### Frontend (fe/) — Vite + React + TanStack Query
- **Framework:** Vite + React Router v7 + TanStack Query + Zustand + Tailwind CSS v4
- **12 pages:** Home, Login, Register, Consultant List, Consultant Profile, Blog List, Blog Post, Dashboard, Chat, Booking, Admin
- **i18n:** Bilingual (ID + EN) via react-i18next
- **Auth:** Zustand store with JWT management, ProtectedRoute guard
- **API client:** Centralized fetch wrapper with auth token, error handling

---

## How to Run

```bash
# Backend
cd be
cp .env.example .env   # edit if needed
pnpm install
pnpm build
node dist/src/main.js   # runs on port 3000

# Frontend
cd fe
pnpm install
pnpm dev                # runs on port 5173, proxies /api to :3000
```

---

## Remaining / TODO

### Backend
- [ ] **PostgreSQL migration** — swap SQLite dialect to pg in drizzle.config.ts and database.ts
- [ ] **Real Google OAuth** — replace placeholder credentials in .env
- [ ] **Real Midtrans** — replace mock server/client keys, test webhook
- [ ] **Redis** — replace in-memory cache with Redis for production
- [ ] **S3 upload** — swap local disk storage to S3-compatible (IDCloudHost)
- [ ] **Unit tests** — only the NestJS scaffold test exists. Need to write tests for services.
- [ ] **Rate limiting tuning** — adjust throttle TTL/limit per endpoint
- [ ] **NPWP verification** — implement DJP API integration via PJAP partner (Phase 2)
- [ ] **Consultant certification DB lookup** — PPSKP/IKPI integration (Phase 2)
- [ ] **WhatsApp notifications** — integrate WABA (Phase 2)

### Frontend
- [ ] **shadcn/ui** — not installed yet. Run `npx shadcn@latest init` in `fe/` and add components (button, card, dialog, etc.)
- [ ] **Mock data** — the app fetches from real API but returns empty. Need a seed script or mock API for FE dev.
- [ ] **File upload UI** — upload component exists but needs Thumbnail preview
- [ ] **Video consultation** — Phase 2 feature
- [ ] **Phone OTP auth** — Phase 2
- [ ] **Playwright E2E tests** — not set up
- [ ] **CI/CD** — GitHub Actions workflow not created
- [ ] **SEO** — SSR for public pages not implemented (currently CSR-only with Vite)

### Infrastructure
- [ ] **Docker setup** — Dockerfile for BE and FE
- [ ] **Deployment** — IDCloudHost setup
- [ ] **Monitoring** — Grafana + Prometheus + Sentry

---

## Key Files to Know

| File | Purpose |
|---|---|
| `be/src/main.ts` | BE entry point, bootstrap, middleware |
| `be/src/database/schema.ts` | Drizzle ORM schema (16 tables) |
| `be/src/database/migrate.ts` | Auto-migration on startup |
| `be/src/app.module.ts` | Root module, global providers |
| `be/.env.example` | Environment variable template |
| `fe/src/main.tsx` | FE entry point with providers |
| `fe/src/App.tsx` | Route definitions |
| `fe/src/lib/api.ts` | API client with auth token handling |
| `fe/src/lib/i18n.ts` | i18next configuration (ID + EN) |
| `fe/src/store/auth.ts` | Zustand auth store |
| `fe/vite.config.ts` | Vite config with Tailwind + proxy |
| `tax-app-project-plan.md` | Full project plan |
| `ASSUMPTIONS.md` | Assumptions made during implementation |

---

## API Quick Reference

```
POST /api/v1/auth/register    → { email, password, name }
POST /api/v1/auth/login       → { email, password }
GET  /api/v1/auth/me          → user profile
GET  /api/v1/consultants      → list/search (public)
GET  /api/v1/consultants/:id  → profile (public)
POST /api/v1/consultants/:id/book → book session
GET  /api/v1/consultations    → user's consultations
GET  /api/v1/consultations/:id/messages → chat history
GET  /api/v1/tax/categories   → tax categories (public, seeded)
POST /api/v1/tax/calculate    → PPh 21 calculator
GET  /api/v1/orders           → user's orders
POST /api/v1/orders/:id/pay   → initiate payment (mock)
GET  /api/v1/admin/dashboard   → admin stats
GET  /api/v1/blog/posts       → blog listing (public)
```

---

## Tech Debt / Known Issues

1. **Port 3000 conflict** — kill existing process if EADDRINUSE: `fuser -k 3000/tcp`
2. **No seed data** for users/consultants — only tax categories auto-seed. Run manual INSERT or create seed script.
3. **TanStack Start abandoned** — used Vite + React Router v7 as backup (per plan's accepted risk clause). SSR not implemented yet.
4. **Upload dir** — must exist: `mkdir -p be/uploads`
5. **SQLite in production** — fine for MVP/demo, but swap to PostgreSQL for real deployment

---

## Git History

```
25fcea1 feat: frontend MVP with Vite + React Router + TanStack Query
72a2e8a feat: full NestJS backend MVP with 14 modules (initial commit)
```
