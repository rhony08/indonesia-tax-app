import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { QueryBlogDto } from './dto/query-blog.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * GET /blog/posts
   * Public: list published blog posts with pagination, search, and tag filter
   */
  @Public()
  @Get('posts')
  @ApiOperation({
    summary: 'List published blog posts',
    description:
      'Returns published blog posts with pagination, search, and tag filtering. Public endpoint.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search posts by title or excerpt',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    type: String,
    description: 'Filter posts by tag',
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
    description: 'Paginated list of blog posts',
  })
  async findAll(@Query() query: QueryBlogDto) {
    const result = await this.blogService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * GET /blog/posts/:slug
   * Public: get a single blog post by slug (increments view count)
   */
  @Public()
  @Get('posts/:slug')
  @ApiOperation({
    summary: 'Get blog post by slug',
    description:
      'Returns a single published blog post by its slug and increments the view count. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post detail',
  })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.blogService.findBySlug(slug);
    return { success: true, data };
  }
}
