import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
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
import { ConsultantsService } from './consultants.service';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { UpdateConsultantDto } from './dto/update-consultant.dto';
import { QueryConsultantDto } from './dto/query-consultant.dto';
import { BookSessionDto } from './dto/book-session.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Consultants')
@Controller('consultants')
export class ConsultantsController {
  constructor(private readonly consultantsService: ConsultantsService) {}

  /**
   * GET /consultants
   * Public endpoint: list/search consultants with filters
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'List and search consultants',
    description:
      'Search consultants with filters, pagination, and sorting. Public endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of consultants' })
  async findAll(@Query() filters: QueryConsultantDto) {
    const result = await this.consultantsService.findAll(filters);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * GET /consultants/recommended
   * Public endpoint: get top recommended consultants
   */
  @Public()
  @Get('recommended')
  @ApiOperation({
    summary: 'Get recommended consultants',
    description:
      'Returns top consultants sorted by rating, online status, and total sessions.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recommendations (default: 6)',
  })
  @ApiResponse({ status: 200, description: 'List of recommended consultants' })
  async getRecommended(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    const data = await this.consultantsService.findRecommended(limit);
    return { success: true, data };
  }

  /**
   * GET /consultants/:id
   * Public endpoint: get consultant profile
   */
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get consultant profile',
    description: 'Returns detailed consultant profile with user information.',
  })
  @ApiParam({ name: 'id', description: 'Consultant ID' })
  @ApiResponse({ status: 200, description: 'Consultant profile' })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async findById(@Param('id') id: string) {
    const consultant = await this.consultantsService.findById(id);
    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }
    return { success: true, data: consultant };
  }

  /**
   * GET /consultants/:id/availability
   * Public endpoint: get consultant schedule
   */
  @Public()
  @Get(':id/availability')
  @ApiOperation({
    summary: 'Get consultant availability',
    description: 'Returns the weekly schedule for a consultant.',
  })
  @ApiParam({ name: 'id', description: 'Consultant ID' })
  @ApiResponse({ status: 200, description: 'Consultant availability schedule' })
  async getAvailability(@Param('id') id: string) {
    const data = await this.consultantsService.getAvailability(id);
    return { success: true, data };
  }

  /**
   * GET /consultants/:id/reviews
   * Public endpoint: get consultant reviews
   */
  @Public()
  @Get(':id/reviews')
  @ApiOperation({
    summary: 'Get consultant reviews',
    description: 'Returns paginated reviews for a consultant.',
  })
  @ApiParam({ name: 'id', description: 'Consultant ID' })
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
  @ApiResponse({ status: 200, description: 'Paginated list of reviews' })
  async getReviews(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.consultantsService.getReviews(id, page, limit);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * POST /consultants/:id/book
   * Authenticated: book a consultation session
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Book a consultation session',
    description:
      'Creates a consultation request and order. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Consultant ID' })
  @ApiResponse({ status: 201, description: 'Session booked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async bookSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') consultantId: string,
    @Body() data: BookSessionDto,
  ) {
    const result = await this.consultantsService.bookSession(
      user.id ?? user.sub,
      consultantId,
      data,
    );
    return {
      success: true,
      data: result,
      message: 'Consultation session booked successfully',
    };
  }

  /**
   * POST /consultants/register
   * Authenticated: register as a consultant
   */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register as a consultant',
    description:
      'Register the currently authenticated user as a tax consultant. Requires NPWP.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered as consultant',
  })
  @ApiResponse({ status: 400, description: 'NPWP is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Already registered' })
  async register(
    @CurrentUser() user: JwtPayload,
    @Body() data: CreateConsultantDto,
  ) {
    const result = await this.consultantsService.createConsultant(
      user.id ?? user.sub,
      data,
    );
    return {
      success: true,
      data: result,
      message: 'Successfully registered as a consultant',
    };
  }

  /**
   * PATCH /consultants/me
   * Authenticated + consultant role: update own profile
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('consultant')
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update consultant profile',
    description:
      "Update the currently authenticated consultant's profile. Requires consultant role.",
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a consultant' })
  @ApiResponse({ status: 404, description: 'Consultant profile not found' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() data: UpdateConsultantDto,
  ) {
    const result = await this.consultantsService.updateConsultant(
      user.id ?? user.sub,
      data,
    );
    return {
      success: true,
      data: result,
      message: 'Consultant profile updated successfully',
    };
  }
}
