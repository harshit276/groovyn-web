import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Reuse the client across HMR reloads in dev and across warm serverless
// invocations in production — otherwise every request opens a new pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres connection string to .env (local) or the Vercel project's environment variables."
    );
  }

  // Prisma 7 requires a driver adapter. PrismaPg speaks plain Postgres, so this
  // works with Neon, Supabase or any managed Postgres without code changes.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
