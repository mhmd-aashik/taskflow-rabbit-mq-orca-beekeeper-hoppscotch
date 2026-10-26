import { Module, Inject, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import { databaseProviders, DATABASE, PG_POOL } from './database.provider.js';

@Module({
  providers: [...databaseProviders],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
