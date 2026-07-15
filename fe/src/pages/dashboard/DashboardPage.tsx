import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import {
  MessageSquare,
  ShoppingBag,
  FileText,
  Settings,
  CreditCard,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/* ---------- Types ---------- */

interface Consultation {
  id: string;
  consultant: { id: string; name: string; avatar_url?: string };
  type: 'chat' | 'task';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

interface Order {
  id: string;
  service_type: string;
  consultant: { id: string; name: string };
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
}

interface Document {
  id: string;
  filename: string;
  type: string;
  size: number;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface SettingsFormData {
  name: string;
  phone: string;
  npwp: string;
  locale: 'id' | 'en';
}

/* ---------- Helpers ---------- */

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-warning-bg text-warning',
  active: 'bg-info-bg text-info',
  completed: 'bg-success-bg text-success',
  cancelled: 'bg-critical-bg text-primary',
  paid: 'bg-success-bg text-success',
  refunded: 'bg-warning-bg text-warning',
};

function statusBadge(status: string, t: (k: string) => string) {
  const labelMap: Record<string, string> = {
    pending: t('dashboard.pending'),
    active: t('dashboard.active'),
    completed: t('dashboard.completed'),
    cancelled: t('dashboard.cancelled'),
    paid: t('dashboard.paid'),
    refunded: t('dashboard.paid'),
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_CLASSES[status] ?? 'bg-background-gray text-text-secondary'
      }`}
    >
      {labelMap[status] ?? status}
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ---------- Pagination ---------- */

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

/* ---------- Tab Switcher ---------- */

const TABS = [
  { key: 'consultations', icon: MessageSquare, labelKey: 'dashboard.myConsultations' },
  { key: 'orders', icon: ShoppingBag, labelKey: 'dashboard.myOrders' },
  { key: 'documents', icon: FileText, labelKey: 'dashboard.myDocuments' },
  { key: 'settings', icon: Settings, labelKey: 'dashboard.settings' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/* ---------- Main Component ---------- */

export function DashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('consultations');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t('dashboard.title')}</h1>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'consultations' && <ConsultationsTab t={t} />}
      {activeTab === 'orders' && <OrdersTab t={t} />}
      {activeTab === 'documents' && <DocumentsTab t={t} />}
      {activeTab === 'settings' && <SettingsTab t={t} />}
    </div>
  );
}

/* ================================================================
   Consultations Tab
   ================================================================ */

function ConsultationsTab({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['consultations', page],
    queryFn: () =>
      api.get<PaginatedResponse<Consultation>>('/consultations', {
        page: String(page),
        limit: String(limit),
      }),
  });

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
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
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
            <MessageSquare className="w-10 h-10 text-text-disabled" />
            <p>{t('dashboard.noConsultations')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('dashboard.consultant')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.type')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.status')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.date')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((c) => (
                <tr key={c.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3">{c.consultant.name}</td>
                  <td className="px-4 py-3 capitalize">
                    {c.type === 'chat' ? t('dashboard.chat') : t('dashboard.task')}
                  </td>
                  <td className="px-4 py-3">{statusBadge(c.status, t)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      to={`/chat/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t('dashboard.viewChat')}
                    </Link>
                    {/* View Details can be a link or modal */}
                    <span className="text-xs font-medium text-text-secondary cursor-default">
                      {t('dashboard.viewDetails')}
                    </span>
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
   Orders Tab
   ================================================================ */

function OrdersTab({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', page],
    queryFn: () =>
      api.get<PaginatedResponse<Order>>('/orders', {
        page: String(page),
        limit: String(limit),
      }),
  });

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
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
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
            <ShoppingBag className="w-10 h-10 text-text-disabled" />
            <p>{t('dashboard.noOrders')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('dashboard.serviceType')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.consultant')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.amount')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.status')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.date')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((o) => (
                <tr key={o.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3">{o.service_type}</td>
                  <td className="px-4 py-3">{o.consultant.name}</td>
                  <td className="px-4 py-3 font-medium">
                    Rp {o.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">{statusBadge(o.status, t)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {o.status === 'pending' && (
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-white bg-primary hover:bg-primary-hover px-2.5 py-1 rounded-md">
                        <CreditCard className="w-3.5 h-3.5" />
                        {t('dashboard.payNow')}
                      </button>
                    )}
                    <span className="text-xs font-medium text-text-secondary cursor-default">
                      {t('dashboard.viewDetails')}
                    </span>
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
   Documents Tab
   ================================================================ */

function DocumentsTab({ t }: { t: (k: string) => string }) {
  const [page, setPage] = useState(1);
  const limit = 5;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['documents', page],
    queryFn: () =>
      api.get<PaginatedResponse<Document>>('/users/me/documents', {
        page: String(page),
        limit: String(limit),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => api.delete(`/users/me/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleDelete = (doc: Document) => {
    if (window.confirm(t('dashboard.deleteConfirm'))) {
      deleteMutation.mutate(doc.id);
    }
  };

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('common.loading')}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
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
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-2">
            <FileText className="w-10 h-10 text-text-disabled" />
            <p>{t('dashboard.noDocuments')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background-gray text-text-secondary text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t('dashboard.documentType')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.documentType')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.documentSize')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.date')}</th>
                <th className="px-4 py-3 font-medium">{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data.map((d) => (
                <tr key={d.id} className="hover:bg-background-gray/50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-text-secondary" />
                    {d.filename}
                  </td>
                  <td className="px-4 py-3 capitalize">{d.type}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatSize(d.size)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(d.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(d)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {t('dashboard.delete')}
                    </button>
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
   Settings Tab
   ================================================================ */

function SettingsTab({ t }: { t: (k: string) => string }) {
  const { user, setUser } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<SettingsFormData>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    npwp: user?.npwp ?? '',
    locale: (user?.locale ?? 'id') as 'id' | 'en',
  });

  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) =>
      api.patch<{ data: SettingsFormData }>('/users/me', data),
    onSuccess: (res) => {
      setUser({
        ...user!,
        name: res.data.name,
        phone: res.data.phone,
        npwp: res.data.npwp,
        locale: res.data.locale,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16 text-text-secondary">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        {t('dashboard.settingsTitle')}
      </h2>

      {saved && (
        <div className="mb-4 px-4 py-2 bg-success-bg text-success text-sm rounded-md">
          {t('dashboard.settingsSaved')}
        </div>
      )}

      {updateMutation.isError && (
        <div className="mb-4 px-4 py-2 bg-critical-bg text-primary text-sm rounded-md">
          {t('common.error')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('dashboard.name')}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('dashboard.phone')}
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('dashboard.npwp')}
          </label>
          <input
            type="text"
            value={form.npwp}
            onChange={(e) => setForm((f) => ({ ...f, npwp: e.target.value }))}
            className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('dashboard.locale')}
          </label>
          <select
            value={form.locale}
            onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value as 'id' | 'en' }))}
            className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          {t('dashboard.saveSettings')}
        </button>
      </form>
    </div>
  );
}
