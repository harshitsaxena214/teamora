import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

let prisma;

export function getPrisma() {
  if (prisma) return prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing at runtime");
  }

  const sql = neon(connectionString);
  const adapter = new PrismaNeon(sql);

  prisma = new PrismaClient({ adapter });

  return prisma;
}

export default getPrisma;

