import path from "path";

export const CONFIG = {
  ROOT: "./master-data",

  SOURCE_FOLDER: path.join("./master-data", "source"),

  GENERATED_FOLDER: path.join("./master-data", "generated"),

  PIN_FOLDER: path.join("./master-data", "source", "pin"),

  STATES_FILE: path.join("./master-data", "source", "states_all.json"),

  CITY_LOOKUP_FILE: path.join("./master-data", "generated", "city_lookup.json"),

  CITY_BATCH_SIZE: 500,

  PINCODE_BATCH_SIZE: 2000,
};
