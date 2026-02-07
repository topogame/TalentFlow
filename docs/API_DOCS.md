# API Documentation: TalentFlow

## Base URL
`/api` (relative — served by Next.js API routes on same domain)

## Response Format
All endpoints return a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [ ... ]
  }
}
```

## Authentication
- **Method:** JWT via NextAuth.js (stored in httpOnly cookie)
- **Protected routes:** All endpoints except `/api/auth/*` public routes
- **Role check:** Endpoints marked `[Admin]` require `role: admin`
- **Middleware:** `src/middleware.ts` handles JWT verification and route protection

## Pagination Format
For list endpoints that support pagination:
```
GET /api/candidates?page=1&limit=20&sort=created_at&order=desc
```

Response includes:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Endpoints

---

### Auth Module

#### POST /api/auth/login
**Description:** Authenticate user and create session
**Auth:** Public
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | yes | Valid email, max 255 |
| password | string | yes | Min 8 chars |

**Success (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "role": "consultant" }
  }
}
```
**Note:** JWT is set as httpOnly cookie by NextAuth.js, not returned in body.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 403 | ACCOUNT_DISABLED | User is deactivated |
| 429 | RATE_LIMITED | Too many login attempts (5/min) |

---

#### POST /api/auth/forgot-password
**Description:** Send password reset email
**Auth:** Public
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | yes | Valid email |

**Success (200):**
```json
{ "success": true, "data": { "message": "Şifre sıfırlama e-postası gönderildi." } }
```
**Note:** Always returns 200 even if email doesn't exist (prevents user enumeration).

**Errors:**
| Status | Code | When |
|--------|------|------|
| 429 | RATE_LIMITED | Too many requests (3/hour per email) |

---

#### POST /api/auth/reset-password
**Description:** Reset password using token
**Auth:** Public
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| token | string | yes | Non-empty |
| password | string | yes | Min 8, 1 uppercase, 1 number |

**Success (200):**
```json
{ "success": true, "data": { "message": "Şifreniz başarıyla güncellendi." } }
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | INVALID_TOKEN | Token expired or invalid |
| 400 | VALIDATION_ERROR | Password doesn't meet requirements |

---

#### POST /api/auth/change-password
**Description:** Change own password (while logged in)
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| currentPassword | string | yes | Non-empty |
| newPassword | string | yes | Min 8, 1 uppercase, 1 number |

**Success (200):**
```json
{ "success": true, "data": { "message": "Şifreniz güncellendi." } }
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | New password doesn't meet requirements |
| 401 | INVALID_CREDENTIALS | Current password is wrong |

---

#### GET /api/auth/session
**Description:** Get current session/user info
**Auth:** Any authenticated user

**Success (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "role": "admin" }
  }
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 401 | UNAUTHORIZED | Not logged in |

---

### Users Module [Admin]

#### GET /api/users
**Description:** List all users
**Auth:** Admin only
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | no | Page number (default: 1) |
| limit | number | no | Items per page (default: 20, max: 100) |
| role | string | no | Filter by role: admin, consultant |
| isActive | boolean | no | Filter by active status |
| search | string | no | Search by name or email |

**Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "role": "consultant", "isActive": true, "lastLoginAt": "...", "createdAt": "..." }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

---

#### POST /api/users
**Description:** Create a new user account
**Auth:** Admin only
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | yes | Valid email, unique, max 255 |
| password | string | yes | Min 8, 1 uppercase, 1 number |
| firstName | string | yes | Min 1, max 100 |
| lastName | string | yes | Min 1, max 100 |
| role | string | yes | "admin" or "consultant" |

**Success (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "role": "consultant" }
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 409 | EMAIL_EXISTS | Email already registered |
| 403 | FORBIDDEN | Non-admin attempting |

---

#### GET /api/users/:id
**Description:** Get user details
**Auth:** Admin only

**Success (200):** Single user object.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 404 | NOT_FOUND | User not found |

---

#### PUT /api/users/:id
**Description:** Update user (name, role, active status)
**Auth:** Admin only
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firstName | string | no | Max 100 |
| lastName | string | no | Max 100 |
| role | string | no | "admin" or "consultant" |
| isActive | boolean | no | Activate/deactivate |

**Success (200):** Updated user object.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 404 | NOT_FOUND | User not found |
| 400 | CANNOT_DEACTIVATE_SELF | Admin trying to deactivate themselves |

---

### Candidates Module

#### GET /api/candidates
**Description:** List candidates with filtering and search
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | no | Page number (default: 1) |
| limit | number | no | Items per page (default: 20, max: 100) |
| search | string | no | Search in name, email, phone |
| sector | string | no | Filter by current sector |
| minExperience | number | no | Minimum experience years |
| maxExperience | number | no | Maximum experience years |
| city | string | no | Filter by city |
| country | string | no | Filter by country |
| salaryMin | number | no | Minimum salary expectation |
| salaryMax | number | no | Maximum salary expectation |
| language | string | no | Filter by language |
| status | string | no | "active" or "passive" (default: "active") |
| isRemoteEligible | boolean | no | Filter remote-eligible |
| sort | string | no | Sort field (default: "createdAt") |
| order | string | no | "asc" or "desc" (default: "desc") |

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "...",
      "lastName": "...",
      "email": "...",
      "phone": "...",
      "currentTitle": "...",
      "currentSector": "...",
      "totalExperienceYears": 8,
      "city": "Istanbul",
      "salaryExpectation": 50000,
      "salaryCurrency": "TRY",
      "status": "active",
      "activeProcessCount": 2,
      "createdAt": "..."
    }
  ],
  "pagination": { ... }
}
```

---

#### POST /api/candidates
**Description:** Create a new candidate
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firstName | string | yes | Min 1, max 100 |
| lastName | string | yes | Min 1, max 100 |
| email | string | no | Valid email, max 255 |
| phone | string | no | Max 30 |
| linkedinUrl | string | no | Valid URL, max 500 |
| educationLevel | string | no | Max 100 |
| totalExperienceYears | number | no | Min 0, max 50 |
| currentSector | string | no | Max 200 |
| currentTitle | string | no | Max 200 |
| salaryExpectation | number | no | Min 0 |
| salaryCurrency | string | no | "TRY", "USD", or "EUR" |
| salaryType | string | no | "net" or "gross" |
| country | string | no | Max 100 |
| city | string | no | Max 100 |
| isRemoteEligible | boolean | no | Default false |
| isHybridEligible | boolean | no | Default false |
| languages | array | no | Array of { language, level } |

**Success (201):** Created candidate object with id.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |

---

#### POST /api/candidates/duplicate-check
**Description:** Check for duplicate candidates before creation
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| linkedinUrl | string | no | URL to check |
| email | string | no | Email to check |
| phone | string | no | Phone to check |
| firstName | string | no | Name for similarity check |
| lastName | string | no | Name for similarity check |

**Success (200):**
```json
{
  "success": true,
  "data": {
    "hasDuplicates": true,
    "matches": [
      {
        "candidateId": "uuid",
        "firstName": "...",
        "lastName": "...",
        "matchType": "linkedin",
        "confidence": "exact"
      }
    ]
  }
}
```

---

#### GET /api/candidates/:id
**Description:** Get full candidate profile
**Auth:** Any authenticated user

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "...",
    "linkedinUrl": "...",
    "educationLevel": "...",
    "totalExperienceYears": 8,
    "currentSector": "...",
    "currentTitle": "...",
    "salaryExpectation": 50000,
    "salaryCurrency": "TRY",
    "salaryType": "net",
    "country": "Türkiye",
    "city": "Istanbul",
    "isRemoteEligible": true,
    "isHybridEligible": true,
    "status": "active",
    "languages": [ { "id": "uuid", "language": "English", "level": "advanced" } ],
    "documents": [ { "id": "uuid", "fileName": "cv.pdf", "fileUrl": "...", "createdAt": "..." } ],
    "activeProcessCount": 2,
    "createdBy": { "id": "uuid", "firstName": "...", "lastName": "..." },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 404 | NOT_FOUND | Candidate not found |

---

#### PUT /api/candidates/:id
**Description:** Update candidate
**Auth:** Any authenticated user
**Request Body:** Same fields as POST (all optional). Languages array replaces existing.

**Success (200):** Updated candidate object.

---

#### GET /api/candidates/:id/notes
**Description:** Get candidate notes
**Auth:** Any authenticated user

**Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "content": "...", "createdBy": { "firstName": "...", "lastName": "..." }, "createdAt": "..." }
  ]
}
```

---

#### POST /api/candidates/:id/notes
**Description:** Add a note to candidate
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | string | yes | Min 1, max 5000 |

**Success (201):** Created note object.

---

#### GET /api/candidates/:id/documents
**Description:** List candidate documents
**Auth:** Any authenticated user

**Success (200):** Array of document objects.

---

#### POST /api/candidates/:id/documents
**Description:** Upload a document (CV) for candidate
**Auth:** Any authenticated user
**Content-Type:** multipart/form-data
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| file | File | yes | PDF or Word, max 10MB |

**Success (201):**
```json
{
  "success": true,
  "data": { "id": "uuid", "fileName": "cv.pdf", "fileUrl": "...", "fileType": "application/pdf", "fileSize": 524288, "createdAt": "..." }
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | INVALID_FILE_TYPE | Not PDF or Word |
| 400 | FILE_TOO_LARGE | Exceeds 10MB |

---

#### GET /api/candidates/:id/processes
**Description:** Get all processes for a candidate
**Auth:** Any authenticated user

**Success (200):** Array of process objects (with firm and position names).

---

### Firms Module

#### GET /api/firms
**Description:** List client firms
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | no | Default: 1 |
| limit | number | no | Default: 20 |
| search | string | no | Search in firm name |
| sector | string | no | Filter by sector |
| city | string | no | Filter by city |
| status | string | no | "active" or "passive" (default: "active") |
| sort | string | no | Sort field (default: "createdAt") |
| order | string | no | "asc" or "desc" (default: "desc") |

**Success (200):** Array of firm objects with `openPositionCount` and `activeProcessCount`.

---

#### POST /api/firms
**Description:** Create a new client firm
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | yes | Min 1, max 255 |
| sector | string | no | Max 200 |
| companySize | string | no | Max 50 |
| city | string | no | Max 100 |
| country | string | no | Max 100 |
| website | string | no | Valid URL, max 500 |
| notes | string | no | Max 5000 |
| contacts | array | no | Array of { name, title, phone, email, isPrimary } |

**Success (201):** Created firm object with id.

---

#### GET /api/firms/:id
**Description:** Get full firm profile
**Auth:** Any authenticated user

**Success (200):** Firm object with contacts, open positions, active processes, past placements.

---

#### PUT /api/firms/:id
**Description:** Update firm
**Auth:** Any authenticated user
**Request Body:** Same fields as POST (all optional).

**Success (200):** Updated firm object.

---

#### PUT /api/firms/:id/status
**Description:** Activate/deactivate firm
**Auth:** Admin only
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| status | string | yes | "active" or "passive" |

**Success (200):** Updated firm object.

---

#### GET /api/firms/:id/notes
**Description:** Get firm notes
**Auth:** Any authenticated user

---

#### POST /api/firms/:id/notes
**Description:** Add note to firm
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | string | yes | Min 1, max 5000 |

**Success (201):** Created note object.

---

### Positions Module

#### GET /api/positions
**Description:** List positions
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | no | Default: 1 |
| limit | number | no | Default: 20 |
| search | string | no | Search in title |
| firmId | string | no | Filter by firm |
| sector | string | no | Filter by sector preference |
| city | string | no | Filter by location |
| status | string | no | "open", "on_hold", "closed" (default: "open") |
| priority | string | no | "low", "normal", "high", "urgent" |
| workModel | string | no | "office", "remote", "hybrid" |
| salaryMin | number | no | Minimum salary range |
| salaryMax | number | no | Maximum salary range |
| sort | string | no | Sort field (default: "createdAt") |
| order | string | no | "asc" or "desc" (default: "desc") |

**Success (200):** Array of position objects with `firm.name` and `activeProcessCount`.

---

#### POST /api/positions
**Description:** Create a new position
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firmId | string | yes | Valid firm UUID |
| title | string | yes | Min 1, max 255 |
| department | string | no | Max 200 |
| reportingTo | string | no | Max 200 |
| minExperienceYears | number | no | Min 0, max 50 |
| educationRequirement | string | no | Max 200 |
| requiredSkills | string | no | Comma-separated or text |
| languageRequirement | string | no | Max 500 |
| sectorPreference | string | no | Max 200 |
| city | string | no | Max 100 |
| country | string | no | Max 100 |
| workModel | string | no | "office", "remote", "hybrid" |
| travelRequirement | string | no | Max 200 |
| salaryMin | number | no | Min 0 |
| salaryMax | number | no | Min 0, >= salaryMin |
| salaryCurrency | string | no | "TRY", "USD", "EUR" |
| salaryType | string | no | "net", "gross" |
| benefits | string | no | Max 2000 |
| status | string | no | "open", "on_hold", "closed" (default: "open") |
| priority | string | no | "low", "normal", "high", "urgent" (default: "normal") |
| openedAt | date | no | ISO date |
| targetCloseDate | date | no | ISO date, >= openedAt |

**Success (201):** Created position object with id.

---

#### GET /api/positions/:id
**Description:** Get full position profile
**Auth:** Any authenticated user

**Success (200):** Position object with firm details, active processes (with candidate names), process count.

---

#### PUT /api/positions/:id
**Description:** Update position
**Auth:** Any authenticated user

---

#### PUT /api/positions/:id/status
**Description:** Change position status (close/hold/reopen)
**Auth:** Admin only
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| status | string | yes | "open", "on_hold", "closed" |

---

### Processes Module

#### GET /api/processes
**Description:** List processes (supports both list and Kanban data)
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | no | Default: 1 |
| limit | number | no | Default: 50 |
| candidateId | string | no | Filter by candidate |
| firmId | string | no | Filter by firm |
| positionId | string | no | Filter by position |
| assignedToId | string | no | Filter by consultant |
| stage | string | no | Filter by pipeline stage |
| view | string | no | "list" or "kanban" (default: "list") |
| sort | string | no | Sort field (default: "updatedAt") |
| order | string | no | "asc" or "desc" (default: "desc") |

**Success (200) — List view:** Array of process objects with candidate name, firm name, position title, consultant name.

**Success (200) — Kanban view:**
```json
{
  "success": true,
  "data": {
    "pool": [ { "id": "...", "candidate": { ... }, "firm": { ... }, "position": { ... }, ... } ],
    "initial_interview": [ ... ],
    "submitted": [ ... ],
    "interview": [ ... ],
    "positive": [ ... ],
    "negative": [ ... ],
    "on_hold": [ ... ]
  }
}
```

---

#### POST /api/processes
**Description:** Start a new process (candidate + firm + position)
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| candidateId | string | yes | Valid candidate UUID |
| firmId | string | yes | Valid firm UUID |
| positionId | string | yes | Valid position UUID, must belong to firmId |
| stage | string | no | Initial stage (default: "pool") |
| fitnessScore | number | no | 1–5 |

**Success (201):** Created process object.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 409 | DUPLICATE_PROCESS | Active process already exists for this candidate + firm + position |

**Warnings (returned in response, don't block creation):**
```json
{
  "success": true,
  "data": { ... },
  "warnings": [
    { "code": "PAST_PROCESS", "message": "Bu aday daha önce bu firmaya sunulmuş." },
    { "code": "NEGATIVE_HISTORY", "message": "Bu aday daha önce bu firmada olumsuz sonuçlanmış." }
  ]
}
```

---

#### GET /api/processes/:id
**Description:** Get full process detail
**Auth:** Any authenticated user

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "candidate": { "id": "...", "firstName": "...", "lastName": "...", "email": "...", "phone": "..." },
    "firm": { "id": "...", "name": "..." },
    "position": { "id": "...", "title": "..." },
    "assignedTo": { "id": "...", "firstName": "...", "lastName": "..." },
    "stage": "interview",
    "fitnessScore": 4,
    "stageChangedAt": "...",
    "closedAt": null,
    "stageHistory": [ { "fromStage": "pool", "toStage": "initial_interview", "note": "...", "changedBy": { ... }, "createdAt": "..." } ],
    "notes": [ ... ],
    "interviews": [ ... ],
    "emails": [ ... ],
    "createdBy": { ... },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### PUT /api/processes/:id/stage
**Description:** Change pipeline stage
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| stage | string | yes | Valid stage enum value |
| note | string | no | Max 2000 — optional note for transition |

**Validation Rules:**
- Cannot change stage if process is already closed (stage = positive or negative)
- Any other stage transition is allowed (flexible rollback)
- When changing to "positive" or "negative", `closedAt` is auto-set

**Success (200):** Updated process object.

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | PROCESS_CLOSED | Attempting to change a closed process |
| 400 | VALIDATION_ERROR | Invalid stage value |

---

#### PUT /api/processes/:id
**Description:** Update process metadata (fitness score, assigned consultant)
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| fitnessScore | number | no | 1–5 |
| assignedToId | string | no | Valid user UUID |

**Success (200):** Updated process object.

---

#### GET /api/processes/:id/notes
**Description:** Get process notes
**Auth:** Any authenticated user

---

#### POST /api/processes/:id/notes
**Description:** Add note to process
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | string | yes | Min 1, max 5000 |

**Success (201):** Created note object.

---

### Interviews Module

#### GET /api/calendar
**Description:** Get interviews for calendar view
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| startDate | date | yes | Range start (ISO date) |
| endDate | date | yes | Range end (ISO date) |
| assignedToId | string | no | Filter by consultant |

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "scheduledAt": "2026-03-15T10:00:00Z",
      "durationMinutes": 60,
      "type": "online",
      "meetingLink": "https://...",
      "isCompleted": false,
      "process": {
        "id": "...",
        "candidate": { "firstName": "...", "lastName": "..." },
        "firm": { "name": "..." },
        "position": { "title": "..." }
      }
    }
  ]
}
```

---

#### POST /api/calendar
**Description:** Schedule a new interview
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| processId | string | yes | Valid process UUID |
| scheduledAt | datetime | yes | ISO datetime, must be in future |
| durationMinutes | number | no | Min 15, max 480 (default: 60) |
| type | string | yes | "face_to_face", "online", "phone" |
| meetingLink | string | no | Valid URL (required if type is "online") |
| location | string | no | Max 500 |
| clientParticipants | string | no | Max 1000 |
| notes | string | no | Max 2000 |

**Success (201):** Created interview object.

---

#### GET /api/calendar/:id
**Description:** Get interview details
**Auth:** Any authenticated user

---

#### PUT /api/calendar/:id
**Description:** Update interview (reschedule, add result)
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| scheduledAt | datetime | no | ISO datetime |
| durationMinutes | number | no | 15–480 |
| type | string | no | "face_to_face", "online", "phone" |
| meetingLink | string | no | Valid URL |
| location | string | no | Max 500 |
| clientParticipants | string | no | Max 1000 |
| notes | string | no | Max 2000 |
| resultNotes | string | no | Max 5000 |
| isCompleted | boolean | no | Mark as completed |

**Success (200):** Updated interview object.

---

#### DELETE /api/calendar/:id
**Description:** Cancel/delete an interview
**Auth:** Any authenticated user

**Success (200):**
```json
{ "success": true, "data": { "message": "Mülakat iptal edildi." } }
```

---

### Email Module

#### GET /api/emails/templates
**Description:** List email templates
**Auth:** Any authenticated user

**Success (200):** Array of template objects.

---

#### POST /api/emails/templates
**Description:** Create email template
**Auth:** Admin only
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | yes | Min 1, max 255 |
| subject | string | yes | Min 1, max 500 |
| body | string | yes | Min 1 (HTML allowed) |
| category | string | no | Max 100 |

**Success (201):** Created template object.

---

#### PUT /api/emails/templates/:id
**Description:** Update email template
**Auth:** Admin only

---

#### DELETE /api/emails/templates/:id
**Description:** Delete email template
**Auth:** Admin only

---

#### POST /api/emails/send
**Description:** Send email to one or more candidates
**Auth:** Any authenticated user
**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| candidateIds | string[] | yes | Array of candidate UUIDs (1–50) |
| templateId | string | no | Template to use (optional — can write custom) |
| subject | string | yes | Min 1, max 500 (overrides template if provided) |
| body | string | yes | Min 1 (overrides template if provided) |
| processId | string | no | Link email to specific process |

**Dynamic fields in subject/body are auto-replaced:** `{aday_adi}`, `{aday_soyadi}`, `{pozisyon}`, `{firma}`, `{danisman_adi}`, `{tarih}`, `{mulakat_tarihi}`, `{mulakat_saati}`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "sent": 5,
    "failed": 0,
    "results": [
      { "candidateId": "uuid", "status": "sent" }
    ]
  }
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input |
| 400 | NO_EMAIL | Candidate has no email address |

---

#### GET /api/emails/logs
**Description:** Get email send history
**Auth:** Any authenticated user
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| candidateId | string | no | Filter by candidate |
| processId | string | no | Filter by process |
| page | number | no | Default: 1 |
| limit | number | no | Default: 20 |

**Success (200):** Array of email log objects.

---

### Reports Module

#### GET /api/reports/dashboard
**Description:** Get dashboard metrics
**Auth:** Any authenticated user

**Success (200):**
```json
{
  "success": true,
  "data": {
    "activeCandidates": 342,
    "openPositions": 28,
    "weeklyInterviews": 7,
    "pendingActions": 12,
    "pipelineOverview": {
      "pool": 45,
      "initial_interview": 23,
      "submitted": 18,
      "interview": 12,
      "positive": 8,
      "negative": 15,
      "on_hold": 5
    },
    "recentActivity": [
      { "type": "stage_change", "description": "...", "user": "...", "createdAt": "..." }
    ]
  }
}
```

---

#### GET /api/reports/candidates
**Description:** Candidate summary report
**Auth:** Any authenticated user
**Query Params:** Same filters as GET /api/candidates + `format` (json or xlsx)

**Success (200):** Report data or Excel file download.

---

#### GET /api/reports/firms
**Description:** Firm-based report (processes per firm, stage distribution)
**Auth:** Any authenticated user

---

#### GET /api/reports/positions
**Description:** Position-based report (candidates per position, time analysis)
**Auth:** Any authenticated user

---

#### GET /api/reports/consultants
**Description:** Consultant performance report
**Auth:** Any authenticated user (sees own data; Admin sees all)
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | no | Filter by consultant (Admin only) |
| startDate | date | no | Period start |
| endDate | date | no | Period end |

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "consultant": { "id": "...", "firstName": "...", "lastName": "..." },
      "totalProcesses": 45,
      "activeProcesses": 12,
      "positiveOutcomes": 8,
      "negativeOutcomes": 15,
      "avgTimeToClose": 18.5,
      "interviewsScheduled": 22,
      "emailsSent": 134
    }
  ]
}
```

---

#### GET /api/reports/pipeline
**Description:** Pipeline analysis (stage distribution, transition times)
**Auth:** Any authenticated user

---

### Settings Module [Admin]

#### GET /api/settings
**Description:** Get all system settings
**Auth:** Admin only

**Success (200):**
```json
{
  "success": true,
  "data": {
    "company_name": "TalentFlow",
    "session_timeout_hours": 8,
    "stale_process_days": 7
  }
}
```

---

#### PUT /api/settings
**Description:** Update system settings
**Auth:** Admin only
**Request Body:**
```json
{
  "company_name": "My Firm",
  "stale_process_days": 10
}
```

**Success (200):** Updated settings object.

---

### Audit Module

#### GET /api/audit-logs
**Description:** Query audit logs
**Auth:** Admin only
**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| entityType | string | no | Filter by entity (candidate, firm, process, etc.) |
| entityId | string | no | Filter by specific entity |
| userId | string | no | Filter by user who performed action |
| action | string | no | Filter by action (create, update, delete, login, stage_change) |
| startDate | date | no | From date |
| endDate | date | no | To date |
| page | number | no | Default: 1 |
| limit | number | no | Default: 50 |

**Success (200):** Array of audit log objects with user info and change details.

---

## Error Code Reference

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed — details in error.details |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| UNAUTHORIZED | 401 | Missing or invalid JWT token |
| FORBIDDEN | 403 | Insufficient permissions (role check failed) |
| NOT_FOUND | 404 | Resource not found |
| EMAIL_EXISTS | 409 | Email already registered |
| DUPLICATE_PROCESS | 409 | Active process already exists for candidate + firm + position |
| PROCESS_CLOSED | 400 | Cannot modify a closed process |
| INVALID_TOKEN | 400 | Password reset token expired or invalid |
| INVALID_FILE_TYPE | 400 | File type not allowed (only PDF/Word) |
| FILE_TOO_LARGE | 400 | File exceeds 10MB limit |
| NO_EMAIL | 400 | Candidate has no email address for sending |
| CANNOT_DEACTIVATE_SELF | 400 | Admin cannot deactivate their own account |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server error (details logged, not exposed) |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 requests | 1 minute |
| POST /api/auth/forgot-password | 3 requests | 1 hour (per email) |
| POST /api/emails/send | 50 emails | 1 hour (per user) |
| All other endpoints | 100 requests | 1 minute (per user) |
