import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { api } from '../../lib/api';

interface ConsultantProfile {
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
  bio: string;
  location?: string;
  languages?: string[];
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

interface AvailabilityResponse {
  schedule: DaySchedule[];
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
      Level {level}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-border rounded-lg p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-7 bg-gray-200 rounded w-1/3 mx-auto sm:mx-0" />
            <div className="h-5 bg-gray-200 rounded w-1/4 mx-auto sm:mx-0" />
            <div className="h-5 bg-gray-200 rounded w-1/5 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-lg p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="bg-white border border-border rounded-lg p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-16 bg-gray-200 rounded w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-lg p-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
            {review.user_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-text-primary">{review.user_name}</span>
        </div>
        <span className="text-xs text-text-secondary">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="mb-2">
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-text-secondary">{review.comment}</p>
    </div>
  );
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const REVIEWS_PER_PAGE = 5;

export function ConsultantProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [reviewsPage, setReviewsPage] = useState(1);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErr,
    refetch: refetchProfile,
  } = useQuery<ConsultantProfile>({
    queryKey: ['consultant', id],
    queryFn: () => api.get<ConsultantProfile>(`/consultants/${id}`),
    enabled: !!id,
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery<AvailabilityResponse>({
    queryKey: ['consultant-availability', id],
    queryFn: () => api.get<AvailabilityResponse>(`/consultants/${id}/availability`),
    enabled: !!id,
  });

  const { data: reviewsData, isLoading: reviewsLoading, isError: reviewsError } = useQuery<ReviewsResponse>({
    queryKey: ['consultant-reviews', id, reviewsPage],
    queryFn: () =>
      api.get<ReviewsResponse>(`/consultants/${id}/reviews`, {
        page: reviewsPage,
        limit: REVIEWS_PER_PAGE,
      }),
    enabled: !!id,
  });

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-critical-bg border border-warning/30 rounded-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-warning mb-2">{t('consultants.notFound')}</h1>
          <p className="text-sm text-text-secondary mb-4">
            {(profileErr as Error)?.message ?? ''}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/consultants"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft size={16} />
              {t('common.back')}
            </Link>
            <button
              onClick={() => refetchProfile()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const schedule = availability?.schedule ?? [];
  const reviews = reviewsData?.data ?? [];
  const reviewsTotalPages = reviewsData?.meta?.totalPages ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <Link
        to="/consultants"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.back')}
      </Link>

      {/* Profile Header */}
      <div className="bg-white border border-border rounded-lg p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-4xl shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{profile.name}</h1>
              <CertBadge level={profile.certification_level} />
              {profile.is_online && (
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  {t('consultants.online')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <StarRating rating={profile.rating} />
              </div>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                <span className="font-semibold text-text-primary">{profile.total_reviews}</span>{' '}
                {t('consultants.reviews')}
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                <span className="font-semibold text-text-primary">{profile.total_sessions}</span>{' '}
                {t('consultants.sessionsCompleted')}
              </span>
            </div>

            {profile.location && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-sm text-text-secondary">
                <MapPin size={14} />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <section className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">{t('consultants.bio')}</h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </section>
          )}

          {/* Specializations */}
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t('consultants.specializations')}</h2>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-background-gray text-text-primary border border-border"
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {/* Availability */}
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              <Calendar size={18} className="inline mr-2" />
              {t('consultants.availability')}
            </h2>

            {availabilityLoading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : schedule.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">{t('common.noResults')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = schedule.find((s) => s.day === day);
                  const slots = daySchedule?.slots ?? [];
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;

                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-md border text-sm ${
                        isToday ? 'border-primary bg-primary-light/50' : 'border-border'
                      }`}
                    >
                      <p className="font-medium capitalize mb-2 text-text-primary">{day}</p>
                      {slots.length === 0 ? (
                        <p className="text-xs text-text-disabled italic">-</p>
                      ) : (
                        <div className="space-y-1">
                          {slots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-xs text-text-secondary"
                            >
                              <Clock size={10} className="shrink-0" />
                              <span>
                                {slot.start} - {slot.end}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              <BookOpen size={18} className="inline mr-2" />
              {t('consultants.reviews')}
              <span className="text-sm font-normal text-text-secondary ml-2">
                ({reviewsData?.meta?.total ?? 0})
              </span>
            </h2>

            {reviewsLoading ? (
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : reviewsError ? (
              <p className="text-sm text-text-secondary text-center py-4">{t('common.error')}</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">{t('consultants.noReviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}

            {/* Reviews Pagination */}
            {reviewsTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                  disabled={reviewsPage <= 1}
                  className="p-1.5 rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t('common.previous')}
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm text-text-secondary px-3">
                  {t('common.page')} {reviewsPage} {t('common.of')} {reviewsTotalPages}
                </span>

                <button
                  onClick={() => setReviewsPage((p) => Math.min(reviewsTotalPages, p + 1))}
                  disabled={reviewsPage >= reviewsTotalPages}
                  className="p-1.5 rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t('common.next')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="bg-white border border-border rounded-lg p-6 sticky top-20">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-text-primary">
                Rp {profile.price_per_session.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-text-secondary">{t('consultants.perSession')}</p>
            </div>

            <Link
              to={`/booking/${profile.id}`}
              className="block w-full text-center py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              <Calendar size={16} className="inline mr-2" />
              {t('consultants.bookNow')}
            </Link>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{profile.total_sessions} {t('consultants.sessionsCompleted')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} />
                <span>{profile.rating.toFixed(1)} ({profile.total_reviews} {t('consultants.reviews')})</span>
              </div>
              <div className="flex items-center gap-2">
                <CertBadge level={profile.certification_level} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
