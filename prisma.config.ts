import { defineConfig } from "prisma/config";

// Prisma 7 reads the datasource URL from here rather than from the schema.
// Next.js loads .env itself at runtime; the CLI needs it loaded explicitly.
import { config } from "dotenv";

config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
