import 'dotenv/config';
import { DataSource } from 'typeorm';

// CLI-driven migrations. Never auto-run on boot (see app.module.ts).
// Usage:
//   pnpm --filter @247gbs/api migration:run
//   pnpm --filter @247gbs/api migration:revert
// Env: POSTGRES_HOST/PORT/USERNAME/PASSWORD/NAME, POSTGRES_SSL=true for Supabase.
const useSsl =
  process.env.NODE_ENV === 'production' ||
  process.env.POSTGRES_SSL === 'true' ||
  Boolean(process.env.POSTGRES_HOST?.includes('supabase'));

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_NAME || 'audit_db',
  // Entities resolved relative to compiled dist at runtime, src via ts-node in dev.
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  migrationsRun: false,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
