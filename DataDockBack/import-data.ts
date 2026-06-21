import "dotenv/config";
import fs from "fs";
import prisma from "./src/config/prisma";

async function main() {
  // const states = JSON.parse(
  //   fs.readFileSync("states.json", "utf8")
  // );

  // const cities = JSON.parse(
  //   fs.readFileSync("datadock_india_cities_production.json", "utf8"),
  // );

  const pincodes = JSON.parse(
    fs.readFileSync("pincode_all_datadock_import.json", "utf8"),
  );

  // await prisma.state.createMany({
  //   data: states,
  //   skipDuplicates: true,
  // });

  // console.log(`Imported ${states.length} states`);

  // await prisma.city.createMany({
  //   data: cities,
  //   skipDuplicates: true,
  // });

  // console.log(`Imported ${cities.length} cities`);

  // console.log("Validating existing cityid======");

  // const cityIdsInDb = await prisma.city.findMany({
  //   select: { id: true },
  // });

  // const validCityIds = new Set(cityIdsInDb.map((c) => c.id));

  // const invalidPincodes = pincodes.filter(
  //   (p: any) => !validCityIds.has(p.cityId),
  // );

  // console.log("Invalid records:", invalidPincodes.length);

  // console.log(invalidPincodes.slice(0, 20));
  // console.log("===========");

  console.log("===========skip invalid or missing cityid records====");

  const cityIdsInDb = await prisma.city.findMany({
    select: { id: true },
  });

  const validCityIds = new Set(cityIdsInDb.map((c) => c.id));

  const validPincodes = pincodes.filter((p: any) => validCityIds.has(p.cityId));

  console.log(`Importing ${validPincodes.length} valid records`);

  await prisma.pincode.createMany({
    data: validPincodes,
    skipDuplicates: true,
  });
  console.log("done with skiping invalid or missing city records==");

  // await prisma.pincode.createMany({
  //   data: pincodes,
  //   skipDuplicates: true,
  // });

  console.log(`Imported ${pincodes.length} pincodes`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
