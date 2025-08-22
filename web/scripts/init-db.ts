import { config } from 'dotenv';
import { initializeDatabase } from '@/lib/db/init';

// 環境変数を読み込み
config({ path: '.env.local' });

async function main() {
  console.log('Initializing database...');
  await initializeDatabase();
  console.log('Database initialization complete');
  process.exit(0);
}

main().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});