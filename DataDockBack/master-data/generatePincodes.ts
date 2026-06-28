import fs from "fs";
import path from "path";

import csv from "csv-parser";

import { CONFIG } from "./config";

import {
  readJson,
  getAllCsvFiles,
  writeJsonChunks,
  printSummary,
  normalizeStateName,
  normalizeCityName,
  normalizeAreaName,
  PINCODE_JSON_CHUNK_SIZE,
} from "./utils";

interface State {
  id: number;

  name: string;
}

interface CsvRow {
  officename: string;

  pincode: string;

  officetype: string;

  deliverystatus: string;

  divisionname: string;

  regionname: string;

  circlename: string;

  taluk: string;

  districtname: string;

  statename: string;
}

interface PincodeRecord {
  cityId: number;

  pinCode: string;

  areaName: string;
}

const GENERATED_FOLDER = CONFIG.GENERATED_FOLDER;

const PIN_FOLDER = CONFIG.PIN_FOLDER;

const CITY_LOOKUP_FILE = CONFIG.CITY_LOOKUP_FILE;

const STATES_FILE = CONFIG.STATES_FILE;

async function generatePincodes() {
  console.log("");

  console.log("====================================");
  console.log("PINCODE GENERATOR");
  console.log("====================================");
  console.log("");

  const started = Date.now();

  console.log("Loading city lookup...");

  const cityMap = readJson<Record<string, number>>(CITY_LOOKUP_FILE);

  console.log("Sample lookup keys:");
  console.log(Object.keys(cityMap).slice(0, 10));

  console.log(`City Lookup : ${Object.keys(cityMap).length}`);

  console.log("First lookup keys:");
  console.log(Object.keys(cityMap).slice(0, 10));

  console.log("");

  console.log("Loading states...");

  const states = readJson<State[]>(STATES_FILE);

  const stateLookup = new Map<string, number>();

  for (const state of states) {
    stateLookup.set(normalizeStateName(state.name), state.id);
  }

  console.log("");

  const csvFiles = getAllCsvFiles(PIN_FOLDER);

  console.log(`CSV Files : ${csvFiles.length}`);

  console.log("");

  const records: PincodeRecord[] = [];

  const missingCities = new Map<string, number>();

  let totalRows = 0;

  let matchedCities = 0;

  let duplicateRecords = 0;

  for (let index = 0; index < csvFiles.length; index++) {
    const file = csvFiles[index]!;

    if ((index + 1) % 10 === 0 || index === 0) {
      console.log(
        `Processing ${index + 1}/${csvFiles.length} : ${path.basename(file)}`,
      );
    }

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(file)

        .pipe(
          csv({
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
          }),
        )

        .on("data", (row: CsvRow) => {
          if (totalRows === 0) {
            console.log("FIRST ROW:");
            console.log(row);
          }
          totalRows++;

          const stateName = normalizeStateName(row.statename);
          const stateId = stateLookup.get(stateName);

          if (totalRows <= 10) {
            console.log({
              rawState: row.statename,
              normalizedState: stateName,
              stateId,
              taluk: row.taluk,
              district: row.districtname,
            });
          }

          if (!stateId) {
            return;
          }

          //   const cityName = normalizeCityName(
          //     `${row.taluk} ${row.districtname}`,
          //   );
          const cityName = normalizeCityName(row.taluk);

          if (!cityName) {
            return;
          }

          const cityKey = `${stateId}|${cityName}`;

          if (totalRows <= 5) {
            console.log({
              cityKey,
              exists: cityMap[cityKey] !== undefined,
              taluk: row.taluk,
              district: row.districtname,
              stateId,
            });
          }

          if (totalRows <= 10) {
            console.log({
              cityKey,
              cityId: cityMap[cityKey],
            });
          }

          const cityId = cityMap[cityKey];

          if (!cityId) {
            const current = missingCities.get(cityKey) ?? 0;

            missingCities.set(cityKey, current + 1);

            return;
          }

          matchedCities++;

          const areaName = normalizeAreaName(row.officename);

          records.push({
            cityId,

            pinCode: row.pincode.trim(),

            areaName,
          });
        })

        .on("end", () => {
          resolve();
        })

        .on("error", reject);
    });
  }

  console.log("");

  console.log(`Rows Read : ${totalRows}`);

  console.log(`Matched Cities : ${matchedCities}`);

  console.log(`Missing Cities : ${missingCities.size}`);

  console.log("");

  console.log("Deduplicating pincodes...");

  const uniqueMap = new Map<string, PincodeRecord>();

  for (const record of records) {
    const key = `${record.cityId}|${record.pinCode}|${record.areaName}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, record);
    } else {
      duplicateRecords++;
    }
  }

  const uniqueRecords = Array.from(uniqueMap.values());

  uniqueRecords.sort((a, b) => {
    if (a.cityId !== b.cityId) {
      return a.cityId - b.cityId;
    }

    if (a.pinCode !== b.pinCode) {
      return a.pinCode.localeCompare(b.pinCode);
    }

    return a.areaName.localeCompare(b.areaName);
  });

  console.log(`Unique Records : ${uniqueRecords.length}`);

  console.log("");
  console.log("Writing JSON...");
  console.log("");

  writeJsonChunks(
    uniqueRecords,

    GENERATED_FOLDER,

    "pincodes_all",

    PINCODE_JSON_CHUNK_SIZE,
  );

  console.log("");

  console.log("Generating missing city mapping report...");

  const missingCityReport = Array.from(missingCities.entries())
    .map(([key, count]) => {
      const [stateId, cityName = ""] = key.split("|");

      return {
        stateId: Number(stateId),

        cityName,

        occurrences: count,
      };
    })

    .sort((a, b) => {
      if (a.stateId !== b.stateId) {
        return a.stateId - b.stateId;
      }

      if (b.occurrences !== a.occurrences) {
        return b.occurrences - a.occurrences;
      }

      return a.cityName.localeCompare(b.cityName);
    });

  fs.writeFileSync(
    path.join(
      GENERATED_FOLDER,

      "missing_city_mapping.json",
    ),

    JSON.stringify(
      missingCityReport,

      null,

      2,
    ),
  );

  console.log(
    `Generated missing_city_mapping.json (${missingCityReport.length})`,
  );

  console.log("");

  const generatedFiles = Math.ceil(
    uniqueRecords.length / PINCODE_JSON_CHUNK_SIZE,
  );

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  printSummary({
    title: "PINCODE GENERATION COMPLETED",

    values: {
      "CSV Files Processed": csvFiles.length,

      "Rows Read": totalRows,

      "Cities Matched": matchedCities,

      "Cities Missing": missingCities.size,

      "Duplicate Records": duplicateRecords,

      "Unique Records": uniqueRecords.length,

      "Generated Files": generatedFiles,

      Time: `${elapsed} sec`,
    },
  });
}

async function main() {
  try {
    await generatePincodes();

    console.log("");

    console.log("Completed Successfully.");
  } catch (error) {
    console.error("");

    console.error("PINCODE GENERATION FAILED");

    console.error(error);

    process.exitCode = 1;
  }
}

main();
