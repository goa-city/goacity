-- CreateTable
CREATE TABLE "members" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "dob" DATE,
    "gender" VARCHAR(50),
    "location" VARCHAR(255),
    "role" VARCHAR(50) DEFAULT 'member',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "password_hash" TEXT,
    "is_onboarded" SMALLINT DEFAULT 0,
    "bio" TEXT,
    "profile_photo" VARCHAR(255),
    "linkedin_url" VARCHAR(255),
    "intro_video" VARCHAR(255),
    "village" VARCHAR(100),
    "address" TEXT,
    "age" INTEGER,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(255),
    "timezone" VARCHAR(100) DEFAULT 'Asia/Kolkata',
    "email_from_name" VARCHAR(255),
    "email_from_addr" VARCHAR(255),
    "theme_config" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255),
    "email" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'admin',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streams" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7) DEFAULT '#6366f1',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "form_id" INTEGER,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_members" (
    "stream_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "stream_members_pkey" PRIMARY KEY ("stream_id","user_id")
);

-- CreateTable
CREATE TABLE "otp_table" (
    "id" SERIAL NOT NULL,
    "email_or_phone" VARCHAR(255) NOT NULL,
    "otp_code" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "attempts" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "content" TEXT,
    "media_url" VARCHAR(255),
    "media_type" VARCHAR(50) DEFAULT 'none',
    "link_title" VARCHAR(255),
    "link_desc" VARCHAR(255),
    "link_image" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER,
    "user_id" INTEGER,
    "meeting_id" INTEGER,
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'draft',

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "profile_key" VARCHAR(100) NOT NULL,
    "profile_value" TEXT,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "business_name" VARCHAR(255),
    "business_type" VARCHAR(100),
    "industry" VARCHAR(100),
    "years_in_operation" INTEGER,
    "employees_count" INTEGER,
    "website" VARCHAR(255),
    "summary" TEXT,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER,
    "user_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'absent',
    "marked_by" INTEGER,
    "marked_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_answers" (
    "id" SERIAL NOT NULL,
    "response_id" INTEGER,
    "field_key" VARCHAR(100) NOT NULL,
    "answer_value" TEXT,

    CONSTRAINT "form_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER,
    "field_key" VARCHAR(100) NOT NULL,
    "field_type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255),
    "subtitle" TEXT,
    "placeholder" VARCHAR(255),
    "options" JSONB,
    "is_required" SMALLINT DEFAULT 0,
    "is_optional" SMALLINT DEFAULT 0,
    "is_profile" SMALLINT DEFAULT 0,
    "sort_order" INTEGER DEFAULT 0,
    "section" VARCHAR(100),
    "conditions" JSONB,
    "group_fields" JSONB,
    "button_text" VARCHAR(50) DEFAULT 'Next',

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" SMALLINT DEFAULT 1,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "type" VARCHAR(50) DEFAULT 'Full Time',
    "description" TEXT,
    "url" VARCHAR(500),
    "contact_email" VARCHAR(255),
    "posted_by" INTEGER,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_responses" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER,
    "user_id" INTEGER,
    "rsvp_status" VARCHAR(50) DEFAULT 'none',
    "checked_in" SMALLINT DEFAULT 0,
    "payment_status" VARCHAR(50) DEFAULT 'pending',
    "paid_amount" DECIMAL(10,2) DEFAULT 0.00,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "meeting_date" DATE,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "location_name" VARCHAR(255),
    "map_link" TEXT,
    "is_paid" SMALLINT DEFAULT 0,
    "payment_qr_image" VARCHAR(255),
    "feedback_form_id" INTEGER,
    "archived" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "stream_id" INTEGER,
    "payment_amount" DECIMAL(10,2) DEFAULT 0.00,
    "recap_content" TEXT,
    "zoom_link" VARCHAR(500),
    "google_event_id" VARCHAR(255),
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_resources" (
    "id" SERIAL NOT NULL,
    "meeting_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "type" VARCHAR(50) DEFAULT 'link',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "needs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "need_type" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "offer_type" VARCHAR(100),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "file_path" VARCHAR(500),
    "file_name" VARCHAR(255),
    "description" TEXT,
    "content" TEXT,
    "submitted_by" INTEGER,
    "status" VARCHAR(50) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "skill_name" VARCHAR(100),

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stewardship_orgs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "org_type" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stewardship_orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stewardship_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "recipient_id" INTEGER,
    "amount" DECIMAL(10,2),
    "hours" DECIMAL(10,2),
    "date" DATE,
    "skill_category" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "impact_note" TEXT,
    "impact_image_url" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stewardship_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_relations" (
    "id" TEXT NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "mentee_id" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Requested',
    "type" VARCHAR(50) NOT NULL,
    "focus_area" VARCHAR(255),
    "goals_json" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentorship_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incubator_ideas" (
    "id" TEXT NOT NULL,
    "founder_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "problem_statement" TEXT,
    "vision_purpose" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Draft',
    "needs_json" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incubator_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idea_feedback" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "contributor_id" INTEGER NOT NULL,
    "comment" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_services" (
    "id" TEXT NOT NULL,
    "member_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',

    CONSTRAINT "member_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_requests" (
    "id" TEXT NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Pending_Admin',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaboration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "city_id" INTEGER DEFAULT 1,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_phone_key" ON "members"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cities_domain_key" ON "cities"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "forms_code_key" ON "forms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_title_key" ON "email_templates"("title");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streams" ADD CONSTRAINT "streams_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_members" ADD CONSTRAINT "stream_members_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_members" ADD CONSTRAINT "stream_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_resources" ADD CONSTRAINT "meeting_resources_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stewardship_logs" ADD CONSTRAINT "stewardship_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_relations" ADD CONSTRAINT "mentorship_relations_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_relations" ADD CONSTRAINT "mentorship_relations_mentee_id_fkey" FOREIGN KEY ("mentee_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incubator_ideas" ADD CONSTRAINT "incubator_ideas_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_feedback" ADD CONSTRAINT "idea_feedback_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "incubator_ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idea_feedback" ADD CONSTRAINT "idea_feedback_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_services" ADD CONSTRAINT "member_services_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
