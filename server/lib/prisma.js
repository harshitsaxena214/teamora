import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for Node.js runtimes (Vercel serverless)
neonConfig.webSocketConstructor = ws;

let prisma;

/**
 * Serverless-safe Prisma client
 * Works with Vercel + Inngest
 */
export function getPrisma() {
  if (prisma) return prisma;

  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error("DATABASE_URL is missing or empty");
  }

  const sql = neon(url);              // Create Neon client
  const adapter = new PrismaNeon(sql); // Pass client to adapter

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