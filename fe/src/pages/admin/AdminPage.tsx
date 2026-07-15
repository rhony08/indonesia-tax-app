import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';

/* ---------- Types ---------- */

interface AdminStats {
  total_users: number;
  total_consultants: number;
  total_orders: number;
  total_revenue: number;
}

interface AdminConsultant {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  verified: boolean;
  created_at: string;
}

interface AdminOrder {
  id: string;
  user: { id: string; name: string };
  consultant: { id: string; name: string };
  service_type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface PayoutLog {
  id: string;
  consultant: { id: string; name: string };
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/* ---------- Helpers ---------- */

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-warning-bg text-warning',
  paid: 'bg-success-bg text-success',
  completed: 'bg-success-bg text-success',
  cancelled: 'bg-critical-bg text-primary',
  refunded: 'bg-warning-bg text-warning',
  processed: 'bg-success-bg text-success',
};

function statusBadge(status: string, t: (k: string) => string) {
  const labels: Record<string, string> = {
    pending: t('dashboard.pending'),
    paid: t('dashboard.paid'),
    completed: t('admin.verified'),
    cancelled: t('dashboard.cancelled'),
    refunded: t('admin.refund'),
    processed: t('admin.verified'),
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_CLASSES[status] ?? 'bg-background-gray text-text-secondary'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Pagination({
  page,
  total,
  limit,
  onPageChange,
  t,
}: {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  t: (k: string) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <span className="text-sm text-text-secondary">
        {t('common.page')} {page} {t('common.of')} {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-background-gray disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={t('common.next')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */

type SectionKey = 'dashboard' | 'consultants' | 'orders' | 'payouts';

const NAV_ITEMS: { key: SectionKey; icon: typeof LayoutDashboard; labelKey: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { key: 'consultants', icon: Users, labelKey: 'admin.consultants' },
  { key: 'orders', icon: ShoppingBag, labelKey: 'admin.orders' },
  { key: 'payouts', icon: DollarSign, labelKey: 'admin.payouts' },
];

function Sidebar({
  active,
  onSelect,
  t,
}: {
  active: SectionKey;
  onSelect: (k: SectionKey) => void;
  t: (k: string) => string;
}) {
  const { logout } = useAuthStore();

  return (
    <aside className="w-56 bg-white border-r border-border flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border">
        <h2 className="text-lg font-bold text-primary">{t('admin.title')}</h2>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors ${
              active === key
                ? 'bg-primary-light text-primary border-r-2 border-primary'
                : 'text-text-secondary hover:bg-background-gray hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(labelKey)}
          </button>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary w-full"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}

/* ---------- Main Component ---------- */

export function AdminPage() {
  const { t } = useTranslation();
  const [section, setSection] = useState<SectionKey>('dashboard');

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar active={section} onSelect={setSection} t={t} />
      <main className="flex-1 overflow-y-auto p-6 bg-background-gray">
        {section === 'dashboard' && <DashboardSection t={t} />}
        {section === 'consultants' && <ConsultantsSection t={t} />}
        {section === 'orders' && <OrdersSection t={t} />}
        {section === 'payouts' && <PayoutsSection t={t} />}
      </main>
    </div>
  );
}

/* ================================================================
   Dashboard Section
   ================================================================ */

function DashboardSection({ t }: { t: (k: string) => string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<{ data: AdminStats }>('/admin/dashboard').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('common.loading')}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
        <AlertCircle className="w-8 h-8 text-primary" />
        <p>{t('common.error')}</p>
      </div>
    );
  }

  const stats = [
    { label: t('admin.totalUsers'), value: data.total_users, icon: Users },
    { label: t('admin.totalConsultants'), value: data.total_consultants, icon: Users },
    { label: t('admin.totalOrders'), value: data.total_orders, icon: ShoppingBag },
    { label: t('admin.totalRevenue'), value: `Rp ${data.total_revenue.toLocaleString('id-ID')}`, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t('admin.dashboard')}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-border rounded-lg p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-sm text-text-secondary">{label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Consultants Section
   ================================================================ */

function ConsultantsSection({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'consultants', page],
    queryFn: () =>
      api.get<PaginatedResponse<AdminConsultant>>('/admin/consultants', {
        page: String(page),
        limit: String(limit),
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/consultants/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'consultants'] });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t('admin.consultants')}
      </h1>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p>{t('common.error')}</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary hover:underline mt-1"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <Users className="w-10 h-10 text-text-disabled" />
            <p>{t('admin.noConsultants')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('admin.consultantName')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.email')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.specialization')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.date')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((c) => (
                <tr key={c.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.email}</td>
                  <td className="px-4 py-3">{c.specialization || '-'}</td>
                  <td className="px-4 py-3">
                    {c.verified ? (
                      statusBadge('verified', t)
                    ) : (
                      statusBadge('pending', t)
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    {!c.verified && (
                      <button
                        onClick={() => verifyMutation.mutate(c.id)}
                        disabled={verifyMutation.isPending}
                        className="text-xs font-medium text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors"
                      >
                        {t('admin.verify')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
          t={t}
        />
      )}
    </div>
  );
}

/* ================================================================
   Orders Section
   ================================================================ */

function OrdersSection({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () =>
      api.get<PaginatedResponse<AdminOrder>>('/admin/orders', {
        page: String(page),
        limit: String(limit),
      }),
  });

  const refundMutation = useMutation({
    mutationFn: (orderId: string) => api.post(`/admin/orders/${orderId}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {t('admin.orders')}
      </h1>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p>{t('common.error')}</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary hover:underline mt-1"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <ShoppingBag className="w-10 h-10 text-text-disabled" />
            <p>{t('admin.noOrders')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('admin.orderId')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.user')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.consultant')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.amount')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.date')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((o) => (
                <tr key={o.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">{o.user.name}</td>
                  <td className="px-4 py-3">{o.consultant.name}</td>
                  <td className="px-4 py-3 font-medium">
                    Rp {o.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{statusBadge(o.status, t)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="text-xs font-medium text-primary hover:text-primary-hover"
                      >
                        {t('common.view')}
                      </button>
                      {o.status === 'paid' && (
                        <button
                          onClick={() => refundMutation.mutate(o.id)}
                          disabled={refundMutation.isPending}
                          className="text-xs font-medium text-warning hover:opacity-80 disabled:opacity-50"
                        >
                          {t('admin.refund')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
          t={t}
        />
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {t('admin.orderDetails')}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md hover:bg-background-gray text-text-secondary"
                aria-label={t('admin.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.orderId')}</dt>
                <dd className="font-mono text-xs">{selectedOrder.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.user')}</dt>
                <dd>{selectedOrder.user.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.consultant')}</dt>
                <dd>{selectedOrder.consultant.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('dashboard.serviceType')}</dt>
                <dd className="capitalize">{selectedOrder.service_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.amount')}</dt>
                <dd className="font-medium">
                  Rp {selectedOrder.amount.toLocaleString('id-ID')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.status')}</dt>
                <dd>{statusBadge(selectedOrder.status, t)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('admin.date')}</dt>
                <dd>{formatDate(selectedOrder.created_at)}</dd>
              </div>
            </dl>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full py-2 text-sm font-medium text-text-secondary border border-border hover:bg-background-gray rounded-md transition-colors"
            >
              {t('admin.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Payouts Section
   ================================================================ */

function PayoutsSection({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'payouts', page],
    queryFn: () =>
      api.get<PaginatedResponse<PayoutLog>>('/admin/payouts', {
        page: String(page),
        limit: String(limit),
      }),
  });

  const processMutation = useMutation({
    mutationFn: () => api.post<{ data: unknown }>('/admin/payouts/process'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('admin.payouts')}
        </h1>
        <button
          onClick={() => processMutation.mutate()}
          disabled={processMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {processMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {t('admin.processPayouts')}
        </button>
      </div>

      {processMutation.isSuccess && (
        <div className="mb-4 px-4 py-2 bg-success-bg text-success text-sm rounded-md">
          {t('admin.payoutProcessed')}
        </div>
      )}

      {processMutation.isError && (
        <div className="mb-4 px-4 py-2 bg-critical-bg text-primary text-sm rounded-md">
          {t('common.error')}
        </div>
      )}

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <AlertCircle className="w-8 h-8 text-primary" />
            <p>{t('common.error')}</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-primary hover:underline mt-1"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-2">
            <DollarSign className="w-10 h-10 text-text-disabled" />
            <p>{t('admin.noPayouts')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('admin.payoutId')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.consultant')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.amount')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.period')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.status')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((p) => (
                <tr key={p.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3 font-mono text-xs">{p.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3">{p.consultant.name}</td>
                  <td className="px-4 py-3 font-medium">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(p.period_start)} &ndash; {formatDate(p.period_end)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.status, t)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
          t={t}
        />
      )}
    </div>
  );
}
