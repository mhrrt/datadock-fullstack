import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("chetan123", 10);

  await prisma.user.upsert({
    where: {
      username: "chetan",
    },
    update: {},
    create: {
      username: "chetan",
      passwordHash,
      fullName: "Cheetan S",
      // role: "ADMIN",
    },
  });

  console.log("User created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
