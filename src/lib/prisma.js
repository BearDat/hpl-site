import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;
// Always cache on globalThis, production included: serverless functions
// reuse the same warm container across invocations, and without this a
// fresh PrismaClient (and fresh database connections) gets created on
// every request instead of being reused within that container.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
globalForPrisma.prisma = prisma;
