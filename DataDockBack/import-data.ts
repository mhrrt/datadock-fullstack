import "dotenv/config";
import fs from "fs";
import prisma from "./src/config/prisma";

async function main() {
  const states = JSON.parse(
    fs.readFileSync("states.json", "utf8")
  );

  const cities = JSON.parse(
    fs.readFileSync("cities.json", "utf8")
  );

  const pincodes = JSON.parse(
    fs.readFileSync("pincodes.json", "utf8")
  );

  await prisma.state.createMany({
    data: states,
    skipDuplicates: true,
  });

  console.log(`Imported ${states.length} states`);

  await prisma.city.createMany({
    data: cities,
    skipDuplicates: true,
  });

  console.log(`Imported ${cities.length} cities`);

  await prisma.pincode.createMany({
    data: pincodes,
    skipDuplicates: true,
  });

  console.log(`Imported ${pincodes.length} pincodes`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });