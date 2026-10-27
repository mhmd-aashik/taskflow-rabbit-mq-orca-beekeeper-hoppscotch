import { Module, Inject, OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import {
  NOTIFICATIONS_DATABASE,
  NOTIFICATIONS_PG_POOL,
  NotificationsDatabaseProviders,
} from './database.provider.js';

@Module({
  providers: [...NotificationsDatabaseProviders],
  exports: [NOTIFICATIONS_DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(NOTIFICATIONS_PG_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
