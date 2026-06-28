import fs from "fs";
import path from "path";

//import prisma from "../src/config/Prisma";

import { CONFIG } from "./config";

import { normalizeAreaName, printSummary, readJson } from "./utils";
import prisma from "../src/config/prisma";

interface PincodeRecord {
  cityId: number;

  pinCode: string;

  areaName: string;
}

async function importPincodes() {
  console.log("");

  console.log("==================================");
  console.log("PINCODE IMPORTER");
  console.log("==================================");
  console.log("");

  const started = Date.now();

  console.log("Loading existing pincodes...");

  const existing = await prisma.pincode.findMany({
    select: {
      cityId: true,

      pinCode: true,

      areaName: true,
    },
  });

  const existingSet = new Set<string>();

  for (const row of existing) {
    existingSet.add(
      `${row.cityId}|${row.pinCode}|${normalizeAreaName(row.areaName ?? "")}`,
    );
  }

  console.log(`Existing Pincodes : ${existingSet.size}`);

  console.log("");

  const generatedFolder = CONFIG.GENERATED_FOLDER;

  const jsonFiles = fs
    .readdirSync(generatedFolder)
    .filter(
      (file) => file.startsWith("pincodes_all_") && file.endsWith(".json"),
    )
    .sort();

  console.log(`Found ${jsonFiles.length} JSON files`);

  console.log("");

  let imported = 0;

  let skipped = 0;

  for (const file of jsonFiles) {
    console.log(`Reading ${file}`);

    const records = readJson<PincodeRecord[]>(path.join(generatedFolder, file));

    console.log(`Records : ${records.length}`);

    const newRecords = records.filter((record) => {
      const key = `${record.cityId}|${record.pinCode}|${normalizeAreaName(record.areaName)}`;

      if (existingSet.has(key)) {
        skipped++;

        return false;
      }

      return true;
    });

    console.log(`Need to insert : ${newRecords.length}`);

    if (newRecords.length === 0) {
      console.log("Nothing to import.");

      console.log("");

      continue;
    }

    const batchSize = CONFIG.PINCODE_BATCH_SIZE;

    const totalBatches = Math.ceil(newRecords.length / batchSize);

    for (let i = 0; i < newRecords.length; i += batchSize) {
      const batch = newRecords.slice(i, i + batchSize);

      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`Batch ${batchNumber}/${totalBatches}`);

      // uncomment if need to debug import process
      //   const cityIds = [...new Set(batch.map((p) => p.cityId))];

      //   const existing = await prisma.city.findMany({
      //     where: {
      //       id: {
      //         in: cityIds,
      //       },
      //     },
      //     select: {
      //       id: true,
      //     },
      //   });

      //   const existingCitySet = new Set(existing.map((c) => c.id));

      //   const missing = cityIds.filter((id) => !existingCitySet.has(id));

      //   if (missing.length > 0) {
      //     console.log("=================================");
      //     console.log("Missing City IDs");
      //     console.log(missing);
      //     console.log("=================================");

      //     process.exit(1);
      //   }

      const result = await prisma.pincode.createMany({
        data: batch.map((record) => ({
          cityId: record.cityId,

          pinCode: record.pinCode,

          areaName: normalizeAreaName(record.areaName),
        })),

        skipDuplicates: true,
      });

      imported += result.count;

      for (const record of batch) {
        const key = `${record.cityId}|${record.pinCode}|${normalizeAreaName(record.areaName)}`;

        existingSet.add(key);
      }

      const processed = Math.min(i + batchSize, newRecords.length);

      const percentage = ((processed / newRecords.length) * 100).toFixed(1);

      console.log(
        `Imported ${processed}/${newRecords.length} (${percentage}%)`,
      );
    }

    console.log("");
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  printSummary({
    title: "PINCODE IMPORT COMPLETED",

    values: {
      Inserted: imported,

      Skipped: skipped,

      "Existing Total": existingSet.size,

      Time: `${elapsed} sec`,
    },
  });

  await prisma.$disconnect();
}

async function main() {
  try {
    await importPincodes();

    console.log("");

    console.log("Completed Successfully.");
  } catch (error) {
    console.error("");

    console.error("PINCODE IMPORT FAILED");

    console.error(error);

    process.exitCode = 1;
  }
}

main();
