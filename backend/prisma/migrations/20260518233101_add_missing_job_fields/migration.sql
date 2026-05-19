-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "allow_remote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "application_deadline" TIMESTAMP(3),
ADD COLUMN     "highlight_job" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "require_resume" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "show_salary" BOOLEAN NOT NULL DEFAULT true;
