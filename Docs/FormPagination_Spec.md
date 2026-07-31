# Form Engine Enhancements Specification

This document outlines the final implementation plan for adding form pagination, visibility controls, and success redirection to the Goa.City forms engine.

## 1. Overview
The goal is to allow administrators to configure multi-page forms, control whether a form is public or private, and define where a user is sent after submission.

## 2. Database Changes (Prisma)
We will add new configuration fields to the `forms` model in `backend_node/prisma/schema.prisma`.

```prisma
model forms {
  id                Int            @id @default(autoincrement())
  // ... existing fields ...
  
  // Pagination
  fields_per_page   Int?           @default(1) // 1 = standard, 0 = show all, N = N per page
  
  // Visibility & Access
  visibility        String?        @default("members") // "members" or "public"
  
  // Post-Submission Actions
  redirect_url      String?        @db.VarChar(500) // URL to redirect after success
  
  // Notifications
  notify_admin      Boolean        @default(false) // Send notification to admin on submission
}
```

## 3. Feature Details

### A. Pagination (Fields per Page)
- **Logic**: Questions are grouped into "pages" based on `fields_per_page`.
- **UI**: Multiple `QuestionRenderer` components are displayed on a single view.
- **Validation**: All required fields on the current page must be completed before the "Continue" button is enabled or processed.
- **Progress Tracking**: The `last_step_index` will now represent the current `pageIndex`.

### B. Visibility (Public vs. Members)
- **Members Only**: Requires a valid user session (default).
- **Public**: Accessible without authentication. 
  - Useful for: Registration forms or public inquiries.
  - `FormResponse` will have a null `user_id` for anonymous submissions.

### C. Success Redirection
- Allows defining a custom destination after form completion (e.g., `/dashboard`, `/welcome`, or an external URL).
- If left blank, it will default to `/dashboard`.

### D. Admin Alerts
- Toggle for "Notify admin on new submission" to alert staff when a form is completed. Create a field to specify the admin to be notified. It can also be a list of admins.

## 4. Conditional Logic Compatibility
Conditional logic (showing/hiding questions based on previous answers) is **already implemented**. 
- To ensure compatibility with pagination, questions will be filtered **before** being grouped into pages. 
- If all questions on a prospective page are hidden by logic, the pagination will automatically skip that empty page.

## 5. Implementation Strategy

Do not change the existing code structure and features. Follow the master_code_standards.md in the Docs folder. The standards are the most important guidelines to follow.

### Admin UI
Update `frontend/src/features/admin-forms/components/FormEditor.tsx`:
- Add settings for `fields_per_page`, `visibility`, `redirect_url`, and `notify_admin`.
Follow the current UI and UX, do not change the current UI and UX. Do not add new components, do not alter any of the existing components, just use the existing components and adapt them to the new feature. Do not over-engineer the solution. Keep it simple and elegant. Follow the UI guidelines in the Docs folder.

### Frontend Logic
Update `OnboardingFlow.tsx` and `useOnboarding.ts`:
- Handle chunking of questions into pages.
- Handle public access routes.
- Execute redirection based on form config. 

*Updated by Antigravity on 2026-07-22*

## 6. July 22, 2026 Mobile Layout, Modal Overlaps, and Onboarding Persistence Edits

### A. Mobile Layout & Bottom Navigation Customization
- **Top Mobile Header**: Visible on all screen viewports below `lg` (responsive breakpoints). Features a left-aligned uppercase brand logo (**`GOA.CITY`** via logo asset) and a right-aligned hamburger menu toggle (`Bars3Icon` with custom stroke weight).
- **Bottom Navigation Bar**: Repositioned Home in the center as a floating circular action button with a prominent ring border and elevation shadow. Remaining items are grouped:
  - **Left**: My People (labeled "People"), News.
  - **Right**: Mentorship, Meetings.
- **Content Layout Spacing**: Set content wrapper padding to `pb-24 lg:pb-0` to clear the bottom nav bar on mobile.

### B. Modal Overlap Prevention & Input Width Alignment
- **Mobile Modal Padding**: Updated all modal overlays in `MentorshipWorkspace.tsx` to use `p-6 pb-28 md:pb-6`, keeping modal buttons and interactive items clear of the fixed bottom navigation bar on mobile.
  - Modals updated: Log Session, Edit Session, Create Objective, Share Material, Submit Response, Pay RSVP Session.
- **Input Widths**: Enforced `w-full` constraints on `<form>` tags and inner input containers to ensure text inputs, textareas, and datepickers align uniformly across flex layouts.

### C. Onboarding Persistence & Title Design
- **Form Title**: Styled the form's `<h1>` title using the `.page-heading` class, adding a centered colored divider line underneath.
- **Mobile Spacing**: Increased top spacing of the onboarding container to `pt-32 sm:pt-40` to avoid clipping against the fixed progress bar.
- **Edit & Resubmit Logic**:
  - `/form-progress` retrieves existing answers for completed responses (latest response, draft or completed).
  - Completed onboarding forms start at step 0 to allow review/editing of all sections, but keeping all existing answers pre-populated.
  - Submitting onboarding forms updates the existing response record in place (no duplicate response rows in DB).
