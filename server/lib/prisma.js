import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for Node.js runtimes (Vercel serverless)
neonConfig.webSocketConstructor = ws;

let prisma;

export function getPrisma() {
  if (prisma) return prisma;

  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing or empty");
  }

  const pool = new Pool({ connectionString });

  // 4. Create the Adapter
  const adapter = new PrismaNeon(pool);

  prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

  return prisma;
}

console.log(
  typeof process.env.DATABASE_URL,
  JSON.stringify(process.env.DATABASE_URL)
);

export default getPrisma;
