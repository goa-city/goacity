# Jobs Section Documentation

The Jobs Section (Career Board) is a community feature on Goa.City designed to connect talent with opportunities. It allows both members and guests to browse and apply for jobs, post new job openings, and allows administrators to review, approve, edit, or remove listings.

---

## Features

- **Jobs Board (Feed)**:
  - Displays approved, unexpired jobs.
  - **Filters**:
    - Keyword search (matches job title and company name).
    - Location search (matches job location).
    - Work Arrangement dropdown (`Onsite`, `Remote`, `Hybrid`).
    - Minimum Salary input (filters by minimum salary threshold).
    - Job Type checkboxes: `Freelance`, `Full Time`, `Internship`, `Part Time` (supports multi-selection).
  - **Styling & Aesthetics**:
    - Each company gets a deterministic, modern gradient background and initials based on its name for the company logo.
    - Custom color-coded badges for different job types and arrangement styles.
    - Displays salary ranges formatted with currency indicators.
    - Smooth hover transitions and shadows.

- **Job Detail Page**:
  - Detailed view of role definition, qualifications, and company culture.
  - Supports rich-text rendering (HTML from DB) for job description and company profile.
  - **Dynamic Application Form**:
    - Features a responsive design: a fixed sidebar on desktop screens and a bottom sheet on mobile screens.
    - Collects Full Name, Email, Phone, Cover Message, and CV.
    - Restricts CV file uploads to `pdf`, `doc`, and `docx` formats.
    - Saves the application in the database and triggers automated email alerts to the contact email and/or the job poster with application details and the CV download link.

- **Member Job Posting Management (Employer Dashboard)**:
  - Accessible via `/jobs/my-postings` ("Manage My Postings" button on the Jobs feed).
  - Lists all openings submitted by the current member showing status (Pending, Approved, Rejected) and total application counts.
  - Clicking a listing navigates to the Applications Detail view (`/jobs/my-postings/:jobId/applications`).

- **Candidate Application Desk (Employer View)**:
  - Displays detailed applicant cards containing CV download links, contact details, and cover messages.
  - Allows employers to write internal recruiter notes and update candidate statuses (`Submitted`, `Under Review`, `Contacted`, `Offered`, `Rejected`).
  - Automatically triggers email alerts to candidates when their status is modified.

- **Post Opportunity / Edit Form**:
  - Allows members and public users to submit job postings.
  - Includes salary range (`salary_min`, `salary_max`, `salary_currency`) and work arrangement inputs.
  - Includes Rich Text (Quill) editors for role definition and company culture, styled with a flat, clean container design matching the Goa.City member profiles.
  - Submitted jobs start in `pending` status, requiring administrator verification.

- **Admin Job Management**:
  - A comprehensive table showing all jobs or filtering by status (`all`, `pending`, `approved`, `rejected`).
  - Displays submission attribution (member name and email, or "System Admin").
  - Quick action buttons to edit or permanently delete listings.
  - Prominent indicators of how many jobs are pending review.

- **Admin Job Editor**:
  - Allows administrators to create new jobs or edit details of existing ones, including salary range, currency, and work arrangements.
  - Allows overriding/updating the status directly (e.g. Approve & Publish, Reject).
  - Features an editable URL Slug field with input validation (auto-slugifies text).
  - Expiry date selection: if set, the job is automatically filtered out from the public board once it passes the expiration date.

- **Admin Applications desk**:
  - Global supervisor view at `/admin/jobs/applications` to inspect, search, and manage all job applications submitted across the platform.

---

## Technical Architecture

### Frontend Components & Routing

- **Route Mapping**:
  - `/jobs`: [Jobs.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/Jobs.tsx) (Public/Member board)
  - `/jobs/:slug`: [JobView.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/JobView.tsx) (Job Details & Application Form)
  - `/jobs/post`: [JobEditor.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/JobEditor.tsx) (Member/Public creation form)
  - `/jobs/my-postings`: [MyPostings.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/MyPostings.tsx) (Member postings list)
  - `/jobs/my-postings/:jobId/applications`: [JobApplicationsView.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/JobApplicationsView.tsx) (Employer candidate reviewer)
  - `/admin/jobs`: [AdminJobs.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/admin/AdminJobs.tsx) (Admin listing table)
  - `/admin/jobs/:id` & `/admin/jobs/new`: [AdminJobEditor.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/admin/AdminJobEditor.tsx) (Admin review and editing screen)
  - `/admin/jobs/applications`: [AdminApplications.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/pages/admin/AdminApplications.tsx) (Global admin application manager)

