import { Inject, Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.provider.js';
import { users } from '../database/schema.js';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  async create(data: typeof users.$inferInsert) {
    const [user] = await this.db.insert(users).values(data).returning();

    return user;
  }

  async findAll() {
    return this.db.select().from(users);
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByEmailOrUsername(email: string, username: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    return user ?? null;
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  async delete(id: string) {
    const [user] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return user ?? null;
  }
}
