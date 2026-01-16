import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config"; // <--- Explicitly load .env variables first!

// 1. Configure Neon for Serverless
neonConfig.webSocketConstructor = ws;

// 2. Validate Environment Variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Check your Vercel Environment Variables.");
}

// 3. Create the Pool & Adapter ONCE (Global Scope)
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// 4. Instantiate Prisma Client (Singleton Pattern)
// This prevents creating multiple connections during hot-reloading
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 5. Export the INSTANCE, not a function
export default prisma;