- **Key Assets**:
  - [QuillEditor.tsx](file:///Users/stevensdumpala/Imagefile/goa.city/frontend/src/components/QuillEditor.tsx): Used for rich text inputs.

---

### Backend API Endpoints

#### Public Routes (`backend_node/src/routes/public.routes.ts`)
- `GET /public/jobs` & `GET /jobs`: Retrieves approved jobs list.
- `POST /jobs`: Creates a job posting (starts in `pending` status). Accepts multipart data.

#### Member Routes (`backend_node/src/routes/member.routes.ts`)
- `GET /member/jobs`: Returns the active jobs list.
- `GET /member/jobs/:id`: Retrieves a single job detail (using ID or Slug).
- `POST /member/jobs/:id/apply`: Submits a job application (handles `cv` file upload via Multer).
- `GET /member/my-postings`: Fetches job postings created by the current member.
- `GET /member/my-postings/:jobId/applications`: Fetches applications received for a specific posting.
- `PATCH /member/my-postings/applications/:applicationId/status`: Updates application status and internal notes (triggers email alerts).

#### Admin Routes (`backend_node/src/routes/admin.routes.ts`)
- `GET /admin/jobs`: Returns all jobs or jobs filtered by status. If `?id=X` is passed, returns a single job with submitter details.
- `POST /admin/jobs`: Creates a new job listing as admin.
- `PUT /admin/jobs`: Updates job details or status.
- `DELETE /admin/jobs?id=X`: Permanently deletes the job listing.
- `GET /admin/jobs/applications`: Fetches all job applications globally.
- `PATCH /admin/jobs/applications/:id/status`: Updates application status.

---

### Services & Controllers

- **Member Controller (`backend_node/src/controllers/member.controller.ts`)**:
  - `getJobs`, `getJob`, `createJob`, `applyJob`.
  - `getMyJobPostings`: Fetches recruiter postings.
  - `getJobApplications`: Fetches applications for a specific listing.
  - `updateApplicationStatus`: Updates candidate status and notes, and handles triggering email notifications to candidates.

- **Admin Controller (`backend_node/src/controllers/admin.controller.ts`)**:
  - `getAdminJobs`, `createJob`, `updateJob`, `deleteJob`.
  - `getAllApplications`: Global application monitoring.
  - `updateApplicationStatus`: Admin status adjustments.

- **Resource Service (`backend_node/src/services/resource.service.ts`)**:
  - `getJobs`: Queries the database for jobs with `status = 'approved'` and `expires_at` is null or greater than the current time.
  - `getJobByIdOrSlug`: Queries by either integer ID or string slug.
  - `createJob`: Saves new job data into database.
  - `applyForJob`: Inserts a `JobApplication` record.
  - `getMyJobPostings`, `getJobApplications`, `updateApplicationStatus`.

---

## Database Schema (Prisma)

### `jobs` Model
```prisma
model jobs {
  id               Int              @id @default(autoincrement())
  title            String           @db.VarChar(255)
  company          String           @db.VarChar(255)
  location         String           @db.VarChar(255)
  category         String?          @db.VarChar(100)
  type             String?          @default("Full Time") @db.VarChar(50)
  description      String?
  url              String?          @db.VarChar(500)
  contact_email    String?          @db.VarChar(255)
  posted_by        Int?
  status           String?          @default("pending") @db.VarChar(50)
  created_at       DateTime?        @default(now()) @db.Timestamp(6)
  updated_at       DateTime?        @default(now()) @db.Timestamp(6)
  city_id          Int?             @default(1)
  company_profile  String?
  expires_at       DateTime?        @db.Timestamp(6)
  slug             String?          @db.VarChar(255)
  work_arrangement String?          @default("Onsite") @db.VarChar(50)
  salary_min       Int?
  salary_max       Int?
  salary_currency  String?          @default("INR") @db.VarChar(10)
  applications     JobApplication[]
  city             City?            @relation(fields: [city_id], references: [id])
  poster           Member?          @relation("JobPostings", fields: [posted_by], references: [id])

  @@unique([city_id, slug])
}
```

### `JobApplication` Model
```prisma
model JobApplication {
  id         Int       @id @default(autoincrement())
  job_id     Int
  user_id    Int
  full_name  String    @db.VarChar(255)
  email      String    @db.VarChar(255)
  phone      String?   @db.VarChar(50)
  message    String?
  cv_url     String    @db.VarChar(500)
  status     String    @default("submitted") @db.VarChar(50)
  notes      String?
  created_at DateTime? @default(now()) @db.Timestamp(6)
  job        jobs      @relation(fields: [job_id], references: [id], onDelete: Cascade)
  applicant  Member    @relation("JobApplications", fields: [user_id], references: [id], onDelete: Cascade)

  @@map("job_applications")
}
```
