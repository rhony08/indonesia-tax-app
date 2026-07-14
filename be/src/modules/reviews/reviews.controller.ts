import {
  Controller,
  Post,
  Get,
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
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * POST /reviews
   * Authenticated: create a review for a consultation
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a review',
    description:
      'Submit a review for a completed consultation. Updates consultant rating.',
  })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - not your consultation or not completed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Already reviewed this consultation',
  })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    const result = await this.reviewsService.create(user.id ?? user.sub, dto);
    return {
      success: true,
      data: result,
      message: 'Review submitted successfully',
    };
  }

  /**
   * GET /reviews/consultant/:consultantId
   * Public: get paginated reviews for a consultant
   */
  @Public()
  @Get('consultant/:consultantId')
  @ApiOperation({
    summary: 'Get consultant reviews',
    description: 'Returns paginated reviews for a consultant. Public endpoint.',
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
    description: 'Paginated list of reviews',
  })
  async findByConsultantId(
    @Param('consultantId') consultantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.reviewsService.findByConsultantId(
      consultantId,
      page,
      limit,
    );
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }
}
