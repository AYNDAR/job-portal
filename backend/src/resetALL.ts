import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetAll() {
  const hash = await bcrypt.hash("password123", 10);
  const result = await prisma.user.updateMany({
    data: { password: hash },
  });
  console.log("Updated " + result.count + " users");
  console.log("All users can now login with password: password123");
  await prisma.$disconnect();
}

resetAll().catch(console.error);
