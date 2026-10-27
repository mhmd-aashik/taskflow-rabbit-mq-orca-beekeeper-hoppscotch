import { Inject, Injectable } from '@nestjs/common';
import { eq, and, lt } from 'drizzle-orm';
import { notifications } from '../database/schema.js';
import {
  NOTIFICATIONS_DATABASE,
  type NotificationsDatabase,
} from '../database/database.provider.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class NotificationsRepository {
  constructor(
    @Inject(NOTIFICATIONS_DATABASE)
    private readonly db: NotificationsDatabase,
  ) {}

  async findByTaskId(taskId: string) {
    const [notification] = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.taskId, taskId),
          eq(notifications.type, 'TASK_CREATED'),
        ),
      )
      .limit(1);

    return notification ?? null;
  }

  async createProcessing(taskId: string) {
    const [notification] = await this.db
      .insert(notifications)
      .values({
        taskId,
        type: 'TASK_CREATED',
        status: 'PROCESSING',
        processingToken: randomUUID(),
      })
      .onConflictDoNothing()
      .returning();

    return notification ?? null;
  }

  async markSent(taskId: string, processingToken: string): Promise<boolean> {
    const [updated] = await this.db
      .update(notifications)
      .set({
        status: 'SENT',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.taskId, taskId),
          eq(notifications.type, 'TASK_CREATED'),
          eq(notifications.processingToken, processingToken),
          eq(notifications.status, 'PROCESSING'),
        ),
      )
      .returning({ id: notifications.id });

    return updated !== undefined;
  }
  async markFailed(taskId: string, processingToken: string): Promise<boolean> {
    const [updated] = await this.db
      .update(notifications)
      .set({
        status: 'FAILED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.taskId, taskId),
          eq(notifications.type, 'TASK_CREATED'),
          eq(notifications.processingToken, processingToken),
          eq(notifications.status, 'PROCESSING'),
        ),
      )
      .returning({ id: notifications.id });

    return updated !== undefined;
  }
  async claimFailed(taskId: string) {
    const [notification] = await this.db
      .update(notifications)
      .set({
        status: 'PROCESSING',
        processingToken: randomUUID(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.taskId, taskId),
          eq(notifications.type, 'TASK_CREATED'),
          eq(notifications.status, 'FAILED'),
        ),
      )
      .returning();

    return notification ?? null;
  }

  async claimStaleProcessing(taskId: string) {
    const staleBefore = new Date(Date.now() - 2 * 60 * 1000);

    const [notification] = await this.db
      .update(notifications)
      .set({
        processingToken: randomUUID(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.taskId, taskId),
          eq(notifications.type, 'TASK_CREATED'),
          eq(notifications.status, 'PROCESSING'),
          lt(notifications.updatedAt, staleBefore),
        ),
      )
      .returning();

    return notification ?? null;
  }
}
