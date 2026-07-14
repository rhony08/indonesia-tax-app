import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/callback
   * Public endpoint: Midtrans webhook callback
   */
  @Public()
  @Post('callback')
  @ApiOperation({
    summary: 'Midtrans webhook callback',
    description:
      'Handles payment notification from Midtrans. This is a public endpoint called by Midtrans servers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Callback processed successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async handleCallback(@Body() dto: PaymentCallbackDto) {
    const result = await this.paymentsService.handleCallback(dto);
    return {
      success: true,
      data: result,
      message: 'Payment callback processed successfully',
    };
  }

  /**
   * GET /payments/:id/status
   * Authenticated: check payment status
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/status')
  @ApiOperation({
    summary: 'Get payment status',
    description:
      'Returns the current status of a payment record. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getStatus(@CurrentUser() _user: JwtPayload, @Param('id') id: string) {
    const result = await this.paymentsService.getStatus(id);
    return { success: true, data: result };
  }
}
