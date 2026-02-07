# Database Schema: TalentFlow

## 1. Entity List

| Entity | Description |
|--------|-------------|
| users | System users (admins and consultants) |
| candidates | Job candidates in the talent pool |
| candidate_languages | Candidate foreign language skills (1:N) |
| candidate_documents | Uploaded CVs and files (1:N) |
| candidate_notes | Timestamped consultant notes per candidate (1:N) |
| firms | Client companies |
| firm_contacts | Contact persons at client firms (1:N) |
| firm_notes | Notes about client firms (1:N) |
| positions | Open roles at client firms |
| processes | Candidate + Firm + Position tracking records |
| process_notes | Timestamped notes per process (1:N) |
| process_stage_history | Stage transition log per process (1:N) |
| interviews | Scheduled interviews linked to processes |
| email_templates | Reusable email templates with dynamic fields |
| email_logs | Record of all sent emails |
| audit_logs | System-wide change log (who, what, when) |
| settings | System-wide key-value settings (SMTP, company info) |

## 2. Table Definitions

### users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| role | ENUM('admin', 'consultant') | NOT NULL, DEFAULT 'consultant' | User role |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft deactivation |
| last_login_at | TIMESTAMP | NULLABLE | Last login timestamp |
| password_reset_token | VARCHAR(255) | NULLABLE | Hashed reset token |
| password_reset_expires | TIMESTAMP | NULLABLE | Token expiration |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### candidates
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| email | VARCHAR(255) | NULLABLE | Email address |
| phone | VARCHAR(30) | NULLABLE | Phone number |
| linkedin_url | VARCHAR(500) | NULLABLE | LinkedIn profile URL |
| education_level | VARCHAR(100) | NULLABLE | Education level |
| total_experience_years | INTEGER | NULLABLE | Total years of experience |
| current_sector | VARCHAR(200) | NULLABLE | Current/last industry |
| current_title | VARCHAR(200) | NULLABLE | Current/last job title |
| salary_expectation | DECIMAL(12,2) | NULLABLE | Expected salary amount |
| salary_currency | VARCHAR(3) | NULLABLE, DEFAULT 'TRY' | Currency (TRY, USD, EUR) |
| salary_type | ENUM('net', 'gross') | NULLABLE | Net or gross |
| country | VARCHAR(100) | NULLABLE | Country |
| city | VARCHAR(100) | NULLABLE | City |
| is_remote_eligible | BOOLEAN | DEFAULT false | Open to remote work |
| is_hybrid_eligible | BOOLEAN | DEFAULT false | Open to hybrid work |
| status | ENUM('active', 'passive') | NOT NULL, DEFAULT 'active' | Candidate status |
| created_by_id | UUID | FK → users.id, NOT NULL | Who created this record |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### candidate_languages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| candidate_id | UUID | FK → candidates.id, NOT NULL, ON DELETE CASCADE | Parent candidate |
| language | VARCHAR(50) | NOT NULL | Language name (e.g., English) |
| level | ENUM('beginner', 'intermediate', 'advanced', 'native') | NOT NULL | Proficiency level |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |

### candidate_documents
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| candidate_id | UUID | FK → candidates.id, NOT NULL, ON DELETE CASCADE | Parent candidate |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_url | VARCHAR(1000) | NOT NULL | Vercel Blob storage URL |
| file_type | VARCHAR(50) | NOT NULL | MIME type (application/pdf, etc.) |
| file_size | INTEGER | NOT NULL | File size in bytes |
| uploaded_by_id | UUID | FK → users.id, NOT NULL | Who uploaded |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload time |

### candidate_notes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| candidate_id | UUID | FK → candidates.id, NOT NULL, ON DELETE CASCADE | Parent candidate |
| content | TEXT | NOT NULL | Note content |
| created_by_id | UUID | FK → users.id, NOT NULL | Who wrote the note |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Note timestamp |

### firms
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NOT NULL | Company name |
| sector | VARCHAR(200) | NULLABLE | Industry sector |
| company_size | VARCHAR(50) | NULLABLE | Employee count range (e.g., '50-200') |
| city | VARCHAR(100) | NULLABLE | City |
| country | VARCHAR(100) | NULLABLE | Country |
| website | VARCHAR(500) | NULLABLE | Company website |
| notes | TEXT | NULLABLE | General notes |
| status | ENUM('active', 'passive') | NOT NULL, DEFAULT 'active' | Firm status |
| created_by_id | UUID | FK → users.id, NOT NULL | Who created |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### firm_contacts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| firm_id | UUID | FK → firms.id, NOT NULL, ON DELETE CASCADE | Parent firm |
| name | VARCHAR(200) | NOT NULL | Contact person name |
| title | VARCHAR(200) | NULLABLE | Job title |
| phone | VARCHAR(30) | NULLABLE | Phone number |
| email | VARCHAR(255) | NULLABLE | Email address |
| is_primary | BOOLEAN | NOT NULL, DEFAULT false | Primary contact flag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### firm_notes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| firm_id | UUID | FK → firms.id, NOT NULL, ON DELETE CASCADE | Parent firm |
| content | TEXT | NOT NULL | Note content |
| created_by_id | UUID | FK → users.id, NOT NULL | Who wrote the note |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Note timestamp |

