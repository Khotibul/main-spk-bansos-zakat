import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const DATABASE_URL = process.env.DATABASE_URL;

const prismaOptions = {
  datasources: {
    db: {
      url: DATABASE_URL.includes("prepared_statements")
        ? DATABASE_URL
        : `${DATABASE_URL}?prepared_statements=false`,
    },
  },
};

const prisma =
  process.env.NODE_ENV === "production"
    ? new PrismaClient(prismaOptions)
    : global.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
