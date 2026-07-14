import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CalculateTaxDto } from './dto/calculate-tax.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tax')
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * GET /tax/categories
   * Public: list all tax categories
   */
  @Public()
  @Get('categories')
  @ApiOperation({
    summary: 'List tax categories',
    description: 'Returns all active tax categories. Public endpoint.',
  })
  @ApiResponse({ status: 200, description: 'List of tax categories' })
  async getCategories() {
    const data = await this.taxService.getCategories();
    return { success: true, data };
  }

  /**
   * GET /tax/rates
   * Public: list tax rates with optional category filter
   */
  @Public()
  @Get('rates')
  @ApiOperation({
    summary: 'List tax rates',
    description:
      'Returns all active tax rates, optionally filtered by category_id. Public endpoint.',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Filter rates by tax category ID',
  })
  @ApiResponse({ status: 200, description: 'List of tax rates' })
  async getRates(@Query('category_id') categoryId?: string) {
    const data = await this.taxService.getRates(categoryId);
    return { success: true, data };
  }

  /**
   * POST /tax/calculate
   * Authenticated: calculate PPh 21 tax estimate
   */
  @UseGuards(JwtAuthGuard)
  @Post('calculate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Calculate PPh 21 tax estimate',
    description:
      'Calculates estimated PPh 21 tax based on monthly income, type (employee/freelancer), and optional deductions. Uses progressive tax brackets. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tax calculation result with bracket breakdown',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  calculate(@Body() dto: CalculateTaxDto) {
    const result = this.taxService.calculate(dto);
    return {
      success: true,
      data: result,
      message: 'Tax calculated successfully',
    };
  }
}
