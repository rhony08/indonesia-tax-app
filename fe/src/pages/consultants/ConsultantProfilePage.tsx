import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Clock, Calendar, ChevronLeft, ChevronRight, ArrowLeft, BookOpen,
} from 'lucide-react';
import { api } from '../../lib/api';

interface ConsultantProfile {
  id: string;
  name: string;
  avatar_url?: string;
  cert_level: string;
  specializations: string[];
  rating: number;
  price_per_session: number;
  is_online: boolean;
  total_sessions: number;
  total_reviews: number;
  bio: string;
  email?: string;
  phone?: string;
}

interface DaySchedule { day: string; slots: { start: string; end: string }[] }

interface BeScheduleItem { id: string; day_of_week: number; start_time: string; end_time: string; is_active: boolean }

interface Review { id: string; user_name: string; rating: number; comment: string; created_at: string }

const DAYS_OF_WEEK = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const REVIEWS_PER_PAGE = 5;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-sm text-text-secondary">{rating.toFixed(1)}</span>
    </div>
  );
}

function CertBadge({ level }: { level: string }) {
  const cm: Record<string,string> = { A:'bg-success-bg text-success border-success/30', B:'bg-info-bg text-info border-info/30', C:'bg-warning-bg text-warning border-warning/30' };
  return <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold border ${cm[level] ?? 'bg-gray-100 text-text-secondary'}`}>Level {level}</span>;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-border rounded-lg p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3 w-full"><div className="h-7 bg-gray-200 rounded w-1/3" /><div className="h-5 bg-gray-200 rounded w-1/4" /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-3"><div className="h-5 bg-gray-200 rounded w-1/4" /><div className="h-4 bg-gray-200 rounded w-full" /><div className="h-4 bg-gray-200 rounded w-3/4" /></div>
        </div>
        <div className="bg-white border rounded-lg p-6 space-y-3"><div className="h-5 bg-gray-200 rounded w-1/2" /><div className="h-10 bg-gray-200 rounded" /></div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">{review.user_name.charAt(0)}</div>
          <span className="font-medium text-sm">{review.user_name}</span>
        </div>
        <span className="text-xs text-text-secondary">{new Date(review.created_at).toLocaleDateString()}</span>
      </div>
      <StarRating rating={review.rating} />
      {review.comment && <p className="text-sm text-text-secondary mt-1">{review.comment}</p>}
    </div>
  );
}

export function ConsultantProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [reviewsPage, setReviewsPage] = useState(1);

  const { data: profileRes, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['consultant', id],
    queryFn: () => api.get<{ success: boolean; data: ConsultantProfile }>(`/consultants/${id}`),
    enabled: !!id,
  });

  const { data: availRes, isLoading: availLoading } = useQuery({
    queryKey: ['consultant-availability', id],
    queryFn: () => api.get<{ success: boolean; data: BeScheduleItem[] }>(`/consultants/${id}/availability`),
    enabled: !!id,
  });

  const { data: reviewsRes, isLoading: reviewsLoading, isError: reviewsError } = useQuery({
    queryKey: ['consultant-reviews', id, reviewsPage],
    queryFn: () => api.get<{ success: boolean; data: Review[]; meta: { total: number; page: number; limit: number; total_pages: number } }>(`/consultants/${id}/reviews`, { page: reviewsPage, limit: REVIEWS_PER_PAGE }),
    enabled: !!id,
  });

  if (profileLoading) return <div className="max-w-7xl mx-auto px-4 py-8"><ProfileSkeleton /></div>;

  if (profileError || !profileRes?.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-critical-bg border border-warning/30 rounded-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-warning mb-2">{t('consultants.notFound')}</h1>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/consultants" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><ArrowLeft size={16} />{t('common.back')}</Link>
            <button onClick={() => refetchProfile()} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md">{t('common.retry')}</button>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileRes.data;
  const reviews = reviewsRes?.data ?? [];
  const reviewsTotalPages = reviewsRes?.meta?.total_pages ?? 1;

  const schedule: DaySchedule[] = (availRes?.data ?? []).reduce((acc: DaySchedule[], item: BeScheduleItem) => {
    const dayName = DAYS_OF_WEEK[item.day_of_week] ?? 'monday';
    const existing = acc.find(d => d.day === dayName);
    const slot = { start: item.start_time, end: item.end_time };
    if (existing) { existing.slots.push(slot); } else { acc.push({ day: dayName, slots: [slot] }); }
    return acc;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/consultants" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6"><ArrowLeft size={16} />{t('common.back')}</Link>

      <div className="bg-white border border-border rounded-lg p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-4xl shrink-0">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" /> : profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{profile.name}</h1>
              <CertBadge level={profile.cert_level} />
              {profile.is_online && <span className="inline-flex items-center gap-1 text-sm text-success"><span className="w-2 h-2 rounded-full bg-success" />{t('consultants.online')}</span>}
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-text-secondary">
              <StarRating rating={profile.rating} />
              <span>{profile.total_reviews} {t('consultants.reviews')}</span>
              <span>{profile.total_sessions} {t('consultants.sessionsCompleted')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {profile.bio && (
            <section className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">{t('consultants.bio')}</h2>
              <p className="text-sm text-text-secondary whitespace-pre-line">{profile.bio}</p>
            </section>
          )}
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">{t('consultants.specializations')}</h2>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map(s => <span key={s} className="px-3 py-1.5 rounded-md text-sm bg-background-gray border border-border">{s}</span>)}
            </div>
          </section>
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4"><Calendar size={18} className="inline mr-2" />{t('consultants.availability')}</h2>
            {availLoading ? <div className="animate-pulse space-y-2">{Array(3).fill(0).map((_,i)=><div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            : schedule.length === 0 ? <p className="text-sm text-text-secondary text-center py-4">{t('common.noResults')}</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DAYS_OF_WEEK.map(day => {
                  const ds = schedule.find(s => s.day === day);
                  const slots = ds?.slots ?? [];
                  const isToday = new Date().toLocaleDateString('en-US',{weekday:'long'}).toLowerCase() === day;
                  return <div key={day} className={`p-3 rounded-md border text-sm ${isToday?'border-primary bg-primary-light/50':'border-border'}`}>
                    <p className="font-medium capitalize mb-2">{day}</p>
                    {slots.length===0 ? <p className="text-xs text-text-disabled italic">-</p>
                    : <div className="space-y-1">{slots.map((s,i)=><Link key={i} to={`/booking/${profile.id}?day=${day}&start=${s.start}&end=${s.end}`} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover hover:bg-primary-light/30 rounded px-1 py-0.5 -mx-1 transition-colors"><Clock size={10} className="shrink-0" />{s.start} - {s.end}</Link>)}</div>}
                  </div>;
                })}
              </div>
            }
          </section>
          <section className="bg-white border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4"><BookOpen size={18} className="inline mr-2" />{t('consultants.reviews')} ({reviewsRes?.meta?.total ?? 0})</h2>
            {reviewsLoading ? <div className="animate-pulse space-y-4">{Array(3).fill(0).map((_,i)=><div key={i} className="space-y-2 pb-4 border-b"><div className="flex gap-2"><div className="w-8 h-8 rounded-full bg-gray-200" /><div className="h-4 bg-gray-200 rounded w-24" /></div><div className="h-3 bg-gray-200 rounded w-3/4" /></div>)}</div>
            : reviewsError ? <p className="text-sm text-center py-4">{t('common.error')}</p>
            : reviews.length === 0 ? <p className="text-sm text-center py-4">{t('consultants.noReviews')}</p>
            : <div className="space-y-4">{reviews.map(r=><ReviewCard key={r.id} review={r} />)}</div>}
            {reviewsTotalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
                <button onClick={()=>setReviewsPage(p=>Math.max(1,p-1))} disabled={reviewsPage<=1} className="p-1.5 rounded border hover:bg-background-gray disabled:opacity-40"><ChevronLeft size={16} /></button>
                <span className="text-sm py-1 px-2">{t('common.page')} {reviewsPage} {t('common.of')} {reviewsTotalPages}</span>
                <button onClick={()=>setReviewsPage(p=>Math.min(reviewsTotalPages,p+1))} disabled={reviewsPage>=reviewsTotalPages} className="p-1.5 rounded border hover:bg-background-gray disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-20">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">Rp {profile.price_per_session.toLocaleString('id-ID')}</p>
              <p className="text-sm text-text-secondary">{t('consultants.perSession')}</p>
            </div>
            <Link to={`/booking/${profile.id}`} className="block w-full text-center py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md"><Calendar size={16} className="inline mr-2" />{t('consultants.bookNow')}</Link>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm text-text-secondary">
              <div className="flex gap-2"><Clock size={14} />{profile.total_sessions} {t('consultants.sessionsCompleted')}</div>
              <div className="flex gap-2"><Star size={14} />{profile.rating.toFixed(1)} ({profile.total_reviews} {t('consultants.reviews')})</div>
              <div className="flex gap-2"><CertBadge level={profile.cert_level} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
