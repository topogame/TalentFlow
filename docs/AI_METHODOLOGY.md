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

### 1B.5 — UI / Design Input
- Do you have any design references, mockups, wireframes, or screenshots for the UI?
- Is there a brand style guide (colors, fonts, logo)?
- Are there specific design systems or UI libraries you want to use? (e.g., Material UI, Tailwind, Shadcn, Ant Design)
- Any competitor UIs you like or dislike? What specifically?
- If the user provides mockups or references, analyze them and use as the design foundation for all UI work.
- If no design input is provided, propose a clean, modern UI direction and get approval before proceeding.

### 1B.6 — Notifications & Communication
- Will users receive notifications? (email, push, in-app, SMS)
- What events trigger notifications? (e.g., new message, order update, password reset)
- Are there any transactional emails? (welcome, receipt, password reset)

### 1B.7 — Platform & Accessibility
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
- **Present at least 2 viable options** with a comparison table:
  - Pros and cons of each approach
  - Scalability implications (what happens at 10x, 100x users?)
  - Performance characteristics
  - Development speed vs long-term maintainability
  - Cost implications
- Get explicit user confirmation before proceeding.
- If the user is unsure, make a clear recommendation with justification.

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

### 3.6 — Concurrency & Locking Strategy
For every table that can receive concurrent writes, define the protection strategy:
- Which tables need **optimistic locking** (version/timestamp column)?
- Which tables need **pessimistic locking** (SELECT FOR UPDATE) for critical operations?
- Which columns need **unique constraints** to prevent duplicate creation at DB level?
- Which counters/accumulators should use **atomic operations** (`SET count = count + 1`)?
- What **transaction isolation level** is needed? (READ COMMITTED is default; SERIALIZABLE for financial ops)
- Are there **multi-table writes** that must be wrapped in a single transaction?
- Document these decisions in DATABASE_SCHEMA.md under a "Concurrency Strategy" section.

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

## 8. Concurrency Strategy
| Table | Risk Scenario | Protection | Implementation |
|-------|--------------|------------|----------------|
| users | Duplicate registration | Unique constraint on email | DB-level UNIQUE index |
| orders | Double payment | Idempotency key + transaction | idempotency_key UNIQUE column |
| products | Overselling (stock < 0) | Atomic decrement + check | UPDATE SET stock = stock - 1 WHERE stock >= 1 |
| [table] | [scenario] | [strategy] | [implementation] |
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

### 4.5 — Edge Case Scenarios per Endpoint
For each endpoint, identify and document edge case scenarios:
- What happens if required fields are missing or null?
- What happens if input values are at boundary limits (min, max, 0, negative)?
- What happens if the referenced resource doesn't exist (404) or was soft-deleted?
- What happens if the user doesn't own the resource (403 vs 404)?
- What happens if the request is a duplicate (idempotency)?
- What happens under concurrent access (two users modifying the same resource)?
- Document these in the API_DOCS.md under each endpoint as an "Edge Cases" section.

### 4.6 — Concurrency Design per Endpoint
For every write endpoint (POST/PUT/PATCH/DELETE), answer:
- **Duplicate safety:** Is this endpoint idempotent? If not, does it require an idempotency key header?
- **Concurrent mutation:** What happens if two users update the same resource simultaneously? (use optimistic locking with version/ETag, or last-write-wins with conflict notification?)
- **Race-prone operations:** Does this endpoint involve check-then-act logic? (e.g., "check stock, then reserve") If so, what database-level protection is used?
- **Common race condition scenarios to evaluate:**
  - Payment/checkout: double-charge prevention
  - Inventory/booking: overselling/overbooking prevention
  - Like/vote/rating: accurate counter with concurrent votes
  - User registration: duplicate account prevention
  - Token refresh: concurrent refresh handling
  - File upload: same file uploaded twice simultaneously
  - Coupon/promo code: single-use code used by two users simultaneously
