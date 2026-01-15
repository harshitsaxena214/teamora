import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

let prisma;

export function getPrisma() {
  if (prisma) return prisma;

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing at runtime");
  }

  const sql = neon(url);              // ← happens ONLY at execution time
  const adapter = new PrismaNeon(sql);

  prisma = new PrismaClient({ adapter });

  return prisma;
}

export default getPrisma;

