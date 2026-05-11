# Public Registration Implementation Plan

This document outlines the workflow and technical implementation for the new public registration system on the Goa.City platform.

## 1. Core Components

*   **Registration Form (ID: 8):** Managed via Admin Forms.
*   **Registration Content Page (ID: 3):** Managed via Custom Pages (slug: `register`).
*   **Registration URL:** `https://goa.city/register`

## 2. Form Field Mappings

Since the field keys are auto-generated, the backend will map the following keys to the `Member` model:

| Field Label | Field Key | Destination Column |
| :--- | :--- | :--- |
| **First Name** | `q_1777535957750` | `Member.first_name` |
| **Last Name** | `q_1777535965235` | `Member.last_name` |
| **Phone** | `q_1777535983051` | `Member.phone` |
| **Email** | `q_1777535975718` | `Member.email` |

*Note: Any additional fields added by the Admin will be saved in the `MemberProfile` (KV table) and `FormAnswer` table.*

## 3. Workflow Flow

### A. Frontend Flow (`/register`)
1.  **Access:** Open to all users (no authentication required).
2.  **Data Fetching:**
    *   Fetch **Page 3** content to display the "Welcome" text and branding.
    *   Fetch **Form 8** structure to render the registration fields.
3.  **Rendering:**
    *   Display Page title as `<h1>`.
    *   Display Page content (introduction).
    *   Render the dynamic Form using the standard Goa.City form renderer.
4.  **Submission:**
    *   Send data to `POST /api/public/register`.
5.  **Success State:**
    *   Show a "Success" message: *"Thank you for joining Goa.City. Your application is currently being reviewed. You will be notified once your membership is activated."*
    *   Note: The "Back to Login" button has been removed from this screen to maintain focus on the pending state.

### B. Backend Flow (`POST /api/public/register`)
1.  **Validation:**
    *   Ensure all required fields are present.
    *   Check for existing members with the same email or phone.
2.  **Member Creation:**
    *   Create a new `Member` record with **no assigned streams**.
    *   Sync mapped fields (`first_name`, `last_name`, etc.).
3.  **Data Persistence:**
    *   Save a `FormResponse` and `FormAnswer` for historical tracking.

### C. Admin Review & Confirmation Workflow
1.  **Registrations Queue:**
    *   New users appear in the **"Registrations"** submenu in the Admin Sidebar.
    *   The **"Members"** list is filtered to only show active members (those with at least one stream).
2.  **Confirmation Requirements:**
    *   Admins must edit the registration to "activate" the member.
    *   **Mandatory Fields:** The member cannot be saved until at least one **Stream** is assigned and a **URL Slug (handle)** is provided.
3.  **Activation:**
    *   Once a stream is assigned and the profile is updated, the user automatically moves from the "Registrations" list to the "Members" directory.

### D. Login Restriction Logic
1.  Modify `AuthService.sendOtp`.
2.  Check if the member exists.
3.  **Validation:** Check if the member has any assigned streams.
4.  **If** `streamCount === 0`:
    *   Block OTP generation.
    *   Return error: *"Your registration is pending approval. You will be notified once your membership is activated."*

## 4. Implementation Steps

1.  **Backend:**
    *   Add `/api/public/register` to `public.routes.ts`.
    *   Implement registration controller logic.
    *   Update `AuthService` with stream-based login validation.
2.  **Frontend:**
    *   Add `/register` route to `App.tsx`.
    *   Create `RegisterView` component.
    *   Integrate with existing `QuestionRenderer`.
