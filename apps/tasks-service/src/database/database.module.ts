import { Module, Inject, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import {
  TASKS_DATABASE,
  TASKS_PG_POOL,
  tasksDatabaseProviders,
} from './database.provider.js';

@Module({
  providers: [...tasksDatabaseProviders],
  exports: [TASKS_DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(TASKS_PG_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
