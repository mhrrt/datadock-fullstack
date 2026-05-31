import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./src/config/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      username: "admin",
      fullName: "Admin User",
      passwordHash,
      isActive: true,
    },
  });

  console.log(user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });