# Marketplace Training Module

This document outlines the architecture, database design, backend services, and frontend interface required to implement a **Marketplace Training** module on the `goa.city` platform. 

This module allows members to discover, sign up for, and participate in training courses organized under different subject streams (such as Technology, Entrepreneurship, Creative Arts, etc.), which are linked to the platform's existing `Stream` model.

---

## Architectural Decisions

### Stream Re-use vs New Subject Table
To align with the platform's existing design, training courses will be directly linked to the `Stream` model. This allows us to reuse the existing streams of subjects (e.g. "Technology", "Business") rather than maintaining a separate set of training-specific subjects.

### Course Access & Payments
Courses can be either free or paid:
1. **Free Courses:** Immediate enrollment with a single action.
2. **Paid Courses:** Require confirmation and verification. The course details will show a payment QR code, and users can submit a payment reference/note during the signup flow.

---

## Database Design (Prisma Models)

We will introduce two new tables: `training_courses` and `training_enrollments`.

### TrainingCourse

```prisma
model TrainingCourse {
  id               Int                  @id @default(autoincrement())
  title            String               @db.VarChar(255)
  description      String?
  content          String?              @db.Text // Full syllabus, requirements, etc.
  stream_id        Int?                 // Linked to the subject stream
  trainer_id       Int?                 // Linked to the member conducting the training
  start_date       DateTime?            @db.Timestamp(6)
  end_date         DateTime?            @db.Timestamp(6)
  schedule         String?              @db.VarChar(255) // e.g. "Saturdays 10:00 AM - 12:30 PM"
  capacity         Int?                 @default(0) // Max participants
  price            Decimal?             @default(0.00) @db.Decimal(10, 2)
  payment_qr_image String?              @db.VarChar(255)
  status           String               @default("Draft") @db.VarChar(50) // Draft, Published, Completed, Cancelled
  city_id          Int?                 @default(1)
  created_at       DateTime?            @default(now()) @db.Timestamp(6)
  updated_at       DateTime?            @default(now()) @db.Timestamp(6)
  
  city             City?                @relation(fields: [city_id], references: [id])
  stream           Stream?              @relation(fields: [stream_id], references: [id])
  trainer          Member?              @relation("TrainerCourses", fields: [trainer_id], references: [id])
  enrollments      TrainingEnrollment[]

  @@map("training_courses")
}

model TrainingEnrollment {
  id             String         @id @default(uuid())
  course_id      Int
  member_id      Int
  status         String         @default("Enrolled") @db.VarChar(50) // Enrolled, Completed, Cancelled
  payment_status String         @default("Free") @db.VarChar(50) // Free, Unpaid, Verifying, Paid
  payment_note   String?        @db.Text
  created_at     DateTime?      @default(now()) @db.Timestamp(6)
  updated_at     DateTime?      @default(now()) @db.Timestamp(6)

  course         TrainingCourse @relation(fields: [course_id], references: [id], onDelete: Cascade)
  member         Member         @relation("MemberEnrollments", fields: [member_id], references: [id], onDelete: Cascade)

  @@unique([course_id, member_id])
  @@map("training_enrollments")
}
```

---

## API Endpoints

All endpoints are prefix-routed via `/api/trainings`:

### Member Endpoints
- `GET /api/trainings` - Get all published courses.
- `GET /api/trainings/:id` - Detailed view of a training course.
- `GET /api/trainings/my-enrollments` - Get list of courses enrolled by current member.
- `POST /api/trainings/:id/enroll` - Sign up / request enrollment for a course.
- `POST /api/trainings/:id/cancel` - Cancel a course enrollment.

### Admin/Trainer Endpoints
- `POST /api/trainings` - Create a course.
- `PUT /api/trainings/:id` - Update a course.
- `PATCH /api/trainings/enrollments/:id` - Manage student enrollment state or verify payments.

---

## UI/UX Flow

### Course Directory
- A responsive grid layout where courses are visually grouped under their respective **Subject Streams** using the colors configured for each stream.
- Indicators for Course Capacity, Trainer details, Schedule, and Pricing status.

### Enrollment Dialog
- For paid courses, a payment QR code will show along with a field for users to upload a payment note/reference, matching the patterns used in mentorship and meeting modules.
