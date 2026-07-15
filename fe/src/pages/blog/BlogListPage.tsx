import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { api } from '../../lib/api';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url?: string;
  tags: string[];
  author_name: string;
  published_at: string;
}

interface PaginatedBlogResponse {
  data: BlogPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const POSTS_PER_PAGE = 9;

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded w-14" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="aspect-video bg-background-gray overflow-hidden">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-disabled">
            <Tag size={32} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-light text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 text-xs text-text-secondary mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          </div>
          <span className="text-border">|</span>
          <span>{t('blog.byAuthor')} {post.author_name}</span>
        </div>
      </div>
    </Link>
  );
}

function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t('common.previous')}
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-9 h-9 rounded-md text-sm border border-border hover:bg-background-gray"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-text-secondary">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-md text-sm border transition-colors ${
            p === currentPage
              ? 'bg-primary text-white border-primary'
              : 'border-border hover:bg-background-gray'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-text-secondary">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-9 h-9 rounded-md text-sm border border-border hover:bg-background-gray"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={t('common.next')}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function BlogListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const activeTag = searchParams.get('tag') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        if (!('page' in updates)) {
          next.delete('page');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedBlogResponse>({
    queryKey: ['blog-posts', { search, tag: activeTag, page }],
    queryFn: () =>
      api.get<PaginatedBlogResponse>('/blog/posts', {
        search: search || undefined,
        tag: activeTag || undefined,
        page,
        limit: POSTS_PER_PAGE,
      }),
  });

  // Fetch all available tags for the tag filter bar
  const { data: tagsData } = useQuery<string[]>({
    queryKey: ['blog-tags'],
    queryFn: () => api.get<string[]>('/blog/tags'),
    staleTime: 1000 * 60 * 10,
  });

  const posts = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalResults = data?.meta?.total ?? 0;
  const tags = tagsData ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t('blog.title')}</h1>

      {/* Search Bar */}
      <div className="max-w-lg mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParams({ search: e.target.value, tag: activeTag || undefined })}
            placeholder={t('blog.searchPosts')}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Tag Filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => updateParams({ tag: undefined })}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTag === ''
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border hover:bg-background-gray'
            }`}
          >
            {t('blog.allTags')}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => updateParams({ tag: activeTag === tag ? undefined : tag })}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                activeTag === tag
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:bg-background-gray'
              }`}
            >
              <Tag size={12} className="mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !isError && (
        <p className="text-sm text-text-secondary mb-4">
          {t('common.showing')}{' '}
          <span className="font-medium text-text-primary">{totalResults}</span>{' '}
          {t('common.results')}
        </p>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-critical-bg border border-warning/30 rounded-lg p-8 text-center">
          <p className="text-warning font-medium mb-2">{t('common.error')}</p>
          <p className="text-sm text-text-secondary mb-4">
            {(error as Error)?.message ?? t('common.error')}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary text-lg">{t('blog.noPostsFound')}</p>
        </div>
      )}

      {/* Posts Grid */}
      {!isLoading && !isError && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          <BlogPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => updateParams({ page: String(newPage) })}
          />
        </>
      )}
    </div>
  );
}
