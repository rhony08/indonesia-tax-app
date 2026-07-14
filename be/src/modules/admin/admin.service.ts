import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, count, sql, sum } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { AdminQueryDto } from './dto/admin-query.dto';
import { VerifyConsultantDto } from './dto/verify-consultant.dto';

const { users, consultants, orders, payments, payoutLogs } = schema;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  /**
   * Get dashboard statistics: total users, consultants, orders, and revenue.
   */
  async getDashboard() {
    const totalUsersResult = await db.select({ total: count() }).from(users);

    const totalConsultantsResult = await db
      .select({ total: count() })
      .from(consultants);

    const totalOrdersResult = await db.select({ total: count() }).from(orders);

    const revenueResult = await db
      .select({ total: sum(orders.amount) })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    return {
      total_users: Number(totalUsersResult[0]?.total ?? 0),
      total_consultants: Number(totalConsultantsResult[0]?.total ?? 0),
      total_orders: Number(totalOrdersResult[0]?.total ?? 0),
      total_revenue: Number(revenueResult[0]?.total ?? 0),
    };
  }

  /**
   * List all consultants with pagination and optional verified filter.
   */
  async getConsultants(query: AdminQueryDto) {
    const { page = 1, limit = 10, is_verified } = query;

    const conditions: ReturnType<typeof eq>[] = [];
    if (is_verified !== undefined) {
      conditions.push(eq(consultants.is_verified, is_verified));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db
      .select({ total: count() })
      .from(consultants)
      .where(whereClause);

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: consultants.id,
        user_id: consultants.user_id,
        name: users.name,
        email: users.email,
        cert_level: consultants.cert_level,
        cert_number: consultants.cert_number,
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
      .where(whereClause)
      .orderBy(desc(consultants.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Approve or reject consultant verification.
   */
  async verifyConsultant(consultantId: string, dto: VerifyConsultantDto) {
    const consultantResult = await db
      .select({ id: consultants.id, is_verified: consultants.is_verified })
      .from(consultants)
      .where(eq(consultants.id, consultantId))
      .limit(1);

    if (!consultantResult.length) {
      throw new NotFoundException('Consultant not found');
    }

    await db
      .update(consultants)
      .set({
        is_verified: dto.is_verified,
        updated_at: new Date().toISOString(),
      })
      .where(eq(consultants.id, consultantId));

    this.logger.log(
      `Consultant ${consultantId} verification set to: ${dto.is_verified}`,
    );

    return {
      id: consultantId,
      is_verified: dto.is_verified,
      message: dto.is_verified
        ? 'Consultant verified successfully'
        : 'Consultant verification revoked',
    };
  }

  /**
   * List all orders with pagination.
   */
  async getOrders(query: AdminQueryDto) {
    const { page = 1, limit = 10 } = query;

    const countResult = await db.select({ total: count() }).from(orders);

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        consultant_id: orders.consultant_id,
        consultation_id: orders.consultation_id,
        service_type: orders.service_type,
        amount: orders.amount,
        platform_fee: orders.platform_fee,
        commission_rate: orders.commission_rate,
        status: orders.status,
        user_name: users.name,
        created_at: orders.created_at,
        updated_at: orders.updated_at,
      })
      .from(orders)
      .leftJoin(users, eq(orders.user_id, users.id))
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Get order detail by ID.
   */
  async getOrderById(orderId: string) {
    const result = await db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        consultant_id: orders.consultant_id,
        consultation_id: orders.consultation_id,
        service_type: orders.service_type,
        amount: orders.amount,
        platform_fee: orders.platform_fee,
        commission_rate: orders.commission_rate,
        status: orders.status,
        user_name: users.name,
        user_email: users.email,
        created_at: orders.created_at,
        updated_at: orders.updated_at,
      })
      .from(orders)
      .leftJoin(users, eq(orders.user_id, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Order not found');
    }

    const paymentResult = await db
      .select({
        id: payments.id,
        method: payments.method,
        external_id: payments.external_id,
        status: payments.status,
        amount: payments.amount,
        paid_at: payments.paid_at,
        created_at: payments.created_at,
      })
      .from(payments)
      .where(eq(payments.order_id, orderId));

    return {
      ...result[0],
      payments: paymentResult,
    };
  }

  /**
   * Process a refund for an order.
   */
  async refundOrder(orderId: string) {
    const orderResult = await db
      .select({
        id: orders.id,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      throw new NotFoundException('Order not found');
    }

    if (orderResult[0].status === 'refunded') {
      throw new BadRequestException('Order has already been refunded');
    }

    if (orderResult[0].status !== 'completed') {
      throw new BadRequestException('Only completed orders can be refunded');
    }

    await db
      .update(orders)
      .set({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .where(eq(orders.id, orderId));

    this.logger.log(`Order ${orderId} refunded`);

    return {
      id: orderId,
      status: 'refunded',
      message: 'Order refunded successfully',
    };
  }

  /**
   * List payout logs with pagination.
   */
  async getPayouts(query: AdminQueryDto) {
    const { page = 1, limit = 10 } = query;

    const countResult = await db.select({ total: count() }).from(payoutLogs);

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: payoutLogs.id,
        consultant_id: payoutLogs.consultant_id,
        amount: payoutLogs.amount,
        period_start: payoutLogs.period_start,
        period_end: payoutLogs.period_end,
        status: payoutLogs.status,
        reference: payoutLogs.reference,
        created_at: payoutLogs.created_at,
      })
      .from(payoutLogs)
      .orderBy(desc(payoutLogs.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Process pending payouts: sum up consultant earnings for the past week
   * from completed orders and create payout_log entries.
   */
  async processPayouts() {
    const now = new Date();
    const oneWeekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const nowIso = now.toISOString();

    const completedOrders = await db
      .select({
        consultant_id: orders.consultant_id,
        amount: orders.amount,
        platform_fee: orders.platform_fee,
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          sql`${orders.updated_at} >= ${oneWeekAgo}`,
        ),
      );

    if (!completedOrders.length) {
      return {
        message: 'No completed orders found for the past week',
        payouts_processed: 0,
      };
    }

    const consultantEarnings = new Map<
      string,
      { totalAmount: number; count: number }
    >();

    for (const order of completedOrders) {
      const earnings = order.amount - order.platform_fee;
      const existing = consultantEarnings.get(order.consultant_id);

      if (existing) {
        existing.totalAmount += earnings;
        existing.count += 1;
      } else {
        consultantEarnings.set(order.consultant_id, {
          totalAmount: earnings,
          count: 1,
        });
      }
    }

    const payouts: Array<{ consultant_id: string; amount: number }> = [];
    const nowStr = now.toISOString();

    for (const [consultantId, data] of consultantEarnings) {
      const payoutId = uuidv4();

      await db.insert(payoutLogs).values({
        id: payoutId,
        consultant_id: consultantId,
        amount: data.totalAmount,
        period_start: oneWeekAgo,
        period_end: nowIso,
        status: 'pending',
        reference: null,
        created_at: nowStr,
      });

      payouts.push({
        consultant_id: consultantId,
        amount: data.totalAmount,
      });
    }

    this.logger.log(`Processed ${payouts.length} payouts for the past week`);

    return {
      message: 'Payouts processed successfully',
      period_start: oneWeekAgo,
      period_end: nowIso,
      payouts_processed: payouts.length,
      payouts,
    };
  }
}
