# Mentorship Exchange – Relationship Tracking & Paid Sessions

This implementation plan outlines the database schema updates, backend API services, and frontend UI/UX updates to support:
1. Advanced relationship tracking (reading materials, step-by-step homework, and file upload/response).
2. Paid mentorship sessions managed by mentors.
3. A unified Dashboard route `/mentorship` handling both empty states and active states (including dual roles where a user is both a mentor and a mentee).

---

## Safety & Style Guidelines

> [!IMPORTANT]
> **Preserving Look & Feel**:
> - We will strictly adhere to the standards in [UI_GUIDELINES.md](file:///Users/stevensdumpala/Imagefile/goa.city/Docs/UI_GUIDELINES.md).
> - All new components will match the dark/light mode glassmorphic styling, custom high-contrast badges, buttons (`bg-sky-600` for primary, `#2D2D46` for secondary dark), inputs, cards, margins (`mb-8`), and typography (`text-3xl font-extrabold text-[#2D2D46]` for page titles).
>
> **Safe Schema & Database Updates**:
> - All new schema additions must be fully nullable or have default values (e.g. `is_paid Boolean @default(false)`) to guarantee database backward compatibility and prevent deletion/corruption of existing database data.
> - Do not delete or rename existing tables/fields.
> - Avoid schema drifts that break existing functions, APIs, or scripts (e.g., `seed_mentorship.ts`).
>
> **Isolate Scope (Zero Regressions)**:
> - Mentorship changes will be fully isolated to mentorship routes, controllers, and pages. Existing pages (Incubator, Dashboard, Jobs, stewardship, etc.) must remain completely untouched.

---

## User Review Required

> [!IMPORTANT]
> **Unified `/mentorship` URL Structure**:
> - We will deprecate `/mentorship/start` and route all clicks from the Sidebar to `/mentorship`.
> - The `/mentorship` page will dynamically check for active relationships and user profile flags to render the correct view (Empty State vs. Active Dashboard).
>
> **Dual Roles support**:
> - The new dashboard UI will explicitly support a member being both a mentor (having active mentees) and a mentee (learning from other mentors). Both lists will render separately under dedicated headers: "Mentees I am Guiding" and "Mentors I am Learning From".
>
> **Offline QR Code Payments**:
> - Paid mentorship sessions will utilize a manual QR Code payment confirmation system (similar to the meetings system), where mentees upload payment references and mentors manually verify/approve them. This keeps overhead low and fits the existing ecosystem.

---

## Proposed Changes

### Database Layer

#### [MODIFY] [schema.prisma](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/prisma/schema.prisma)
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
    *   Add relation field `materials` (`MentorshipMaterial[]`).
*   **[NEW] MentorshipMaterial**:
    *   Create a new model to track reading materials, tasks, templates, and file response flows.
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

### Backend Service & Controllers

#### [MODIFY] [mentorship.service.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/services/mentorship.service.ts)
*   Add CRUD operations for `MentorshipMaterial`:
    *   `addMaterial(relationId, data)`
    *   `submitMaterialResponse(materialId, menteeId, data)` (text and/or file response)
    *   `deleteMaterial(materialId)`
*   Update `MentorshipSession` methods:
    *   `logSession` / `createSession` to handle `is_paid`, `price`, `payment_qr_image`.
    *   `updateSession` to let mentors update session notes, agenda, price, or details.
    *   `submitSessionPayment(sessionId, paymentNote)` sets `payment_status = "Verifying"`.
    *   `verifySessionPayment(sessionId)` sets `payment_status = "Paid"`.
*   Include `materials` in `getById` relationship fetch.

#### [MODIFY] [mentorship.controller.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/controllers/mentorship.controller.ts)
*   Expose endpoints for materials CRUD and file upload handling.
*   Expose session payment submission and validation endpoints.

#### [MODIFY] [member.routes.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/routes/member.routes.ts)
*   Register new mentorship workspace routes:
    *   `POST /mentorship/relations/:id/materials` (upload files)
    *   `POST /mentorship/materials/:id/response` (mentee responds & uploads proof)
    *   `POST /mentorship/sessions/:id/pay` (submit payment note)
    *   `POST /mentorship/sessions/:id/verify` (mentor verifies payment)

---

### Frontend UI/UX Design

#### [MODIFY] [App.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/App.tsx)
*   Update routing path:
    ```diff
    - <Route path="/mentorship/start" element={<MentorshipStart />} />
    + <Route path="/mentorship" element={<MentorshipStart />} />
    ```

#### [MODIFY] [SidebarLeft.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/components/SidebarLeft.tsx)
*   Change Mentorship link `href` from `/mentorship/start` to `/mentorship`.

#### [MODIFY] [MentorshipStart.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/MentorshipStart.tsx)
This file will be completely refactored to act as a **Dynamic Mentorship Dashboard**:
1.  **Check Status**:
    *   Fetch `my-mentorships` and `mentor-profile`.
2.  **State A: Empty State (No active/requested relationships)**:
    *   Display standard "Wisdom Exchange" landing content.
    *   Present two primary call-to-actions:
        *   **"Find a Mentor / Request Wisdom"** (Navigates to `/mentorship/assessment/mentorship-mentee-assessment` or directory search).
        *   **"Become a Mentor"** (Onboards the user as a mentor, toggles "Willing to Mentor" flag, and opens settings to define focus areas/session price/payment QR image).
3.  **State B: Dashboard State (One or more relationships exist)**:
    *   **"Mentors I am Learning From"**: List of active relationships where the current member is the Mentee. Showing the mentor's name, profile photo, status, and button to open workspace.
    *   **"Mentees I am Guiding"**: List of active relationships where the current member is the Mentor. Showing the mentee's name, profile photo, current phase, and button to open workspace.
    *   **"Pending Requests"**: Sub-section showing incoming mentorship requests from other members with options to accept or decline.
    *   **Quick Actions Panel**:
        *   **"Find Another Mentor"**: Allows active mentors or mentees to request new mentorship pairings.
        *   **"Mentor Settings"**: Toggle availability, edit bio, set session prices, and upload payment QR code.

#### [MODIFY] [MentorshipWorkspace.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/MentorshipWorkspace.tsx)
Enhanced layout with tabs:
1.  **Sessions Tab**:
    *   Mentors can create, edit, or log a session. They can set the session as paid and adjust the fee.
    *   Mentees can view sessions, trigger a QR Code payment modal for paid sessions, enter the txn reference, and submit for verification.
    *   Mentors can click "Verify Payment" to approve the RSVP.
2.  **Goals & Steps Tab**:
    *   Collaborative goal setting and milestone list.
3.  **Materials Tab [NEW]**:
    *   Mentors can add suggested links or upload PDFs/worksheets.
    *   Mentees can download files, add written notes/responses, and upload response files.

---

## Verification Plan

### Automated/Manual Tests
*   Run database migrations to apply the new schema elements.
*   Seed dummy data for a user with:
    *   No relationships (confirm Landing UI with dual registration options).
    *   Dual roles (confirm lists for both Mentors and Mentees exist).
    *   Paid sessions (verify QR code billing and confirmation flow).
*   Verify navigation works seamlessly from Sidebar `/mentorship`.

---

## Updates Completed on June 7, 2026

I have implemented and deployed several bug fixes, design corrections, and security hardening updates to the mentorship modules and image upload systems.

### 1. Unified WebP Image Conversion & Security Hardening
*   **Path:** [image.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/utils/image.ts)
*   **Optimized WebP Storage:** Created the `processImageToWebp` utility that uses the `sharp` library to resize uploaded QR images to `600px` width and convert them to optimized `.webp` format (quality: 85) to conserve resources.
*   **MIME-type Security Validation:** Hardened the file type check to strictly reject files whose `mimetype` does not start with `image/`. Malformed or invalid file uploads are immediately unlinked (deleted) from disk.
*   **Elimination of Insecure Fallbacks:** Removed the catch-block logic that renamed failed uploads (previously naming them to `.png` or original extensions as a fallback). Now, if `sharp` fails, the temporary upload is aggressively deleted from `/uploads/` and an error is thrown, preventing potentially executable scripts or raw malicious files from lingering in public static directories.
*   **Meetings Upload Standardization ([meetings.controller.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/controllers/meetings.controller.ts)):** Standardized the payment QR uploads in meetings by routing them through `processImageToWebp` inside `createMeeting` to enforce compression and type security constraints uniformly across the application.

### 2. Mentorship Session Persistence Fix
*   **Path:** [mentorship.service.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/services/mentorship.service.ts)
*   **PRISMA Update Bug resolved:** Resolved a bug in the `updateSession` method where the `payment_qr_image` column was skipped during DB queries. Edits to session-specific payment QR images are now successfully persisted.
*   **Path:** [mentorship.controller.ts](file:///Users/stevensdumpala/Imagefile/goa.city/backend_node/src/controllers/mentorship.controller.ts)
*   **Body Fallback Logic:** Updated the `logMentorshipSession` and `updateMentorshipSession` controller endpoints. If `fileUrl` is undefined (because no new file was uploaded), the query falls back to `req.body.payment_qr_image` (the existing string path submitted by the frontend) rather than defaulting to `null`, ensuring existing custom QR links are preserved.

### 3. Frontend UI & UX Enhancements
*   **Path:** [MentorshipWorkspace.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/MentorshipWorkspace.tsx)
*   **Clean Paid Session Labels:** Refactored paid session indicator tags to render clean label templates (`Paid Session: ₹500`) instead of appending redundant `(Free)` or `(Unpaid)` states.
*   **Dual QR Code Resolution:** Updated the payment confirmation popup to resolve session-specific QR codes first and fall back to profile-level QR codes (`mentorProfile.payment_qr_image`) if a custom one is not set.

### 4. Deployment Verification
*   **Compilation:** Backend and frontend compiled locally with zero warnings.
*   **Deployment:** Synchronized code and compiled outputs to the production environment (`140.238.245.13`).
*   **Production Checks:** Verified PM2 is hosting `goa-city-backend` in healthy running condition (`online` status with zero restarts). Verified logs show successful initialization, WhatsApp client authentication, and connection heartbeats.

