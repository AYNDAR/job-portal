-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "budget_max" DOUBLE PRECISION,
ADD COLUMN     "budget_min" DOUBLE PRECISION,
ADD COLUMN     "budget_type" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "experience_level" TEXT,
ADD COLUMN     "skills" TEXT[];
