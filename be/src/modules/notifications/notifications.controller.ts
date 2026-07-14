import {
  Controller,
  Get,
  Patch,
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
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Authenticated: get user's notifications with pagination
   */
  @Get()
  @ApiOperation({
    summary: "Get user's notifications",
    description:
      "Returns the authenticated user's notifications with pagination. Requires authentication.",
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
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of notifications',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryNotificationDto,
  ) {
    const result = await this.notificationsService.findAll(
      user.id ?? user.sub,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * PATCH /notifications/:id/read
   * Authenticated: mark a notification as read
   */
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a single notification as read. Must belong to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(
      user.id ?? user.sub,
      id,
    );
    return { success: true, data };
  }

  /**
   * PATCH /notifications/read-all
   * Authenticated: mark all notifications as read
   */
  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Marks all unread notifications for the authenticated user as read.',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@CurrentUser() user: JwtPayload) {
    const data = await this.notificationsService.markAllAsRead(
      user.id ?? user.sub,
    );
    return { success: true, data };
  }
}
