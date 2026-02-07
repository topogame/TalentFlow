# 📋 AI_METHODOLOGY.md — Development Process & Templates

> **This file contains the full development methodology: phases, questions, and document templates.**
> The AI reads relevant sections as directed by the routing table in `AI_RULES.md`.
> You do NOT need to feed this file every session — only when starting a project, moving to a new phase, or producing a deliverable.

---

## 📋 PHASE OVERVIEW

| # | Phase | Goal | Deliverable |
|---|-------|------|-------------|
| 1A | Idea Validation & Vision | Validate the idea, define the vision | PRODUCT_VISION.md |
| 1B | User Experience Planning | Map personas, journeys, and screens | USER_JOURNEYS.md |
| 1C | Technical Scoping & Planning | Prioritize features, assess risks, plan | PROJECT_SPEC.md |
| 2 | Architecture & Design | Define system architecture | ARCHITECTURE.md |
| 3 | Database Design | Design the data layer | DATABASE_SCHEMA.md |
| 4 | API Design | Define all interfaces | API_DOCS.md |
| 5 | Project Setup | Initialize project and tooling | Working project scaffold |
| 6 | Development (Iterative) | Build feature by feature | Working code + tests |
| 7 | Security Audit | Systematic vulnerability review | SECURITY_CHECKLIST.md |
| 8 | Testing & QA | Validate quality and coverage | TESTING_STRATEGY.md |
| 9 | Deployment Preparation | Prepare for production | DEPLOYMENT.md |
| 10 | Release & Handoff | Ship it | Release-ready product 🚀 |

---

# PHASE 1A: IDEA VALIDATION & VISION

**Goal:** Validate the idea, understand the market, and define the product vision before anything else.

**Ask the user the following (one group at a time, not all at once):**

### 1A.1 — Elevator Pitch
- Describe your product in 1–2 sentences. What is it?
- What specific problem does it solve?
- How is this problem currently being solved (without your product)?

### 1A.2 — Target Audience
- Who is your ideal user? (age, profession, technical level, habits)
- What is the user's main pain point that drives them to this product?
- How large is the potential user base? (rough estimate is fine)

### 1A.3 — Competitive Landscape
- Are there existing products that solve the same or a similar problem?
- If yes, what are their strengths and weaknesses?
- What makes your product different or better? (your unique value proposition)

### 1A.4 — Business Model
- How do you plan to generate revenue? (SaaS subscription, freemium, one-time purchase, ads, free/open-source, not decided yet)
- Is there a pricing strategy in mind?
- Are there any monetization constraints? (e.g., must be free, grant-funded, internal tool)

### 1A.5 — Success Metrics
- How will you measure whether this product is successful?
- What are your key performance indicators (KPIs)? (e.g., user count, conversion rate, revenue, retention, engagement)
- Where do you want this product to be in 6 months? In 1 year?

### ✅ Phase 1A Deliverable: `PRODUCT_VISION.md`

Present for approval before moving to Phase 1B.

<template id="PRODUCT_VISION">
```markdown
# Product Vision: [Project Name]

## 1. Elevator Pitch
[1–2 sentence description of the product]

## 2. Problem Statement
- **The Problem:** [What specific problem does this solve?]
- **Current Solutions:** [How is this problem being solved today?]
- **Gap:** [What is missing from current solutions?]

## 3. Target Audience
### Primary Persona
- **Name:** [Fictional name for reference]
- **Age / Demographics:** ...
- **Profession / Role:** ...
- **Technical Level:** [Beginner / Intermediate / Advanced]
- **Goals:** [What do they want to achieve?]
- **Pain Points:** [What frustrates them today?]
- **Habits:** [How do they currently work/behave?]

### Secondary Persona (if applicable)
- ...

## 4. Competitive Analysis
| Competitor | What They Do Well | What They Do Poorly | Our Differentiator |
|-----------|-------------------|--------------------|--------------------|
| [Name] | ... | ... | ... |
| [Name] | ... | ... | ... |
| [Name] | ... | ... | ... |

## 5. Unique Value Proposition
[One clear statement: Why would someone choose this product over alternatives?]

## 6. Business Model
- **Revenue Model:** [SaaS / Freemium / One-time / Ads / Free / Internal tool]
- **Pricing Strategy:** [If applicable]
- **Monetization Constraints:** [If any]

## 7. Success Metrics (KPIs)
| Metric | Target (6 months) | Target (1 year) |
|--------|-------------------|-----------------|
| Active Users | ... | ... |
| Conversion Rate | ... | ... |
| Revenue | ... | ... |
| Retention Rate | ... | ... |
| [Custom KPI] | ... | ... |

## 8. Product Vision (Long-term)
[Where should this product be in 1 year? In 3 years?]
```
</template>

