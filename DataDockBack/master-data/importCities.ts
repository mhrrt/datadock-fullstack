import fs from "fs";
import path from "path";

import prisma from "../src/config/prisma";

import { CONFIG } from "./config";

import { City, readJson, logProgress, normalizeCityName } from "./utils";

const GENERATED_FOLDER = CONFIG.GENERATED_FOLDER;

const CITY_LOOKUP_FILE = CONFIG.CITY_LOOKUP_FILE;

const BATCH_SIZE = CONFIG.CITY_BATCH_SIZE;

interface CityLookup {
  id: number;

  stateId: number;

  name: string;
}

async function importCities() {
  console.log("");

  console.log("==================================");
  console.log("CITY IMPORTER");
  console.log("==================================");
  console.log("");

  const started = Date.now();

  console.log("Loading existing cities...");

  const existingCities = await prisma.city.findMany({
    select: {
      id: true,

      stateId: true,

      name: true,
    },
  });

  console.log(`Existing cities : ${existingCities.length}`);

  const existingSet = new Set<string>();

  const cityLookup: Record<string, number> = {};

  existingCities.forEach((city) => {
    const normalizedName = normalizeCityName(city.name);

    const key = `${city.stateId}|${normalizedName}`;

    existingSet.add(key);

    cityLookup[key] = city.id;
  });

  const files = fs

    .readdirSync(GENERATED_FOLDER)

    .filter((file) => file.startsWith("cities_all_") && file.endsWith(".json"))

    .sort();

  console.log("");

  console.log(`Found ${files.length} JSON files`);

  console.log("");

  let totalJsonRecords = 0;

  let totalInserted = 0;

  let totalSkipped = 0;

  for (const file of files) {
    console.log(`Reading ${file}`);

    const cities = readJson<City[]>(path.join(GENERATED_FOLDER, file));

    totalJsonRecords += cities.length;

    console.log(`Records : ${cities.length}`);

    const newCities = cities.filter((city) => {
      const key = `${city.stateId}|${normalizeCityName(city.name)}`;

      return !existingSet.has(key);
    });

    console.log(`Need to insert : ${newCities.length}`);

    if (newCities.length === 0) {
      totalSkipped += cities.length;

      console.log("Nothing to import.");

      console.log("");

      continue;
    }

    console.log("");

    let imported = 0;

    const totalBatches = Math.ceil(newCities.length / BATCH_SIZE);

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchData = newCities.slice(
        batch * BATCH_SIZE,
        (batch + 1) * BATCH_SIZE,
      );

      const result = await prisma.city.createMany({
        data: batchData.map((city) => ({
          stateId: city.stateId,
          name: normalizeCityName(city.name),
        })),
        skipDuplicates: true,
      });

      for (const city of batchData) {
        const key = `${city.stateId}|${normalizeCityName(city.name)}`;

        if (!existingSet.has(key)) {
          existingSet.add(key);
        }
      }

      imported += result.count;

      logProgress(
        imported,

        newCities.length,

        "Imported",
      );
    }

    totalInserted += imported;

    totalSkipped += cities.length - imported;

    console.log("");

    const insertedCities = await prisma.city.findMany({
      where: {
        OR: newCities.map((city) => ({
          stateId: city.stateId,

          name: normalizeCityName(city.name),
        })),
      },

      select: {
        id: true,

        stateId: true,

        name: true,
      },
    });

    insertedCities.forEach((city) => {
      const key = `${city.stateId}|${normalizeCityName(city.name)}`;

      cityLookup[key] = city.id;
    });

    console.log("");
  }

  console.log("");

  console.log("Generating city lookup...");

  fs.writeFileSync(
    CITY_LOOKUP_FILE,

    JSON.stringify(cityLookup, null, 2),
  );

  console.log(`Generated city_lookup.json (${cityLookup.length})`);

  console.log("");

  const finalCount = await prisma.city.count();

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  console.log("");

  console.log("==================================");
  console.log("IMPORT COMPLETED");
  console.log("----------------------------------");

  console.log(`JSON Records      : ${totalJsonRecords}`);

  console.log(`Already Existing  : ${totalSkipped}`);

  console.log(`Inserted          : ${totalInserted}`);

  console.log(`Final DB Count    : ${finalCount}`);

  console.log(`Lookup Generated  : Yes`);

  console.log(`Time              : ${elapsed} sec`);

  console.log("==================================");
}

async function main() {
  try {
    await importCities();
  } catch (error) {
    console.error("");

    console.error("IMPORT FAILED");

    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
