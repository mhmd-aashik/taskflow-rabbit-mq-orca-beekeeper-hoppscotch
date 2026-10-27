import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').notNull(),
    type: varchar('type', { length: 50 }).notNull().default('TASK_CREATED'),
    status: varchar('status', { length: 20 }).notNull().default('PROCESSING'),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('notifications_task_type_unique').on(table.taskId, table.type),
  ],
);
