import 'dotenv/config';
// import pkg from '@prisma/client'
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

// const { PrismaClient } = pkg;

import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;