- Add a `Concurrency` section to each write endpoint in API_DOCS.md:
  ```
  **Concurrency:**
  - Idempotent: Yes/No (Idempotency-Key header required)
  - Conflict strategy: Optimistic lock (version header) / Last-write-wins / Queue
  - Race protection: [specific DB-level mechanism]
  ```

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

**Edge Cases:**
| Scenario | Expected Behavior |
|----------|-------------------|
| Duplicate registration (same email) | Return 409, do not create duplicate |
| Empty password | Return 400 with specific validation message |
| Very long email (>255 chars) | Return 400, enforce max length |
| SQL/XSS in email field | Sanitized, no injection |
| Concurrent registration (same email, parallel) | First succeeds, second gets 409 |

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

**Goal:** Initialize a clean, well-configured project scaffold with version control and hosting.

### 5.0 — Git Repository & Hosting
- Ask the user: *"Do you have a Git repository ready? If not, I'll guide you through creating one."*
- Initialize Git with a proper `.gitignore` and initial commit.
- Set up branching strategy from Phase 2 (create main + develop branches if applicable).
- **Hosting:** Default recommendation is **Vercel** for frontend/fullstack projects. If the project requirements suggest a different host (e.g., backend-only API → Railway/Render, heavy compute → AWS/GCP), recommend alternatives with justification and get confirmation.
- Configure deployment pipeline connected to the Git repo.
- **Git discipline:** After each completed phase or feature, prompt the user to commit and push. Provide the exact commit message. Format: `[phase/feature]: description`
  - Example: `[phase-5]: project scaffold with base infrastructure`
  - Example: `[feature]: user authentication with JWT`

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

**6.1.1 — Edge Case Analysis (before writing code):**
Before implementing any feature, present an edge case analysis to the user:
```
🔍 Edge Case Analysis for [Feature Name]:

Input edge cases:
- [list relevant input edge cases for this feature]

State edge cases:
- [list relevant state edge cases]

Business logic edge cases:
- [list relevant business logic edge cases]

Mitigation approach:
- [how each will be handled in the implementation]
```
Get user confirmation before proceeding to implementation.

**📚 Edge Case Reference Catalog (consult when analyzing features):**

**Input Edge Cases:**
- Null / undefined / missing fields
- Empty strings, empty arrays, empty objects
- Extremely long strings (10K+ characters)
- Special characters: `<script>`, SQL fragments, Unicode, emoji, RTL text, zero-width characters
- Negative numbers, zero, MAX_INT, floating point precision (0.1 + 0.2 ≠ 0.3)
- Dates: leap years, timezone differences, UTC vs local, epoch 0, far future dates, DST transitions
- Files: 0 bytes, max size boundary, wrong MIME type, corrupted content, path traversal names

**State Edge Cases:**
- First-time use (no data exists yet — empty states)
- Only 1 record vs millions of records (pagination, performance)
- Concurrent modifications (two users editing same resource simultaneously)
- Race conditions in async operations (double submit, parallel requests)
- Stale data / cache invalidation after updates
- Session or token expiry during a multi-step operation
- Partial failures in multi-step operations (step 2 of 3 fails — what happens to step 1?)
- Soft-deleted records appearing in queries

**Network / Infrastructure Edge Cases:**
- Timeout mid-operation (what happens to partially written data?)
- Duplicate requests (user clicks submit twice rapidly — use idempotency keys)
- Database connection loss during a transaction (auto-rollback?)
- Third-party API down, slow, or returning unexpected format
- Webhook delivery failure and retry handling
- File upload interrupted halfway

**Business Logic Edge Cases:**
- Permission boundaries (admin demotes themselves, last admin deleted)
- Circular references in data relationships
- Division by zero in calculations
- Currency/financial rounding (use integer cents, not float)
- Pagination: last page, page beyond total, page 0, negative page
- Search with no results, search with special regex characters
- Bulk operations on 0 items, on 1 item, on max allowed items
- Time-sensitive operations across midnight, month-end, year-end