---

# PHASE 1B: USER EXPERIENCE PLANNING

**Goal:** Deeply understand the users, their journeys, and the screens/pages they will interact with.

**Ask the user the following (one group at a time, not all at once):**

### 1B.1 — User Personas
- How many distinct types of users will use the product? (e.g., admin, regular user, guest, moderator)
- For each user type: what is their goal? What is their biggest frustration?
- Are there user types that interact with each other? (e.g., buyer ↔ seller, student ↔ teacher)

### 1B.2 — Permissions & Access Control
- What can each user type do? What are they restricted from?
- Is there a super-admin or system-level role?
- Are there any actions that require approval workflows? (e.g., content moderation, order approval)

### 1B.3 — User Journeys (Step by Step)
- Walk me through the very first experience: what happens when a new user opens the product for the first time?
- What is the core action loop? (the thing users do repeatedly — e.g., browse → add to cart → checkout)
- What are the secondary flows? (settings, profile, notifications, etc.)
- Are there any onboarding or tutorial steps?

### 1B.4 — Pages / Screens Inventory
- Based on the journeys above, let's list every page or screen the product needs.
- For each page: what is its purpose? What are the key elements on it?
- Are there any modals, drawers, or overlays?

### 1B.5 — Notifications & Communication
- Will users receive notifications? (email, push, in-app, SMS)
- What events trigger notifications? (e.g., new message, order update, password reset)
- Are there any transactional emails? (welcome, receipt, password reset)

### 1B.6 — Platform & Accessibility
- Mobile, web, desktop, or all? Responsive web or separate mobile app?
- Multi-language support needed? Which languages?
- Accessibility requirements? (WCAG level, screen reader support)

### ✅ Phase 1B Deliverable: `USER_JOURNEYS.md`

Present for approval before moving to Phase 1C.

<template id="USER_JOURNEYS">
```markdown
# User Journeys: [Project Name]

## 1. User Personas

### Persona 1: [Name — e.g., "Admin Ali"]
- **Role:** Admin
- **Age:** ...
- **Profession:** ...
- **Goal:** [What they want to accomplish]
- **Pain Point:** [Their main frustration]
- **Tech Comfort:** [Low / Medium / High]

### Persona 2: [Name — e.g., "User Elif"]
- ...

## 2. Role Permission Matrix
| Action | Admin | User | Guest |
|--------|-------|------|-------|
| View dashboard | ✅ | ✅ | ❌ |
| Create content | ✅ | ✅ | ❌ |
| Delete any content | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View public pages | ✅ | ✅ | ✅ |
| ... | ... | ... | ... |

## 3. User Journeys

### Journey 1: First-Time User Registration
1. User lands on homepage
2. Clicks "Sign Up"
3. Fills in email and password
4. Receives verification email
5. Clicks verification link
6. Redirected to onboarding / dashboard
**Success Criteria:** User sees the dashboard within 2 minutes of starting signup.

### Journey 2: Core Action Loop — [e.g., "Browse and Purchase"]
1. ...
2. ...
**Success Criteria:** ...

### Journey 3: [Secondary Flow — e.g., "Profile Management"]
1. ...

## 4. Screen / Page Inventory
| # | Page Name | Purpose | Key Elements | Auth Required |
|---|-----------|---------|-------------|---------------|
| 1 | Landing Page | First impression, conversion | Hero, features, CTA, pricing | No |
| 2 | Sign Up | Registration | Form, OAuth buttons, link to login | No |
| 3 | Login | Authentication | Form, OAuth buttons, forgot password | No |
| 4 | Dashboard | Main hub after login | Stats, recent activity, quick actions | Yes |
| 5 | ... | ... | ... | ... |

## 5. Notification Strategy
| Event | Channel | Recipient | Template |
|-------|---------|-----------|----------|
| Welcome | Email | New user | Welcome + getting started |
| Password Reset | Email | Requesting user | Reset link (expires in 1h) |
| New Message | In-app + Push | Recipient | Notification badge + push |
| ... | ... | ... | ... |

## 6. Platform & Accessibility
- **Platform:** [Web (responsive) / Mobile app / Desktop / API-only]
- **Mobile Strategy:** [Responsive web / PWA / Native iOS+Android / React Native]
- **Languages:** [e.g., Turkish, English]
- **Accessibility:** [WCAG 2.1 Level AA / Basic / None specified]
- **Browser Support:** [Modern browsers / specific requirements]
```
</template>

