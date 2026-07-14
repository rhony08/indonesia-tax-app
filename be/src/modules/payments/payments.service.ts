import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

const { payments, orders } = schema;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  /**
   * Process Midtrans webhook callback
   * Updates payment and order status based on transaction_status
   */
  async handleCallback(dto: PaymentCallbackDto) {
    const { order_id, transaction_status, fraud_status, payment_type } = dto;

    this.logger.log(
      `Payment callback received: order_id=${order_id}, transaction_status=${transaction_status}, fraud_status=${fraud_status}`,
    );

    // Find the payment by order_id
    const paymentResult = await db
      .select({
        id: payments.id,
        order_id: payments.order_id,
        status: payments.status,
        amount: payments.amount,
      })
      .from(payments)
      .where(eq(payments.order_id, order_id))
      .limit(1);

    if (!paymentResult.length) {
      this.logger.warn(`Payment not found for order_id: ${order_id}`);
      throw new NotFoundException(
        `Payment not found for order_id: ${order_id}`,
      );
    }

    const payment = paymentResult[0];

    // Determine payment status
    const paymentStatus = this.mapTransactionStatus(
      transaction_status,
      fraud_status,
    );

    // Update payment record
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status: paymentStatus,
    };

    if (payment_type) {
      updateData.method = payment_type;
    }

    if (paymentStatus === 'settlement') {
      updateData.paid_at = now;
    }

    await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, payment.id));

    // Map payment status to order status and update order
    const orderStatus = this.mapPaymentToOrderStatus(paymentStatus);

    await db
      .update(orders)
      .set({
        status: orderStatus,
        updated_at: now,
      })
      .where(eq(orders.id, order_id));

    this.logger.log(
      `Payment ${payment.id} updated to ${paymentStatus}, order ${order_id} updated to ${orderStatus}`,
    );

    return {
      success: true,
      payment_status: paymentStatus,
      order_status: orderStatus,
    };
  }

  /**
   * Get payment status by payment ID
   */
  async getStatus(paymentId: string) {
    const result = await db
      .select({
        id: payments.id,
        order_id: payments.order_id,
        method: payments.method,
        external_id: payments.external_id,
        status: payments.status,
        amount: payments.amount,
        paid_at: payments.paid_at,
        created_at: payments.created_at,
      })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Payment not found');
    }

    // Also fetch current order status
    const orderResult = await db
      .select({
        id: orders.id,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, result[0].order_id))
      .limit(1);

    return {
      ...result[0],
      order_status: orderResult.length > 0 ? orderResult[0].status : null,
    };
  }

  /**
   * Map Midtrans transaction status to internal payment status
   */
  private mapTransactionStatus(
    transaction_status: string,
    fraud_status: string,
  ): string {
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        return 'settlement';
      } else if (fraud_status === 'challenge') {
        return 'pending';
      } else {
        return 'deny';
      }
    }

    switch (transaction_status) {
      case 'settlement':
        return 'settlement';
      case 'pending':
        return 'pending';
      case 'deny':
        return 'deny';
      case 'cancel':
        return 'cancel';
      case 'expire':
        return 'expire';
      case 'refund':
        return 'refund';
      default:
        return 'pending';
    }
  }

  /**
   * Map payment status to order status
   */
  private mapPaymentToOrderStatus(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'settlement':
      case 'capture':
        return 'paid';
      case 'deny':
      case 'cancel':
        return 'cancelled';
      case 'expire':
        return 'cancelled';
      case 'refund':
        return 'refunded';
      case 'pending':
      default:
        return 'pending';
    }
  }
}