### positions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| firm_id | UUID | FK → firms.id, NOT NULL | Parent firm |
| title | VARCHAR(255) | NOT NULL | Position title |
| department | VARCHAR(200) | NULLABLE | Department name |
| reporting_to | VARCHAR(200) | NULLABLE | Reports to (title/role) |
| min_experience_years | INTEGER | NULLABLE | Minimum experience required |
| education_requirement | VARCHAR(200) | NULLABLE | Education requirement |
| required_skills | TEXT | NULLABLE | Technical skills (comma-separated or JSON) |
| language_requirement | VARCHAR(500) | NULLABLE | Language requirements |
| sector_preference | VARCHAR(200) | NULLABLE | Preferred industry background |
| city | VARCHAR(100) | NULLABLE | Work location city |
| country | VARCHAR(100) | NULLABLE | Work location country |
| work_model | ENUM('office', 'remote', 'hybrid') | NULLABLE | Working model |
| travel_requirement | VARCHAR(200) | NULLABLE | Travel needs |
| salary_min | DECIMAL(12,2) | NULLABLE | Salary range minimum |
| salary_max | DECIMAL(12,2) | NULLABLE | Salary range maximum |
| salary_currency | VARCHAR(3) | NULLABLE, DEFAULT 'TRY' | Currency |
| salary_type | ENUM('net', 'gross') | NULLABLE | Net or gross |
| benefits | TEXT | NULLABLE | Additional benefits |
| status | ENUM('open', 'on_hold', 'closed') | NOT NULL, DEFAULT 'open' | Position status |
| priority | ENUM('low', 'normal', 'high', 'urgent') | NOT NULL, DEFAULT 'normal' | Priority level |
| opened_at | DATE | NULLABLE | Date position was opened |
| target_close_date | DATE | NULLABLE | Target fill date |
| created_by_id | UUID | FK → users.id, NOT NULL | Who created |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### processes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| candidate_id | UUID | FK → candidates.id, NOT NULL | Candidate |
| firm_id | UUID | FK → firms.id, NOT NULL | Client firm |
| position_id | UUID | FK → positions.id, NOT NULL | Position |
| assigned_to_id | UUID | FK → users.id, NOT NULL | Responsible consultant |
| stage | ENUM('pool', 'initial_interview', 'submitted', 'interview', 'positive', 'negative', 'on_hold') | NOT NULL, DEFAULT 'pool' | Current pipeline stage |
| fitness_score | INTEGER | NULLABLE, CHECK (1-5) | Role fitness score |
| stage_changed_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last stage change timestamp |
| closed_at | TIMESTAMP | NULLABLE | When process was closed (positive/negative) |
| created_by_id | UUID | FK → users.id, NOT NULL | Who created |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### process_notes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| process_id | UUID | FK → processes.id, NOT NULL, ON DELETE CASCADE | Parent process |
| content | TEXT | NOT NULL | Note content |
| created_by_id | UUID | FK → users.id, NOT NULL | Who wrote the note |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Note timestamp |

### process_stage_history
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| process_id | UUID | FK → processes.id, NOT NULL, ON DELETE CASCADE | Parent process |
| from_stage | VARCHAR(50) | NULLABLE | Previous stage (null for initial) |
| to_stage | VARCHAR(50) | NOT NULL | New stage |
| note | TEXT | NULLABLE | Optional note for transition |
| changed_by_id | UUID | FK → users.id, NOT NULL | Who made the change |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Transition timestamp |

