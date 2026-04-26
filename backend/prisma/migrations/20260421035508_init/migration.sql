-- CreateTable
CREATE TABLE "UserType" (
    "id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSeekerProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "resume_url" TEXT,
    "skills" TEXT[],
    "location" TEXT,

    CONSTRAINT "JobSeekerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "website" TEXT,
    "logo_url" TEXT,
    "industry_id" INTEGER NOT NULL,
    "location" TEXT,

    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobIndustry" (
    "id" SERIAL NOT NULL,
    "industry_name" TEXT NOT NULL,

    CONSTRAINT "JobIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentType" (
    "id" SERIAL NOT NULL,
    "type_name" TEXT NOT NULL,

    CONSTRAINT "EmploymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPostStatus" (
    "id" SERIAL NOT NULL,
    "status_name" TEXT NOT NULL,

    CONSTRAINT "JobPostStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,
    "industry_id" INTEGER NOT NULL,
    "employment_type_id" INTEGER NOT NULL,
    "salary_range" TEXT,
    "status_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationStatus" (
    "id" SERIAL NOT NULL,
    "status_name" TEXT NOT NULL,

    CONSTRAINT "JobApplicationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "seeker_id" TEXT NOT NULL,
    "resume_url" TEXT,
    "cover_letter" TEXT,
    "status_id" INTEGER NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationNote" (
    "id" SERIAL NOT NULL,
    "application_id" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobBookmark" (
    "id" SERIAL NOT NULL,
    "seeker_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "query_text" TEXT NOT NULL,
    "filters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserType_type_name_key" ON "UserType"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeekerProfile_user_id_key" ON "JobSeekerProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_user_id_key" ON "EmployerProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobIndustry_industry_name_key" ON "JobIndustry"("industry_name");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentType_type_name_key" ON "EmploymentType"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "JobPostStatus_status_name_key" ON "JobPostStatus"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationStatus_status_name_key" ON "JobApplicationStatus"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "JobBookmark_seeker_id_job_id_key" ON "JobBookmark"("seeker_id", "job_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSeekerProfile" ADD CONSTRAINT "JobSeekerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "JobIndustry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "JobIndustry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_employment_type_id_fkey" FOREIGN KEY ("employment_type_id") REFERENCES "EmploymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "JobPostStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "JobSeekerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "JobApplicationStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationNote" ADD CONSTRAINT "JobApplicationNote_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationNote" ADD CONSTRAINT "JobApplicationNote_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBookmark" ADD CONSTRAINT "JobBookmark_seeker_id_fkey" FOREIGN KEY ("seeker_id") REFERENCES "JobSeekerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobBookmark" ADD CONSTRAINT "JobBookmark_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
