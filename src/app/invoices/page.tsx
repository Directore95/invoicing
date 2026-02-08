'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t, formatCurrency, formatDate } from '@/lib/i18n';
import { StatusBadge } from '@/app/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InvoiceStatus } from '@/lib/types';

export default function InvoicesPage() {
  const router = useRouter();
  const { settings, invoices, deleteInvoice, cloneInvoice, updateInvoiceStatus } = useStore();
  const locale = settings.locale;
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = invoices
    .filter((inv) => filter === 'all' || inv.status === filter)
    .filter((inv) =>
      search === '' ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleClone = (id: string) => {
    const cloned = cloneInvoice(id);
    router.push(`/invoices/${cloned.id}/edit`);
  };

  const statusFilters: Array<{ key: 'all' | InvoiceStatus; label: string }> = [
    { key: 'all', label: locale === 'en' ? 'All' : 'Všetky' },
    { key: 'draft', label: t(locale, 'invoice.status_draft') },
    { key: 'sent', label: t(locale, 'invoice.status_sent') },
    { key: 'paid', label: t(locale, 'invoice.status_paid') },
    { key: 'overdue', label: t(locale, 'invoice.status_overdue') },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(locale, 'invoice.title')}</h1>
          <p className="text-gray-500 mt-1">
            {locale === 'en' ? `${invoices.length} total invoices` : `${invoices.length} faktúr celkom`}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t(locale, 'invoice.createInvoice')}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex rounded-lg bg-gray-100 p-1">
          {statusFilters.map((sf) => (
            <button
              key={sf.key}
              onClick={() => setFilter(sf.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === sf.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder={t(locale, 'common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-3">{t(locale, 'common.noData')}</p>
          <Link href="/invoices/new" className="text-blue-600 text-sm hover:underline">
            {t(locale, 'invoice.createInvoice')}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'invoice.invoiceNumber')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'invoice.clientName')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'invoice.invoiceDate')}</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'invoice.dueDate')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'invoice.total')}</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'common.status')}</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t(locale, 'common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/invoices/${inv.id}`} className="text-blue-600 font-medium text-sm hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{inv.clientName}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(inv.invoiceDate, locale)}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(inv.dueDate, locale)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-right">{formatCurrency(inv.total, locale)}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={inv.status} locale={locale} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title={t(locale, 'common.preview')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/invoices/${inv.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title={t(locale, 'common.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleClone(inv.id)}
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        title={t(locale, 'common.clone')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </button>
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'sent')}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title={t(locale, 'invoice.markAsSent')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'overdue') && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          title={t(locale, 'invoice.markAsPaid')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(t(locale, 'common.confirm'))) deleteInvoice(inv.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title={t(locale, 'common.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
