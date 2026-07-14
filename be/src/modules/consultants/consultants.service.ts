import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, like, gte, lte, desc, asc, count } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { UpdateConsultantDto } from './dto/update-consultant.dto';
import { QueryConsultantDto } from './dto/query-consultant.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { ScheduleDto } from './dto/schedule.dto';

const {
  users,
  consultants,
  consultantSchedules,
  consultations,
  reviews,
  orders,
} = schema;

@Injectable()
export class ConsultantsService {
  private readonly logger = new Logger(ConsultantsService.name);

  /**
   * Search consultants with filters, pagination, and sorting
   */
  async findAll(filters: QueryConsultantDto) {
    const {
      specialization,
      cert_level,
      min_rating,
      max_rating,
      min_price,
      max_price,
      is_online,
      search,
      page = 1,
      limit = 10,
      sort_by = 'rating',
      sort_order = 'desc',
    } = filters;

    const conditions: ReturnType<typeof eq>[] = [];

    if (cert_level) {
      conditions.push(eq(consultants.cert_level, cert_level));
    }
    if (min_rating != null) {
      conditions.push(gte(consultants.rating, min_rating));
    }
    if (max_rating != null) {
      conditions.push(lte(consultants.rating, max_rating));
    }
    if (min_price != null) {
      conditions.push(gte(consultants.price_per_session, min_price));
    }
    if (max_price != null) {
      conditions.push(lte(consultants.price_per_session, max_price));
    }
    if (is_online != null) {
      conditions.push(eq(consultants.is_online, is_online));
    }
    if (specialization) {
      conditions.push(like(consultants.specializations, `%${specialization}%`));
    }
    if (search) {
      conditions.push(like(users.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn =
      sort_by === 'price'
        ? consultants.price_per_session
        : sort_by === 'sessions'
          ? consultants.total_sessions
          : consultants.rating;

    const orderFn = sort_order === 'asc' ? asc : desc;

    const countResult = await db
      .select({ total: count() })
      .from(consultants)
      .leftJoin(users, eq(consultants.user_id, users.id))
      .where(whereClause);

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: consultants.id,
        user_id: consultants.user_id,
        name: users.name,
        avatar_url: users.avatar_url,
        cert_level: consultants.cert_level,
        specializations: consultants.specializations,
        price_per_session: consultants.price_per_session,
        rating: consultants.rating,
        total_reviews: consultants.total_reviews,
        total_sessions: consultants.total_sessions,
        is_online: consultants.is_online,
        is_verified: consultants.is_verified,
        created_at: consultants.created_at,
      })
      .from(consultants)
      .leftJoin(users, eq(consultants.user_id, users.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    const parsedItems = items.map((item) => ({
      ...item,
      specializations: this.parseSpecializations(item.specializations),
    }));

    return {
      data: parsedItems,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Get top recommended consultants by rating, online status, and session count
   */
  async findRecommended(limit = 6) {
    const items = await db
      .select({
        id: consultants.id,
        user_id: consultants.user_id,
        name: users.name,
        avatar_url: users.avatar_url,
        cert_level: consultants.cert_level,
        specializations: consultants.specializations,
        price_per_session: consultants.price_per_session,
        rating: consultants.rating,
        total_reviews: consultants.total_reviews,
        total_sessions: consultants.total_sessions,
        is_online: consultants.is_online,
        is_verified: consultants.is_verified,
        created_at: consultants.created_at,
      })
      .from(consultants)
      .leftJoin(users, eq(consultants.user_id, users.id))
      .orderBy(
        desc(consultants.rating),
        desc(consultants.is_online),
        desc(consultants.total_sessions),
      )
      .limit(limit);

    return items.map((item) => ({
      ...item,
      specializations: this.parseSpecializations(item.specializations),
    }));
  }

  /**
   * Get consultant profile with user data
   */
  async findById(id: string) {
    const result = await db
      .select({
        id: consultants.id,
        user_id: consultants.user_id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar_url: users.avatar_url,
        cert_level: consultants.cert_level,
        cert_number: consultants.cert_number,
        izin_praktik: consultants.izin_praktik,
        specializations: consultants.specializations,
        bio: consultants.bio,
        price_per_session: consultants.price_per_session,
        rating: consultants.rating,
        total_reviews: consultants.total_reviews,
        total_sessions: consultants.total_sessions,
        is_verified: consultants.is_verified,
        is_online: consultants.is_online,
        created_at: consultants.created_at,
      })
      .from(consultants)
      .leftJoin(users, eq(consultants.user_id, users.id))
      .where(eq(consultants.id, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const consultant = result[0];
    return {
      ...consultant,
      specializations: this.parseSpecializations(consultant.specializations),
    };
  }

  /**
   * Find consultant by user ID
   */
  async findByUserId(userId: string) {
    const result = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.user_id, userId))
      .limit(1);

    return result.length > 0 ? this.findById(result[0].id) : null;
  }

  /**
   * Get consultant availability schedule
   */
  async getAvailability(consultantId: string) {
    const schedule = await db
      .select({
        id: consultantSchedules.id,
        day_of_week: consultantSchedules.day_of_week,
        start_time: consultantSchedules.start_time,
        end_time: consultantSchedules.end_time,
        is_active: consultantSchedules.is_active,
      })
      .from(consultantSchedules)
      .where(
        and(
          eq(consultantSchedules.consultant_id, consultantId),
          eq(consultantSchedules.is_active, true),
        ),
      )
      .orderBy(
        asc(consultantSchedules.day_of_week),
        asc(consultantSchedules.start_time),
      );

    return schedule;
  }

  /**
   * Set consultant availability schedule (replaces existing)
   */
  async createSchedule(consultantId: string, schedule: ScheduleDto[]) {
    const now = new Date().toISOString();

    await db
      .update(consultantSchedules)
      .set({ is_active: false })
      .where(eq(consultantSchedules.consultant_id, consultantId));

    if (schedule.length > 0) {
      const values = schedule.map((s) => ({
        id: uuidv4(),
        consultant_id: consultantId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: true,
        created_at: now,
      }));

      await db.insert(consultantSchedules).values(values);
    }

    return this.getAvailability(consultantId);
  }

  /**
   * Get paginated reviews for a consultant
   */
  async getReviews(consultantId: string, page = 1, limit = 10) {
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

  /**
   * Register a user as a consultant
   */
  async createConsultant(userId: string, data: CreateConsultantDto) {
    const userResult = await db
      .select({ id: users.id, npwp: users.npwp })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length) {
      throw new NotFoundException('User not found');
    }

    if (!userResult[0].npwp) {
      throw new BadRequestException(
        'NPWP is required to register as a consultant',
      );
    }

    const existing = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.user_id, userId))
      .limit(1);

    if (existing.length) {
      throw new ConflictException('User is already registered as a consultant');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(consultants).values({
      id,
      user_id: userId,
      cert_level: data.cert_level,
      cert_number: data.cert_number,
      izin_praktik: data.izin_praktik || null,
      specializations: JSON.stringify(data.specializations),
      bio: data.bio || null,
      price_per_session: data.price_per_session ?? 100000,
      rating: 0,
      total_reviews: 0,
      total_sessions: 0,
      is_verified: true,
      is_online: false,
      created_at: now,
      updated_at: now,
    });

    this.logger.log(`New consultant registered: ${id} (user: ${userId})`);

    return this.findById(id);
  }

  /**
   * Update consultant profile
   */
  async updateConsultant(userId: string, data: UpdateConsultantDto) {
    const consultantResult = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.user_id, userId))
      .limit(1);

    if (!consultantResult.length) {
      throw new NotFoundException('Consultant profile not found');
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.cert_level !== undefined) {
      updateData.cert_level = data.cert_level;
    }
    if (data.cert_number !== undefined) {
      updateData.cert_number = data.cert_number;
    }
    if (data.izin_praktik !== undefined) {
      updateData.izin_praktik = data.izin_praktik;
    }
    if (data.specializations !== undefined) {
      updateData.specializations = JSON.stringify(data.specializations);
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }
    if (data.price_per_session !== undefined) {
      updateData.price_per_session = data.price_per_session;
    }
    if (data.is_online !== undefined) {
      updateData.is_online = data.is_online;
    }

    await db
      .update(consultants)
      .set(updateData)
      .where(eq(consultants.user_id, userId));

    this.logger.log(`Consultant profile updated for user: ${userId}`);

    return this.findById(consultantResult[0].id);
  }

  /**
   * Book a consultation session with a consultant
   */
  async bookSession(
    userId: string,
    consultantId: string,
    data: BookSessionDto,
  ) {
    const consultantResult = await db
      .select({
        id: consultants.id,
        price_per_session: consultants.price_per_session,
        user_id: consultants.user_id,
      })
      .from(consultants)
      .where(eq(consultants.id, consultantId))
      .limit(1);

    if (!consultantResult.length) {
      throw new NotFoundException('Consultant not found');
    }

    if (consultantResult[0].user_id === userId) {
      throw new BadRequestException('You cannot book a session with yourself');
    }

    const consultationId = uuidv4();
    const orderId = uuidv4();
    const now = new Date().toISOString();

    await db.insert(consultations).values({
      id: consultationId,
      user_id: userId,
      consultant_id: consultantId,
      type: data.type,
      status: 'pending',
      created_at: now,
      updated_at: now,
    });

    const amount = consultantResult[0].price_per_session;
    const platformFee = Math.round(amount * 0.25);

    await db.insert(orders).values({
      id: orderId,
      user_id: userId,
      consultant_id: consultantId,
      consultation_id: consultationId,
      service_type: data.service_type || data.type,
      amount,
      platform_fee: platformFee,
      commission_rate: 0.25,
      status: 'pending',
      created_at: now,
      updated_at: now,
    });

    this.logger.log(
      `Session booked: consultation=${consultationId}, order=${orderId}`,
    );

    return {
      id: consultationId,
      status: 'pending',
      type: data.type,
      order_id: orderId,
      amount,
      created_at: now,
    };
  }

  /**
   * Safely parse specializations JSON string to array
   */
  private parseSpecializations(raw: unknown): string[] {
    if (!raw || typeof raw !== 'string') {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [raw];
    } catch {
      return typeof raw === 'string' ? [raw] : [];
    }
  }
}
