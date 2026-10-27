import { drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const DatabaseProvider = {
  provide: DATABASE_CONNECTION,

  useFactory: () => {
    const connectionString = process.env.NOTIFICATIONS_DATABASE_URL;

    if (!connectionString) {
      throw new Error('NOTIFICATIONS_DATABASE_URL is not configured');
    }

    const client = new Pool({ connectionString });

    return drizzle(client);
  },
};
