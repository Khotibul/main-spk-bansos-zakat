// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Extend globalThis agar TypeScript mengenali global.prisma pada development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;

// Matikan prepared statements (sangat penting untuk mengatasi cached plan error)
const prismaOptions = {
  datasources: {
    db: {
      url: DATABASE_URL?.includes("prepared_statements") 
        ? DATABASE_URL 
        : `${DATABASE_URL}?prepared_statements=false`,
    },
  },
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.prisma;
}

export default prisma;

