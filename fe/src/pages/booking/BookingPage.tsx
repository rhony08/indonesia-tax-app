import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';

/* ---------- Types ---------- */

interface Consultant {
  id: string;
  name: string;
  avatar_url?: string;
  specialization?: string;
  rating?: number;
}

interface BookingPayload {
  consultantId: string;
  service_type: 'chat' | 'task';
  message?: string;
  price: number;
  platform_fee: number;
  total: number;
}

interface OrderResponse {
  data: {
    order_id: string;
    consultation_id?: string;
    status: string;
  };
}

/* ---------- Constants ---------- */

const CHAT_PRICE = 100_000;
const CHAT_DURATION = 30;
const PLATFORM_FEE_RATE = 0.25;

type Step = 1 | 2 | 3 | 4;

/* ---------- Main Component ---------- */

export function BookingPage() {
  const { t } = useTranslation();
  const { consultantId } = useParams<{ consultantId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<'chat' | 'task' | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  /* Fetch consultant info */
  const {
    data: consultant,
    isLoading: loadingConsultant,
    isError: consultantError,
  } = useQuery({
    queryKey: ['consultant', consultantId],
    queryFn: () =>
      api.get<{ data: Consultant }>(`/consultants/${consultantId}`).then((r) => r.data),
    enabled: !!consultantId,
  });

  /* Create booking mutation */
  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!serviceType || !consultant) throw new Error('Missing data');
      const price = serviceType === 'chat' ? CHAT_PRICE : customPrice;
      const platformFee = Math.round(price * PLATFORM_FEE_RATE);
      const total = price + platformFee;

      const payload: BookingPayload = {
        consultantId: consultant.id,
        service_type: serviceType,
        message: message.trim() || undefined,
        price,
        platform_fee: platformFee,
        total,
      };

      /* Step 1: Book the consultation */
      const bookingRes = await api.post<{ data: { consultation_id: string } }>(
        `/consultants/${consultantId}/book`,
        payload,
      );

      const consultId = bookingRes.data.consultation_id;

      /* Step 2: Create the order */
      const orderRes = await api.post<OrderResponse>('/orders', {
        consultation_id: consultId,
        service_type: serviceType,
        amount: total,
      });

      return { consultationId: consultId, orderId: orderRes.data.order_id };
    },
    onSuccess: (data) => {
      setConsultationId(data.consultationId);
      setBookingSuccess(true);
    },
  });

  /* Pay mutation (mock) */
  const payMutation = useMutation({
    mutationFn: (orderId: string) =>
      api.post<{ data: { payment_url?: string } }>(`/orders/${orderId}/pay`),
    onSuccess: () => {
      setBookingSuccess(true);
    },
  });

  /* ---- Derived values ---- */
  const price = serviceType === 'chat' ? CHAT_PRICE : customPrice;
  const platformFee = Math.round(price * PLATFORM_FEE_RATE);
  const total = price + platformFee;

  /* ---- Step navigation ---- */

  const goToStep = (s: Step) => {
    if (s >= 1 && s <= 4) setStep(s);
  };

  const canProceedStep1 = serviceType !== null && (serviceType === 'chat' || customPrice > 0);
  const canProceedStep3 = true;

  /* ---- Loading state ---- */
  if (loadingConsultant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center text-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('common.loading')}
      </div>
    );
  }

  /* ---- Error state ---- */
  if (consultantError || !consultant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-2 text-text-secondary">
        <AlertCircle className="w-8 h-8 text-primary" />
        <p>{t('booking.errorFetching')}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary hover:underline mt-1"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  /* ---- Success state ---- */
  if (bookingSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-4">
        <CheckCircle className="w-16 h-16 text-success" />
        <h2 className="text-2xl font-bold text-text-primary">
          {t('booking.bookingSuccess')}
        </h2>
        <p className="text-text-secondary">{t('booking.bookingSuccessDesc')}</p>
        <div className="flex gap-3 mt-4">
          {consultationId && (
            <Link
              to={`/chat/${consultationId}`}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              {t('booking.goToChat')}
            </Link>
          )}
          <Link
            to="/dashboard"
            className="px-5 py-2.5 text-sm font-medium text-text-secondary border border-border hover:bg-background-gray rounded-md transition-colors"
          >
            {t('booking.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Main booking flow ---- */

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-text-primary mb-6">{t('booking.title')}</h1>

      {/* ---- Step indicator ---- */}
      <div className="flex items-center mb-8">
        {([1, 2, 3, 4] as Step[]).map((s, idx) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s <= step
                  ? 'bg-primary text-white'
                  : 'bg-background-gray text-text-disabled'
              }`}
            >
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  s < step ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ---- Error display ---- */}
      {bookMutation.isError && (
        <div className="mb-6 px-4 py-3 bg-critical-bg text-primary text-sm rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{t('booking.errorBooking')}</span>
        </div>
      )}

      {payMutation.isError && (
        <div className="mb-6 px-4 py-3 bg-critical-bg text-primary text-sm rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{t('booking.errorPayment')}</span>
        </div>
      )}

      {/* ---- Step 1: Service Selection ---- */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t('booking.step1')}: {t('booking.selectService')}
          </h2>

          <div className="grid gap-4">
            <button
              onClick={() => setServiceType('chat')}
              className={`flex items-start gap-4 p-5 rounded-lg border-2 text-left transition-colors ${
                serviceType === 'chat'
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-text-disabled'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {t('booking.chatConsultation')}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {CHAT_DURATION} {t('booking.minutes')} &middot; Rp {CHAT_PRICE.toLocaleString('id-ID')}
                </p>
              </div>
            </button>

            <button
              onClick={() => setServiceType('task')}
              className={`flex items-start gap-4 p-5 rounded-lg border-2 text-left transition-colors ${
                serviceType === 'task'
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-text-disabled'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {t('booking.taskBased')}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {t('booking.custom')} {t('booking.price')}
                </p>
              </div>
            </button>
          </div>

          {serviceType === 'task' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('booking.price')} (IDR)
              </label>
              <input
                type="number"
                min={0}
                step={10_000}
                value={customPrice || ''}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                placeholder="Rp 0"
                className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => goToStep(2)}
              disabled={!canProceedStep1}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('booking.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 2: Message ---- */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t('booking.step2')}: {t('booking.messageToConsultant')}
          </h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('booking.messagePlaceholder')}
            rows={5}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-disabled"
          />

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => goToStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-secondary border border-border hover:bg-background-gray rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('booking.back')}
            </button>
            <button
              onClick={() => goToStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              {t('booking.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 3: Order Summary ---- */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t('booking.step3')}: {t('booking.orderSummary')}
          </h2>

          <div className="border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {consultant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {consultant.name}
                </p>
                {consultant.specialization && (
                  <p className="text-xs text-text-secondary">{consultant.specialization}</p>
                )}
              </div>
            </div>

            <div className="px-4 py-3 flex justify-between text-sm">
              <span className="text-text-secondary">{t('booking.service')}</span>
              <span className="font-medium text-text-primary">
                {serviceType === 'chat'
                  ? t('booking.chatConsultation')
                  : t('booking.taskBased')}{' '}
                ({serviceType === 'chat'
                  ? `${CHAT_DURATION} ${t('booking.minutes')}`
                  : t('booking.custom')})
              </span>
            </div>

            <div className="px-4 py-3 flex justify-between text-sm">
              <span className="text-text-secondary">{t('booking.price')}</span>
              <span className="font-medium text-text-primary">
                Rp {price.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="px-4 py-3 flex justify-between text-sm">
              <span className="text-text-secondary">
                {t('booking.platformFee')} (25%)
              </span>
              <span className="font-medium text-text-primary">
                Rp {platformFee.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="px-4 py-3 flex justify-between text-sm bg-background-gray">
              <span className="font-semibold text-text-primary">{t('booking.total')}</span>
              <span className="font-bold text-primary">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 border border-border rounded-lg bg-background-gray">
              <p className="text-xs font-medium text-text-secondary mb-1">
                {t('booking.messageToConsultant')}:
              </p>
              <p className="text-sm text-text-primary">{message}</p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => goToStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-secondary border border-border hover:bg-background-gray rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('booking.back')}
            </button>
            <button
              onClick={() => goToStep(4)}
              disabled={!canProceedStep3}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
            >
              {t('booking.next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---- Step 4: Confirm & Pay ---- */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t('booking.step4')}: {t('booking.confirmPay')}
          </h2>

          <div className="border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-text-secondary mb-4">
              {t('booking.total')}:{' '}
              <span className="text-xl font-bold text-primary">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </p>

            <p className="text-xs text-text-disabled mb-6">
              {t('booking.step4')} —{' '}
              {t('booking.consultantName')}: {consultant.name}
            </p>

            <button
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending || payMutation.isPending}
              className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {bookMutation.isPending || payMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {t('booking.confirmPay')}
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => goToStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-secondary border border-border hover:bg-background-gray rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('booking.back')}
            </button>
            <div />
          </div>
        </div>
      )}
    </div>
  );
}
