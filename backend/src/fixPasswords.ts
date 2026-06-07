import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPasswords() {
  const users = await prisma.user.findMany();
  console.log("Found " + users.length + " users.");

  for (const user of users) {
    const isHashed =
      user.password.startsWith("$2b$") || user.password.startsWith("$2a$");

    if (!isHashed) {
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      console.log("Fixed: " + user.email);
    } else {
      console.log("Already hashed: " + user.email);
    }
  }

  console.log("Done!");
  await prisma.$disconnect();
}

fixPasswords().catch(console.error);
