import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const envPath = path.resolve(process.cwd(), ".env.local");
require("dotenv").config({ path: envPath });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
