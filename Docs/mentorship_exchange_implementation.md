# Mentorship Exchange – Relationship Tracking, Paid Sessions & Admin Match Tools

This implementation document details the vision, core features, database schemas, backend APIs, and frontend interfaces built to support the Mentorship Exchange ecosystem.

---

## 1. Vision & Concept
Based on the **Kingdom Marketplace Concept Document**, the mentorship section is a **covenant-based ecosystem** designed to transfer wisdom, experience, and leadership across generations. It bridges the gap between professional excellence and spiritual calling.

---

## 2. Core Features

### A. Mentor & Mentee Profiles
*   **Mentor Flag**: Users can toggle "Willing to Mentor" or "Set as Mentor" in their profile.
*   **Focus Areas**: 
    *   *Industry*: Tech, Hospitality, Real Estate, Finance, etc.
    *   *Kingdom*: Faith-Work Integration, Leadership, Stewardship, Ethics.
*   **Availability**: "Accepting new mentees" toggle.

### B. Relationship Models (Covenant Types)
1.  **Long-term Covenant**: 6-12 month commitment with structured milestones.
2.  **Flash/Micro Mentoring**: One-off 30-60 minute "Wisdom Sessions" for specific challenges.
3.  **Incubator Mentoring**: Specialized support for business ideas in the Incubator module.

### C. The Mentorship Workspace (Journey View)
The workspace guides users through a **Three-Phase Journey**:
1.  **Phase 1: Foundations & Alignment** (Defining the covenant, spiritual alignment, core objectives).
2.  **Phase 2: Strategy & Execution** (Deep diving into professional skills, business growth, or career path).
3.  **Phase 3: Impact & Multiplication** (Measuring outcomes, scaling the vision, and preparing the mentee to become a mentor).

### D. Admin Control Center
*   **Pairing Oversight**: Review pending requests, match mentees to available approved mentors, and approve "Requested" relations.
*   **Health Dashboard**: See which pairings are active vs. completed vs. pending.
*   **Impact Reporting**: Export CSV reports showing hours spent in mentorship and goal completion rates.

---

## 3. Database Layer Schema

*   **MentorProfile**:
    *   Add `payment_qr_image` (`String?`) to host the mentor's payment QR code.
    *   Add `default_session_price` (`Decimal?`) for default pricing.
*   **MentorshipSession**:
    *   Add `is_paid` (`Boolean @default(false)`).
    *   Add `price` (`Decimal? @db.Decimal(10, 2)`).
    *   Add `payment_status` (`String @default("Free")`) – values: `Free`, `Unpaid`, `Verifying`, `Paid`.
    *   Add `payment_qr_image` (`String?`).
    *   Add `payment_note` (`String?`) to allow the mentee to enter transaction references.
*   **MentorshipRelation**:
    *   Relation field `materials` (`MentorshipMaterial[]`).
*   **MentorshipMaterial**:
    ```prisma
    model MentorshipMaterial {
      id            String             @id @default(uuid())
      relation_id   String
      title         String             @db.VarChar(255)
      description   String?
      file_url      String?            @db.VarChar(500) // File uploaded by mentor
      link_url      String?            @db.VarChar(500) // Optional link to reading material
      status        String             @default("Shared") @db.VarChar(50) // Shared, Read, Responded
      response_text String?            // Mentee's text feedback/response
      response_file String?            @db.VarChar(500) // Mentee's upload response
      created_at    DateTime?          @default(now()) @db.Timestamp(6)
      updated_at    DateTime?          @default(now()) @db.Timestamp(6)

      relation      MentorshipRelation @relation(fields: [relation_id], references: [id], onDelete: Cascade)

      @@map("mentorship_materials")
    }
    ```

---

## 4. Backend Service & Route Implementations

### Service Methods (`mentorship.service.ts`)
*   **`getAdminMentorProfiles()`**: Retrieves candidates, combining `mentor_profiles` records with `Member` table records where `is_mentor === true`. Links completed Mentor Reflection form (Form 20) responses dynamically.
*   **`getMentorshipRequests()`**: Fetches pending requests, filtering out draft/partial submissions (loads `status: 'completed'` only). Excludes members who currently have an active relationship, but dynamically permits new requests to show up if their previous pairing has been closed/completed.
*   **`getMentorshipRequestById(id)`**: Fetches request detail records, mapping field keys to questionnaire labels.
*   **`addMaterial(...)` / `submitMaterialResponse(...)`**: Supports material exchanges and HW tracking.
*   **`adminMatchMentorMentee(...)`**: Matches covenant pairings.
*   **`getApprovedMentors()`**: Retrieves approved mentors from `mentor_profiles` where `is_approved === true`, and includes members who have `is_mentor === true` in their profile.

### Route Registrations (`admin.routes.ts`)
*   `GET /api/admin/mentorship` - Get admin mentorship relations.
*   `GET /api/admin/mentorship/requests` - Get pending completed requests.
*   `GET /api/admin/mentorship/requests/:id` - Fetch single request details.
*   `GET /api/admin/mentorship/profiles` - Fetch mentor profile entries.
*   `POST /api/admin/mentorship/match` - Match a pair.
*   `PUT /api/admin/mentorship/relations/:id/status` - Mark complete or Reopen a relationship.
*   `POST /api/admin/mentorship/relations/:id/notify` - Send customized WhatsApp/email connection alerts to the mentor and/or mentee using system templates and relation placeholders.

---

## 5. Frontend & UI Page Refinement

*   **Mentorship Workspace UI**: Lock banners show the completion dates and block edit operations when status is `Completed`. It includes `formatDate` utilities to prevent rendering crashes.
*   **Become a Mentor Action**: Launches Form ID 20 (`/mentorship/assessment/20`) in the frontend, preventing the admin redirect.
*   **Form Answers & Match Modal**: Renders candidate responses in a modal view inside the Admin Mentorship Hub. Array response values are converted and displayed as clean bullet lists instead of raw JSON brackets.
*   **Profiles Table View**: Simplified to a clean two-column grid (Member & Form Submitted) with name links hookups.
*   **Reopen Relationship Action**: Added a Reopen button in the admin workspace detail page that sets relations status back to `Active` and restores workspace interactivity.
*   **Multi-Submission & Ongoing Checks**:
    *   Form progress loading logic is restricted to `'draft'` statuses. Once a mentorship request is submitted, it is closed, and any subsequent starts create a fresh request.
    *   If a mentee has a pending request (`status === 'Requested'`), they are blocked from sending another request with a warning alert.
    *   If a mentee has an active mentorship (`status === 'Active'`), they are prompted with a confirmation dialog: *"You already have an ongoing mentorship, would you like to make another request?"* before proceeding.
