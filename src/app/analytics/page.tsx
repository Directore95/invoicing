'use client';

import { useMemo } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';

export default function AnalyticsPage() {
  const { settings, invoices, companies } = useStore();
  const locale = settings.locale;

  const analytics = useMemo(() => {
    const paid = invoices.filter((inv) => inv.status === 'paid');
    const sent = invoices.filter((inv) => inv.status === 'sent');
    const overdue = invoices.filter((inv) => {
      if (inv.status === 'paid' || inv.status === 'cancelled') return false;
      return new Date(inv.dueDate) < new Date();
    });

    const totalIncome = paid.reduce((s, i) => s + i.total, 0);
    const avgInvoice = paid.length > 0 ? totalIncome / paid.length : 0;
    const outstandingAmount = [...sent, ...overdue].reduce((s, i) => s + i.total, 0);
    const collectionRate = invoices.length > 0 ? (paid.length / invoices.filter(i => i.status !== 'draft' && i.status !== 'cancelled').length) * 100 : 0;

    // Monthly revenue (last 12 months)
    const monthlyRevenue: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = 0;
    }
    paid.forEach((inv) => {
      const d = new Date(inv.paidAt || inv.invoiceDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyRevenue) monthlyRevenue[key] += inv.total;
    });

    // Income by company
    const byCompany: Record<string, { name: string; amount: number }> = {};
    paid.forEach((inv) => {
      const key = inv.companyId || 'unknown';
      if (!byCompany[key]) byCompany[key] = { name: inv.companyName || (locale === 'en' ? 'Unknown' : 'Neznáma'), amount: 0 };
      byCompany[key].amount += inv.total;
    });

    // Income by client (top 10)
    const byClient: Record<string, { name: string; amount: number; count: number }> = {};
    paid.forEach((inv) => {
      const key = inv.clientName || 'Unknown';
      if (!byClient[key]) byClient[key] = { name: key, amount: 0, count: 0 };
      byClient[key].amount += inv.total;
      byClient[key].count += 1;
    });
    const topClients = Object.values(byClient)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Status breakdown
    const statusCounts = {
      draft: invoices.filter((i) => i.status === 'draft').length,
      sent: sent.length,
      paid: paid.length,
      overdue: overdue.length,
      cancelled: invoices.filter((i) => i.status === 'cancelled').length,
    };

    // Revenue growth
    const monthKeys = Object.keys(monthlyRevenue);
    const currentMonth = monthlyRevenue[monthKeys[monthKeys.length - 1]] || 0;
    const prevMonth = monthlyRevenue[monthKeys[monthKeys.length - 2]] || 0;
    const growthPct = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;

    return {
      totalIncome,
      avgInvoice,
      outstandingAmount,
      collectionRate,
      monthlyRevenue,
      byCompany: Object.values(byCompany).sort((a, b) => b.amount - a.amount),
      topClients,
      statusCounts,
      growthPct,
      currentMonth,
      totalPaid: paid.length,
      totalInvoices: invoices.length,
    };
  }, [invoices, locale]);

  const maxMonthly = Math.max(...Object.values(analytics.monthlyRevenue), 1);
  const maxClientAmount = analytics.topClients.length > 0 ? analytics.topClients[0].amount : 1;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(locale, 'analytics.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {locale === 'en' ? 'Track your income and business performance' : 'Sledujte vaše príjmy a výkon podnikania'}
        </p>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label={t(locale, 'analytics.totalIncome')}
          value={formatCurrency(analytics.totalIncome, locale)}
          sublabel={`${analytics.totalPaid} ${locale === 'en' ? 'paid invoices' : 'zaplatených faktúr'}`}
          color="blue"
        />
        <MetricCard
          label={t(locale, 'analytics.averageInvoice')}
          value={formatCurrency(analytics.avgInvoice, locale)}
          sublabel={`${analytics.totalInvoices} ${locale === 'en' ? 'total' : 'celkom'}`}
          color="green"
        />
        <MetricCard
          label={t(locale, 'analytics.outstandingAmount')}
          value={formatCurrency(analytics.outstandingAmount, locale)}
          sublabel={`${analytics.statusCounts.sent + analytics.statusCounts.overdue} ${locale === 'en' ? 'pending' : 'čakajúcich'}`}
          color="yellow"
        />
        <MetricCard
          label={t(locale, 'analytics.collectionRate')}
          value={`${analytics.collectionRate.toFixed(1)}%`}
          sublabel={
            analytics.growthPct >= 0
              ? `+${analytics.growthPct.toFixed(1)}% ${locale === 'en' ? 'growth' : 'rast'}`
              : `${analytics.growthPct.toFixed(1)}% ${locale === 'en' ? 'decline' : 'pokles'}`
          }
          color={analytics.growthPct >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'analytics.revenueByMonth')}</h3>
          {Object.keys(analytics.monthlyRevenue).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(analytics.monthlyRevenue).map(([key, amount]) => {
                const [year, month] = key.split('-');
                const d = new Date(parseInt(year), parseInt(month) - 1);
                const label = d.toLocaleDateString(locale === 'en' ? 'en-US' : 'sk-SK', { month: 'short', year: '2-digit' });
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-14 text-xs text-gray-500 dark:text-slate-400 text-right font-mono">{label}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-5 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-5 rounded-full transition-all duration-500"
                        style={{ width: `${(amount / maxMonthly) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 text-xs font-medium text-right">{formatCurrency(amount, locale)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8">{t(locale, 'common.noData')}</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'analytics.invoicesByStatus')}</h3>
          {analytics.totalInvoices > 0 ? (
            <div className="space-y-4">
              {/* Visual bar */}
              <div className="flex h-8 rounded-lg overflow-hidden">
                {analytics.statusCounts.paid > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(analytics.statusCounts.paid / analytics.totalInvoices) * 100}%` }}
                  />
                )}
                {analytics.statusCounts.sent > 0 && (
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(analytics.statusCounts.sent / analytics.totalInvoices) * 100}%` }}
                  />
                )}
                {analytics.statusCounts.draft > 0 && (
                  <div
                    className="bg-gray-300 transition-all"
                    style={{ width: `${(analytics.statusCounts.draft / analytics.totalInvoices) * 100}%` }}
                  />
                )}
                {analytics.statusCounts.overdue > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(analytics.statusCounts.overdue / analytics.totalInvoices) * 100}%` }}
                  />
                )}
                {analytics.statusCounts.cancelled > 0 && (
                  <div
                    className="bg-gray-200 transition-all"
                    style={{ width: `${(analytics.statusCounts.cancelled / analytics.totalInvoices) * 100}%` }}
                  />
                )}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-3">
                <StatusRow color="bg-green-500" label={t(locale, 'invoice.status_paid')} count={analytics.statusCounts.paid} />
                <StatusRow color="bg-blue-500" label={t(locale, 'invoice.status_sent')} count={analytics.statusCounts.sent} />
                <StatusRow color="bg-gray-300" label={t(locale, 'invoice.status_draft')} count={analytics.statusCounts.draft} />
                <StatusRow color="bg-red-500" label={t(locale, 'invoice.status_overdue')} count={analytics.statusCounts.overdue} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8">{t(locale, 'common.noData')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Clients */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'analytics.topClients')}</h3>
          {analytics.topClients.length > 0 ? (
            <div className="space-y-3">
              {analytics.topClients.map((client, idx) => (
                <div key={client.name} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-gray-400 dark:text-slate-500 text-right">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(client.amount, locale)}</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(client.amount / maxClientAmount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {client.count} {locale === 'en' ? 'invoices' : 'faktur'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8">{t(locale, 'common.noData')}</p>
          )}
        </div>

        {/* Income by Company */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'analytics.incomeStreams')}</h3>
          {analytics.byCompany.length > 0 ? (
            <div className="space-y-4">
              {analytics.byCompany.map((company) => {
                const pct = analytics.totalIncome > 0 ? (company.amount / analytics.totalIncome) * 100 : 0;
                return (
                  <div key={company.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{company.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(company.amount, locale)}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-slate-500 text-center py-8">{t(locale, 'common.noData')}</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ label, value, sublabel, color }: { label: string; value: string; sublabel: string; color: string }) {
  const bg: Record<string, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
  };
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-l-4 ${bg[color]} p-5`}>
      <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}

function StatusRow({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-gray-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto">{count}</span>
    </div>
  );
}