**6.1.2 — Concurrency Risk Assessment (before writing code):**
For any feature that involves write operations, present a concurrency analysis:
```
⚡ Concurrency Risk Assessment for [Feature Name]:

Write operations in this feature:
- [list each write operation]

Race condition risks:
- [for each write: what happens if two requests arrive within 10ms?]

Protection plan:
- [specific strategy for each risk: transaction, optimistic lock, idempotency key, atomic op, queue]

Database-level protections needed:
- [unique constraints, indexes, column additions (version, idempotency_key)]
```
If no race condition risk exists, briefly state why and proceed.
Get user confirmation on the protection plan before implementing.

**📚 Concurrency Solution Strategies Reference (consult when designing write operations):**

| Problem | Solution | When to Use |
|---------|----------|-------------|
| Two users edit same record | **Optimistic locking** (version column) | Low conflict, reads >> writes |
| Critical resource (money, stock) | **Pessimistic locking** (SELECT FOR UPDATE) | High conflict, data integrity critical |
| Duplicate form submission | **Idempotency keys** (client sends unique key per operation) | All payment/order/mutation endpoints |
| Counter updates (likes, views) | **Atomic DB operations** (`UPDATE SET count = count + 1`) | Any counter/accumulator |
| Unique resource creation | **Unique constraints + upsert** (DB-level uniqueness) | User registration, slug creation |
| Complex multi-step workflows | **Queue-based processing** (one worker processes sequentially) | Order processing, file processing |
| Distributed systems | **Distributed locks** (Redis lock, advisory lock) | Cross-service coordination |
| Time-sensitive operations | **Database transactions with proper isolation level** | Financial operations, booking |

**Additional concurrency patterns:**
- **Lazy initialization race:** `if (cache == null) { cache = compute() }` — multiple threads compute simultaneously. Use double-checked locking or eager initialization.
- **Token refresh race:** Multiple concurrent requests trigger refresh simultaneously. Only one should succeed; others should receive the same new token or retry.
- **Exactly-once processing:** When using queues, ensure the consumer operation is idempotent or implement deduplication.

**6.2 — Build in order:**
1. Database migration (if needed)
2. Data model / repository layer
3. Service / business logic layer
4. Controller / route handler
5. Input validation
6. Error handling
7. Unit tests
8. Integration tests

**6.2.1 — Complex Logic Handling:**
When a function or module involves complex business logic (multi-step calculations, state machines, conditional branching, algorithmic logic):
- **Stop and explain** the proposed approach before coding.
- **Present a flowchart** (text-based or Mermaid) showing the logic flow.
- **Get user confirmation** on the logic before implementing.
- **Break it into small, testable functions** — each function should do one thing.
- If the logic involves more than 3 conditional branches or steps, always decompose it.
- Provide a brief summary: *"This function does X. It handles Y scenarios. Here's the flow: ..."*

**6.3 — Quality Gate (after each feature):**
- [ ] No hard-coded secrets
- [ ] All inputs validated and sanitized
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection
- [ ] Authorization checks on every endpoint
- [ ] IDOR protection
- [ ] Proper error handling (no system info leaks)
- [ ] Edge cases handled:
  - [ ] Null/empty/missing input handling
  - [ ] Boundary values (min, max, zero, negative)
  - [ ] Duplicate request / double submit protection
  - [ ] Concurrent access / race conditions addressed:
    - [ ] All write operations analyzed for concurrent request safety
    - [ ] Payment/financial ops use idempotency keys + transactions
    - [ ] Counters use atomic DB operations (not read-then-write)
    - [ ] Unique resources protected by DB-level constraints
    - [ ] Optimistic/pessimistic locking applied where needed
    - [ ] Duplicate form submission handled (idempotency or UI disable)
  - [ ] Partial failure recovery (multi-step operations)
  - [ ] Empty state (first use, no data) handled gracefully
  - [ ] Pagination edge cases (last page, beyond total, page 0)
