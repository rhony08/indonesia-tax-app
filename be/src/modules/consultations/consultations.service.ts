import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { QueryConsultationDto } from './dto/query-consultation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

const { consultations, messages, consultants } = schema;

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  /**
   * Get the consultant profile ID for a given user ID.
   */
  private async getConsultantIdByUserId(
    userId: string,
  ): Promise<string | undefined> {
    const result = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.user_id, userId))
      .limit(1);

    return result.length > 0 ? result[0].id : undefined;
  }

  /**
   * Verify that a user is a participant in a consultation.
   * A user is a participant if they are the client (user_id) or the consultant
   * (their consultant profile ID matches consultation.consultant_id).
   */
  private async verifyParticipant(consultationId: string, userId: string) {
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Consultation not found');
    }

    const consultation = result[0];

    // Check if user is the client
    if (consultation.user_id === userId) {
      return consultation;
    }

    // Check if user is the consultant (by looking up their consultant profile)
    const consultantId = await this.getConsultantIdByUserId(userId);
    if (consultantId && consultation.consultant_id === consultantId) {
      return consultation;
    }

    throw new ForbiddenException(
      'You are not a participant in this consultation',
    );
  }

  /**
   * Get paginated list of consultations for a user.
   * Shows consultations where user is the client (user_id) or the consultant.
   */
  async findByUser(userId: string, filters: QueryConsultationDto) {
    const { status, page = 1, limit = 10 } = filters;

    // Get the user's consultant profile if any
    const consultantId = await this.getConsultantIdByUserId(userId);

    const clientCond = eq(consultations.user_id, userId);
    const consultantCond = consultantId
      ? eq(consultations.consultant_id, consultantId)
      : undefined;

    // Build WHERE clause for counting
    let countResult: { total: number }[];
    if (status) {
      if (consultantCond) {
        // Count where (user_id = X OR consultant_id = Y) AND status = Z
        // drizzle doesn't have OR natively; use raw approach with two queries
        const clientCount = await db
          .select({ total: count() })
          .from(consultations)
          .where(and(clientCond, eq(consultations.status, status)));
        const consultantCount = await db
          .select({ total: count() })
          .from(consultations)
          .where(and(consultantCond, eq(consultations.status, status)));
        const total =
          Number(clientCount[0]?.total ?? 0) +
          Number(consultantCount[0]?.total ?? 0);
        countResult = [{ total }];
      } else {
        countResult = await db
          .select({ total: count() })
          .from(consultations)
          .where(and(clientCond, eq(consultations.status, status)));
      }
    } else {
      if (consultantCond) {
        const clientCount = await db
          .select({ total: count() })
          .from(consultations)
          .where(clientCond);
        const consultantCount = await db
          .select({ total: count() })
          .from(consultations)
          .where(consultantCond);
        const total =
          Number(clientCount[0]?.total ?? 0) +
          Number(consultantCount[0]?.total ?? 0);
        countResult = [{ total }];
      } else {
        countResult = await db
          .select({ total: count() })
          .from(consultations)
          .where(clientCond);
      }
    }

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch items: first client consultations, then consultant consultations
    const clientItems = await db
      .select()
      .from(consultations)
      .where(
        status ? and(clientCond, eq(consultations.status, status)) : clientCond,
      )
      .orderBy(desc(consultations.created_at));

    let consultantItems: typeof clientItems = [];
    if (consultantCond) {
      consultantItems = await db
        .select()
        .from(consultations)
        .where(
          status
            ? and(consultantCond, eq(consultations.status, status))
            : consultantCond,
        )
        .orderBy(desc(consultations.created_at));
    }

    // Merge and sort all items by created_at descending
    const allItems = [...clientItems, ...consultantItems].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Apply pagination to the merged list
    const paginatedItems = allItems.slice(offset, offset + limit);

    return {
      data: paginatedItems,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Get a single consultation by ID.
   * The caller must be a participant.
   */
  async findById(consultationId: string, userId: string) {
    return this.verifyParticipant(consultationId, userId);
  }

  /**
   * Send a chat message in a consultation.
   * The caller must be a participant and the consultation must be active.
   */
  async sendMessage(
    consultationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    // Verify the consultation exists and the sender is a participant
    const consultation = await this.verifyParticipant(consultationId, senderId);

    if (consultation.status !== 'active') {
      throw new ForbiddenException(
        'Cannot send messages to a consultation that is not active',
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(messages).values({
      id,
      consultation_id: consultationId,
      sender_id: senderId,
      content: dto.content,
      type: dto.type || 'text',
      file_url: dto.file_url || null,
      file_name: dto.file_name || null,
      is_read: false,
      created_at: now,
    });

    this.logger.log(
      `Message sent in consultation ${consultationId} by ${senderId}`,
    );

    return {
      id,
      consultation_id: consultationId,
      sender_id: senderId,
      content: dto.content,
      type: dto.type || 'text',
      file_url: dto.file_url || null,
      file_name: dto.file_name || null,
      is_read: false,
      created_at: now,
    };
  }

  /**
   * Get paginated chat messages for a consultation.
   * The caller must be a participant.
   */
  async getMessages(
    consultationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    // Verify the consultation exists and user is a participant
    await this.verifyParticipant(consultationId, userId);

    const countResult = await db
      .select({ total: count() })
      .from(messages)
      .where(eq(messages.consultation_id, consultationId));

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select()
      .from(messages)
      .where(eq(messages.consultation_id, consultationId))
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .offset(offset);

    // Return in chronological order (oldest first) for chat display
    return {
      data: items.reverse(),
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Update the status of a consultation.
   * Only the consultant can update the status (enforced by @Roles guard on controller).
   */
  async updateStatus(
    consultationId: string,
    userId: string,
    dto: UpdateStatusDto,
  ) {
    // Verify the consultation exists and user is a participant
    await this.verifyParticipant(consultationId, userId);

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      status: dto.status,
      updated_at: now,
    };

    // Set started_at when consultation becomes active
    if (dto.status === 'active') {
      updateData.started_at = now;
    }

    // Set ended_at when consultation is completed or cancelled
    if (dto.status === 'completed' || dto.status === 'cancelled') {
      updateData.ended_at = now;
    }

    await db
      .update(consultations)
      .set(updateData)
      .where(eq(consultations.id, consultationId));

    this.logger.log(
      `Consultation ${consultationId} status updated to ${dto.status} by ${userId}`,
    );

    // Fetch and return the updated consultation
    const result = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);

    return result[0];
  }
}
