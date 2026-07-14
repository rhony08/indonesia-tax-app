import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryConsultationDto } from './dto/query-consultation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  /**
   * GET /consultations
   * List the current user's consultations with pagination and optional status filter.
   */
  @Get()
  @ApiOperation({
    summary: "List user's consultations",
    description:
      "Returns paginated list of the authenticated user's consultations. Filter by status.",
  })
  @ApiResponse({ status: 200, description: 'Paginated list of consultations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() filters: QueryConsultationDto,
  ) {
    const result = await this.consultationsService.findByUser(
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
   * GET /consultations/:id
   * Get a single consultation by ID. The user must be a participant.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get consultation detail',
    description:
      'Returns the full details of a consultation. User must be a participant.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({ status: 200, description: 'Consultation detail' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a participant' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.consultationsService.findById(
      id,
      user.id ?? user.sub,
    );
    return { success: true, data };
  }

  /**
   * POST /consultations/:id/message
   * Send a chat message in a consultation. User must be a participant.
   */
  @Post(':id/message')
  @ApiOperation({
    summary: 'Send a chat message',
    description:
      'Send a message in a consultation. User must be a participant and the consultation must be active.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a participant or not active' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') consultationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    const data = await this.consultationsService.sendMessage(
      consultationId,
      user.id ?? user.sub,
      dto,
    );
    return {
      success: true,
      data,
      message: 'Message sent successfully',
    };
  }

  /**
   * GET /consultations/:id/messages
   * Get paginated chat history for a consultation. User must be a participant.
   */
  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get chat history',
    description:
      'Returns paginated messages for a consultation in chronological order. User must be a participant.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
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
    description: 'Items per page (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of messages' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a participant' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') consultationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const result = await this.consultationsService.getMessages(
      consultationId,
      user.id ?? user.sub,
      page,
      limit,
    );
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * PATCH /consultations/:id/status
   * Update consultation status. Only the consultant can do this.
   */
  @UseGuards(RolesGuard)
  @Roles('consultant')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update consultation status',
    description:
      'Update the status of a consultation. Only the assigned consultant can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'Consultation ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a consultant' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') consultationId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const data = await this.consultationsService.updateStatus(
      consultationId,
      user.id ?? user.sub,
      dto,
    );
    return {
      success: true,
      data,
      message: 'Consultation status updated successfully',
    };
  }
}
