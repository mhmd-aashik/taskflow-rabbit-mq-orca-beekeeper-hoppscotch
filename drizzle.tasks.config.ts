import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/tasks-service/src/database/schema.ts',
  out: './drizzle/tasks',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.TASKS_DATABASE_URL!,
  },
});
