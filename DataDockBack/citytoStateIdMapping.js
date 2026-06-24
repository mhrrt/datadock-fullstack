// generateCitiesJson.js

const fs = require("fs");

const states = require("./states_all.json");
const cities = require("./cities-1482.json");

// Create state name -> stateId mapping
const stateMap = {};

states.forEach((state) => {
  stateMap[state.name.toLowerCase()] = state.id;
});

// Generate final city records
const result = [];

cities.forEach((city) => {
  let stateName = city.state.replace(/&/g, "and").trim().toLowerCase();

  const stateId = stateMap[stateName];

  if (!stateId) {
    console.warn(`State not found: ${city.state}`);
    return;
  }

  result.push({
    stateId,
    name: city.city.trim(),
  });
});

// Save result to JSON file
fs.writeFileSync(
  "./cities_1482_stateIdMapped.json",
  JSON.stringify(result, null, 2),
  "utf8",
);

console.log(`Generated cities_all.json with ${result.length} records`);
