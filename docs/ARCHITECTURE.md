# Architecture: TalentFlow

## 1. Architecture Pattern

**Modular Monolith (Full-Stack Next.js)**

A single Next.js application containing both frontend and backend, organized into domain modules (auth, candidates, firms, positions, processes, emails, calendar, reports).

**Justification:**
- **Solo developer + AI team** — single codebase reduces operational overhead
- **MVP scope** — no need for microservices complexity at this scale
- **Vercel-native** — deploys as one unit with zero config
- **Clear module boundaries** — can be extracted into separate services later if needed
- **Shared types** — TypeScript types shared between frontend and backend, zero duplication

**Trade-offs:**
- (+) Fastest development speed for a small team
- (+) Single deployment, single repo, single CI/CD
- (+) Shared TypeScript types end-to-end
- (-) All modules scale together (acceptable for MVP scale)
- (-) Must enforce module boundaries by convention (folder structure + imports)

## 2. System Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application                      │  │
│  │                                                             │  │
│  │  ┌─────────────────────┐    ┌───────────────────────────┐  │  │
│  │  │     FRONTEND        │    │        BACKEND            │  │  │
│  │  │   (App Router)      │    │    (API Routes)           │  │  │
│  │  │                     │    │                           │  │  │
│  │  │  Pages & Layouts    │───▶│  /api/auth/*              │  │  │
│  │  │  Client Components  │    │  /api/candidates/*        │  │  │
│  │  │  Server Components  │    │  /api/firms/*             │  │  │
│  │  │  shadcn/ui + TW     │    │  /api/positions/*         │  │  │
│  │  │                     │    │  /api/processes/*          │  │  │
│  │  │                     │    │  /api/emails/*            │  │  │
│  │  │                     │    │  /api/calendar/*          │  │  │
│  │  │                     │    │  /api/reports/*           │  │  │
│  │  │                     │    │  /api/users/*             │  │  │
│  │  │                     │    │  /api/settings/*          │  │  │
│  │  └─────────────────────┘    └──────────┬────────────────┘  │  │
│  │                                        │                    │  │
│  └────────────────────────────────────────┼────────────────────┘  │
│                                           │                       │
└───────────────────────────────────────────┼───────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
               ┌────▼─────┐         ┌──────▼──────┐        ┌──────▼──────┐
               │   Neon    │         │ Vercel Blob │        │   Resend    │
               │ PostgreSQL│         │ (CV files)  │        │  (Email)    │
               │           │         │             │        │             │
               │ - users   │         │ - PDFs      │        │ - SMTP API  │
               │ - cands   │         │ - Word docs │        │ - Templates │
               │ - firms   │         │             │        │             │
               │ - positions│        └─────────────┘        └─────────────┘
               │ - processes│
               │ - notes   │
               │ - emails  │
               │ - calendar│
               │ - logs    │
               └───────────┘
```

## 3. Folder Structure

```
talent-flow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Minimal auth layout
│   │   │
│   │   ├── (dashboard)/              # Main app route group (with sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── candidates/
│   │   │   │   ├── page.tsx          # Candidate list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New candidate form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Candidate detail
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit candidate
│   │   │   ├── firms/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── positions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── processes/
│   │   │   │   ├── page.tsx          # Process list + Kanban toggle
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Process detail
│   │   │   ├── emails/
│   │   │   │   └── page.tsx          # Email send + history
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx          # Calendar view
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Reports + export
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx          # General settings
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx      # User management (Admin)
│   │   │   │   ├── email-templates/
│   │   │   │   │   └── page.tsx      # Email template mgmt (Admin)
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx      # Own profile + password change
│   │   │   └── layout.tsx            # Dashboard layout (sidebar + header)
│   │   │
│   │   ├── api/                      # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth.js handler
│   │   │   ├── candidates/
│   │   │   │   ├── route.ts          # GET (list) + POST (create)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts      # GET + PUT + DELETE
│   │   │   │   ├── [id]/notes/
│   │   │   │   │   └── route.ts      # GET + POST notes
│   │   │   │   ├── [id]/documents/
│   │   │   │   │   └── route.ts      # GET + POST documents
│   │   │   │   └── duplicate-check/
│   │   │   │       └── route.ts      # POST — check duplicates
│   │   │   ├── firms/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── positions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── processes/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── [id]/notes/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/stage/
│   │   │   │       └── route.ts      # PUT — change pipeline stage
│   │   │   ├── emails/
│   │   │   │   ├── route.ts          # POST — send email
│   │   │   │   └── templates/
│   │   │   │       └── route.ts      # CRUD email templates
│   │   │   ├── calendar/
│   │   │   │   ├── route.ts          # GET + POST interviews
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET + PUT + DELETE interview
│   │   │   ├── reports/
│   │   │   │   └── route.ts          # GET — generate report
│   │   │   ├── users/
│   │   │   │   ├── route.ts          # GET + POST (Admin)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET + PUT (Admin)
│   │   │   └── settings/
│   │   │       └── route.ts          # GET + PUT system settings
│   │   │
│   │   ├── layout.tsx                # Root layout (providers, fonts)
│   │   ├── not-found.tsx             # 404 page
│   │   └── globals.css               # Global styles + Tailwind
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── page-header.tsx
│   │   ├── candidates/               # Candidate-specific components
│   │   │   ├── candidate-form.tsx
│   │   │   ├── candidate-table.tsx
│   │   │   ├── candidate-filters.tsx
│   │   │   ├── duplicate-warning.tsx
│   │   │   └── candidate-tabs.tsx
│   │   ├── firms/
│   │   │   ├── firm-form.tsx
│   │   │   └── firm-table.tsx
│   │   ├── positions/
│   │   │   ├── position-form.tsx
│   │   │   └── position-table.tsx
│   │   ├── processes/
│   │   │   ├── process-table.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── stage-badge.tsx
│   │   │   └── stage-change-modal.tsx
│   │   ├── emails/
│   │   │   ├── email-compose.tsx
│   │   │   └── template-selector.tsx
│   │   ├── calendar/
│   │   │   ├── calendar-view.tsx
│   │   │   └── interview-form.tsx
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx
│   │   │   ├── pipeline-chart.tsx
│   │   │   └── recent-activity.tsx
│   │   └── shared/                   # Cross-module shared components
│   │       ├── data-table.tsx        # Generic sortable/filterable table
│   │       ├── search-input.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       └── pagination.tsx
│   │
│   ├── lib/                          # Shared utilities & configuration
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # NextAuth.js configuration
│   │   ├── email.ts                  # Resend client + send helpers
│   │   ├── blob.ts                   # Vercel Blob upload helpers
│   │   ├── validations/              # Zod schemas for input validation
│   │   │   ├── candidate.ts
│   │   │   ├── firm.ts
│   │   │   ├── position.ts
│   │   │   ├── process.ts
│   │   │   ├── auth.ts
│   │   │   └── common.ts
│   │   ├── utils.ts                  # General utility functions
│   │   ├── constants.ts              # App-wide constants (pipeline stages, roles, etc.)
│   │   └── types.ts                  # Shared TypeScript types (beyond Prisma)
│   │
│   ├── services/                     # Business logic layer
│   │   ├── candidate.service.ts      # Candidate CRUD + duplicate check logic
│   │   ├── firm.service.ts
│   │   ├── position.service.ts
│   │   ├── process.service.ts        # Process management + stage transitions
│   │   ├── email.service.ts          # Email template rendering + sending
│   │   ├── calendar.service.ts       # Interview scheduling + reminders
│   │   ├── report.service.ts         # Report generation
│   │   ├── user.service.ts           # User management
│   │   ├── audit.service.ts          # Audit log recording
│   │   └── dashboard.service.ts      # Dashboard metric aggregation
│   │
│   ├── middleware.ts                 # NextAuth.js middleware (route protection)
│   │
│   └── hooks/                        # Custom React hooks
│       ├── use-candidates.ts         # SWR/React Query hooks for candidates
│       ├── use-firms.ts
│       ├── use-positions.ts
│       ├── use-processes.ts
│       └── use-auth.ts
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   ├── migrations/                  # Migration files
│   └── seed.ts                      # Seed data (admin user, default templates, pipeline stages)
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── lib/
│   ├── integration/
│   │   └── api/
│   └── setup.ts
│
├── docs/                            # Project documentation
│   ├── AI_RULES.md
│   ├── AI_METHODOLOGY.md
│   ├── BUSINESS_CASE.md
│   ├── PRODUCT_VISION.md
│   ├── USER_JOURNEYS.md
│   ├── PROJECT_SPEC.md
│   ├── ARCHITECTURE.md
│   └── manual/
│       └── USER_GUIDE_manual.md
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local env (git-ignored)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/schema.prisma
└── README.md
```

**Directory Responsibilities:**

| Directory | Responsibility |
|-----------|---------------|
| `src/app/(auth)/` | Authentication pages (login, password reset) — no sidebar layout |
| `src/app/(dashboard)/` | All authenticated pages — wrapped in sidebar + header layout |
| `src/app/api/` | All API endpoints — REST, organized by resource |
| `src/components/ui/` | shadcn/ui base components (auto-generated, don't modify) |
| `src/components/{module}/` | Module-specific UI components |
| `src/components/shared/` | Reusable cross-module components |
| `src/lib/` | Configuration, utilities, validation schemas, types, constants |
| `src/services/` | Business logic — all DB queries and domain logic live here |
| `src/hooks/` | Custom React hooks for data fetching (SWR/React Query) |
| `prisma/` | Database schema, migrations, seed data |
| `tests/` | Unit and integration tests |
| `docs/` | All project documentation |

## 4. Data Flow

### Primary Journey: Candidate → Process → Placement

```
User Action          Frontend              API Route              Service Layer          Database
──────────────────────────────────────────────────────────────────────────────────────────────────

1. Add Candidate     CandidateForm ──POST──▶ /api/candidates ────▶ candidate.service ──▶ INSERT candidate
                                                                   └─ duplicateCheck() ──▶ SELECT (LinkedIn/email/phone)
                                                                   └─ audit.log()  ─────▶ INSERT audit_log

2. Add to Process    "Sürece Ekle" ──POST──▶ /api/processes ─────▶ process.service ────▶ INSERT process
                                                                   └─ checkDuplicate() ──▶ SELECT (candidate+firm+position)
                                                                   └─ checkHistory() ───▶ SELECT (past processes)
                                                                   └─ audit.log() ──────▶ INSERT audit_log

3. Change Stage      StageModal ────PUT───▶ /api/processes/       process.service ────▶ UPDATE process.stage
                                            [id]/stage             └─ validateTransition()
                                                                   └─ audit.log() ──────▶ INSERT audit_log

4. Schedule Interview InterviewForm ─POST─▶ /api/calendar ───────▶ calendar.service ──▶ INSERT interview
                                                                   └─ scheduleReminder() (24h + 1h)

5. Send Email        EmailCompose ──POST──▶ /api/emails ──────────▶ email.service ─────▶ Resend API
                                                                   └─ renderTemplate()    INSERT email_log
                                                                   └─ audit.log() ──────▶ INSERT audit_log

6. View Dashboard    DashboardPage ─GET───▶ /api/dashboard ──────▶ dashboard.service ──▶ SELECT (aggregations)
```

### Authentication Flow

```
Login:    LoginForm ──POST──▶ NextAuth.js ──▶ credentials provider ──▶ bcrypt.compare() ──▶ JWT issued
                                                                        └─ audit.log("login")

Protected Route:  middleware.ts ──▶ verify JWT ──▶ allow/redirect to login

Password Reset:  ResetForm ──POST──▶ /api/auth/reset ──▶ generate token ──▶ Resend email
                 ResetConfirm ──POST──▶ /api/auth/reset/confirm ──▶ bcrypt.hash() ──▶ UPDATE user
```

### File Upload Flow (CV)

```
Upload:   FileInput ──POST──▶ /api/candidates/[id]/documents ──▶ Vercel Blob ──▶ store file
                                                                  └─ DB ──▶ INSERT document (blob URL, metadata)

Download: DocLink ──GET───▶ /api/candidates/[id]/documents/[docId] ──▶ redirect to Blob URL
```

## 5. Technology Stack (Final)

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Framework | Next.js (App Router) | 14+ | SSR + API in one, Vercel-native |
| Language | TypeScript | 5.x | End-to-end type safety |
| UI | Tailwind CSS | 3.x | Utility-first, rapid styling |
| Components | shadcn/ui | Latest | Accessible, customizable, not a dependency |
| Data Fetching | SWR | Latest | Lightweight, caching, revalidation |
| Forms | React Hook Form + Zod | Latest | Performant forms + schema validation |
| Database | PostgreSQL (Neon) | 16 | Relational model, JSON support, free tier |
| ORM | Prisma | 5.x | Type-safe, migrations, studio |
| Auth | NextAuth.js (Auth.js) | v5 | Credentials provider, JWT, middleware |
| Hashing | bcrypt | Latest | Password hashing standard |
| File Storage | Vercel Blob | Latest | Simple, Vercel-integrated |
| Email | Resend | Latest | Modern API, 3K free/month |
| Hosting | Vercel | Free tier | Zero-config Next.js deployment |
| Testing | Vitest + Testing Library | Latest | Fast, modern, React-friendly |

## 6. Communication Patterns

- **Frontend ↔ Backend:** REST API (JSON) via Next.js API Routes
- **Backend ↔ Database:** Prisma ORM (connection pooling via Neon)
- **Backend ↔ File Storage:** Vercel Blob SDK (direct upload)
- **Backend ↔ Email:** Resend SDK (HTTP API)
- **Auth:** JWT tokens via NextAuth.js (httpOnly cookies)
- **Real-time:** Not required for MVP. Standard request-response pattern. Polling for dashboard refresh (30s interval).

## 7. Environment Strategy

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| Local | Development | localhost:3000 | Neon dev branch (or local Docker PostgreSQL) |
| Preview | PR previews | *.vercel.app (auto) | Neon dev branch |
| Production | Live application | talentflow.vercel.app | Neon main branch |

**Note:** Vercel automatically creates preview deployments for every git push. Neon supports database branching for isolated dev/preview environments.

## 8. Branching Strategy

**Trunk-based development with feature branches:**

```
main (production) ◄── always deployable
  │
  ├── feature/auth-system
  ├── feature/candidate-module
  ├── feature/process-pipeline
  ├── fix/duplicate-check-bug
  └── ...
```

**Rules:**
- `main` branch = production (auto-deploys to Vercel)
- Feature branches: `feature/{module-name}` or `fix/{description}`
- Short-lived branches (merge within 1–2 days)
- No develop/staging branch — Vercel preview deployments serve this purpose
- Squash merge to keep history clean
