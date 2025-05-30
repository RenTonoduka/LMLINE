-- Create database schema for LMS×LINE AI Support System

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "firebaseUid" TEXT,
    "lineUserId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Courses table
CREATE TABLE IF NOT EXISTS "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" DECIMAL(65,30),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- Chapters table
CREATE TABLE IF NOT EXISTS "chapters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "position" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- User Progress table
CREATE TABLE IF NOT EXISTS "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_firebaseUid_key" ON "users"("firebaseUid");
CREATE UNIQUE INDEX IF NOT EXISTS "users_lineUserId_key" ON "users"("lineUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_userId_courseId_key" ON "enrollments"("userId", "courseId");
CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_userId_chapterId_key" ON "user_progress"("userId", "chapterId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "courses_categoryId_idx" ON "courses"("categoryId");
CREATE INDEX IF NOT EXISTS "courses_creatorId_idx" ON "courses"("creatorId");
CREATE INDEX IF NOT EXISTS "chapters_courseId_idx" ON "chapters"("courseId");
CREATE INDEX IF NOT EXISTS "enrollments_userId_idx" ON "enrollments"("userId");
CREATE INDEX IF NOT EXISTS "enrollments_courseId_idx" ON "enrollments"("courseId");
CREATE INDEX IF NOT EXISTS "user_progress_chapterId_idx" ON "user_progress"("chapterId");

-- Add foreign key constraints
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;