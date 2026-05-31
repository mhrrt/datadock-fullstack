import "dotenv/config";
import fs from "fs";
import prisma from "./src/config/prisma";

async function main() {
  const states = await prisma.state.findMany();
  const cities = await prisma.city.findMany();
  const pincodes = await prisma.pincode.findMany();

  fs.writeFileSync("states.json", JSON.stringify(states, null, 2));
  fs.writeFileSync("cities.json", JSON.stringify(cities, null, 2));
  fs.writeFileSync("pincodes.json", JSON.stringify(pincodes, null, 2));

  console.log("Export completed");
  console.log("States:", states.length);
  console.log("Cities:", cities.length);
  console.log("Pincodes:", pincodes.length);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });