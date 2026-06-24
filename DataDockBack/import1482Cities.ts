import fs from "fs";
import prisma from "./src/config/prisma";
import { normalize } from "path";

const cities = JSON.parse(
  fs.readFileSync("./cities_1482_stateIdMapped.json", "utf8"),
);
console.log("SCRIPT STARTED");

async function importCities() {
  try {
    const existingCities = await prisma.city.findMany({
      select: {
        stateId: true,
        name: true,
      },
    });

    const existingSet = new Set(
      existingCities.map((c) => `${c.stateId}|${c.name.toLowerCase()}`),
    );

    const newCities = cities.filter(
      (c) => !existingSet.has(`${c.stateId}|${c.name.toLowerCase()}`),
    );

    console.log(`Found ${existingCities.length} existing cities`);
    console.log(`Need to insert ${newCities.length} new cities`);

    const uniqueCities = Array.from(
      new Map(
        newCities.map((c) => [
          `${c.stateId}|${normalize(c.name)}`,
          {
            stateId: c.stateId,
            name: c.name.trim(),
          },
        ]),
      ).values(),
    );

    console.log(`After deduplication: ${uniqueCities.length}`);

    const result = await prisma.city.createMany({
      data: uniqueCities,
      skipDuplicates: true,
    });

    console.log(`Inserted ${result.count} cities`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

importCities();