### interviews
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| process_id | UUID | FK → processes.id, NOT NULL | Related process |
| scheduled_at | TIMESTAMP | NOT NULL | Interview date and time |
| duration_minutes | INTEGER | NOT NULL, DEFAULT 60 | Duration in minutes |
| type | ENUM('face_to_face', 'online', 'phone') | NOT NULL | Interview type |
| meeting_link | VARCHAR(500) | NULLABLE | Online meeting URL |
| location | VARCHAR(500) | NULLABLE | Physical location/address |
| client_participants | TEXT | NULLABLE | Participants from client side |
| notes | TEXT | NULLABLE | Pre-interview notes |
| result_notes | TEXT | NULLABLE | Post-interview result notes |
| is_completed | BOOLEAN | NOT NULL, DEFAULT false | Whether interview has occurred |
| reminder_24h_sent | BOOLEAN | NOT NULL, DEFAULT false | 24h reminder sent flag |
| reminder_1h_sent | BOOLEAN | NOT NULL, DEFAULT false | 1h reminder sent flag |
| created_by_id | UUID | FK → users.id, NOT NULL | Who scheduled |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### email_templates
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NOT NULL | Template name |
| subject | VARCHAR(500) | NOT NULL | Email subject (supports dynamic fields) |
| body | TEXT | NOT NULL | Email body (HTML, supports dynamic fields) |
| category | VARCHAR(100) | NULLABLE | Template category (e.g., 'ilk_temas', 'mulakat_daveti') |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Whether template is available |
| created_by_id | UUID | FK → users.id, NOT NULL | Who created |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update |

### email_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| candidate_id | UUID | FK → candidates.id, NOT NULL | Recipient candidate |
| process_id | UUID | FK → processes.id, NULLABLE | Related process (if any) |
| template_id | UUID | FK → email_templates.id, NULLABLE | Template used (if any) |
| to_email | VARCHAR(255) | NOT NULL | Recipient email address |
| subject | VARCHAR(500) | NOT NULL | Actual subject sent |
| body | TEXT | NOT NULL | Actual body sent |
| sent_by_id | UUID | FK → users.id, NOT NULL | Who sent |
| sent_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Send timestamp |
| status | ENUM('sent', 'failed') | NOT NULL, DEFAULT 'sent' | Delivery status |
| error_message | TEXT | NULLABLE | Error details if failed |

### audit_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → users.id, NOT NULL | Who performed the action |
| action | VARCHAR(50) | NOT NULL | Action type (create, update, delete, login, stage_change, etc.) |
| entity_type | VARCHAR(50) | NOT NULL | Entity type (candidate, firm, position, process, etc.) |
| entity_id | UUID | NOT NULL | ID of the affected entity |
| changes | JSONB | NULLABLE | Before/after snapshot of changed fields |
| ip_address | VARCHAR(45) | NULLABLE | Client IP address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

### settings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Primary key |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key (e.g., 'smtp_host', 'company_name') |
| value | TEXT | NOT NULL | Setting value |
| updated_by_id | UUID | FK → users.id, NULLABLE | Who last updated |
| updated_at | TIMESTAMP | NOT NULL | Last update |

## 3. Relationships

```
erDiagram
    users ||--o{ candidates : "created_by"
    users ||--o{ candidate_notes : "created_by"
    users ||--o{ candidate_documents : "uploaded_by"
    users ||--o{ firms : "created_by"
    users ||--o{ firm_notes : "created_by"
    users ||--o{ positions : "created_by"
    users ||--o{ processes : "assigned_to / created_by"
    users ||--o{ process_notes : "created_by"
    users ||--o{ process_stage_history : "changed_by"
    users ||--o{ interviews : "created_by"
    users ||--o{ email_templates : "created_by"
    users ||--o{ email_logs : "sent_by"
    users ||--o{ audit_logs : "user"

    candidates ||--o{ candidate_languages : "has"
    candidates ||--o{ candidate_documents : "has"
    candidates ||--o{ candidate_notes : "has"
    candidates ||--o{ processes : "tracked_in"
    candidates ||--o{ email_logs : "received"

    firms ||--o{ firm_contacts : "has"
    firms ||--o{ firm_notes : "has"
    firms ||--o{ positions : "has"
    firms ||--o{ processes : "involved_in"

    positions ||--o{ processes : "for"

    processes ||--o{ process_notes : "has"
    processes ||--o{ process_stage_history : "has"
    processes ||--o{ interviews : "has"
    processes ||--o{ email_logs : "related_to"
```

**Relationship Summary:**
| Relationship | Type | Description |
|-------------|------|-------------|
| users → candidates | 1:N | A user creates many candidates |
| candidates → candidate_languages | 1:N | A candidate speaks many languages |
| candidates → candidate_documents | 1:N | A candidate has many uploaded files |
| candidates → candidate_notes | 1:N | A candidate has many notes |
| firms → firm_contacts | 1:N | A firm has many contact persons |
| firms → firm_notes | 1:N | A firm has many notes |
| firms → positions | 1:N | A firm has many open positions |
| candidates → processes | 1:N | A candidate can be in many processes |
| firms → processes | 1:N | A firm can have many processes |
| positions → processes | 1:N | A position can have many candidate processes |
| processes → process_notes | 1:N | A process has many notes |
| processes → process_stage_history | 1:N | A process has many stage transitions |
| processes → interviews | 1:N | A process can have many interviews |
| processes → email_logs | 1:N | A process can have many related emails |

