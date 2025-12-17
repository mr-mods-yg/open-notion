import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({connectionString: connectionString});

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

export default prisma;

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

const cleanup = async () => {
    await prisma.$disconnect();
};

process.on("beforeExit", cleanup);
process.on("exit", cleanup);
