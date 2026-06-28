import fs from "fs";
import csv from "csv-parser";

import {
  State,
  City,
  CITY_JSON_CHUNK_SIZE,
  buildStateMap,
  getAllCsvFiles,
  normalizeStateName,
  normalizeCityName,
  isValidCity,
  uniqueCities,
  sortCities,
  writeJsonChunks,
  printSummary,
} from "./utils";

// const STATES_FILE = "./master-data/source/states_all.json";

// const PIN_FOLDER = "./master-data/source/pin";

// const OUTPUT_FOLDER = "./master-data/generated";
import { CONFIG } from "./config";

const STATES_FILE = CONFIG.STATES_FILE;

const PIN_FOLDER = CONFIG.PIN_FOLDER;

const OUTPUT_FOLDER = CONFIG.GENERATED_FOLDER;

/**
 * Read states
 */
const states: State[] = JSON.parse(fs.readFileSync(STATES_FILE, "utf8"));

const stateMap = buildStateMap(states);

/**
 * City collection.
 */
const cities: City[] = [];

/**
 * Read one CSV file.
 */
function processCsv(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${file}`);

    fs.createReadStream(file)

      .pipe(csv())

      .on("data", (row) => {
        const state = row.statename;

        if (!state) return;

        const stateId = stateMap.get(normalizeStateName(state));

        if (!stateId) return;

        processCity(row.Taluk, stateId);

        processCity(row.Districtname, stateId);
      })

      .on("end", () => resolve())

      .on("error", reject);
  });
}

/**
 * Process one city.
 */
function processCity(value: string, stateId: number) {
  if (!value) return;

  const city = normalizeCityName(value);

  if (!isValidCity(city)) return;

  cities.push({
    stateId,

    name: city,
  });
}

/**
 * Read every CSV.
 */
async function readAllCsvFiles() {
  const csvFiles = getAllCsvFiles(PIN_FOLDER);

  console.log("");

  console.log(`Found ${csvFiles.length} CSV files`);

  console.log("");

  for (const file of csvFiles) {
    await processCsv(file);
  }
}

/**
 * Generate JSON files.
 */
function generateCityFiles() {
  console.log("");

  console.log("Deduplicating cities...");

  const unique = uniqueCities(cities);

  console.log(`Unique cities : ${unique.length}`);

  console.log("");

  console.log("Sorting...");

  const sorted = sortCities(unique);

  console.log("");

  console.log("Writing JSON...");

  console.log("Sorted length:", sorted.length);
  console.log("Chunk size:", CITY_JSON_CHUNK_SIZE);

  writeJsonChunks(
    sorted,

    OUTPUT_FOLDER,

    "cities_all",

    CITY_JSON_CHUNK_SIZE,
  );

  printSummary({
    title: "CITY GENERATION COMPLETED",
    values: {
      "Total Records": sorted.length,
    },
  });
}

/**
 * Main
 */
async function main() {
  console.log("");

  console.log("========================================");

  console.log("India Post City Generator");

  console.log("========================================");

  console.log("");

  console.log("Loading States...");

  console.log(`States Loaded : ${states.length}`);

  console.log("");

  await readAllCsvFiles();

  console.log("");

  console.log(`Cities collected : ${cities.length}`);

  generateCityFiles();
}

main()
  .then(() => {
    console.log("");

    console.log("Completed Successfully.");
  })

  .catch((error) => {
    console.error("");

    console.error("Generation Failed");

    console.error(error);
  });
