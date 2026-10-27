import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

export const NOTIFICATIONS_DATABASE = Symbol('NOTIFICATIONS_DATABASE');
export const NOTIFICATIONS_PG_POOL = Symbol('NOTIFICATIONS_PG_POOL');

export const NotificationsDatabaseProviders = [
  {
    provide: NOTIFICATIONS_PG_POOL,
    useFactory: () => {
      const url = process.env.NOTIFICATIONS_DATABASE_URL;

      if (!url) {
        throw new Error('NOTIFICATIONS_DATABASE_URL is missing');
      }

      return new Pool({
        connectionString: url,
        max: 10,
        connectionTimeoutMillis: 5000,
      });
    },
  },
  {
    provide: NOTIFICATIONS_DATABASE,
    inject: [NOTIFICATIONS_PG_POOL],
    useFactory: (pool: Pool) => drizzle(pool, { schema }),
  },
];

export type NotificationsDatabase = ReturnType<typeof drizzle<typeof schema>>;
