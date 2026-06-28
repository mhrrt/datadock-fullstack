import fs from "fs";
import path from "path";

export interface State {
  id: number;
  name: string;
}

export interface City {
  stateId: number;
  name: string;
}

export interface PincodeRecord {
  cityId: number;
  pinCode: string;
  areaName: string;
}

export const CITY_JSON_CHUNK_SIZE = 2000;
export const PINCODE_JSON_CHUNK_SIZE = 5000;

/**
 * State aliases
 * India Post and Government datasets
 * are not always consistent.
 */
const STATE_ALIASES: Record<string, string> = {
  orissa: "odisha",

  uttaranchal: "uttarakhand",

  pondicherry: "puducherry",

  "nct of delhi": "delhi",

  "andaman & nicobar islands": "andaman and nicobar islands",

  "andaman & nicobar": "andaman and nicobar islands",

  "dadra & nagar haveli and daman & diu":
    "dadra and nagar haveli and daman and diu",

  "jammu & kashmir": "jammu and kashmir",
};

/**
 * Remove extra spaces
 */
export function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Convert to Title Case
 */
export function titleCase(text: string): string {
  return collapseSpaces(text)
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Normalize state name
 */
export function normalizeStateName(value: string): string {
  value = value.trim().toLowerCase();

  value = STATE_ALIASES[value] ?? value;

  return value;
}

/**
 * Administrative suffixes
 * which should not appear in
 * City dropdown.
 */
const CITY_SUFFIXES = [
  " city",

  " rural",

  " taluk",

  " taluka",

  " tahsil",

  " tehsil",

  " subdivision",

  " sub division",

  " sub-division",

  " block",
];

/**
 * Remove unwanted suffixes.
 */
export function removeCitySuffix(city: string): string {
  let value = collapseSpaces(city);

  CITY_SUFFIXES.forEach((suffix) => {
    if (value.toLowerCase().endsWith(suffix)) {
      value = value.substring(0, value.length - suffix.length);
    }
  });

  return collapseSpaces(value);
}

/**
 * Normalize city.
 */
export function normalizeCityName(city: string): string {
  let value = city;

  value = value.replace(/\./g, "");

  value = value.replace(/\(.*?\)/g, "");

  value = collapseSpaces(value);

  value = removeCitySuffix(value);

  value = value.replace(/-/g, " ");

  value = titleCase(value);

  return value;
}

export function normalizeAreaName(area: string): string {
  if (!area) return "";

  let value = collapseSpaces(area);

  value = value.replace(/\./g, "");

  const suffixes = ["SO", "BO", "HO", "GPO", "RMS", "MDG", "TMO"];

  for (const suffix of suffixes) {
    const regex = new RegExp(`\\b${suffix}\\b`, "ig");

    value = value.replace(regex, "");
  }

  value = collapseSpaces(value);

  return titleCase(value);
}

/**
 * Ignore invalid values
 * while generating cities.
 */
export function isValidCity(city: string): boolean {
  if (!city) return false;

  const value = city.trim().toLowerCase();

  const invalid = ["", "-", "--", "na", "n/a", "null", "unknown"];

  return !invalid.includes(value);
}

/**
 * Create directory if missing.
 */
export function ensureDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }
}

/**
 * Read JSON file.
 */
export function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Build
 *
 * stateName -> stateId
 *
 * lookup.
 */
export function buildStateMap(states: State[]): Map<string, number> {
  const map = new Map<string, number>();

  states.forEach((state) => {
    map.set(normalizeStateName(state.name), state.id);
  });

  return map;
}

/**
 * Recursively find
 * all CSV files.
 */
// export function getAllCsvFiles(directory: string): string[] {
//   let files: string[] = [];

//   const entries = fs.readdirSync(directory);

//   for (const entry of entries) {
//     const fullPath = path.join(directory, entry);

//     const stat = fs.statSync(fullPath);

//     if (stat.isDirectory()) {
//       files = files.concat(getAllCsvFiles(fullPath));
//     } else if (entry.toLowerCase().endsWith(".csv")) {
//       files.push(fullPath);
//     }
//   }

//   return files;
// }
export function getAllCsvFiles(folder: string): string[] {
  const files: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.toLowerCase().endsWith(".csv")) {
        files.push(fullPath);
      }
    }
  }

  walk(folder);

  return files.sort();
}

/**
 * Split into chunks.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Write JSON files.
 */
// export function writeJsonChunks<T>(
//   data: T[],
//   outputDirectory: string,
//   prefix: string,
//   chunkSize: number,
// ): void {
//   ensureDirectory(outputDirectory);

//   const chunks = chunkArray(data, chunkSize);

//   chunks.forEach((chunk, index) => {
//     const filePath = path.join(outputDirectory, `${prefix}_${index + 1}.json`);

//     fs.writeFileSync(filePath, JSON.stringify(chunk, null, 2));

//     console.log(`Generated ${path.basename(filePath)} (${chunk.length})`);
//   });
// }
export function writeJsonChunks<T>(
  records: T[],
  outputFolder: string,
  prefix: string,
  chunkSize: number,
) {
  ensureDirectory(outputFolder);

  console.log("Records received :", records.length);
  console.log("Chunk size :", chunkSize);

  let fileNumber = 1;

  for (let i = 0; i < records.length; i += chunkSize) {
    console.log(`Loop i = ${i}`);

    const chunk = records.slice(i, i + chunkSize);

    console.log(`Chunk length = ${chunk.length}`);

    const fileName = `${prefix}_${fileNumber}.json`;

    fs.writeFileSync(
      path.join(outputFolder, fileName),
      JSON.stringify(chunk, null, 2),
    );

    console.log(`Generated ${fileName} (${chunk.length})`);

    fileNumber++;
  }
}

/**
 * Progress Logger.
 */
export function logProgress(
  current: number,
  total: number,
  title: string,
): void {
  const percentage = ((current / total) * 100).toFixed(1);

  process.stdout.write(`\r${title} ${current}/${total} (${percentage}%)`);

  if (current === total) {
    process.stdout.write("\n");
  }
}

/**
 * Remove duplicate cities.
 */
export function uniqueCities(cities: City[]): City[] {
  const map = new Map<string, City>();

  cities.forEach((city) => {
    const key = `${city.stateId}|${normalizeCityName(city.name)}`;

    if (!map.has(key)) {
      map.set(key, {
        stateId: city.stateId,

        name: normalizeCityName(city.name),
      });
    }
  });

  return Array.from(map.values());
}

/**
 * Sort by
 *
 * stateId
 *
 * city name.
 */
export function sortCities(cities: City[]): City[] {
  return cities.sort((a, b) => {
    if (a.stateId !== b.stateId) {
      return a.stateId - b.stateId;
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * Nice Console Output.
 */
export function printSummary(summary: {
  title: string;

  values: Record<string, string | number>;
}) {
  console.log("");

  console.log("======================================");

  console.log(summary.title);

  console.log("======================================");

  for (const [key, value] of Object.entries(summary.values)) {
    console.log(`${key.padEnd(28)} : ${value}`);
  }

  console.log("======================================");
}
