import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      fullName: "System Admin",
      // role: "ADMIN",
    },
  });

  console.log("Admin user created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
