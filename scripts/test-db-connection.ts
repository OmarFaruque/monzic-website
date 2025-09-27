import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
    path: '.env',
});

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });

async function main() {
    try {
        const result = await sql`SELECT 1`;
        console.log('Database connection successful:', result);
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

main();
