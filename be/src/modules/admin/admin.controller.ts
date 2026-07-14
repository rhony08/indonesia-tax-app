import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { VerifyConsultantDto } from './dto/verify-consultant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/dashboard
   * Admin only: dashboard statistics
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard stats',
    description:
      'Returns total users, consultants, orders, and revenue. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getDashboard() {
    const data = await this.adminService.getDashboard();
    return { success: true, data };
  }

  /**
   * GET /admin/consultants
   * Admin only: list all consultants
   */
  @Get('consultants')
  @ApiOperation({
    summary: 'List all consultants',
    description:
      'Returns all consultants with pagination and optional verified filter. Admin only.',
  })
  @ApiQuery({
    name: 'is_verified',
    required: false,
    type: Boolean,
    description: 'Filter by verified status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of consultants',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getConsultants(@Query() query: AdminQueryDto) {
    const result = await this.adminService.getConsultants(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * PATCH /admin/consultants/:id/verify
   * Admin only: approve/reject consultant verification
   */
  @Patch('consultants/:id/verify')
  @ApiOperation({
    summary: 'Verify or unverify a consultant',
    description: 'Approve or reject consultant verification. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consultant verification updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async verifyConsultant(
    @Param('id') id: string,
    @Body() dto: VerifyConsultantDto,
  ) {
    const data = await this.adminService.verifyConsultant(id, dto);
    return { success: true, data };
  }

  /**
   * GET /admin/orders
   * Admin only: list all orders
   */
  @Get('orders')
  @ApiOperation({
    summary: 'List all orders',
    description: 'Returns all orders with pagination. Admin only.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of orders',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getOrders(@Query() query: AdminQueryDto) {
    const result = await this.adminService.getOrders(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * GET /admin/orders/:id
   * Admin only: order detail with payment info
   */
  @Get('orders/:id')
  @ApiOperation({
    summary: 'Get order detail',
    description:
      'Returns order detail including payment information. Admin only.',
  })
  @ApiResponse({ status: 200, description: 'Order detail with payments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string) {
    const data = await this.adminService.getOrderById(id);
    return { success: true, data };
  }

  /**
   * PATCH /admin/orders/:id/refund
   * Admin only: process refund for an order
   */
  @Patch('orders/:id/refund')
  @ApiOperation({
    summary: 'Process refund',
    description:
      'Process a refund for a completed order. Changes order status to refunded. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order refunded successfully',
  })
  @ApiResponse({ status: 400, description: 'Order cannot be refunded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async refundOrder(@Param('id') id: string) {
    const data = await this.adminService.refundOrder(id);
    return { success: true, data };
  }

  /**
   * GET /admin/payouts
   * Admin only: list payout logs
   */
  @Get('payouts')
  @ApiOperation({
    summary: 'List payout logs',
    description: 'Returns all payout logs with pagination. Admin only.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payout logs',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getPayouts(@Query() query: AdminQueryDto) {
    const result = await this.adminService.getPayouts(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * POST /admin/payouts/process
   * Admin only: process pending payouts (weekly batch)
   */
  @Post('payouts/process')
  @ApiOperation({
    summary: 'Process pending payouts',
    description:
      'Process pending payouts for the past week. Sums up consultant earnings from completed orders and creates payout log entries. Admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payouts processed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async processPayouts() {
    const data = await this.adminService.processPayouts();
    return { success: true, data };
  }
}
