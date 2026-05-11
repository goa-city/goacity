# Mentorship Exchange – Development Plan

## 1. Vision & Concept
Based on the **Kingdom Marketplace Concept Document**, the mentorship section is a **covenant-based ecosystem** designed to transfer wisdom, experience, and leadership across generations. It bridges the gap between professional excellence and spiritual calling.

## 2. Core Features

### A. Mentor & Mentee Profiles
*   **Mentor Flag**: Users can toggle "Willing to Mentor" in their profile.
*   **Focus Areas**: 
    *   *Industry*: Tech, Hospitality, Real Estate, Finance, etc.
    *   *Kingdom*: Faith-Work Integration, Leadership, Stewardship, Ethics.
*   **Availability**: "Accepting new mentees" toggle.

### B. Relationship Models (Covenant Types)
1.  **Long-term Covenant**: 6-12 month commitment with structured milestones.
2.  **Flash/Micro Mentoring**: One-off 30-60 minute "Wisdom Sessions" for specific challenges.
3.  **Incubator Mentoring**: Specialized support for business ideas in the Incubator module.

### C. The Mentorship Workspace (Journey View)
The workspace will move from a simple goal list to a **Three-Phase Journey**:
1.  **Phase 1: Foundations & Alignment** (Defining the covenant, spiritual alignment, core objectives).
2.  **Phase 2: Strategy & Execution** (Deep diving into professional skills, business growth, or career path).
3.  **Phase 3: Impact & Multiplication** (Measuring outcomes, scaling the vision, and preparing the mentee to become a mentor).

### D. Admin Control Center
*   **Pairing Oversight**: Review and approve "Requested" relations.
*   **Health Dashboard**: See which pairings are active vs. stagnant (no goals updated or meetings held for 14+ days).
*   **Impact Reporting**: Export CSV reports showing hours spent in mentorship and goal completion rates across the city.

---

## 3. Technical Implementation Roadmap

### Phase 1: Database & API Core (Current Focus)
*   [ ] **Schema Update**: Add `willing_to_mentor` and `mentorship_focus` to the `Member` model.
*   [ ] **Service Update**: Enhance `MentorshipService` to handle "Micro" vs "Long-term" relations.
*   [ ] **Route Registration**: Properly register `/admin/mentorship` routes in `admin.routes.ts`.
*   [ ] **Directory Search**: Implement server-side filtering for mentors in the member directory.

### Phase 2: Frontend Workspace Evolution
*   [ ] **Timeline UI**: Create a visual vertical timeline for the Three-Phase Journey.
*   [ ] **Milestone Tracking**: allow mentors to "Sign off" on completed phases.
*   [ ] **Resource Sharing**: Simple attachment support within the workspace.

### Phase 3: Admin & Reporting
*   [ ] **Admin Table**: Add "Last Activity" column to the admin table.
*   [ ] **Export Logic**: Implement the real CSV export for impact reports.

---

## 4. User Experience (UX) Goals
*   **Premium Aesthetic**: Use the existing dark/light glassmorphism style with high-contrast status badges.
*   **Frictionless Request**: A "Request Wisdom" button on any member's profile who is a mentor.
*   **Transparency**: Mentees should clearly see their progress through the "Kingdom Journey."