- [ ] No hallucinated packages or APIs
- [ ] Tests written and meaningful
- [ ] Code follows project conventions

**6.3.1 — Test Summary (after each feature):**
After writing tests, always provide a summary to the user:
```
🧪 Test Summary for [Feature Name]:
- Unit Tests: [X] tests ([list what they cover])
- Integration Tests: [X] tests ([list what they cover])
- Coverage: [what's covered, what's not]
```

**6.3.2 — UI Testing Guidance:**
After backend + tests are complete for a feature, ask the user to perform manual UI testing. Provide step-by-step instructions:
```
🖥️ Please test the following in your browser:

1. [Step 1 — e.g., Navigate to /login]
   Expected: [what you should see]
2. [Step 2 — e.g., Enter invalid email and submit]
   Expected: [validation error message]
3. [Step 3 — e.g., Enter valid credentials and submit]
   Expected: [redirect to dashboard]
...

❌ If anything doesn't work as expected, tell me what happened and I'll fix it.
✅ If all steps pass, confirm and we'll move to the next feature.
```

**6.4 — Git Commit & Push:**
After each feature passes the quality gate and UI testing:
- Provide the user with the exact Git commands:
  ```
  git add .
  git commit -m "[feature]: [short description of what was built]"
  git push origin [branch-name]
  ```
- If deploying to Vercel or similar, confirm the deployment succeeded.

**6.5 — Complete:** Confirm feature works end-to-end. Ask: *"Next feature or refine this one?"* Update CHANGELOG.md.

**6.6 — Bug Fix Protocol:**
When fixing bugs during development (Phase 6 or later), follow this process:
1. **Reproduce:** Confirm you can reproduce the bug (or understand the exact conditions).
2. **Root cause analysis:** Identify why the bug happened — not just what, but why it wasn't caught.
3. **Write regression test FIRST:** Create a test that demonstrates the bug (test should FAIL with the bug present).
4. **Fix the bug:** Implement the minimal fix.
5. **Verify regression test PASSES** after the fix.
6. **Run full test suite:** Ensure no side effects — all existing tests must still pass.
7. **Extend tests if needed:** If the bug reveals a gap in test coverage (missing edge case, missing concurrency test, missing validation), add additional tests beyond the regression test.
8. **Update documentation:** If the bug was caused by a missing edge case or race condition that wasn't in the original analysis, update the relevant edge case analysis or concurrency risk assessment.
9. **Present bug fix summary** to the user:
   ```
   🐛 Bug Fix Summary:
   - Root cause: [what caused the bug]
   - Fix: [what was changed]
   - Regression test added: [test name and what it verifies]
   - Full test suite: [X passed, Y failed]
   - Side effects: [any other areas potentially affected]
   ```
10. **Git commit:** Provide commit message: `[bugfix]: [short description of what was fixed and why]`

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

