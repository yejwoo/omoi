import { PrismaClient } from "@prisma/client";
const db = new PrismaClient({
    log: ['info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        }
    }
});
export default db;