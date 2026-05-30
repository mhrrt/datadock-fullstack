import prisma from "./src/config/prisma";

async function main() {
  const users = await prisma.user.findMany();

  console.log("Users found:", users.length);
  console.log(users);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });