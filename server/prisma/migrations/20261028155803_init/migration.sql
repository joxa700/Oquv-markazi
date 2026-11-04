-- CreateTable
CREATE TABLE "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name_uz" TEXT NOT NULL,
    "name_ru" TEXT,
    "name_en" TEXT,
    "description_uz" TEXT NOT NULL,
    "description_ru" TEXT,
    "description_en" TEXT,
    "curriculum_uz" TEXT NOT NULL,
    "curriculum_ru" TEXT,
    "curriculum_en" TEXT,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration_uz" TEXT NOT NULL,
    "duration_ru" TEXT,
    "duration_en" TEXT,
    "lessons_per_week" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "target_audience_uz" TEXT NOT NULL,
    "target_audience_ru" TEXT,
    "target_audience_en" TEXT,
    "required_level_uz" TEXT NOT NULL,
    "required_level_ru" TEXT,
    "required_level_en" TEXT,
    "payment_terms_uz" TEXT NOT NULL,
    "payment_terms_ru" TEXT,
    "payment_terms_en" TEXT,
    "image" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "specialization_uz" TEXT NOT NULL,
    "specialization_ru" TEXT,
    "specialization_en" TEXT,
    "experience_years" INTEGER NOT NULL,
    "bio_uz" TEXT NOT NULL,
    "bio_ru" TEXT,
    "bio_en" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "groups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "days" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolled_count" INTEGER NOT NULL DEFAULT 0,
    "level_uz" TEXT NOT NULL,
    "level_ru" TEXT,
    "level_en" TEXT,
    "start_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "group_id" INTEGER,
    "age_or_level" TEXT,
    "comment" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'uz',
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "applications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "author" TEXT NOT NULL,
    "text_uz" TEXT NOT NULL,
    "text_ru" TEXT,
    "text_en" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "photo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_uz" TEXT NOT NULL,
    "question_ru" TEXT,
    "question_en" TEXT,
    "answer_uz" TEXT NOT NULL,
    "answer_ru" TEXT,
    "answer_en" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'uz',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_CourseTeachers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CourseTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CourseTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "teachers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "groups_course_id_idx" ON "groups"("course_id");

-- CreateIndex
CREATE INDEX "groups_teacher_id_idx" ON "groups"("teacher_id");

-- CreateIndex
CREATE INDEX "groups_status_idx" ON "groups"("status");

-- CreateIndex
CREATE INDEX "applications_course_id_idx" ON "applications"("course_id");

-- CreateIndex
CREATE INDEX "applications_group_id_idx" ON "applications"("group_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_created_at_idx" ON "applications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "faq_items_order_idx" ON "faq_items"("order");

-- CreateIndex
CREATE INDEX "contact_messages_is_read_idx" ON "contact_messages"("is_read");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseTeachers_AB_unique" ON "_CourseTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseTeachers_B_index" ON "_CourseTeachers"("B");
