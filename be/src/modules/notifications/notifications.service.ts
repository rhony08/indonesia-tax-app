import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, schema } from '../../database/database';

const { notifications } = schema;

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  body: string;
  type?: string;
  reference_id?: string;
  reference_type?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Create a new notification (used by other services internally).
   */
  async create(input: CreateNotificationInput) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(notifications).values({
      id,
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      type: input.type || 'general',
      reference_id: input.reference_id || null,
      reference_type: input.reference_type || null,
      is_read: false,
      created_at: now,
    });

    this.logger.log(`Notification created: ${id} for user ${input.user_id}`);

    return {
      id,
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      type: input.type || 'general',
      is_read: false,
      created_at: now,
    };
  }

  /**
   * Get user's notifications with pagination (ordered by most recent).
   */
  async findAll(userId: string, page = 1, limit = 20) {
    const countResult = await db
      .select({ total: count() })
      .from(notifications)
      .where(eq(notifications.user_id, userId));

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: notifications.id,
        title: notifications.title,
        body: notifications.body,
        type: notifications.type,
        reference_id: notifications.reference_id,
        reference_type: notifications.reference_type,
        is_read: notifications.is_read,
        created_at: notifications.created_at,
      })
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Mark a single notification as read (must belong to the user).
   */
  async markAsRead(userId: string, notificationId: string) {
    const result = await db
      .select({ id: notifications.id, user_id: notifications.user_id })
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Notification not found');
    }

    if (result[0].user_id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await db
      .update(notifications)
      .set({ is_read: true })
      .where(eq(notifications.id, notificationId));

    return {
      id: notificationId,
      is_read: true,
      message: 'Notification marked as read',
    };
  }

  /**
   * Mark all of a user's notifications as read.
   */
  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ is_read: true })
      .where(
        and(
          eq(notifications.user_id, userId),
          eq(notifications.is_read, false),
        ),
      );

    this.logger.log(`All notifications marked as read for user ${userId}`);

    return {
      message: 'All notifications marked as read',
    };
  }
}
