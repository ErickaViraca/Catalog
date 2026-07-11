import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable not set!");
}

const isLocalhost =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.DATABASE_URL?.includes("127.0.0.1");

console.log("[DB Client] Initializing connection...");
console.log("[DB Client] Database host:", process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "unknown");

const poolConfig: any = {
  connectionString: process.env.DATABASE_URL,
  application_name: "catalog-app",
};

if (!isLocalhost && process.env.DATABASE_URL?.includes("rds")) {
  poolConfig.ssl = { rejectUnauthorized: false };
  console.log("[DB Client] SSL config: enabled for RDS");
}

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("[DB Pool Error]", err.message);
});

pool.on("connect", () => {
  console.log("[DB Pool] Connection established");
});

export const db = drizzle(pool);
