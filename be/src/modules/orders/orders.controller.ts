import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * List user's orders with optional status filter and pagination
   */
  @Get()
  @ApiOperation({
    summary: "Get user's orders",
    description:
      'Returns a paginated list of the authenticated user’s orders with optional status filtering.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: QueryOrderDto,
  ) {
    const result = await this.ordersService.findAll(
      user.id ?? user.sub,
      filters,
    );
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * POST /orders
   * Create a new order
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order for a tax consultation. Platform fee is automatically calculated.',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(user.id ?? user.sub, dto);
    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    };
  }

  /**
   * GET /orders/:id
   * Get order detail
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get order detail',
    description:
      'Returns detailed information about a specific order including payment details.',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findById(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    return { success: true, data: order };
  }

  /**
   * POST /orders/:id/pay
   * Initiate payment for an order (mock Midtrans)
   */
  @Post(':id/pay')
  @ApiOperation({
    summary: 'Initiate payment',
    description:
      'Creates a payment record for the order with a mock Midtrans external ID and payment URL.',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async initiatePayment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    const result = await this.ordersService.initiatePayment(
      id,
      user.id ?? user.sub,
    );
    return {
      success: true,
      data: result,
      message: 'Payment initiated successfully',
    };
  }
}
