import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc, count, sql } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { CreateReviewDto } from './dto/create-review.dto';

const { reviews, users, consultations, consultants } = schema;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  /**
   * Create a new review for a consultation.
   * Updates the consultant's average rating and review count.
   */
  async create(userId: string, dto: CreateReviewDto) {
    const { consultation_id, rating, comment } = dto;

    const consultationResult = await db
      .select({
        id: consultations.id,
        user_id: consultations.user_id,
        consultant_id: consultations.consultant_id,
        status: consultations.status,
      })
      .from(consultations)
      .where(eq(consultations.id, consultation_id))
      .limit(1);

    if (!consultationResult.length) {
      throw new NotFoundException('Consultation not found');
    }

    const consultation = consultationResult[0];

    if (consultation.user_id !== userId) {
      throw new BadRequestException(
        'You can only review your own consultations',
      );
    }

    if (consultation.status !== 'completed') {
      throw new BadRequestException(
        'You can only review completed consultations',
      );
    }

    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.consultation_id, consultation_id))
      .limit(1);

    if (existingReview.length) {
      throw new ConflictException(
        'You have already reviewed this consultation',
      );
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(reviews).values({
      id,
      consultation_id,
      user_id: userId,
      consultant_id: consultation.consultant_id,
      rating,
      comment: comment || null,
      created_at: now,
    });

    const statsResult = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        total: count(),
      })
      .from(reviews)
      .where(eq(reviews.consultant_id, consultation.consultant_id));

    const avgRating = Number(statsResult[0]?.avgRating ?? 0);
    const totalReviews = Number(statsResult[0]?.total ?? 0);

    await db
      .update(consultants)
      .set({
        rating: Math.round(avgRating * 100) / 100,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString(),
      })
      .where(eq(consultants.id, consultation.consultant_id));

    this.logger.log(
      `Review created: ${id} for consultant ${consultation.consultant_id}, rating ${rating}`,
    );

    return {
      id,
      consultation_id,
      rating,
      comment: comment || null,
      created_at: now,
    };
  }

  /**
   * Get paginated reviews for a consultant (public).
   */
  async findByConsultantId(consultantId: string, page = 1, limit = 10) {
    const countResult = await db
      .select({ total: count() })
      .from(reviews)
      .where(eq(reviews.consultant_id, consultantId));

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        user_name: users.name,
        user_avatar: users.avatar_url,
        created_at: reviews.created_at,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.user_id, users.id))
      .where(eq(reviews.consultant_id, consultantId))
      .orderBy(desc(reviews.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }
}
