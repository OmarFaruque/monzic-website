import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
    path: '.env',
});

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });

async function main() {
    const columns = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
    `;
    console.log(columns.map(c => c.column_name));
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
