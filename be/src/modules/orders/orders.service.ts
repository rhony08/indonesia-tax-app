import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

const { orders, payments, consultants, users } = schema;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  /**
   * List orders for a user with optional status filter and pagination
   */
  async findAll(userId: string, filters: QueryOrderDto) {
    const { status, page = 1, limit = 10 } = filters;

    const conditions = [eq(orders.user_id, userId)];
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    const whereClause = and(...conditions);

    const countResult = await db
      .select({ total: count() })
      .from(orders)
      .where(whereClause);

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
        created_at: orders.created_at,
        updated_at: orders.updated_at,
        consultant_name: users.name,
      })
      .from(orders)
      .leftJoin(consultants, eq(orders.consultant_id, consultants.id))
      .leftJoin(users, eq(consultants.user_id, users.id))
      .where(whereClause)
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);

    return {
      data: items,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Create a new order
   */
  async create(userId: string, dto: CreateOrderDto) {
    const { consultant_id, service_type, amount, consultation_id } = dto;

    // Verify consultant exists
    const consultantResult = await db
      .select({ id: consultants.id })
      .from(consultants)
      .where(eq(consultants.id, consultant_id))
      .limit(1);

    if (!consultantResult.length) {
      throw new NotFoundException('Consultant not found');
    }

    // Prevent self-ordering
    const consultantUser = await db
      .select({ user_id: consultants.user_id })
      .from(consultants)
      .where(eq(consultants.id, consultant_id))
      .limit(1);

    if (consultantUser[0]?.user_id === userId) {
      throw new BadRequestException('You cannot create an order with yourself');
    }

    const commissionRate = 0.25;
    const platformFee = Math.round(amount * commissionRate);

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(orders).values({
      id,
      user_id: userId,
      consultant_id,
      consultation_id: consultation_id ?? null,
      service_type,
      amount,
      platform_fee: platformFee,
      commission_rate: commissionRate,
      status: 'pending',
      created_at: now,
      updated_at: now,
    });

    this.logger.log(`Order created: ${id} by user ${userId}`);

    return this.findById(id);
  }

  /**
   * Get order by ID with payment details
   */
  async findById(id: string) {
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
        created_at: orders.created_at,
        updated_at: orders.updated_at,
        consultant_name: users.name,
      })
      .from(orders)
      .leftJoin(consultants, eq(orders.consultant_id, consultants.id))
      .leftJoin(users, eq(consultants.user_id, users.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Order not found');
    }

    const order = result[0];

    // Fetch associated payment
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
      .where(eq(payments.order_id, id))
      .limit(1);

    return {
      ...order,
      payment: paymentResult.length > 0 ? paymentResult[0] : null,
    };
  }

  /**
   * Initiate payment for an order (mock Midtrans)
   */
  async initiatePayment(orderId: string, userId: string) {
    const order = await db
      .select({
        id: orders.id,
        user_id: orders.user_id,
        amount: orders.amount,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order.length) {
      throw new NotFoundException('Order not found');
    }

    if (order[0].user_id !== userId) {
      throw new BadRequestException('You can only pay for your own orders');
    }

    if (order[0].status !== 'pending') {
      throw new BadRequestException(
        `Cannot pay for an order with status: ${order[0].status}`,
      );
    }

    // Check if payment already exists
    const existingPayment = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.order_id, orderId))
      .limit(1);

    if (existingPayment.length) {
      throw new BadRequestException('Payment already initiated for this order');
    }

    const paymentId = uuidv4();
    const externalId = `MID-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    const now = new Date().toISOString();

    await db.insert(payments).values({
      id: paymentId,
      order_id: orderId,
      method: null,
      external_id: externalId,
      status: 'pending',
      amount: order[0].amount,
      created_at: now,
    });

    this.logger.log(
      `Payment initiated: ${paymentId} for order ${orderId}, external_id: ${externalId}`,
    );

    return {
      id: paymentId,
      order_id: orderId,
      external_id: externalId,
      status: 'pending',
      amount: order[0].amount,
      payment_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${externalId}`,
    };
  }
}
