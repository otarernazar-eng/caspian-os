import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "file:./dev.db";
  }

  // On Vercel / Production Serverless environment
  const tmpDbPath = "/tmp/dev.db";
  if (!fs.existsSync(tmpDbPath)) {
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
    const altSourceDbPath = path.join(process.cwd(), "dev.db");
    
    if (fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    } else if (fs.existsSync(altSourceDbPath)) {
      fs.copyFileSync(altSourceDbPath, tmpDbPath);
    }
  }
  return `file:${tmpDbPath}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
