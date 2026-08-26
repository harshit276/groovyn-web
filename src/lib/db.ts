import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Neon's driver tunnels over 443 instead of holding a TCP connection on 5432.
// Two reasons that matters: serverless functions don't keep pools alive between
// invocations, and plenty of ISPs and office networks block 5432 outright —
// including this project's dev network, where adapter-pg times out entirely.
neonConfig.webSocketConstructor = ws;

// Reuse the client across HMR reloads in dev and across warm serverless
// invocations in production, so every request doesn't open a new connection.
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

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
