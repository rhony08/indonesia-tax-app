import { useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api';

interface Consultant {
  id: string;
  name: string;
  avatar_url?: string;
  certification_level: string;
  specializations: string[];
  rating: number;
  price_per_session: number;
  is_online: boolean;
  total_sessions: number;
  total_reviews: number;
  years_experience: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CERT_LEVELS = ['', 'A', 'B', 'C'] as const;
const MIN_RATING_OPTIONS = ['', '3', '4', '4.5'] as const;
const LIMIT = 9;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-200'}
        />
      ))}
      <span className="ml-1 text-sm text-text-secondary">{rating.toFixed(1)}</span>
    </div>
  );
}

function CertBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    A: 'bg-success-bg text-success border-success/30',
    B: 'bg-info-bg text-info border-info/30',
    C: 'bg-warning-bg text-warning border-warning/30',
  };
  const colorClass = colorMap[level] ?? 'bg-gray-100 text-text-secondary border-border';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
      Level {level}
    </span>
  );
}

function ConsultantCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded flex-1" />
        <div className="h-9 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  );
}

function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden">
          {consultant.avatar_url ? (
            <img
              src={consultant.avatar_url}
              alt={consultant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            consultant.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{consultant.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <CertBadge level={consultant.certification_level} />
            {consultant.is_online && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                {t('consultants.online')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {consultant.specializations.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-background-gray text-text-secondary border border-border"
          >
            {spec}
          </span>
        ))}
        {consultant.specializations.length > 3 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-text-secondary">
            +{consultant.specializations.length - 3}
          </span>
        )}
      </div>

      <div className="mb-3">
        <StarRating rating={consultant.rating} />
      </div>

      <div className="flex items-center gap-1 text-sm text-text-secondary mb-4">
        <Clock size={14} />
        <span className="font-semibold text-text-primary">
          Rp {consultant.price_per_session.toLocaleString('id-ID')}
        </span>
        <span>{t('consultants.perSession')}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link
          to={`/consultants/${consultant.id}`}
          className="flex-1 text-center text-sm font-medium text-primary border border-primary hover:bg-primary-light rounded-md py-2 transition-colors"
        >
          {t('consultants.viewProfile')}
        </Link>
        <Link
          to={`/booking/${consultant.id}`}
          className="flex-1 text-center text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md py-2 transition-colors"
        >
          {t('consultants.bookSession')}
        </Link>
      </div>
    </div>
  );
}

function Pagination({
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

export function ConsultantListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') ?? '';
  const specialization = searchParams.get('specialization') ?? '';
  const certLevel = searchParams.get('cert_level') ?? '';
  const minPrice = searchParams.get('min_price') ?? '';
  const maxPrice = searchParams.get('max_price') ?? '';
  const isOnline = searchParams.get('is_online') === 'true';
  const minRating = searchParams.get('min_rating') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '' || value === 'false') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        // Reset to page 1 when filters change (unless page itself is being set)
        if (!('page' in updates)) {
          next.delete('page');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const { data, isLoading, isError, error, refetch } = useQuery<PaginatedResponse<Consultant>>({
    queryKey: ['consultants', { search, specialization, certLevel, minPrice, maxPrice, isOnline, minRating, page }],
    queryFn: () =>
      api.get<PaginatedResponse<Consultant>>('/consultants', {
        search: search || undefined,
        specialization: specialization || undefined,
        cert_level: certLevel || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        is_online: isOnline || undefined,
        min_rating: minRating || undefined,
        page,
        limit: LIMIT,
      }),
  });

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = search || specialization || certLevel || minPrice || maxPrice || isOnline || minRating;

  const consultants = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalResults = data?.meta?.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('consultants.title')}</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-background-gray transition-colors"
        >
          <Filter size={16} />
          {t('consultants.filter')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside
          className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block lg:w-64 shrink-0`}
        >
          <div className="bg-white border border-border rounded-lg p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">{t('consultants.filter')}</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-text-secondary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('consultants.search')}
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => updateParams({ search: e.target.value })}
                  placeholder={t('consultants.search')}
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Specialization */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('consultants.specialization')}
              </label>
              <select
                value={specialization}
                onChange={(e) => updateParams({ specialization: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">{t('consultants.allSpecializations')}</option>
                <option value="tax_planning">Tax Planning</option>
                <option value="spt_preparation">SPT Preparation</option>
                <option value="tax_audit">Tax Audit</option>
                <option value="monthly_tax">Monthly Tax</option>
                <option value="international_tax">International Tax</option>
                <option value="vat">VAT / PPN</option>
              </select>
            </div>

            {/* Certification Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('consultants.certLevel')}
              </label>
              <select
                value={certLevel}
                onChange={(e) => updateParams({ cert_level: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">{t('consultants.allCertLevels')}</option>
                {CERT_LEVELS.filter(Boolean).map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('consultants.priceRange')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => updateParams({ min_price: e.target.value })}
                  placeholder={t('consultants.minPrice')}
                  className="w-1/2 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => updateParams({ max_price: e.target.value })}
                  placeholder={t('consultants.maxPrice')}
                  className="w-1/2 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Min Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t('consultants.minRating')}
              </label>
              <select
                value={minRating}
                onChange={(e) => updateParams({ min_rating: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">{t('common.all')}</option>
                {MIN_RATING_OPTIONS.filter(Boolean).map((r) => (
                  <option key={r} value={r}>
                    {r}+ {t('consultants.rating')}
                  </option>
                ))}
              </select>
            </div>

            {/* Online Toggle */}
            <div className="mb-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-text-secondary">
                  {t('consultants.onlineOnly')}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOnline}
                  onClick={() => updateParams({ is_online: isOnline ? undefined : 'true' })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-light transition-colors"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
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
                <ConsultantCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && consultants.length === 0 && (
            <div className="bg-white border border-border rounded-lg p-12 text-center">
              <p className="text-text-secondary text-lg mb-2">{t('consultants.noConsultants')}</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          )}

          {/* Data Grid */}
          {!isLoading && !isError && consultants.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultants.map((consultant) => (
                  <ConsultantCard key={consultant.id} consultant={consultant} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => updateParams({ page: String(newPage) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