---

# PHASE 1C: TECHNICAL SCOPING & PLANNING

**Goal:** Define the technical boundaries, prioritize features, assess risks, and create a roadmap.

**Ask the user the following (one group at a time, not all at once):**

### 1C.1 — Technology Preferences
- Do you have a preferred tech stack? (frontend, backend, database, hosting)
- Any technologies you want to avoid? Why?
- Are there third-party services you want to integrate? (payment, email, SMS, OAuth provider, maps, analytics, AI/ML, file storage)
- Do you have an existing codebase, infrastructure, or domain?

### 1C.2 — Scale & Performance
- Expected number of users at launch? In 6 months? In 1 year?
- Expected data volume? (e.g., number of records, file storage needs)
- Performance requirements? (response time, concurrent users, uptime SLA)
- Real-time features needed? (chat, live updates, WebSocket)

### 1C.3 — Compliance & Constraints
- Compliance requirements? (GDPR, KVKK, HIPAA, SOC 2, PCI DSS)
- Budget constraints? (open-source only, specific cloud provider, monthly infra budget)
- Team constraints? (solo developer, small team, outsourced)
- Timeline or deadline?

### 1C.4 — Feature Prioritization (MoSCoW)
Based on everything discussed in Phase 1A and 1B:
- List all identified features.
- Work with the user to categorize each:
  - **Must Have** — MVP cannot launch without these
  - **Should Have** — Important but MVP can launch without them
  - **Could Have** — Nice to have, will add if time permits
  - **Won't Have (this version)** — Explicitly deferred to future versions
- Confirm the final MVP scope with the user.

### 1C.5 — Risk Assessment
Identify and present risks:
- **Technical risks:** Complex integrations, unfamiliar tech, scalability unknowns
- **Dependency risks:** Third-party API reliability, vendor lock-in
- **Timeline risks:** Scope too large for deadline, single point of failure
- **Security risks:** Sensitive data handling, compliance requirements
- For each risk: likelihood (Low/Med/High), impact (Low/Med/High), mitigation strategy.

### 1C.6 — Effort Estimation & Roadmap
- Provide rough effort estimates for each MVP feature (T-shirt sizing: S / M / L / XL).
- Propose a development roadmap with sprints/phases.
- Estimate total project duration.
- Get user confirmation on the roadmap.

### ✅ Phase 1C Deliverable: `PROJECT_SPEC.md`

This document consolidates all decisions from Phase 1A, 1B, and 1C. Present for approval before moving to Phase 2.

