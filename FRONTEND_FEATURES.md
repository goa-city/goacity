# Goa.City Frontend Features Documentation

The Goa.City frontend is a React-based multi-page application (MPA) designed to serve both regular members and system administrators. The application is divided into two primary zones: the **Member Portal** and the **Admin Management Console**.

## 1. Authentication & Onboarding
- **Member Login (`/`)**: Secure access point for registered members.
- **Admin Login (`/admin/login`)**: Separate secure authentication portal for system administrators.
- **Dynamic Onboarding (`/onboarding/form/:formId`)**: System-driven onboarding forms where new or existing users fill out necessary information, tailored per stream/role. The questions and structure of these forms are defined dynamically by the backend.

## 2. Member Portal (Public & Protected)
The Member Portal provides registered users with access to community resources, networking, and personal profile management.

### Dashboard & Navigation
- **Member Dashboard (`/dashboard`)**: The central hub for signed-in users, displaying an overview of active streams, upcoming meetings, quick links, and prompts to complete required onboarding forms.
- **Home/Landing (`/home`)**: General landing page or public-facing city overview.

### Community & Content
- **News Feed (`/news`)**: A stream of updates, announcements, and stories relevant to the Goa City network.
- **Resource Hub (`/resources` & `/resources/add`)**: 
  - A directory of shared materials (documents, links, videos, etc.) uploaded by admins or contributed by members.
  - Members can submit new resources for approval.
- **Job Board (`/jobs` & `/jobs/post`)**: 
  - A marketplace for employment opportunities within the network. 
  - Members can view listings and post new job openings.

### Identity Management
- **User Profile (`/profile`)**: Allows members to manage their personal information, contact details, and view their assigned streams and roles.

## 3. Admin Management Console (`/admin/*`)
A premium, dark-themed management interface for system administrators to oversee the entire platform, manage users, and configure core systems.

### Overview & Analytics
- **System Overview (`/admin`)**: A comprehensive dashboard showing real-time statistics (total members, active streams, upcoming meetings, pending forms).

### Directory Management
- **Member Directory (`/admin/members`)**: 
  - High-density table view of all registered users.
  - Features role badges, stream tags, and search/filtering capabilities.
- **Member Profiles & Editing (`/admin/members/:id`)**: Detailed views of individual members, allowing admins to modify identity information, view form responses, and assign/revoke stream access.
- **Manual Member Creation (`/admin/members/create`)**: Tools for admins to manually invite or create user profiles.

### Core Systems Configuration
- **Stream Access (`/admin/streams`)**: Management of "Streams" (interest groups, cohorts, or organizational divisions). Includes creating new streams and linking them to specific onboarding forms.
- **Onboarding Forms (`/admin/forms` & `/admin/forms/:id`)**: 
  - A form builder interface.
  - Admins can create dynamic forms, add different field types (text, multiple-choice, file upload), and reorder questions. These forms dictate what information members provide during onboarding.

### Content & Event Moderation
- **Event Meetings (`/admin/meetings` & `/admin/meetings/:id`)**: 
  - Schedule and manage network events.
  - Differentiates between active and archived meetings.
  - Supports paid meetings with QR code configuration.
- **Job Board Moderation (`/admin/jobs` & `/admin/jobs/:id`)**: Oversee job postings, approve pending submissions, and edit listing details.
- **Resource Moderation (`/admin/resources` & `/admin/resources/:id`)**: Content management for the resource hub, including status workflows (pending, approved, rejected) and categorizations.

## 4. Technical Architecture Highlights
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7) with protected route wrappers (`MemberProtectedRoute`, `AdminProtectedRoute`) separating concerns and access levels.
- **Styling**: TailwindCSS 3.4 with a standardized internal design system.
  - The admin interface uses an established set of CSS classes (`admin-container`, `admin-card`, `admin-button-primary`, etc.) for strict visual consistency.
- **API Communication**: Axios configured with interceptors for authenticated REST requests to the Node.js backend.
- **Rich Text Editing**: Integrated `react-quill` for WYSIWYG editing in resource and job descriptions.
- **Iconography**: Extensive use of Heroicons for a clean, modern aesthetic.
