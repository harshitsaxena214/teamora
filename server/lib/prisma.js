import 'dotenv/config'
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

let prisma;

/**
 * Lazy Prisma client — REQUIRED for Vercel + Inngest
 */
export function getPrisma() {
  if (prisma) return prisma;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing at runtime");
  }

  const sql = neon(databaseUrl.trim());
  const adapter = new PrismaNeon(sql);

  prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

  return prisma;
}

export default getPrisma;
