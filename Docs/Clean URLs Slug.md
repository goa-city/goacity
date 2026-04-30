# Clean URLs and Slug Implementation Plan

## Objective
Implement human-readable, SEO-friendly "slug" URLs for Members and Meetings, replacing numeric IDs in public-facing links.

## Core Logic

### 1. Member Profiles
- **Format:** `firstname-lastname` (e.g., `steven-dumpala`).
- **Uniqueness:** Unique within a city.
- **Clash Handling:** 
    - Frontend/Backend checks for existing slugs.
    - If a clash occurs (e.g., two "Rahul Sharmas"), the Admin is alerted.
    - Admin manually resolves by adding a middle name, location, or suffix (e.g., `rahul-sharma-panjim`).

### 2. Meetings
- **Format:** `title-month-year` (e.g., `community-mixer-may-26`).
- **Clash Handling (Automatic):**
    - If a meeting with the same title exists in the same month (e.g., weekly meetings), the system appends the day: `title-day-month-year` (e.g., `weekly-breakfast-07-may-26`).
- **Uniqueness:** Unique within a city.

## Technical Implementation

### Database (Prisma)
- Add `slug` field to `Member` and `meetings` models.
- Add composite unique index: `@@unique([city_id, slug])`.

### Backend Utilities
- `slugify(text)`: Cleans strings (lowercase, hyphens, removes special chars).
- `generateUniqueSlug(model, title, date, cityId)`: Handles the logic of checking collisions and appending dates.

### Admin UX
- **Real-time Preview:** As admins type a Title/Name, the suggested slug is shown.
- **Manual Override:** Admins can manually edit the slug.
- **Sanitization:** Manual inputs are still passed through `slugify` to ensure URL safety.
- **Locking:** Once a record is published, the slug is locked to prevent breaking shared links.

### Frontend Routing
- Update routes in `App.tsx`:
    - `/meetings/:id` -> `/meetings/:slug`
    - `/profile/:id` -> `/profile/:slug`
- **Backward Compatibility:** Update backend "Get" controllers to support both numeric IDs and slug strings so old links still work.