<template id="PROJECT_SPEC">
```markdown
# Project Specification: [Project Name]

## 1. Overview (from PRODUCT_VISION.md)
- **Description:** [1–2 sentence summary]
- **Problem:** [What problem does it solve?]
- **Target Users:** [Who will use this?]
- **Value Proposition:** [Why this over alternatives?]
- **Business Model:** [Revenue approach]

## 2. MVP Features (Prioritized — MoSCoW)

### Must Have (MVP cannot launch without these)
- [ ] Feature 1: [description] — Effort: [S/M/L/XL]
- [ ] Feature 2: [description] — Effort: [S/M/L/XL]

### Should Have (Important but not blocking launch)
- [ ] Feature A: [description] — Effort: [S/M/L/XL]

### Could Have (Nice to have, if time permits)
- [ ] Feature B: [description] — Effort: [S/M/L/XL]

### Won't Have (Explicitly deferred to v2+)
- Feature C: [description] — Reason: [why deferred]

## 3. User Roles & Permissions Summary
(Reference USER_JOURNEYS.md for full details)
| Role | Summary |
|------|---------|
| Admin | Full access, user management, system config |
| User | Standard features, own data only |
| Guest | Public pages only |

## 4. Tech Stack
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend | ... | ... | ... |
| Backend | ... | ... | ... |
| Database | ... | ... | ... |
| Hosting | ... | ... | ... |
| Auth | ... | ... | ... |

## 5. Third-Party Integrations
| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| Payment | ... | ... | ... |
| Email | ... | ... | ... |

## 6. Non-Functional Requirements
- **Performance:** [Response time, concurrent users]
- **Scalability:** [Expected growth, scaling strategy]
- **Compliance:** [GDPR / KVKK / HIPAA / etc.]
- **Accessibility:** [WCAG level]
- **i18n / l10n:** [Languages, RTL support]
- **Uptime SLA:** [99.9% / etc.]

## 7. Constraints
- **Budget:** ...
- **Timeline:** ...
- **Team:** ...
- **Existing Infrastructure:** ...

## 8. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Technical risk] | H/M/L | H/M/L | [Strategy] |
| [Dependency risk] | ... | ... | ... |
| [Timeline risk] | ... | ... | ... |
| [Security risk] | ... | ... | ... |

## 9. Development Roadmap
| Phase | Features | Effort | Target Date |
|-------|----------|--------|-------------|
| Sprint 1 | Core infra + Auth | [X weeks] | ... |
| Sprint 2 | [Core features] | [X weeks] | ... |
| Sprint 3 | [Secondary features] | [X weeks] | ... |
| Sprint 4 | Testing, polish, launch | [X weeks] | ... |
| **Total** | | **[X weeks]** | |

## 10. Open Questions
- [ ] [Unresolved items]
```
</template>

---

# PHASE 2: ARCHITECTURE & DESIGN

**Goal:** Define the system architecture before implementation.

### 2.1 — Architecture Pattern
- Recommend an architecture pattern (monolith, microservices, serverless, modular monolith) based on Phase 1A–1C requirements.
- Explain the trade-offs and get user confirmation.

### 2.2 — Folder Structure
- Propose a complete folder/directory structure.
- Explain the responsibility of each directory.

### 2.3 — Component Diagram
- Identify all major components/services and how they interact.
- Define communication patterns (REST, GraphQL, WebSocket, message queue, etc.).

### 2.4 — Data Flow
- Map out the data flow for the primary user journeys.
- Identify where data is created, read, updated, and deleted.

### 2.5 — Technology Decisions
- Finalize the tech stack with justifications.
- List all third-party packages/libraries with versions.
- Identify potential risks with chosen technologies.

### 2.6 — Environment Strategy
- Define environments: local, development, staging, production.
- Define the branching strategy (e.g., GitFlow, trunk-based).

### ✅ Phase 2 Deliverable: `ARCHITECTURE.md`

<template id="ARCHITECTURE">
```markdown
# Architecture: [Project Name]

## 1. Architecture Pattern
[Monolith / Microservices / Serverless / Modular Monolith]
**Justification:** ...

## 2. System Component Diagram
[Mermaid diagram or text-based diagram]

## 3. Folder Structure
project-root/
├── src/
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   └── ...
│   ├── middleware/
│   ├── utils/
│   ├── database/
│   └── app.ts
├── tests/
├── docs/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md

## 4. Data Flow
[Primary user journey data flows]

## 5. Technology Stack (Final)
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| ... | ... | ... | ... |

## 6. Communication Patterns
[REST / GraphQL / WebSocket / Message Queue]

## 7. Environment Strategy
| Environment | Purpose | URL |
|-------------|---------|-----|
| Local | Development | localhost:3000 |
| Staging | Pre-production | ... |
| Production | Live | ... |

## 8. Branching Strategy
[GitFlow / Trunk-based / etc.]
```
</template>

---

# PHASE 3: DATABASE DESIGN

**Goal:** Design a robust, normalized, and secure data layer.

### 3.1 — Entity Identification
- List all entities/models based on requirements.
- Ask: "Are there any entities I'm missing?"

### 3.2 — Schema Design
- Define every table/collection with: field names, types, constraints, PKs, FKs, indexes.
- Include soft delete strategy, timestamps (created_at, updated_at).
- Enforce relationships at the database level.

### 3.3 — Relationships
- Map all relationships (1:1, 1:N, M:N).
- Generate ER diagram (Mermaid syntax).

