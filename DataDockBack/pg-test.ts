import "dotenv/config";
import { Pool } from "pg";

console.log(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
async function main() {
  const result = await pool.query("SELECT NOW()");
  console.log(result.rows);
  await pool.end();
}

main().catch(console.error);