import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, or, like, desc, count } from 'drizzle-orm';
import { db, schema } from '../../database/database';
import { QueryBlogDto } from './dto/query-blog.dto';

const { blogPosts, users } = schema;

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  /**
   * List published blog posts with pagination, search, and tag filter.
   */
  async findAll(query: QueryBlogDto) {
    const { search, tag, page = 1, limit = 10 } = query;

    const conditions = [eq(blogPosts.status, 'published')];

    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`),
        ) as ReturnType<typeof eq>,
      );
    }

    if (tag) {
      conditions.push(like(blogPosts.tags, `%${tag}%`));
    }

    const whereClause = and(...conditions);

    const countResult = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(whereClause);

    const total = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const items = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        title_en: blogPosts.title_en,
        excerpt: blogPosts.excerpt,
        excerpt_en: blogPosts.excerpt_en,
        cover_image: blogPosts.cover_image,
        tags: blogPosts.tags,
        view_count: blogPosts.view_count,
        author_name: users.name,
        published_at: blogPosts.published_at,
        created_at: blogPosts.created_at,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.author_id, users.id))
      .where(whereClause)
      .orderBy(desc(blogPosts.published_at))
      .limit(limit)
      .offset(offset);

    const parsedItems = items.map((item) => ({
      ...item,
      tags: this.parseTags(item.tags),
    }));

    return {
      data: parsedItems,
      meta: { page, limit, total, total_pages: totalPages },
    };
  }

  /**
   * Get a single published blog post by slug and increment view count.
   */
  async findBySlug(slug: string) {
    const result = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        title_en: blogPosts.title_en,
        content: blogPosts.content,
        content_en: blogPosts.content_en,
        excerpt: blogPosts.excerpt,
        excerpt_en: blogPosts.excerpt_en,
        cover_image: blogPosts.cover_image,
        tags: blogPosts.tags,
        view_count: blogPosts.view_count,
        author_name: users.name,
        author_avatar: users.avatar_url,
        published_at: blogPosts.published_at,
        created_at: blogPosts.created_at,
        updated_at: blogPosts.updated_at,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.author_id, users.id))
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('Blog post not found');
    }

    const post = result[0];

    await db
      .update(blogPosts)
      .set({
        view_count: post.view_count + 1,
      })
      .where(eq(blogPosts.id, post.id));

    return {
      ...post,
      tags: this.parseTags(post.tags),
      view_count: post.view_count + 1,
    };
  }

  /**
   * Safely parse tags JSON string to string array.
   */
  private parseTags(raw: unknown): string[] {
    if (!raw || typeof raw !== 'string') {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
}
