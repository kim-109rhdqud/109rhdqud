-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'editor', 'admin');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "oneLiner" TEXT NOT NULL,
    "whatIsIt" TEXT NOT NULL,
    "whyPopular" TEXT NOT NULL,
    "howToUse" TEXT NOT NULL,
    "oneLineSummary" TEXT NOT NULL,
    "platforms" TEXT[],
    "period" TEXT NOT NULL,
    "keywords" TEXT[],
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "buzz" INTEGER NOT NULL,
    "search" INTEGER NOT NULL,
    "usage" INTEGER NOT NULL,
    "trend" INTEGER[],
    "timeline" JSONB NOT NULL,
    "relatedVideos" JSONB NOT NULL,
    "relatedPeople" JSONB NOT NULL,
    "relatedMemeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meme_ranks" (
    "id" TEXT NOT NULL,
    "memeId" TEXT NOT NULL,
    "period" "Period" NOT NULL,
    "rank" INTEGER NOT NULL,
    "change" INTEGER,
    "isNew" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "meme_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "memeId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "sources" TEXT[],
    "copyrightHolder" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "changeLog" JSONB NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scraps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "meme_ranks_memeId_period_key" ON "meme_ranks"("memeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_memeId_key" ON "verifications"("memeId");

-- CreateIndex
CREATE UNIQUE INDEX "scraps_userId_memeId_key" ON "scraps"("userId", "memeId");

-- AddForeignKey
ALTER TABLE "meme_ranks" ADD CONSTRAINT "meme_ranks_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "memes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "memes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scraps" ADD CONSTRAINT "scraps_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "memes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