<template id="SECURITY_CHECKLIST">
```markdown
# Security Checklist: [Project Name]

## 1. OWASP Top 10 Review
| # | Category | Status | Findings | Remediation |
|---|----------|--------|----------|-------------|
| 1 | Broken Access Control | ✅/⚠️/❌ | [findings] | [actions taken] |
| 2 | Cryptographic Failures | ✅/⚠️/❌ | ... | ... |
| 3 | Injection | ✅/⚠️/❌ | ... | ... |
| 4 | Insecure Design | ✅/⚠️/❌ | ... | ... |
| 5 | Security Misconfiguration | ✅/⚠️/❌ | ... | ... |
| 6 | Vulnerable Components | ✅/⚠️/❌ | ... | ... |
| 7 | Auth Failures | ✅/⚠️/❌ | ... | ... |
| 8 | Data Integrity Failures | ✅/⚠️/❌ | ... | ... |
| 9 | Logging & Monitoring | ✅/⚠️/❌ | ... | ... |
| 10 | SSRF | ✅/⚠️/❌ | ... | ... |

## 2. Dependency Audit
- **Tool used:** [npm audit / pip audit / etc.]
- **Vulnerabilities found:** [count by severity]
- **Resolved:** [count]
- **Accepted risks:** [if any, with justification]

## 3. Configuration Review
| Check | Status | Notes |
|-------|--------|-------|
| Debug mode OFF in production | ✅/❌ | |
| CORS restricted to allowed origins | ✅/❌ | |
| Security headers configured (HSTS, CSP, X-Frame) | ✅/❌ | |
| HTTPS enforced | ✅/❌ | |
| Rate limiting active on all endpoints | ✅/❌ | |
| File upload limits configured | ✅/❌ | |
| Console.log / debug statements removed | ✅/❌ | |

## 4. Data Protection
| Check | Status | Notes |
|-------|--------|-------|
| Passwords hashed (bcrypt/Argon2/scrypt) | ✅/❌ | |
| Sensitive data encrypted at rest | ✅/❌ | |
| HTTPS (TLS) for data in transit | ✅/❌ | |
| PII handled per compliance (GDPR/KVKK) | ✅/❌ | |
| Logs clean of sensitive data | ✅/❌ | |
| .env in .gitignore, no secrets in code | ✅/❌ | |

## 5. Concurrency & Race Condition Review
| Endpoint/Operation | Protection | Verified |
|-------------------|-----------|----------|
| [payment endpoints] | Idempotency + transaction | ✅/❌ |
| [counters] | Atomic DB operations | ✅/❌ |
| [unique resources] | DB unique constraints | ✅/❌ |
| [concurrent edits] | Optimistic/pessimistic locking | ✅/❌ |

## 6. Open Issues
| # | Severity | Description | Status | Owner |
|---|----------|-------------|--------|-------|
| 1 | [Critical/High/Medium/Low] | ... | [Open/Resolved] | ... |
```
</template>

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
- **Edge case tests:** Comprehensive edge case coverage:
  - Null, undefined, empty string, empty array inputs
  - Boundary values: 0, -1, MAX_INT, very long strings
  - Special characters and Unicode in all text fields
  - Concurrent operations (parallel requests to same resource):
    - Simulate 2-10 parallel identical write requests — verify only one succeeds or all are idempotent
    - Test optimistic lock conflicts — verify 409 Conflict returned with clear message
    - Test counter accuracy under parallel updates (e.g., 100 parallel likes should result in exactly +100)
    - Test double-submit on payment/order endpoints — verify only one charge
    - Test concurrent resource creation with unique constraints — verify only one created
    - Test token refresh under concurrent requests — verify consistent behavior
  - Duplicate submissions (idempotency verification)
  - Partial failures (mock step 2 of 3 failing, verify rollback)
  - Expired tokens / sessions mid-operation
  - Empty database state (first user, first record)
  - Pagination boundaries (page 0, last page, beyond last page)
  - Time-related: timezone handling, DST transitions (if relevant)
- **Error handling tests:** Graceful failures, proper responses.

### 8.3 — Manual Test Scenarios
Generate a list for the user: happy paths, error scenarios, cross-feature interactions, load testing.

### ✅ Phase 8 Deliverable: `TESTING_STRATEGY.md`

