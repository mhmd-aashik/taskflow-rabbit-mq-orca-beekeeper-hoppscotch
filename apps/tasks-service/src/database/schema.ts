import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const taskStatus = pgEnum('task_status', [
  'TODO',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    status: taskStatus('status').default('TODO').notNull(),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('tasks_created_by_idx').on(table.createdBy),
    index('tasks_status_idx').on(table.status),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
