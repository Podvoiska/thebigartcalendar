import { neon } from '@neondatabase/serverless';

process.loadEnvFile('.env.local');

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const counts = await sql`SELECT source_name, COUNT(*) as count FROM events GROUP BY source_name ORDER BY count DESC`;
  console.log('Events by source:');
  console.table(counts);

  const recent = await sql`SELECT title, start_date, source_name FROM events ORDER BY scraped_at DESC LIMIT 10`;
  console.log('\n10 most recently scraped:');
  console.table(recent);
}

main().catch((err) => { console.error(err); process.exit(1); });