<template id="TESTING_STRATEGY">
```markdown
# Testing Strategy: [Project Name]

## 1. Test Coverage Summary
| Category | Test Count | Coverage | Status |
|----------|-----------|----------|--------|
| Unit Tests | [X] | [X%] | ✅/⚠️ |
| Integration Tests | [X] | [X%] | ✅/⚠️ |
| Validation Tests | [X] | — | ✅/⚠️ |
| Auth Tests | [X] | — | ✅/⚠️ |
| Edge Case Tests | [X] | — | ✅/⚠️ |
| Concurrency Tests | [X] | — | ✅/⚠️ |
| **Total** | **[X]** | **[X%]** | |

## 2. Unit Tests
| Module | Tests | Key Scenarios Covered |
|--------|-------|----------------------|
| [auth] | [X] | register, login, token refresh, password hash |
| [users] | [X] | CRUD, profile update, role change |
| ... | ... | ... |

## 3. Integration Tests
| Endpoint Group | Tests | Key Scenarios |
|---------------|-------|--------------|
| POST /auth/* | [X] | register flow, login flow, invalid credentials |
| GET/PUT /users/* | [X] | CRUD with auth, IDOR protection |
| ... | ... | ... |

## 4. Edge Case & Concurrency Tests
| Scenario | Test | Result |
|----------|------|--------|
| Null/empty inputs on all endpoints | [test name] | ✅/❌ |
| Boundary values (0, -1, MAX) | [test name] | ✅/❌ |
| Duplicate form submission | [test name] | ✅/❌ |
| Concurrent write (parallel requests) | [test name] | ✅/❌ |
| Counter accuracy under load | [test name] | ✅/❌ |
| Partial failure rollback | [test name] | ✅/❌ |
| Expired token mid-operation | [test name] | ✅/❌ |
| Empty DB state (first user) | [test name] | ✅/❌ |
| Pagination boundaries | [test name] | ✅/❌ |

## 5. Manual Test Scenarios (for user)
| # | Scenario | Steps | Expected Result | Status |
|---|----------|-------|-----------------|--------|
| 1 | Happy path: full user journey | [steps] | [expected] | ☐ |
| 2 | Error: invalid registration | [steps] | [expected] | ☐ |
| 3 | Cross-feature: [scenario] | [steps] | [expected] | ☐ |
| ... | ... | ... | ... | ☐ |

## 6. Known Gaps & Accepted Risks
- [any untested areas with justification]
```
</template>

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

<template id="DEPLOYMENT">
```markdown
# Deployment Guide: [Project Name]

## 1. Production Configuration
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DATABASE_URL | Production DB connection | postgres://... | Yes |
| JWT_SECRET | Token signing key | [random 64 chars] | Yes |
| [VAR] | [description] | [example] | Yes/No |

## 2. Infrastructure
- **Hosting:** [Vercel / Railway / AWS / etc.]
- **Database:** [Provider, plan, region]
- **CDN:** [if applicable]
- **File Storage:** [if applicable]
- **Email Service:** [if applicable]

## 3. CI/CD Pipeline
```
Push to main → Lint → Test → Security Scan → Build → Deploy → Smoke Test
```
- **Tool:** [GitHub Actions / GitLab CI / etc.]
- **Triggers:** Push to main, PR to main
- **Rollback:** [procedure]

## 4. Deploy Steps
1. [Step-by-step deployment procedure]
2. ...

## 5. Monitoring & Alerting
| Tool | Purpose | Dashboard URL |
|------|---------|--------------|
| [Sentry] | Error tracking | [URL] |
| [UptimeRobot] | Uptime monitoring | [URL] |
| [Vercel Analytics] | Performance | [URL] |

**Alert Thresholds:**
| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error rate | > 1% | > 5% | [action] |
| Response time | > 2s | > 5s | [action] |
| Uptime | < 99.9% | < 99% | [action] |

## 6. Backup Strategy
- **Database:** [frequency, retention, tool]
- **File storage:** [frequency, retention]
- **Restore procedure:** [steps]

## 7. Rollback Procedure
1. [Step-by-step rollback procedure]
2. ...
- **Max rollback time:** [target]

## 8. Post-Deploy Checklist
- [ ] Health check endpoint responds 200
- [ ] Key user flows work (login, core action, payment)
- [ ] Monitoring dashboard shows normal metrics
- [ ] No new errors in error tracker
- [ ] DNS / SSL certificates valid
```
</template>

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
- **Transition to post-launch operations:** If the user has `Post_Launch_Prompt.md`, recommend loading it for go-to-market execution, marketing, customer support setup, and ongoing operations guidance.
- **Pre-release audit:** If the user has `Pre_Release_Audit_Prompt.md` and hasn't run the audit yet, recommend running it before the public launch.

