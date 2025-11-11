// Source - https://stackoverflow.com/a
// Posted by Efe Asiughu
// Retrieved 2025-11-10, License - CC BY-SA 4.0

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
