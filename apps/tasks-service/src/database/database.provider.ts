import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

export const TASKS_DATABASE = Symbol('TASKS_DATABASE');
export const TASKS_PG_POOL = Symbol('TASKS_PG_POOL');

export const tasksDatabaseProviders = [
  {
    provide: TASKS_PG_POOL,
    useFactory: () => {
      const url = process.env.TASKS_DATABASE_URL;

      if (!url) {
        throw new Error('TASKS_DATABASE_URL is missing');
      }

      return new Pool({
        connectionString: url,
        max: 10,
        connectionTimeoutMillis: 5000,
      });
    },
  },
  {
    provide: TASKS_DATABASE,
    inject: [TASKS_PG_POOL],
    useFactory: (pool: Pool) => drizzle(pool, { schema }),
  },
];

export type TasksDatabase = ReturnType<typeof drizzle<typeof schema>>;
