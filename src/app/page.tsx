'use client';

import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t, formatCurrency, formatDate } from '@/lib/i18n';
import Link from 'next/link';

export default function Dashboard() {
  const { settings, invoices, companies } = useStore();
  const locale = settings.locale;

  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'draft');
  const overdueInvoices = invoices.filter((inv) => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    return new Date(inv.dueDate) < new Date();
  });

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const outstandingAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Monthly revenue for the last 6 months
  const monthlyData = getMonthlyRevenue(paidInvoices, locale);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(locale, 'dashboard.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {locale === 'en' ? 'Overview of your invoicing activity' : 'Prehľad vašej fakturačnej činnosti'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t(locale, 'dashboard.totalRevenue')}
          value={formatCurrency(totalRevenue, locale)}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title={t(locale, 'dashboard.totalInvoices')}
          value={String(invoices.length)}
          subtitle={`${paidInvoices.length} ${t(locale, 'dashboard.paidInvoices').toLowerCase()}`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
        <StatCard
          title={locale === 'en' ? 'Outstanding' : 'Nesplatené'}
          value={formatCurrency(outstandingAmount, locale)}
          subtitle={`${unpaidInvoices.length} ${t(locale, 'dashboard.unpaidInvoices').toLowerCase()}`}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title={t(locale, 'dashboard.overdueInvoices')}
          value={String(overdueInvoices.length)}
          subtitle={formatCurrency(overdueInvoices.reduce((s, i) => s + i.total, 0), locale)}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'dashboard.revenueOverTime')}</h3>
          {monthlyData.length > 0 ? (
            <div className="space-y-3">
              {monthlyData.map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-gray-500 dark:text-slate-400 text-right">{m.label}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full transition-all"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                  <span className="w-24 text-sm font-medium text-right">{formatCurrency(m.amount, locale)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8">{t(locale, 'common.noData')}</p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t(locale, 'dashboard.recentInvoices')}</h3>
            <Link href="/invoices" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
              {locale === 'en' ? 'View all' : 'Zobraziť všetky'}
            </Link>
          </div>
          {recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{inv.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(inv.total, locale)}</p>
                      <StatusBadge status={inv.status} locale={locale} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 dark:text-slate-500 mb-3">{t(locale, 'common.noData')}</p>
              <Link
                href="/invoices/new"
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                {t(locale, 'invoice.createInvoice')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {companies.length === 0 && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            {locale === 'en' ? 'Get Started' : 'Začnite'}
          </h3>
          <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">
            {locale === 'en'
              ? 'Add your first company to start creating invoices.'
              : 'Pridajte svoju prvú spoločnosť a začnite vytvárať faktúry.'}
          </p>
          <Link
            href="/companies/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t(locale, 'company.addCompany')}
          </Link>
        </div>
      )}
    </Layout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: React.ReactNode;
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-sm text-gray-500 dark:text-slate-400">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatusBadge({ status, locale }: { status: string; locale: 'en' | 'sk' }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
    sent: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    paid: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    overdue: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    cancelled: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {t(locale, `invoice.status_${status}`)}
    </span>
  );
}

function getMonthlyRevenue(paidInvoices: any[], locale: 'en' | 'sk') {
  const months: Record<string, number> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }

  paidInvoices.forEach((inv) => {
    const d = new Date(inv.paidAt || inv.invoiceDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in months) {
      months[key] += inv.total;
    }
  });

  const maxAmount = Math.max(...Object.values(months), 1);

  return Object.entries(months).map(([key, amount]) => {
    const [year, month] = key.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return {
      label: d.toLocaleDateString(locale === 'en' ? 'en-US' : 'sk-SK', { month: 'short' }),
      amount,
      percentage: (amount / maxAmount) * 100,
    };
  });
}
