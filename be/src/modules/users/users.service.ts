import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, like, desc, sql, and, or, count, SQL } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db, schema } from '../../database/database';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  async findByGoogleId(googleId: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.google_id, googleId),
    });
  }

  async findAll(options: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;
    const search = options.search?.trim();

    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        or(
          like(schema.users.name, `%${search}%`),
          like(schema.users.email, `%${search}%`),
        )!,
      );
    }

    const baseQuery = db.select().from(schema.users).$dynamic();
    const baseCountQuery = db
      .select({ total: count() })
      .from(schema.users)
      .$dynamic();

    if (conditions.length > 0) {
      const whereClause =
        conditions.length === 1 ? conditions[0] : and(...conditions);
      baseQuery.where(whereClause);
      baseCountQuery.where(whereClause);
    }

    const [data, totalResult] = await Promise.all([
      baseQuery
        .orderBy(desc(schema.users.created_at))
        .limit(limit)
        .offset(offset),
      baseCountQuery,
    ]);

    const total = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findById(id);

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.npwp !== undefined) updateData.npwp = data.npwp;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
    if (data.locale !== undefined) updateData.locale = data.locale;

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    updateData.updated_at = sql`(datetime('now'))`;

    await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id));

    this.logger.log(`Updated user ${id}`);

    return this.findById(id);
  }

  async create(data: {
    email: string;
    name: string;
    password_hash?: string;
    google_id?: string;
    avatar_url?: string;
    role?: string;
    locale?: string;
  }) {
    const id = uuidv4();
    const now = sql`(datetime('now'))`;

    await db.insert(schema.users).values({
      id,
      email: data.email,
      name: data.name,
      google_id: data.google_id ?? null,
      avatar_url: data.avatar_url ?? null,
      role: data.role ?? 'user',
      locale: data.locale ?? 'id',
      created_at: now,
      updated_at: now,
    });

    this.logger.log(`Created user ${id} (${data.email})`);

    return this.findById(id);
  }

  async getUserDocuments(
    userId: string,
    options: { page?: number; limit?: number },
  ) {
    await this.findById(userId);

    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(schema.documents)
        .where(eq(schema.documents.user_id, userId))
        .orderBy(desc(schema.documents.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(schema.documents)
        .where(eq(schema.documents.user_id, userId)),
    ]);

    const total = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