## 4. Indexes

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| users | email | UNIQUE | Login lookup |
| candidates | email | INDEX | Duplicate check, search |
| candidates | phone | INDEX | Duplicate check, search |
| candidates | linkedin_url | INDEX | Duplicate check (primary) |
| candidates | first_name, last_name | INDEX | Name search |
| candidates | current_sector | INDEX | Filter by sector |
| candidates | city | INDEX | Filter by location |
| candidates | status | INDEX | Filter active/passive |
| candidates | created_by_id | INDEX | Filter by creator |
| firms | name | INDEX | Search by firm name |
| firms | sector | INDEX | Filter by sector |
| firms | status | INDEX | Filter active/passive |
| positions | firm_id | INDEX | Positions per firm lookup |
| positions | status | INDEX | Filter open/closed/on_hold |
| positions | title | INDEX | Search by title |
| processes | candidate_id | INDEX | Processes per candidate |
| processes | firm_id | INDEX | Processes per firm |
| processes | position_id | INDEX | Processes per position |
| processes | assigned_to_id | INDEX | Processes per consultant |
| processes | stage | INDEX | Filter by pipeline stage |
| processes | candidate_id, firm_id, position_id | UNIQUE (where closed_at IS NULL) | Prevent duplicate active processes |
| process_stage_history | process_id | INDEX | History per process |
| interviews | process_id | INDEX | Interviews per process |
| interviews | scheduled_at | INDEX | Calendar queries |
| interviews | reminder_24h_sent, scheduled_at | INDEX | Reminder job queries |
| email_logs | candidate_id | INDEX | Email history per candidate |
| email_logs | process_id | INDEX | Email history per process |
| audit_logs | entity_type, entity_id | INDEX | Audit trail per entity |
| audit_logs | user_id | INDEX | Audit trail per user |
| audit_logs | created_at | INDEX | Time-based audit queries |

## 5. Sensitive Data

| Table | Column | Protection |
|-------|--------|-----------|
| users | password_hash | bcrypt hashed (never stored plain) |
| users | email | PII — encrypted at rest (Neon default) |
| users | password_reset_token | Hashed (SHA-256), time-limited |
| candidates | email | PII — encrypted at rest |
| candidates | phone | PII — encrypted at rest |
| candidates | first_name, last_name | PII — encrypted at rest |
| candidates | linkedin_url | PII — encrypted at rest |
| candidates | salary_expectation | Sensitive business data |
| firm_contacts | name, phone, email | PII — encrypted at rest |
| email_logs | to_email, body | PII — encrypted at rest |
| audit_logs | ip_address | PII — encrypted at rest, retained per KVKK |

**KVKK Compliance Notes:**
- All PII encrypted at rest (Neon provides transparent encryption)
- All PII encrypted in transit (HTTPS enforced)
- Soft delete for candidates (never hard delete — `status: passive`)
- Audit logging tracks all data access and modifications
- Data export capability for "right to access" requests
- Candidate data can be anonymized upon "right to erasure" request (replace PII with anonymized values while preserving process statistics)

## 6. Seed Data

### Default Admin User
- email: admin@talentflow.local
- password: (set during first deployment, force change on first login)
- role: admin

### Default Email Templates
| Name | Category | Subject |
|------|----------|---------|
| İlk Temas | ilk_temas | {pozisyon} pozisyonu hakkında |
| Süreç Bilgilendirme | bilgilendirme | Süreciniz hakkında güncelleme |
| Mülakat Daveti | mulakat_daveti | Mülakat Daveti - {firma} - {pozisyon} |
| Olumlu Sonuç | olumlu_sonuc | Tebrikler! - {pozisyon} |
| Olumsuz Sonuç | olumsuz_sonuc | Süreç Sonucu - {pozisyon} |
| Bekleme Bildirimi | bekleme | Süreç Güncelleme - {pozisyon} |

### Default Settings
| Key | Value | Description |
|-----|-------|-------------|
| company_name | TalentFlow | Company name for emails and UI |
| session_timeout_hours | 8 | Auto-logout after inactivity |
| stale_process_days | 7 | Days before stale process warning |

## 7. Migration Strategy

- **Tool:** Prisma Migrate
- **Naming Convention:** Auto-generated by Prisma with descriptive names (e.g., `20260207_init`, `20260210_add_email_templates`)
- **Rollback:** Prisma supports rollback via `prisma migrate resolve`. For production, always create a forward migration to undo changes rather than rolling back.
- **Workflow:**
  1. Modify `schema.prisma`
  2. Run `npx prisma migrate dev --name descriptive_name` (local)
  3. Review generated SQL
  4. Commit migration files to git
  5. Production: `npx prisma migrate deploy` runs on Vercel build
- **Seed:** `npx prisma db seed` runs `prisma/seed.ts` to populate defaults
