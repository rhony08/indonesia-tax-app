import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, CheckCircle, Users, Star, Award } from 'lucide-react';
import { api } from '../../lib/api';

interface Consultant {
  id: string;
  name: string;
  specialization?: string;
  rating: number;
  avatar_url?: string;
}

interface TaxCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

const STEPS = [
  { icon: Search, key: 'step1' },
  { icon: MessageSquare, key: 'step2' },
  { icon: CheckCircle, key: 'step3' },
] as const;

function ConsultantCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-4 animate-pulse">
      <div className="w-16 h-16 bg-background-gray rounded-full mx-auto mb-3" />
      <div className="h-5 bg-background-gray rounded w-3/4 mx-auto mb-2" />
      <div className="h-4 bg-background-gray rounded w-1/2 mx-auto mb-2" />
      <div className="flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-background-gray rounded" />
        ))}
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 animate-pulse">
      <div className="w-12 h-12 bg-background-gray rounded-lg mx-auto mb-3" />
      <div className="h-5 bg-background-gray rounded w-2/3 mx-auto mb-2" />
      <div className="h-4 bg-background-gray rounded w-full mx-auto" />
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();

  const {
    data: consultantsData,
    isLoading: consultantsLoading,
    isError: consultantsError,
  } = useQuery({
    queryKey: ['consultants', 'recommended'],
    queryFn: () => api.get<{ data: Consultant[] }>('/consultants/recommended'),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: ['tax', 'categories'],
    queryFn: () => api.get<{ data: TaxCategory[] }>('/tax/categories'),
    staleTime: 1000 * 60 * 10,
  });

  const featuredConsultants = consultantsData?.data?.slice(0, 4) ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-b from-primary-light to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight whitespace-pre-line">
            {t('home.hero')}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            {t('home.subtitle')}
          </p>
          <Link
            to="/consultants"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg shadow-primary/25"
          >
            <Search className="w-5 h-5" />
            {t('home.cta')}
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">
            {t('home.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-background-gray border border-border rounded-xl p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {t(`home.${key}Title`)}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t(`home.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistics ── */}
      <section className="py-14 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-white/80" />
              <div className="text-3xl md:text-4xl font-bold text-white">
                {t('home.statTaxpayers')}
              </div>
              <div className="text-white/70 text-sm">
                {t('home.statTaxpayersLabel')}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="w-8 h-8 text-white/80" />
              <div className="text-3xl md:text-4xl font-bold text-white">
                {t('home.statConsultants')}
              </div>
              <div className="text-white/70 text-sm">
                {t('home.statConsultantsLabel')}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-white/80" />
              <div className="text-3xl md:text-4xl font-bold text-white">
                {t('home.statRating')}
              </div>
              <div className="text-white/70 text-sm">
                {t('home.statRatingLabel')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Consultants ── */}
      <section className="py-16 md:py-20 bg-background-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              {t('home.featuredConsultants')}
            </h2>
            <Link
              to="/consultants"
              className="text-primary hover:text-primary-hover font-medium text-sm hidden sm:inline-flex items-center gap-1"
            >
              {t('home.viewAll')} &rarr;
            </Link>
          </div>

          {consultantsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ConsultantCardSkeleton key={i} />
              ))}
            </div>
          )}

          {consultantsError && !consultantsLoading && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-3">{t('common.error')}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary-hover text-sm font-medium"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {!consultantsLoading && !consultantsError && featuredConsultants.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredConsultants.map((consultant) => (
                <Link
                  key={consultant.id}
                  to={`/consultants/${consultant.id}`}
                  className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {consultant.avatar_url ? (
                      <img
                        src={consultant.avatar_url}
                        alt={consultant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold text-xl">
                        {consultant.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {consultant.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-2">
                    {consultant.specialization ?? t('home.taxConsultant')}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium text-text-primary">
                      {consultant.rating.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!consultantsLoading && !consultantsError && featuredConsultants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">{t('common.noResults')}</p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/consultants"
              className="text-primary hover:text-primary-hover font-medium text-sm inline-flex items-center gap-1"
            >
              {t('home.viewAll')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tax Categories ── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-10">
            {t('home.taxCategories')}
          </h2>

          {categoriesLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {categoriesError && !categoriesLoading && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-3">{t('common.error')}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary-hover text-sm font-medium"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/consultants?category=${category.id}`}
                  className="bg-background-gray border border-border rounded-xl p-5 text-center hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-3">
                    {category.icon ? (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-6 h-6"
                      />
                    ) : (
                      <Search className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">{t('common.noResults')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
