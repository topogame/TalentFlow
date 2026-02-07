# Project Specification: TalentFlow

## 1. Overview (from PRODUCT_VISION.md)
- **Description:** A web-based ATS + CRM hybrid platform for HR consulting firms to manage candidates, client companies, positions, and recruitment pipelines in one centralized system.
- **Problem:** HR consulting firms manage candidate data across scattered tools (Excel, email, notes), causing institutional memory loss, duplicate outreach, no process visibility, manual workload, and inability to measure performance.
- **Target Users:** HR consulting firms (5–50 employees), headhunting/executive search firms, outsourced recruitment companies in Turkey.
- **Value Proposition:** The only affordable, modern platform purpose-built for the HR consulting business model — multi-client candidate tracking, smart duplicate prevention, flexible pipelines, and institutional memory that stays with the company.
- **Business Model:** Monthly SaaS subscription per user, tiered pricing targeting SME consulting firms.

## 2. MVP Features (Prioritized — MoSCoW)

### Must Have (MVP cannot launch without these)
- [ ] Authentication system (login, logout, password reset, role-based access) — Effort: **M**
- [ ] User management (Admin creates/deactivates consultant accounts) — Effort: **S**
- [ ] Candidate management (CRUD + detailed profile with tabs) — Effort: **L**
- [ ] Client firm management (CRUD + firm profile) — Effort: **M**
- [ ] Position management (CRUD + requirements + matching) — Effort: **M**
- [ ] Process management (Candidate + Firm + Position tracking) — Effort: **L**
- [ ] Flexible pipeline (7 stages, rollback support, parallel processes) — Effort: **M**
- [ ] Duplicate record detection (LinkedIn + email + phone + name similarity) — Effort: **M**
- [ ] Consultant notes — timestamped, per candidate and per process — Effort: **S**
- [ ] CV upload and management (PDF/Word, version history) — Effort: **S**
- [ ] Advanced search and filtering (across candidates, firms, positions, processes) — Effort: **M**
- [ ] Dashboard with basic metrics (active candidates, open positions, weekly interviews, pending actions, pipeline overview, recent activity) — Effort: **M**

### Should Have (Important but not blocking launch)
- [ ] Email templates with dynamic fields and SMTP sending (single + bulk) — Effort: **L**
- [ ] Calendar with interview scheduling + manual meeting link — Effort: **M**
- [ ] Audit logging (who changed what, when — full change history) — Effort: **M**

### Could Have (Nice to have, if time permits)
- [ ] Excel export for reports — Effort: **S**
- [ ] Excel import for bulk candidate data — Effort: **M**
- [ ] Custom report builder (select type, columns, filters, sorting) — Effort: **L**

### Won't Have (Explicitly deferred to v2+)
- LinkedIn / Kariyer.net automatic integration — Reason: Requires complex API partnerships
- AI-powered CV parsing — Reason: Significant ML effort, not MVP priority
- Teams/Zoom automatic meeting creation — Reason: OAuth integration complexity
- AI candidate-role matching — Reason: Phase 2 after data is accumulated
- Candidate portal (self-service) — Reason: Focus on internal users first
- Power BI integration — Reason: Excel export covers MVP needs
- Multi-language support — Reason: Turkish market first
- Mobile app — Reason: Responsive web covers MVP needs

## 3. User Roles & Permissions Summary
(Reference USER_JOURNEYS.md for full details)

| Role | Summary |
|------|---------|
| Admin | Full access — manages users, system settings, email templates, data import, all reports, can deactivate firms/positions |
| Consultant | Standard features — manages candidates, firms, positions, processes, sends emails, schedules interviews, views own performance reports |

**Data Visibility:** All data (candidates, firms, positions, processes) visible to all authenticated users. Institutional memory by design.

## 4. Tech Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend | Next.js (App Router) | 14+ | SSR, Vercel-native, React ecosystem |
| Language | TypeScript | 5.x | End-to-end type safety |
| UI Framework | Tailwind CSS + shadcn/ui | Latest | Rapid UI development, consistent design system |
| Backend | Next.js API Routes (serverless) | 14+ | Same codebase, zero-config Vercel deployment |
| Database | PostgreSQL via Neon | Latest | Relational model, Vercel-native integration, free tier |
| ORM | Prisma | Latest | Type-safe queries, built-in migrations, excellent DX |
| Authentication | NextAuth.js (Auth.js) | v5 | Email/password with credentials provider, JWT sessions |
| Password Hashing | bcrypt | Latest | Industry standard, secure |
| File Storage | Vercel Blob | Latest | CV uploads, integrated with Vercel |
| Email Service | Resend | Latest | Modern API, free tier (3,000/month), easy templates |
| Hosting | Vercel | Free tier | Already have account, optimal for Next.js |
| Domain | *.vercel.app | Free | Free subdomain, custom domain can be added later |