### ✅ Phase 10 Deliverable: A live, working, release-ready product. 🚀

---

## 📌 SUPPORTING FILES (Created During the Process)

These files are created and maintained throughout development:

| File | Created In | Updated In | Notes |
|------|-----------|-----------|-------|
| `PRODUCT_VISION.md` | Phase 1A | Rarely | Vision, personas, business model |
| `USER_JOURNEYS.md` | Phase 1B | Phase 6 (if flows change) | Personas, journeys, screens, notifications |
| `PROJECT_SPEC.md` | Phase 1C | Phase 6 (scope changes) | Consolidated spec: features, tech, risks, roadmap |
| `ARCHITECTURE.md` | Phase 2 | Rarely | Architecture, folder structure, tech stack |
| `DATABASE_SCHEMA.md` | Phase 3 | Phase 6 (new migrations) | Schema, relationships, concurrency strategy |
| `API_DOCS.md` | Phase 4 | Phase 6 (new endpoints) | Endpoint specs, edge cases, concurrency design |
| `SECURITY_CHECKLIST.md` | Phase 7 | Phase 9 | OWASP review, dependency audit, config review |
| `TESTING_STRATEGY.md` | Phase 8 | Phase 9 | Coverage, test categories, manual test scenarios |
| `DEPLOYMENT.md` | Phase 9 | As needed | Production config, CI/CD, monitoring, rollback |
| `CHANGELOG.md` | Phase 6 | After every feature | Chronological change log |
| `.env.example` | Phase 5 | As needed | All env vars, no real secrets |
| `.gitignore` | Phase 5 | Rarely | Comprehensive ignore rules |
| `README.md` | Phase 5 | Continuously, finalized Phase 9 | Setup, run, and usage instructions |
| `docker-compose.yml` | Phase 5 | As needed | Local dev services |
| CI/CD config | Phase 5 | Phase 9 | Pipeline definition |

---

## 🔄 APPENDIX — QUICK COMMANDS

These are commands the user can send at any time. The AI should recognize and execute them based on the rules in `AI_RULES.md`.

### Start New Project
```
Please read AI_RULES.md. I want to start a new project.
```
(The AI will then ask for AI_METHODOLOGY.md as directed by the routing table in AI_RULES.md.)

### Resume Project
```
Please read AI_RULES.md. We are in Phase [X].
Here are our project documents: [attach deliverables]
Let's continue.
```
(If the AI needs AI_METHODOLOGY.md for the current phase, it will ask.)

### Mid-Session Security & Quality Check
```
Check the code you just wrote:
1. SQL injection, XSS, or IDOR vulnerabilities?
2. All user inputs validated?
3. Any hard-coded secrets?
4. Error messages leaking system info?
5. Any hallucinated packages or APIs?
6. Edge cases handled? (null/empty inputs, concurrent access, duplicate submit, partial failures, boundary values)
7. Is this production-ready?
```

### Pre-Deployment Check
```
Pre-deployment review:
1. All .env variables set for production?
2. Debug modes disabled?
3. CORS properly restricted?
4. Rate limiting active?
5. Logs going to file/service (not console)?
6. Migrations ready and tested?
7. Security headers configured?
8. HTTPS enforced?
9. Unused endpoints removed?
10. Dependency vulnerabilities resolved?
```

### New Feature (Post-Release)
```
New feature request. Follow the Phase 6 process from AI_METHODOLOGY.md.
Feature: [description]
```

### Bug Fix
```
Bug: [short description]
Expected: ...
Actual: ...
Error: [paste error if any]
```
