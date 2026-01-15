import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Required for Neon in Node.js
neonConfig.webSocketConstructor = ws;

// 1️⃣ Create Neon SQL client (THIS is the DB connection)
const sql = neon(process.env.DATABASE_URL);

// 2️⃣ Pass it to Prisma adapter
const adapter = new PrismaNeon(sql);

// 3️⃣ Serverless-safe singleton
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

console.log(" Prisma + Neon connected");

export default prisma;