## 5. Third-Party Integrations

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| Database | Neon (Vercel Postgres) | PostgreSQL hosting | Free tier (0.5 GB storage, 190 compute hours/month) |
| File Storage | Vercel Blob | CV file storage | Free tier (included with Vercel) |
| Email | Resend | Transactional + template emails via SMTP | Free tier (3,000 emails/month) |
| Hosting | Vercel | Application hosting + serverless functions | Free tier (hobby plan) |
| Version Control | GitHub | Source code repository | Free |

## 6. Non-Functional Requirements
- **Performance:** Page load < 2s, API response < 500ms, search results < 1s
- **Scalability:** MVP designed for 3–5 firms, ~50 concurrent users, ~10,000 candidate records. Architecture supports scaling via Neon auto-scaling and Vercel serverless
- **Compliance:** KVKK (Turkish GDPR) — personal data protection, right to deletion (soft delete), data encryption at rest and in transit
- **Accessibility:** Basic (semantic HTML, keyboard navigation, color contrast, form labels). Full WCAG 2.1 AA deferred to Phase 2
- **i18n / l10n:** Turkish only for MVP. Multi-language deferred to Phase 2
- **Uptime SLA:** 99%+ (Vercel provides 99.99% for hosting layer)
- **Session Management:** JWT-based, auto-logout after 8 hours of inactivity
- **Browser Support:** Chrome, Firefox, Edge, Safari (latest 2 versions)

## 7. Constraints
- **Budget:** Free tiers only for MVP (Vercel, Neon, Resend, Vercel Blob)
- **Timeline:** 8–10 weeks for MVP development (flexible target)
- **Team:** Solo developer + AI assistant
- **Existing Infrastructure:** Vercel account, GitHub account

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low user adoption / resistance to change | Medium | High | Simple, intuitive UI; guided onboarding; Excel import for easy migration |
| Data migration from Excel/legacy systems | Medium | Medium | Provide Excel import tool with validation; data cleaning guidance |
| Vercel/Neon free tier limits exceeded | Low | Medium | Monitor usage; upgrade to paid tier when needed (~$20/month); architecture supports migration |
| KVKK compliance gaps | Low | Very High | Soft delete everywhere; encrypt PII; audit logging; privacy-by-design |
| Scope creep during development | Medium | Medium | Strict MoSCoW prioritization; Phase 2 backlog clearly defined |
| Single developer bottleneck | Medium | High | AI-assisted development; modular architecture; comprehensive docs |
| Email deliverability issues | Low | Medium | Use Resend (good deliverability); SPF/DKIM setup; fallback to direct SMTP |
| File storage costs at scale | Low | Low | Vercel Blob free tier generous; monitor and migrate to S3 if needed |
| NextAuth.js complexity for custom flows | Low | Medium | Well-documented library; credentials provider is straightforward |

## 9. Development Roadmap

| Sprint | Duration | Focus Area | Features | Effort |
|--------|----------|------------|----------|--------|
| **Sprint 1** | Week 1–2 | Foundation | Project setup, DB schema, Prisma models, Auth (login/logout/reset/roles), user management, base layout + navigation, dashboard skeleton | **L** |
| **Sprint 2** | Week 3–4 | Core Modules | Candidate CRUD + profile + tabs, Firm CRUD + profile, Position CRUD + profile, duplicate detection, CV upload, search + filtering | **XL** |
| **Sprint 3** | Week 5–6 | Process Engine | Process management (create/track/close), pipeline stages + rollback, Kanban + list views, consultant notes, fitness scoring, process warnings/alerts | **XL** |
| **Sprint 4** | Week 7–8 | Communication | Email templates + dynamic fields + sending (single/bulk), calendar + interview scheduling, interview reminders, dashboard (full metrics) | **L** |
| **Sprint 5** | Week 9–10 | Polish & Ship | Audit logging, Excel export, reporting (preset reports), testing, bug fixes, performance optimization, deployment | **L** |

**Total estimated duration: 10 weeks**

### Milestone Checkpoints
- **Week 2:** Auth working, DB seeded, base layout live → Deploy to Vercel staging
- **Week 4:** Full CRUD for candidates, firms, positions → Internal demo
- **Week 6:** Full process pipeline working end-to-end → Feature-complete core
- **Week 8:** Email + calendar working → Feature-complete MVP
- **Week 10:** Tested, polished, deployed → MVP launch-ready

## 10. Open Questions
- [ ] Specific Resend vs direct SMTP preference (can be decided during Sprint 4)
- [ ] Custom domain name and timing (can use *.vercel.app until ready)
- [ ] Pilot customer identification (which 3–5 firms to onboard first)
- [ ] KVKK legal review (recommended before handling real user data)
