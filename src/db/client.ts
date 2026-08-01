import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable not set!");
}

const rawConnectionString = process.env.DATABASE_URL || "";
const isLocalhost =
  rawConnectionString.includes("localhost") ||
  rawConnectionString.includes("127.0.0.1");

// pg-connection-string treats sslmode=require/prefer/verify-ca as aliases for
// verify-full, which performs strict certificate verification and breaks AWS
// RDS's self-signed certs — even when we pass an explicit `ssl` object to
// Pool, since the sslmode in the connection string takes precedence. Strip it
// here so SSL is controlled exclusively via the `ssl` option below.
function stripSslModeParam(connectionString: string): string {
  if (!connectionString) return connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("ssl");
    return url.toString();
  } catch {
    return connectionString;
  }
}

const connectionString = stripSslModeParam(rawConnectionString);

console.log("[DB Client] Initializing connection...");
console.log(
  "[DB Client] Database host:",
  connectionString.split("@")[1]?.split(":")[0] || "unknown"
);
console.log(
  "[DB Client] SSL config:",
  isLocalhost ? "disabled (localhost)" : "enabled (rejectUnauthorized=false)"
);

const pool = new Pool({
  connectionString,
  application_name: "catalog-app",
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
});

pool.on("error", (err: any) => {
  console.error("[DB Pool Error]", err.message);
});

pool.on("connect", () => {
  console.log("[DB Pool] Connection established successfully");
});

export const db = drizzle(pool);
