# Goa.City Meeting Feature Master Guide

This document outlines the architecture, flow, and implementation standards for the Meeting feature in Goa.City.

## 1. Overview
The Meeting feature manages event scheduling, member RSVPs, and attendance (check-in). It supports both free and paid meetings, with integrated payment status tracking.

## 2. Core Components
- **MeetingCard**: Reusable summary card used in lists.
- **SingleMeetingView**: Detailed dashboard for a specific meeting, showing resources and recaps.
- **SidebarRight**: Global sidebar showing upcoming meetings for today and future dates.
- **CheckInModal**: Shared component that handles the check-in flow (including payments).

## 3. The Check-in Protocol

### Flow Diagram
1. **Trigger**: User clicks "Check In" (Dashboard, Sidebar, or Meeting Page).
2. **Evaluation**:
    - **If Free**: Shows a simple confirmation.
    - **If Paid**:
        - Displays the amount due.
        - Shows the UPI/Payment QR code (if uploaded in Admin).
        - Provides options for "Paid Online" or "Paid Cash".
3. **Execution**:
    - If paid, calls `POST /api/member/meeting/:id/pay` with the chosen method.
    - Calls `POST /api/member/meeting/:id/checkin`.
4. **Completion**: Invalidates related queries using React Query (`meetings-upcoming`, `meetings-past`, `member-dashboard`, `meeting/:id`) to ensure the UI updates globally across the Sidebar, Dashboard, and Meetings page without a page refresh.

## 4. Payment Status Tracking
Meeting attendance includes a `payment_status` field in the `meeting_responses` table:
- `pending`: Default for paid meetings until check-in.
- `paid_online`: User confirmed payment via UPI/Bank transfer.
- `paid_cash`: User confirmed payment via cash at the venue.

## 5. UI Implementation Standards
- **Shadows**: Use heavy shadows for cards (`shadow-2xl shadow-zinc-200/50`) to follow the premium design system.
- **Status Badges**:
    - **Checked In**: Emerald theme (`bg-emerald-50`, `text-emerald-600`).
    - **RSVP Going**: Emerald theme.
    - **RSVP Maybe**: Amber theme.
    - **RSVP No**: Rose theme.
- **Responsive**: All meeting components must be responsive, especially the check-in modal on mobile devices.
- **Date Normalization**: All frontend date comparisons (e.g., "Today" vs "Upcoming") must use local `YYYY-MM-DD` strings (ignoring time) to prevent timezone-related discrepancies between the client and server. Use `getLocalYYYYMMDD()` helper for consistency.

## 6. Backend Integration
### Key Endpoints
- `GET /api/meetings/upcoming`: Returns meetings scheduled for today and onwards.
- `POST /api/member/meeting/:id/checkin`: Sets `checked_in = 1`.
- `POST /api/member/meeting/:id/pay`: Updates `payment_status` and `paid_amount`.

## 7. Admin Configuration
Admins manage meetings via the Admin Panel:
- **Paid Toggle**: Enables/disables the payment flow.
- **QR Code**: Uploaded as a standard image file, served via `/uploads/`. The backend must provide a calculated `payment_qr_image_url` field in all meeting responses to simplify frontend rendering.
- **Resources**: Files or links accessible to members after check-in (or before, depending on config).

## 8. Development Notes
- **API Consistency**: Always ensure that `payment_qr_image_url` is included in both list and single-item responses to prevent "No QR Code" errors in the frontend modal.
- **Sync Protocol**: Avoid manual `useEffect` fetching for data that is shared across components (like Sidebar meetings). Use the `useMeetings` hook to participate in the global cache and invalidation flow.

## 9. Notification System & Shortcodes
Goa.City uses a unified notification engine for Email, WhatsApp, and OTP.

### Shortcode Syntax
- **Standard**: Use single curly brackets `{shortcode}` for all templates.
- **Backward Compatibility**: Double brackets `{{shortcode}}` are still supported by the backend but should be phased out in UI editors.

### Core Shortcodes
| Shortcode | Description |
| :--- | :--- |
| `{first_name}` | Member's first name |
| `{last_name}` | Member's last name |
| `{meeting_title}` | Title of the meeting |
| `{meeting_date}` | Date formatted as DD/MM/YYYY |
| `{meeting_time}` | Time range (e.g. 06:30pm - 09:00pm) |
| `{location_name}` | Name of the venue |
| `{map_link}` | Google Maps link |
| `{zoom_link}` | Virtual meeting link |
| `{rsvp_link}` | Absolute URL to the meeting detail page (e.g. `https://goa.city/meetings/18`) |
| `{recap_content}` | Meeting minutes or follow-up notes |
| `{description}` | Full meeting description |
| `{otp_code}` | 6-digit login verification code (Auth only) |

### Calendar Integration
- **Email Attachments**: All meeting notification emails must include an `invite.ics` attachment.
- **ICS Generation**: Use the manual string-building logic in `utils.ts` to ensure compatibility across all mail clients.
- **Timezone**: Dates in ICS are exported in UTC `Z` format derived from local IST (+5:30) input.

## 10. Data Handling & Logic Fixes
- **Time Parsing**: NEVER use `new Date(timeString)` on plain time strings (e.g. "06:30pm") as it returns `Invalid Date`. Always use the `parseTimeStr` or `parseTime24h` utilities.
- **Dynamic UI**: Sections like "Meeting Resources" or "Meeting Recap" should be hidden entirely if their content is empty to maintain a clean "Dashboard" feel.
- **URL Generation**: Always use request headers (`x-forwarded-proto`, `host`) to dynamically construct absolute URLs for shortcodes like `{rsvp_link}` to ensure environment-agnostic links.
