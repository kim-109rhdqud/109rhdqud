-- CreateEnum
CREATE TYPE "MemeGrade" AS ENUM ('A', 'B', 'C');

-- AlterTable
ALTER TABLE "memes" ADD COLUMN     "firstRecord" JSONB,
ADD COLUMN     "grade" "MemeGrade",
ADD COLUMN     "peak" JSONB,
ADD COLUMN     "sourceLinks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "spreadPath" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "unverified" TEXT[] DEFAULT ARRAY[]::TEXT[];

