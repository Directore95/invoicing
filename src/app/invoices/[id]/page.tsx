'use client';

import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { InvoicePreview } from '@/components/InvoiceTemplates';
import { useStore } from '@/lib/store';
import { t, formatCurrency } from '@/lib/i18n';
import { exportInvoicePDF } from '@/lib/pdf';
import { StatusBadge } from '@/app/page';
import Link from 'next/link';
import { useState } from 'react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { settings, invoices, updateInvoiceStatus, cloneInvoice, deleteInvoice } = useStore();
  const locale = settings.locale;
  const [exporting, setExporting] = useState(false);

  const invoice = invoices.find((inv) => inv.id === params.id);

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">{locale === 'en' ? 'Invoice not found' : 'Faktúra nebola nájdená'}</p>
          <Link href="/invoices" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            {t(locale, 'common.back')}
          </Link>
        </div>
      </Layout>
    );
  }

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportInvoicePDF('invoice-content', `${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(locale === 'en' ? 'PDF export failed. Please try again.' : 'Export PDF zlyhal. Skúste to znova.');
    } finally {
      setExporting(false);
    }
  };

  const handleClone = () => {
    const cloned = cloneInvoice(invoice.id);
    router.push(`/invoices/${cloned.id}/edit`);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/invoices')} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={invoice.status} locale={locale} />
                <span className="text-sm text-gray-500">{invoice.clientName}</span>
                <span className="text-sm font-semibold text-gray-700">{formatCurrency(invoice.total, locale)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && (
              <button
                onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {t(locale, 'invoice.markAsSent')}
              </button>
            )}
            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <button
                onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t(locale, 'invoice.markAsPaid')}
              </button>
            )}
            <button
              onClick={handleClone}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              {t(locale, 'common.clone')}
            </button>
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              {t(locale, 'common.edit')}
            </Link>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {exporting ? (locale === 'en' ? 'Exporting...' : 'Exportujem...') : t(locale, 'common.export')}
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <InvoicePreview invoice={invoice} locale={locale} />
        </div>
      </div>
    </Layout>
  );
}