### 3.4 — Security Considerations
- Which fields contain sensitive data? Encryption strategy?
- PII handling strategy.
- Audit logging strategy.

### 3.5 — Seed Data & Migrations
- Define initial seed data.
- Plan migration strategy (tool, naming convention, rollback).

### ✅ Phase 3 Deliverable: `DATABASE_SCHEMA.md`

<template id="DATABASE_SCHEMA">
```markdown
# Database Schema: [Project Name]

## 1. Entity List
- Users
- ...

## 2. Table Definitions

### users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Primary key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'user' | User role |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete |

## 3. Relationships
[ER diagram in Mermaid]

## 4. Indexes
| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| users | email | UNIQUE | Login lookup |

## 5. Sensitive Data
| Table | Column | Protection |
|-------|--------|-----------|
| users | password_hash | bcrypt hashed |
| users | email | PII — encrypt at rest |

## 6. Seed Data
[Default roles, admin user, config values]

## 7. Migration Strategy
[Tool, naming convention, rollback approach]
```
</template>

---

# PHASE 4: API DESIGN

**Goal:** Define all interfaces before implementation.

### 4.1 — Endpoint Inventory
- List every API endpoint grouped by resource/module.
- For each: HTTP method, URL, purpose.

### 4.2 — Detailed Endpoint Specification
For each endpoint: request format, response format, status codes, auth requirements, rate limiting.

### 4.3 — Consistent Conventions
- URL naming convention (kebab-case, plural resources).
- Standard response envelope: `{ success, data, error }`.
- Pagination format: `{ page, limit, total, totalPages }`.
- Error code system.

### 4.4 — Validation Rules
- Define validation rules for every input field.

### ✅ Phase 4 Deliverable: `API_DOCS.md`

<template id="API_DOCS">
```markdown
# API Documentation: [Project Name]

## Base URL
`https://api.example.com/v1`

## Response Format
{ "success": true/false, "data": ... | null, "error": { "code": "...", "message": "..." } | null }

## Authentication
Bearer token: `Authorization: Bearer <token>`

## Endpoints

### Auth Module

#### POST /auth/register
**Description:** Create a new user account
**Auth:** Public
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | yes | valid email, max 255 |
| password | string | yes | min 8, 1 uppercase, 1 number |

**Success (201):**
{ "success": true, "data": { "id": "uuid", "email": "...", "role": "user" } }

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 409 | EMAIL_EXISTS | Email taken |
| 429 | RATE_LIMITED | Too many requests |

[Continue for all endpoints...]

