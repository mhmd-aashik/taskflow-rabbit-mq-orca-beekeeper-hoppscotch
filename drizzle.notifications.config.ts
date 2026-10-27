import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/notifications-service/src/database/schema.ts',
  out: './drizzle/notifications',
  dbCredentials: {
    url: process.env.NOTIFICATIONS_DATABASE_URL!,
  },
});