import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
``;
export const DATABASE = Symbol('DATABASE');
export const PG_POOL = Symbol('PG_POOL');

export const databaseProviders = [
  {
    provide: PG_POOL,
    useFactory: () => {
      const url = process.env.USERS_DATABASE_URL;

      if (!url) {
        throw new Error('DATABASE_URL is missing');
      }

      return new Pool({ connectionString: url });
    },
  },
  {
    provide: DATABASE,
    inject: [PG_POOL],
    useFactory: (pool: Pool) => drizzle(pool, { schema }),
  },
];

export type Database = ReturnType<typeof drizzle<typeof schema>>;
