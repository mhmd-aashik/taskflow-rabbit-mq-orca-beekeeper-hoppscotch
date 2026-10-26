import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { TASKS_DATABASE } from '../database/database.provider.js';
import * as schema from '../database/schema.js';
import { tasks, type NewTask } from '../database/schema.js';
import { desc, eq } from 'drizzle-orm';

@Injectable()
export class TasksRepository {
  constructor(
    @Inject(TASKS_DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: NewTask) {
    const [task] = await this.db.insert(tasks).values(data).returning();

    return task;
  }

  async findAll() {
    const tasks = await this.db
      .select()
      .from(schema.tasks)
      .orderBy(desc(schema.tasks.createdAt));

    return tasks;
  }

  async findById(id: string) {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    return task ?? null;
  }

  async findByUserId(userId: string) {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.createdBy, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async update(
    id: string,
    data: Partial<Pick<NewTask, 'title' | 'description' | 'status'>>,
  ) {
    const [task] = await this.db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    return task ?? null;
  }

  async delete(id: string) {
    const [task] = await this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    return task ?? null;
  }
}
