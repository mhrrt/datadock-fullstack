import fs from "fs";
import prisma from "./src/config/prisma";

async function importData() {
  const data = JSON.parse(fs.readFileSync("./pincodes.json", "utf-8"));

  await prisma.pincode.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Imported ${data.length} records`);
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
