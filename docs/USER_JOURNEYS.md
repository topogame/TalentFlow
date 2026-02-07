# User Journeys: TalentFlow

## 1. User Personas

### Persona 1: Danışman Deniz (Consultant)
- **Role:** HR Consultant / Recruiter
- **Age:** 28–40
- **Profession:** Recruiter at an HR consulting firm (5–50 employees)
- **Goal:** Find the right candidates for client positions quickly, manage multiple open roles simultaneously, maintain organized records, communicate professionally with candidates
- **Pain Point:** Wastes time searching through Excel and emails, loses track of candidate stages, accidentally contacts candidates already handled by colleagues, can't produce reports without hours of manual work
- **Tech Comfort:** Medium — comfortable with web apps, Excel power user, lives in email and LinkedIn

### Persona 2: Yönetici Yasemin (Admin / Manager)
- **Role:** Managing Director / Partner / Team Lead at HR consulting firm
- **Age:** 35–50
- **Profession:** Firm owner or senior manager
- **Goal:** Full visibility into team performance, client satisfaction, data-driven business decisions, institutional knowledge preservation
- **Pain Point:** No way to measure consultant productivity, no real-time pipeline overview, institutional knowledge leaves with departing consultants, manual reporting takes hours
- **Tech Comfort:** Medium — wants dashboards and summaries, not raw data

## 2. Role Permission Matrix

| Action | Admin | Consultant |
|--------|:-----:|:----------:|
| View all candidates | Yes | Yes |
| Create / edit candidates | Yes | Yes |
| View all firms | Yes | Yes |
| Create / edit firms | Yes | Yes |
| Delete / deactivate firms | Yes | No |
| View all positions | Yes | Yes |
| Create / edit positions | Yes | Yes |
| Delete / deactivate positions | Yes | No |
| Start / manage processes | Yes | Yes |
| Change pipeline stages | Yes | Yes |
| Add notes (candidate + process) | Yes | Yes |
| Upload / manage CVs | Yes | Yes |
| Send emails (single + bulk) | Yes | Yes |
| Manage calendar / interviews | Yes | Yes |
| View all reports | Yes | Yes |
| View consultant performance reports | Yes (all) | Own only |
| Export to Excel | Yes | Yes |
| Manage users (create / deactivate) | Yes | No |
| Manage system settings (SMTP, config) | Yes | No |
| Manage email templates (system-wide) | Yes | No |
| Data import (Excel) | Yes | No |
| View audit logs | Yes | No |

**Data Visibility Policy:** All candidates, firms, positions, and processes are visible to all authenticated users. This is a deliberate design decision to preserve institutional memory — the core value proposition.

## 3. User Journeys

### Journey 1: First-Time Setup (Admin Only)
1. Admin receives system credentials (created by system deployment)
2. Admin logs in for the first time
3. Admin configures system settings:
   - SMTP settings for email sending
   - Email templates (customize defaults)
   - Company info
4. Admin creates consultant user accounts
5. Consultants receive login credentials via email
**Success Criteria:** System fully configured and all team members can log in.

### Journey 2: Consultant Daily Start
1. Consultant logs in
2. Dashboard loads showing:
   - Active candidate count
   - Open positions count
   - This week's interviews
   - Pending actions (stale processes, follow-ups)
   - Pipeline status overview
   - Recent activity feed
3. Consultant reviews pending actions and plans their day
**Success Criteria:** Consultant has a clear picture of their workload within 10 seconds of login.

### Journey 3: Adding a New Candidate
1. Consultant clicks "+ Yeni Aday"
2. Fills in required fields (name, phone, email)
3. Fills in professional info (experience, sector, position, languages, salary expectation)
4. Fills in location + remote/hybrid preferences
5. Adds LinkedIn URL and uploads CV
6. System runs duplicate check (LinkedIn > Email > Phone > Name similarity)
   - **If duplicate found:** Warning shown with options to link to existing record or create new
   - **If no duplicate:** Proceed
7. Clicks "Kaydet"
8. Candidate profile is created with all tabs (Summary, Processes, Notes, Documents, History)
**Success Criteria:** New candidate fully registered in under 3 minutes, duplicates caught automatically.

### Journey 4: Adding a Client Firm
1. Consultant/Admin clicks "+ Yeni Firma"
2. Fills in firm info (name, sector, size, location, website)
3. Fills in contact person details (name, title, phone, email)
4. Adds notes about the firm
5. Clicks "Kaydet"
6. Firm profile is created showing: info, open positions, active processes, past placements, notes
**Success Criteria:** Firm record created in under 2 minutes.

### Journey 5: Creating a Position
1. User navigates to firm profile or Positions menu
2. Clicks "+ Yeni Pozisyon"
3. Fills in:
   - Position title, client firm (select), department, reporting structure
   - Requirements (experience years, education, skills, languages, sector preference)
   - Working conditions (location, model: office/remote/hybrid, travel)
   - Salary range (min-max, net/gross, currency, benefits)
   - Status (Open/On Hold/Closed), priority (Low/Normal/High/Urgent), dates
4. Clicks "Kaydet"
**Success Criteria:** Position fully defined and ready for candidate matching.

### Journey 6: Core Action Loop — Candidate-Position Matching & Process Management
1. User identifies a suitable candidate for a position (via search/filter or browsing)
2. Clicks "Sürece Ekle" from candidate profile OR "Aday Ekle" from position detail
3. Selects firm + position (or candidate, depending on entry point)
4. System checks for duplicate process / past history warnings
5. Process starts at "Havuzda" (default)
6. Consultant progresses the candidate through stages:
   - **Havuzda** → Initial evaluation
   - **Ilk Gorusme** → Consultant interviews candidate
   - **Musteriye Sunuldu** → CV sent to client firm
   - **Mulakat** → Client interview scheduled/completed
   - **Olumlu** → Candidate hired (process closes)
   - **Olumsuz** → Process terminated (process closes)
   - **Beklemede** → Process paused temporarily
7. At each stage change: optional note, automatic logging
8. Flexible rollback: can move backward (e.g., Mulakat → Havuzda) except from Olumlu/Olumsuz
9. Consultant can set a fitness score (1–5) for each process
10. Process can be viewed in list or Kanban view
**Success Criteria:** Full pipeline visibility; any team member can see where any candidate stands at any time.

### Journey 7: Interview Scheduling
1. From process detail, consultant clicks "Mulakat Planla"
2. Fills in: date/time, duration, type (face-to-face/online/phone), meeting link (if online), client-side participants, location, notes
3. Clicks "Planla"
4. Interview appears on calendar (daily/weekly/monthly views)
5. System sends automatic reminders:
   - 24 hours before → email to candidate
   - 1 hour before → notification to consultant
6. After interview: consultant clicks "Sonuc Kaydet", enters notes, optionally advances to next stage
**Success Criteria:** No missed interviews; results captured promptly.

### Journey 8: Email Communication
**Single email:**
1. From candidate or process profile, click "E-posta Gonder"
2. Select a template or write freely
3. Dynamic fields auto-fill ({aday_adi}, {pozisyon}, {firma}, etc.)
4. Review and edit content
5. Click "Gonder"
6. Email logged in candidate's email history

**Bulk email:**
1. Select multiple candidates from list
2. "Toplu Islem > E-posta Gonder"
3. Select template
4. Preview
5. Send
6. All emails logged individually

**Success Criteria:** Professional, templated communication sent in under 1 minute per candidate.

### Journey 9: Reporting & Export
1. Navigate to "Raporlar" menu
2. Choose a preset report (Candidate Summary, Firm-based, Position-based, Consultant Performance, Pipeline Analysis, Process Duration)
3. OR create a custom report: select type → choose columns → add filters → set sorting
4. View report on screen
5. Click "Excel'e Aktar" to download
**Success Criteria:** Any report generated and exported in under 2 minutes.

### Journey 10: Password Reset
1. User clicks "Sifremi Unuttum" on login screen
2. Enters email address
3. Receives reset email with link
4. Clicks link, enters new password
5. Redirected to login
**Success Criteria:** Password reset completed within 5 minutes.

### Journey 11: Manager Pipeline Review (Admin)
1. Admin logs in, views dashboard
2. Reviews pipeline status overview (stage distribution across all processes)
3. Checks consultant performance report
4. Identifies stale processes (7+ days inactive)
5. Reviews firm-based reports for upcoming client meetings
6. Exports relevant data to Excel for presentations
**Success Criteria:** Full operational visibility without asking consultants for updates.

## 4. Screen / Page Inventory

| # | Page Name | Purpose | Key Elements | Auth Required |
|---|-----------|---------|-------------|:-------------:|
| 1 | Login | Authentication | Email + password form, "Sifremi Unuttum" link | No |
| 2 | Password Reset | Self-service password recovery | Email input, reset form | No |
| 3 | Dashboard | Main hub after login | Stat widgets (active candidates, open positions, weekly interviews, pending actions), pipeline overview chart, recent activity feed | Yes |
| 4 | Candidate List | Browse/search all candidates | Search bar, filters (sector, experience, location, salary, language, status), candidate table, "+ Yeni Aday" button, bulk action toolbar | Yes |
| 5 | Candidate Detail | Full candidate profile | Tabs: Summary, Processes, Notes, Documents, History. Edit button, "Surece Ekle" button, "E-posta Gonder" button | Yes |
| 6 | New/Edit Candidate | Create or edit candidate | Form: basic info, professional info, location, documents. Duplicate check warning modal | Yes |
| 7 | Firm List | Browse all client firms | Search, filters (sector, size, location), firm table, "+ Yeni Firma" button | Yes |
| 8 | Firm Detail | Full firm profile | Firm info, open positions list, active processes, past placements, notes | Yes |
| 9 | New/Edit Firm | Create or edit firm | Form: firm info, contact person, notes | Yes |
| 10 | Position List | Browse all positions | Filters (firm, sector, title, status, location, salary), position table, "+ Yeni Pozisyon" button | Yes |
| 11 | Position Detail | Full position profile | Position info, requirements, matched candidates, active processes, "Aday Ekle" button | Yes |
| 12 | New/Edit Position | Create or edit position | Form: basic info, requirements, working conditions, salary, status/priority | Yes |
| 13 | Process List | View all active processes | Toggle: list view / Kanban view. Filters (candidate, firm, position, stage, consultant, date range) | Yes |
| 14 | Process Detail | Single process view | Current stage indicator, stage change button, fitness score, process notes, interview history, email history, full timeline/log | Yes |
| 15 | Email Send | Compose and send email | Template selector, dynamic field preview, rich text editor, send button | Yes |
| 16 | Email Templates (Settings) | Manage system email templates | Template list, editor with dynamic field insertion, preview | Yes (Admin) |
| 17 | Calendar | View scheduled interviews | Day/week/month toggle, interview cards with candidate+firm+position info, "+ Mulakat Planla" button | Yes |
| 18 | Interview Schedule | Plan an interview | Form: date/time, duration, type, meeting link, participants, location, notes | Yes |
| 19 | Reports | View and generate reports | Preset report buttons, custom report builder (type, columns, filters, sort), report table view, "Excel'e Aktar" button | Yes |
| 20 | User Management (Settings) | Manage consultant accounts | User list, create/edit/deactivate user, role assignment (Admin/Consultant) | Yes (Admin) |
| 21 | System Settings | Configure system | SMTP config, company info, general preferences | Yes (Admin) |
| 22 | Profile / Change Password | User's own profile | Name, email, password change form | Yes |
| 23 | Data Import (Settings) | Bulk import from Excel | Template download, file upload, mapping, validation preview, import button | Yes (Admin) |

**Modals / Overlays:**
| Modal | Triggered From | Purpose |
|-------|---------------|---------|
| Duplicate Candidate Warning | New Candidate form | Show matching records, offer "Link to Existing" or "Create New" |
| Duplicate Process Warning | Start Process action | Warn about existing or past process for same candidate+firm+position |
| Stage Change | Process detail | Select new stage + optional note |
| Add Note | Candidate/Process detail | Text input + save |
| Confirm Delete/Deactivate | Various | Confirmation before destructive actions |
| Interview Result | Calendar / Process | Record interview outcome + optional next stage |

## 5. Notification Strategy

| Event | Channel | Recipient | Content |
|-------|---------|-----------|---------|
| Interview reminder (24h before) | Email | Candidate | Interview details, location/link, contact info |
| Interview reminder (1h before) | In-app notification | Consultant | Interview summary, candidate name, firm |
| Stale process alert (7+ days inactive) | In-app notification | Process owner (Consultant) | Process details, days since last activity |
| Duplicate candidate detected | In-app modal | Active user (during creation) | Matching records, action options |
| Duplicate/past process detected | In-app modal | Active user (during creation) | Past process history, warnings |
| Password reset | Email | Requesting user | Reset link (time-limited) |
| New account created | Email | New user | Login credentials, system URL |
| Negative history warning | In-app modal | Active user (during process creation) | Past negative outcome details |

**Not in MVP (Phase 2+):**
- Push notifications
- SMS notifications
- Automated pipeline stage notifications to candidates
- Slack/Teams integration

## 6. Platform & Accessibility
- **Platform:** Web application (responsive)
- **Mobile Strategy:** Responsive web design for MVP; native mobile app deferred to Phase 2
- **Languages:** Turkish only for MVP; multi-language support deferred to Phase 2
- **Accessibility:** Basic accessibility (semantic HTML, keyboard navigation, proper color contrast, form labels, alt text for images); full WCAG 2.1 AA compliance deferred to Phase 2
- **Browser Support:** Modern browsers (Chrome, Firefox, Edge, Safari — latest 2 versions)
- **Session Management:** Auto-logout after 8 hours of inactivity