## Error Code Reference
| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Pagination
`?page=1&limit=20` → `{ data: [...], pagination: { page, limit, total, totalPages } }`
```
</template>

---

# PHASE 5: PROJECT SETUP

**Goal:** Initialize a clean, well-configured project scaffold.

### 5.1 — Project Initialization
- Initialize with chosen framework/tools.
- Set up folder structure from Phase 2.
- Configure linting / formatting.

### 5.2 — Configuration Files
- `.env.example` with all variables (no real secrets)
- `.gitignore` (comprehensive)
- `docker-compose.yml` (if applicable)
- CI/CD pipeline config
- Package lock file

### 5.3 — Base Infrastructure Code
- Database connection with retry logic
- Logger setup (structured, log levels)
- Global error handler middleware
- Auth middleware skeleton
- Health check endpoint
- CORS, rate limiting, security headers

### 5.4 — Development Tooling
- Hot reload / watch mode
- Migration tool setup
- Test framework setup
- Seed script skeleton

### ✅ Phase 5 Deliverable: A runnable project that starts without errors.

---

# PHASE 6: DEVELOPMENT (ITERATIVE)

**Goal:** Build the product feature by feature.

### For Each Feature:

**6.1 — Plan:** Confirm scope, endpoints, dependencies, DB changes.

**6.2 — Build in order:**
1. Database migration (if needed)
2. Data model / repository layer
3. Service / business logic layer
4. Controller / route handler
5. Input validation
6. Error handling
7. Unit tests
8. Integration tests

**6.3 — Quality Gate (after each feature):**
- [ ] No hard-coded secrets
- [ ] All inputs validated and sanitized
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection
- [ ] Authorization checks on every endpoint
- [ ] IDOR protection
- [ ] Proper error handling (no system info leaks)
- [ ] Edge cases handled
- [ ] No hallucinated packages or APIs
- [ ] Tests written and meaningful
- [ ] Code follows project conventions

**6.4 — Complete:** Confirm feature works end-to-end. Ask: *"Next feature or refine this one?"* Update CHANGELOG.md.

**Repeat 6.1–6.4 for every feature until MVP is complete.**

---

# PHASE 7: SECURITY AUDIT

**Goal:** Systematic security review of the entire codebase.

### 7.1 — OWASP Top 10 Review
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

### 7.2 — Dependency Audit
- Run `npm audit` / `pip audit` / equivalent.
- Resolve all known vulnerabilities. Remove unused dependencies.

### 7.3 — Configuration Review
- Debug modes off? CORS restricted? Security headers set? HTTPS enforced? Rate limits configured? File upload limits set?

### 7.4 — Data Protection Review
- Sensitive data encrypted at rest and in transit? Passwords properly hashed? PII handled per compliance? Logs clean of sensitive data?

### ✅ Phase 7 Deliverable: `SECURITY_CHECKLIST.md`

---

# PHASE 8: TESTING & QA

**Goal:** Ensure the product works correctly and reliably.

### 8.1 — Coverage Review
- Review tests for gaps. Target minimum 80% on business logic.

### 8.2 — Test Categories
- **Unit tests:** All service/business logic.
- **Integration tests:** API endpoints with database.
- **Validation tests:** All input rules.
- **Auth tests:** Login, register, token refresh, unauthorized, role-based.
- **Edge case tests:** Empty inputs, boundaries, concurrency.
- **Error handling tests:** Graceful failures, proper responses.

### 8.3 — Manual Test Scenarios
Generate a list for the user: happy paths, error scenarios, cross-feature interactions, load testing.

### ✅ Phase 8 Deliverable: `TESTING_STRATEGY.md`

---

# PHASE 9: DEPLOYMENT PREPARATION

**Goal:** Prepare everything for production.

### 9.1 — Production Configuration
- Production configs, structured logging, health/readiness endpoints.

### 9.2 — CI/CD Pipeline
- Build → Lint → Test → Security scan → Deploy. Rollback procedure.

### 9.3 — Infrastructure
- Document requirements. Docker/container config. DB backup strategy.

### 9.4 — Monitoring & Alerting
- Error tracking (Sentry, etc.). Uptime, performance monitoring. Alert thresholds.

### 9.5 — Documentation Finalization
- Update README.md. Verify all docs are current. Final CHANGELOG.md entry.

### ✅ Phase 9 Deliverable: `DEPLOYMENT.md`

---

# PHASE 10: RELEASE & HANDOFF

**Goal:** Ship a release-ready product.

### 10.1 — Pre-Release Checklist
```
- [ ] All MVP features implemented and tested
- [ ] All tests passing
- [ ] Security audit completed, no critical issues open
- [ ] Production environment variables documented
- [ ] Database migrations tested
- [ ] Seed data prepared
- [ ] HTTPS configured
- [ ] Monitoring and alerting set up
- [ ] Backup and rollback procedures documented
- [ ] README.md is complete and accurate
- [ ] CHANGELOG.md is up to date
- [ ] All TODO/FIXME items resolved or documented
- [ ] Performance acceptable under expected load
- [ ] Compliance requirements met
```

### 10.2 — Release
- Tag the release version (semantic versioning).
- Deploy to production.
- Run smoke tests on production.
- Verify monitoring is active.

### 10.3 — Post-Release
- Document known issues / limitations.
- Create backlog for v2 features.
- Provide maintenance guidelines.

### ✅ Phase 10 Deliverable: A live, working, release-ready product. 🚀

---

## 📌 SUPPORTING FILES (Created During the Process)

These files are created and maintained throughout development:

| File | Created In | Updated In | Notes |
|------|-----------|-----------|-------|
| `.env.example` | Phase 5 | As needed | All env vars, no real secrets |
| `.gitignore` | Phase 5 | Rarely | Comprehensive ignore rules |
| `README.md` | Phase 5 | Continuously, finalized Phase 9 | Setup, run, and usage instructions |
| `CHANGELOG.md` | Phase 6 | After every feature | Chronological change log |
| `docker-compose.yml` | Phase 5 | As needed | Local dev services |
| CI/CD config | Phase 5 | Phase 9 | Pipeline definition |
