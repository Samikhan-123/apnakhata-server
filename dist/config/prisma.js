import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
}
const pool = new pg.Pool({ connectionString });
// Verify connection on startup
pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection verified successfully!'))
    .catch((err) => {
    console.error('❌ Database connection failed!');
    console.error(err);
});
// @ts-ignore - pg type mismatch due to transitive dependencies in Prisma 7
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma;
//# sourceMappingURL=prisma.js.map