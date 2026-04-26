import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // User Types
  await prisma.userType.createMany({
    data: [
      { type_name: "Job Seeker" },
      { type_name: "Employer" },
      { type_name: "Admin" },
      { type_name: "Super Admin" },
    ],
    skipDuplicates: true,
  });

  // Job Post Statuses
  await prisma.jobPostStatus.createMany({
    data: [
      { status_name: "Draft" },
      { status_name: "Open" },
      { status_name: "Closed" },
    ],
    skipDuplicates: true,
  });

  // Job Application Statuses
  await prisma.jobApplicationStatus.createMany({
    data: [
      { status_name: "Pending" },
      { status_name: "Interview" },
      { status_name: "Accepted" },
      { status_name: "Rejected" },
    ],
    skipDuplicates: true,
  });

  // Employment Types
  await prisma.employmentType.createMany({
    data: [
      { type_name: "Full-time" },
      { type_name: "Part-time" },
      { type_name: "Remote" },
      { type_name: "Contract" },
      { type_name: "Internship" },
    ],
    skipDuplicates: true,
  });

  // Industries
  await prisma.jobIndustry.createMany({
    data: [
      { industry_name: "Technology" },
      { industry_name: "Healthcare" },
      { industry_name: "Finance" },
      { industry_name: "Education" },
      { industry_name: "Retail" },
      { industry_name: "Manufacturing" },
      { industry_name: "Construction" },
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
