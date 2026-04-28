import logger from "../utils/logger.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error("DATABASE_URL is not defined in environment variables");
}

const pool = new pg.Pool({ connectionString });

// Verify connection on startup
pool
  .query("SELECT 1")
  .then(() => logger.info("✅ Database connection verified successfully!"))
  .catch((err: any) => {
    logger.error("❌ Database connection failed!", { error: err.message });
  });

// @ts-ignore - pg type mismatch due to transitive dependencies in Prisma 7
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
