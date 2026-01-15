import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon, neonConfig } from "@neondatabase/serverless";

// Configure WebSocket ONLY for local Node.js development
// Vercel serverless functions use HTTP fetch mode (no WebSocket needed)
// Neon's serverless driver automatically uses HTTP when WebSocket isn't configured
// This is the recommended approach for serverless environments like Vercel
if (
  process.env.VERCEL !== "1" &&
  typeof globalThis.WebSocket === "undefined" &&
  typeof window === "undefined"
) {
  // Dynamic import to avoid bundling ws in serverless builds
  // If this fails, Neon will use HTTP mode (which is preferred for serverless anyway)
  import("ws")
    .then((wsModule) => {
      neonConfig.webSocketConstructor = wsModule.default;
    })
    .catch(() => {
      // Silently continue - HTTP mode works great for serverless
    });
}

// 1️⃣ Create Neon SQL client (THIS is the DB connection)
// In Vercel, this uses HTTP fetch mode automatically (no WebSocket needed)
const sql = neon(process.env.DATABASE_URL);

// 2️⃣ Pass it to Prisma adapter
const adapter = new PrismaNeon(sql);

// 3️⃣ Serverless-safe singleton pattern for Vercel
// In Vercel, the global object persists across invocations in the same container
// but we use this pattern to ensure we reuse the Prisma client instance
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Store in global to reuse across function invocations in the same container
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
