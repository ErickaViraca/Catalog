import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable not set!");
}

const connectionString = process.env.DATABASE_URL || "";
const isLocalhost =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

console.log("[DB Client] Initializing connection...");
console.log(
  "[DB Client] Database host:",
  connectionString.split("@")[1]?.split(":")[0] || "unknown"
);

const poolConfig: any = {
  connectionString: connectionString,
  application_name: "catalog-app",
};

if (!isLocalhost) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
  console.log("[DB Client] SSL config: enabled (rejectUnauthorized=false for AWS RDS self-signed certs)");
} else {
  poolConfig.ssl = false;
  console.log("[DB Client] SSL config: disabled (localhost detected)");
}

const pool = new Pool(poolConfig);

pool.on("error", (err: any) => {
  console.error("[DB Pool Error]", err.message);
  if (err.code === "SELF_SIGNED_CERT_IN_CHAIN") {
    console.error(
      "[DB Pool Error] Hint: The database connection string may have conflicting SSL settings."
    );
    console.error(
      "[DB Pool Error] Consider changing sslmode=verify-full to sslmode=require in DATABASE_URL"
    );
  }
});

pool.on("connect", () => {
  console.log("[DB Pool] Connection established successfully");
});

export const db = drizzle(pool);
