import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Calendar, User } from 'lucide-react';
import { api } from '../../lib/api';

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image_url?: string;
  tags: string[];
  author_name: string;
  author_avatar_url?: string;
  published_at: string;
  updated_at?: string;
}

function BlogPostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="aspect-[21/9] bg-gray-200 rounded-lg mb-8" />
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function BlogPostPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError, error, refetch } = useQuery<BlogPostDetail>({
    queryKey: ['blog-post', slug],
    queryFn: () => api.get<BlogPostDetail>(`/blog/posts/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogPostSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-critical-bg border border-warning/30 rounded-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-warning mb-2">{t('blog.postNotFound')}</h1>
          <p className="text-sm text-text-secondary mb-4">
            {(error as Error)?.message ?? ''}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft size={16} />
              {t('blog.backToBlog')}
            </Link>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('blog.backToBlog')}
      </Link>

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="aspect-[21/9] rounded-lg overflow-hidden mb-8 bg-background-gray">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-3xl mx-auto">
        {/* Title and Meta */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
              )}
              <span>{t('blog.byAuthor')} <span className="font-medium text-text-primary">{post.author_name}</span></span>
            </div>

            <span className="hidden sm:inline text-border">|</span>

            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{t('blog.publishedOn')} {new Date(post.published_at).toLocaleDateString()}</span>
            </div>

            {post.updated_at && post.updated_at !== post.published_at && (
              <span className="text-text-disabled text-xs">
                ({t('common.updated')}: {new Date(post.updated_at).toLocaleDateString()})
              </span>
            )}
          </div>
        </header>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary-light text-primary hover:bg-primary/10 transition-colors"
            >
              <Tag size={12} />
              {tag}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div
          className="prose prose-sm sm:prose max-w-none
            prose-headings:text-text-primary prose-headings:font-semibold
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-img:rounded-lg prose-img:mx-auto
            prose-blockquote:border-l-primary prose-blockquote:bg-primary-light/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-li:text-text-secondary
            [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:mb-4
            [&_ul]:mb-4 [&_ol]:mb-4
            [&_pre]:bg-background-gray [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
            [&_code]:bg-background-gray [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Divider */}
        <hr className="my-10 border-border" />

        {/* Author Bio (optional) */}
        <div className="flex items-center gap-4 p-5 bg-background-gray rounded-lg">
          {post.author_avatar_url ? (
            <img
              src={post.author_avatar_url}
              alt={post.author_name}
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <User size={22} className="text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{post.author_name}</p>
            <p className="text-sm text-text-secondary">
              {t('blog.publishedOn')} {new Date(post.published_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
