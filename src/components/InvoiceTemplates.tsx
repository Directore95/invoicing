'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, t, Locale, regionConfig } from '@/lib/i18n';
import { generatePaymentQR } from '@/lib/qrcode';

interface TemplateProps {
  invoice: Invoice;
  locale: Locale;
}

function usePaymentQR(invoice: Invoice, locale: Locale) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    generatePaymentQR(invoice, locale).then(setQrDataUrl);
  }, [invoice.companyIban, invoice.companyBankAccount, invoice.companyRoutingNumber, invoice.companySwiftCode, invoice.total, invoice.variableSymbol, invoice.invoiceNumber, invoice.companyName, locale]);
  return qrDataUrl;
}

/** Stamp + Signature overlay: stamp at 35% opacity behind signature */
function SignatureStampBlock({ invoice, locale, align = 'right' }: TemplateProps & { align?: 'left' | 'right' }) {
  const hasStamp = !!invoice.companyStamp;
  const hasSignature = !!invoice.companySignature;
  if (!hasStamp && !hasSignature) return null;

  return (
    <div className={`text-center ${align === 'right' ? 'ml-auto' : ''}`}>
      <div className="relative inline-block" style={{ minWidth: '140px', minHeight: '80px' }}>
        {hasStamp && (
          <img
            src={invoice.companyStamp}
            alt="Stamp"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: 0.35 }}
          />
        )}
        {hasSignature && (
          <img
            src={invoice.companySignature}
            alt="Signature"
            className="relative h-16 object-contain mx-auto"
            style={{ zIndex: 1 }}
          />
        )}
      </div>
      <div className="border-t border-gray-300 mt-1 pt-1">
        <p className="text-xs text-gray-700">{locale === 'en' ? 'Authorized Signature' : 'Podpis a pečiatka'}</p>
      </div>
    </div>
  );
}

// ============================================================
// MODERN TEMPLATE - Clean, minimal with accent color bar
// ============================================================
export function ModernTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];
  const qrDataUrl = usePaymentQR(invoice, locale);

  return (
    <div className="bg-white p-6 max-w-[210mm] mx-auto text-sm" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {invoice.companyLogo && (
              <img src={invoice.companyLogo} alt="Logo" className="h-14 object-contain" />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{invoice.companyLegalName || invoice.companyName}</h2>
              <p className="text-gray-700 text-xs">{invoice.companyStreet}, {invoice.companyCity} {invoice.companyZip}</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {locale === 'en' ? 'INVOICE' : 'FAKTÚRA'}
          </h1>
          <p className="text-blue-600 font-semibold mt-0.5">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-800 text-xs uppercase tracking-wide mb-0.5">
            {t(locale, 'invoice.invoiceDate')}
          </p>
          <p className="font-medium text-gray-900">{formatDate(invoice.invoiceDate, locale)}</p>
          <p className="text-gray-800 text-xs uppercase tracking-wide mb-0.5 mt-1.5">
            {t(locale, 'invoice.dueDate')}
          </p>
          <p className="font-medium text-gray-900">{formatDate(invoice.dueDate, locale)}</p>
          {invoice.variableSymbol && locale === 'sk' && (
            <>
              <p className="text-gray-800 text-xs uppercase tracking-wide mb-0.5 mt-1.5">Variabilný symbol</p>
              <p className="font-medium text-gray-900">{invoice.variableSymbol}</p>
            </>
          )}
          {invoice.constantSymbol && locale === 'sk' && (
            <>
              <p className="text-gray-800 text-xs uppercase tracking-wide mb-0.5 mt-1.5">Konštantný symbol</p>
              <p className="font-medium text-gray-900">{invoice.constantSymbol}</p>
            </>
          )}
          {invoice.poNumber && locale === 'en' && (
            <>
              <p className="text-gray-800 text-xs uppercase tracking-wide mb-0.5 mt-1.5">PO Number</p>
              <p className="font-medium text-gray-900">{invoice.poNumber}</p>
            </>
          )}
        </div>
      </div>

      {/* Blue accent bar */}
      <div className="h-0.5 bg-blue-600 mb-6 rounded-full" />

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-700 mb-2 font-semibold">
            {t(locale, 'invoice.from')}
          </p>
          <p className="font-bold text-gray-900">{invoice.companyLegalName || invoice.companyName}</p>
          <p className="text-gray-700">{invoice.companyStreet}</p>
          <p className="text-gray-700">
            {invoice.companyCity}{invoice.companyState ? `, ${invoice.companyState}` : ''} {invoice.companyZip}
          </p>
          <p className="text-gray-700">{invoice.companyCountry}</p>
          {invoice.companyTaxId && (
            <p className="text-gray-800 mt-2">
              <span className="text-gray-700">{locale === 'en' ? 'Tax ID: ' : 'DIČ: '}</span>
              {invoice.companyTaxId}
            </p>
          )}
          {invoice.companyRegistrationNumber && (
            <p className="text-gray-800">
              <span className="text-gray-700">{locale === 'en' ? 'Reg #: ' : 'IČO: '}</span>
              {invoice.companyRegistrationNumber}
            </p>
          )}
          {invoice.companyVatId && locale === 'sk' && (
            <p className="text-gray-800">
              <span className="text-gray-700">IČ DPH: </span>
              {invoice.companyVatId}
            </p>
          )}
          {invoice.companyPhone && <p className="text-gray-800 mt-1">{invoice.companyPhone}</p>}
          {invoice.companyEmail && <p className="text-gray-800">{invoice.companyEmail}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-700 mb-2 font-semibold">
            {t(locale, 'invoice.to')}
          </p>
          <p className="font-bold text-gray-900">{invoice.clientName}</p>
          <p className="text-gray-700">{invoice.clientStreet}</p>
          <p className="text-gray-700">
            {invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}
          </p>
          <p className="text-gray-700">{invoice.clientCountry}</p>
          {invoice.clientTaxId && (
            <p className="text-gray-800 mt-2">
              <span className="text-gray-700">{locale === 'en' ? 'Tax ID: ' : 'DIČ: '}</span>
              {invoice.clientTaxId}
            </p>
          )}
          {invoice.clientRegistrationNumber && locale === 'sk' && (
            <p className="text-gray-800">
              <span className="text-gray-700">IČO: </span>
              {invoice.clientRegistrationNumber}
            </p>
          )}
          {invoice.clientVatId && locale === 'sk' && (
            <p className="text-gray-800">
              <span className="text-gray-700">IČ DPH: </span>
              {invoice.clientVatId}
            </p>
          )}
          {invoice.clientEmail && <p className="text-gray-800 mt-1">{invoice.clientEmail}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 text-xs uppercase tracking-wide text-gray-700 font-semibold">{t(locale, 'invoice.itemDescription')}</th>
            <th className="text-center py-2 text-xs uppercase tracking-wide text-gray-700 font-semibold w-16">{t(locale, 'invoice.itemUnit')}</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-gray-700 font-semibold w-20">{t(locale, 'invoice.itemQuantity')}</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-gray-700 font-semibold w-28">{t(locale, 'invoice.itemRate')}</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-gray-700 font-semibold w-28">{t(locale, 'invoice.itemAmount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2 px-2 text-gray-800">{item.description}</td>
              <td className="py-2 px-2 text-center text-gray-700">{item.unit}</td>
              <td className="py-2 px-2 text-right text-gray-700">{item.quantity}</td>
              <td className="py-2 px-2 text-right text-gray-700">{formatCurrency(item.rate, locale)}</td>
              <td className="py-2 px-2 text-right font-medium text-gray-800">{formatCurrency(item.amount, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-1.5 text-gray-900">
            <span>{t(locale, 'invoice.subtotal')}</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1.5 text-gray-900">
              <span>{t(locale, 'invoice.discount')}</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-1.5 text-gray-900">
              <span>{rc.taxName} ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-blue-600 mt-1">
            <span className="font-bold text-gray-900">{t(locale, 'invoice.total')}</span>
            <span className="font-bold text-blue-600">{formatCurrency(invoice.total, locale)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details + QR Code */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-700 font-semibold mb-2">
              {t(locale, 'company.bankDetails')}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {invoice.companyBankName && (
                <p className="text-gray-800"><span className="text-gray-700">{t(locale, 'company.bankName')}: </span>{invoice.companyBankName}</p>
              )}
              {locale === 'sk' && invoice.companyIban && (
                <p className="text-gray-800"><span className="text-gray-700">IBAN: </span>{invoice.companyIban}</p>
              )}
              {locale === 'en' && invoice.companyBankAccount && (
                <p className="text-gray-800"><span className="text-gray-700">Account: </span>{invoice.companyBankAccount}</p>
              )}
              {locale === 'en' && invoice.companyRoutingNumber && (
                <p className="text-gray-800"><span className="text-gray-700">Routing: </span>{invoice.companyRoutingNumber}</p>
              )}
              {invoice.companySwiftCode && (
                <p className="text-gray-800"><span className="text-gray-700">SWIFT/BIC: </span>{invoice.companySwiftCode}</p>
              )}
              {invoice.variableSymbol && locale === 'sk' && (
                <p className="text-gray-800"><span className="text-gray-700">VS: </span>{invoice.variableSymbol}</p>
              )}
            </div>
          </div>
          {qrDataUrl && (
            <div className="text-center ml-4 flex-shrink-0">
              <img src={qrDataUrl} alt="Payment QR" className="w-28 h-28" />
              <p className="text-[10px] text-gray-700 mt-1">
                {locale === 'en' ? 'Scan to pay' : 'Naskenujte pre platbu'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment method */}
      {invoice.paymentMethod && (
        <p className="text-gray-800 mb-3 text-sm">
          <span className="text-gray-700">{t(locale, 'invoice.paymentMethod')}: </span>{invoice.paymentMethod}
        </p>
      )}

      {/* Notes & Terms */}
      {invoice.notes && (
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-gray-700 font-semibold mb-0.5">{t(locale, 'invoice.notes')}</p>
          <p className="text-gray-700 text-xs whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
      {invoice.terms && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-700 font-semibold mb-0.5">{t(locale, 'invoice.terms')}</p>
          <p className="text-gray-700 text-xs whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}

      {/* Signature & Stamp overlay */}
      <div className="flex justify-end items-end mt-6 pt-4 border-t border-gray-200">
        <SignatureStampBlock invoice={invoice} locale={locale} />
      </div>
    </div>
  );
}

// ============================================================
// CLASSIC TEMPLATE - Traditional, formal invoice layout
// ============================================================
export function ClassicTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];
  const qrDataUrl = usePaymentQR(invoice, locale);

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto text-sm" id="invoice-content">
      {/* Header with border */}
      <div className="border-b-4 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {invoice.companyLogo && (
              <img src={invoice.companyLogo} alt="Logo" className="h-14 object-contain" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invoice.companyLegalName || invoice.companyName}</h2>
              <p className="text-gray-700 text-xs">{invoice.companyStreet}, {invoice.companyCity} {invoice.companyZip}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              {locale === 'en' ? 'INVOICE' : 'FAKTÚRA'}
            </h1>
          </div>
        </div>
      </div>

      {/* Invoice meta + Parties */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <h3 className="font-bold text-gray-800 border-b border-gray-700 pb-1 mb-2">{t(locale, 'invoice.from')}</h3>
          <p className="font-semibold text-gray-900">{invoice.companyLegalName || invoice.companyName}</p>
          <p className="text-gray-900">{invoice.companyStreet}</p>
          <p className="text-gray-900">{invoice.companyCity}{invoice.companyState ? `, ${invoice.companyState}` : ''} {invoice.companyZip}</p>
          <p className="text-gray-900">{invoice.companyCountry}</p>
          {invoice.companyTaxId && <p className="text-gray-900 mt-1">{locale === 'en' ? 'EIN' : 'DIČ'}: {invoice.companyTaxId}</p>}
          {invoice.companyRegistrationNumber && <p className="text-gray-900">{locale === 'en' ? 'Reg' : 'IČO'}: {invoice.companyRegistrationNumber}</p>}
          {invoice.companyVatId && locale === 'sk' && <p className="text-gray-900">IČ DPH: {invoice.companyVatId}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 border-b border-gray-700 pb-1 mb-2">{t(locale, 'invoice.to')}</h3>
          <p className="font-semibold text-gray-900">{invoice.clientName}</p>
          <p className="text-gray-900">{invoice.clientStreet}</p>
          <p className="text-gray-900">{invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}</p>
          <p className="text-gray-900">{invoice.clientCountry}</p>
          {invoice.clientTaxId && <p className="text-gray-900 mt-1">{locale === 'en' ? 'Tax ID' : 'DIČ'}: {invoice.clientTaxId}</p>}
          {invoice.clientRegistrationNumber && locale === 'sk' && <p className="text-gray-900">IČO: {invoice.clientRegistrationNumber}</p>}
          {invoice.clientVatId && locale === 'sk' && <p className="text-gray-900">IČ DPH: {invoice.clientVatId}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
            {locale === 'en' ? 'Invoice Details' : 'Údaje faktúry'}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-900">{t(locale, 'invoice.invoiceNumber')}:</span>
              <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">{t(locale, 'invoice.invoiceDate')}:</span>
              <span className="text-gray-900">{formatDate(invoice.invoiceDate, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">{t(locale, 'invoice.dueDate')}:</span>
              <span className="text-gray-900">{formatDate(invoice.dueDate, locale)}</span>
            </div>
            {invoice.poNumber && locale === 'en' && (
              <div className="flex justify-between">
                <span className="text-gray-900">PO #:</span>
                <span className="text-gray-900">{invoice.poNumber}</span>
              </div>
            )}
            {invoice.variableSymbol && locale === 'sk' && (
              <div className="flex justify-between">
                <span className="text-gray-900">VS:</span>
                <span className="text-gray-900">{invoice.variableSymbol}</span>
              </div>
            )}
            {invoice.constantSymbol && locale === 'sk' && (
              <div className="flex justify-between">
                <span className="text-gray-900">KS:</span>
                <span className="text-gray-900">{invoice.constantSymbol}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 border border-gray-300">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left py-2 px-3 text-xs font-semibold">#</th>
            <th className="text-left py-2 px-3 text-xs font-semibold">{t(locale, 'invoice.itemDescription')}</th>
            <th className="text-center py-2 px-3 text-xs font-semibold">{t(locale, 'invoice.itemUnit')}</th>
            <th className="text-right py-2 px-3 text-xs font-semibold">{t(locale, 'invoice.itemQuantity')}</th>
            <th className="text-right py-2 px-3 text-xs font-semibold">{t(locale, 'invoice.itemRate')}</th>
            <th className="text-right py-2 px-3 text-xs font-semibold">{t(locale, 'invoice.itemAmount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2 px-3 text-gray-700">{idx + 1}</td>
              <td className="py-2 px-3 text-gray-900">{item.description}</td>
              <td className="py-2 px-3 text-center text-gray-700">{item.unit}</td>
              <td className="py-2 px-3 text-right text-gray-900">{item.quantity}</td>
              <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(item.rate, locale)}</td>
              <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(item.amount, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Bank side by side */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bank Details + QR */}
        <div className="border border-gray-300 rounded p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase mb-2">{t(locale, 'company.bankDetails')}</h4>
              {invoice.companyBankName && <p className="text-gray-800 text-xs">{t(locale, 'company.bankName')}: {invoice.companyBankName}</p>}
              {locale === 'sk' && invoice.companyIban && <p className="text-gray-800 text-xs">IBAN: {invoice.companyIban}</p>}
              {locale === 'en' && invoice.companyBankAccount && <p className="text-gray-800 text-xs">Account: {invoice.companyBankAccount}</p>}
              {locale === 'en' && invoice.companyRoutingNumber && <p className="text-gray-800 text-xs">Routing: {invoice.companyRoutingNumber}</p>}
              {invoice.companySwiftCode && <p className="text-gray-800 text-xs">SWIFT: {invoice.companySwiftCode}</p>}
              {invoice.paymentMethod && <p className="text-gray-800 text-xs mt-1">{t(locale, 'invoice.paymentMethod')}: {invoice.paymentMethod}</p>}
            </div>
            {qrDataUrl && (
              <div className="text-center ml-3 flex-shrink-0">
                <img src={qrDataUrl} alt="Payment QR" className="w-24 h-24" />
                <p className="text-[10px] text-gray-700 mt-0.5">
                  {locale === 'en' ? 'Scan to pay' : 'Naskenujte'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div>
          <div className="flex justify-between py-1.5 text-gray-900 text-sm">
            <span>{t(locale, 'invoice.subtotal')}:</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1.5 text-gray-900 text-sm">
              <span>{t(locale, 'invoice.discount')}:</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-1.5 text-gray-900 text-sm">
              <span>{rc.taxName} ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2 text-lg font-bold text-gray-900">
            <span>{t(locale, 'invoice.total')}:</span>
            <span>{formatCurrency(invoice.total, locale)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-3">
          <p className="font-bold text-xs text-gray-800 mb-1">{t(locale, 'invoice.notes')}:</p>
          <p className="text-gray-700 text-xs whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
      {invoice.terms && (
        <div className="mb-6 border-t border-gray-200 pt-3">
          <p className="font-bold text-xs text-gray-800 mb-1">{t(locale, 'invoice.terms')}:</p>
          <p className="text-gray-700 text-xs whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}

      {/* Signature & Stamp overlay */}
      <div className="flex justify-end items-end mt-8 pt-4 border-t border-gray-300">
        <SignatureStampBlock invoice={invoice} locale={locale} />
      </div>
    </div>
  );
}

// ============================================================
// MINIMAL TEMPLATE - Ultra clean, whitespace-focused
// ============================================================
export function MinimalTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];
  const qrDataUrl = usePaymentQR(invoice, locale);

  return (
    <div className="bg-white p-10 max-w-[210mm] mx-auto text-sm font-light" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            {invoice.companyLogo && (
              <img src={invoice.companyLogo} alt="Logo" className="h-12 object-contain" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{invoice.companyLegalName || invoice.companyName}</h2>
              <p className="text-gray-700 text-xs">{invoice.companyStreet}, {invoice.companyCity} {invoice.companyZip}</p>
            </div>
          </div>
          {invoice.companyEmail && <p className="text-gray-700 text-xs">{invoice.companyEmail}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-light text-gray-700 tracking-widest uppercase mb-4">
            {locale === 'en' ? 'Invoice' : 'Faktúra'}
          </h1>
          <p className="text-gray-900 font-medium">{invoice.invoiceNumber}</p>
          <p className="text-gray-700 text-xs mt-2">{formatDate(invoice.invoiceDate, locale)}</p>
          <p className="text-gray-700 text-xs">
            {t(locale, 'invoice.dueDate')}: {formatDate(invoice.dueDate, locale)}
          </p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10">
        <p className="text-gray-700 text-xs uppercase tracking-widest mb-3">{t(locale, 'invoice.to')}</p>
        <p className="text-gray-900 font-medium">{invoice.clientName}</p>
        <p className="text-gray-700">{invoice.clientStreet}</p>
        <p className="text-gray-700">{invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}</p>
        {invoice.clientTaxId && <p className="text-gray-700 text-xs mt-1">{locale === 'en' ? 'Tax ID' : 'DIČ'}: {invoice.clientTaxId}</p>}
        {invoice.clientRegistrationNumber && locale === 'sk' && <p className="text-gray-700 text-xs">IČO: {invoice.clientRegistrationNumber}</p>}
      </div>

      {/* Items */}
      <div className="mb-10">
        <div className="border-b border-gray-100 pb-2 mb-3 flex text-xs text-gray-700 uppercase tracking-widest">
          <div className="flex-1">{t(locale, 'invoice.itemDescription')}</div>
          <div className="w-16 text-center">{t(locale, 'invoice.itemUnit')}</div>
          <div className="w-20 text-right">{t(locale, 'invoice.itemQuantity')}</div>
          <div className="w-24 text-right">{t(locale, 'invoice.itemRate')}</div>
          <div className="w-28 text-right">{t(locale, 'invoice.itemAmount')}</div>
        </div>
        {invoice.items.map((item) => (
          <div key={item.id} className="flex py-3 border-b border-gray-50">
            <div className="flex-1 text-gray-900">{item.description}</div>
            <div className="w-16 text-center text-gray-700">{item.unit}</div>
            <div className="w-20 text-right text-gray-800">{item.quantity}</div>
            <div className="w-24 text-right text-gray-800">{formatCurrency(item.rate, locale)}</div>
            <div className="w-28 text-right text-gray-900">{formatCurrency(item.amount, locale)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-2 text-gray-700">
            <span>{t(locale, 'invoice.subtotal')}</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-2 text-gray-700">
              <span>{t(locale, 'invoice.discount')}</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 text-gray-700">
              <span>{rc.taxName} ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
            <span className="font-medium text-gray-900">{t(locale, 'invoice.total')}</span>
            <span className="font-medium text-gray-900 text-lg">{formatCurrency(invoice.total, locale)}</span>
          </div>
        </div>
      </div>

      {/* Bank & Payment + QR */}
      <div className="border-t border-gray-100 pt-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="text-xs text-gray-700">
            <div className="flex gap-8">
              <div>
                {invoice.companyBankName && <p>{t(locale, 'company.bankName')}: {invoice.companyBankName}</p>}
                {locale === 'sk' && invoice.companyIban && <p>IBAN: {invoice.companyIban}</p>}
                {locale === 'en' && invoice.companyBankAccount && <p>Account: {invoice.companyBankAccount}</p>}
                {locale === 'en' && invoice.companyRoutingNumber && <p>Routing: {invoice.companyRoutingNumber}</p>}
                {invoice.companySwiftCode && <p>SWIFT: {invoice.companySwiftCode}</p>}
              </div>
              {(invoice.variableSymbol || invoice.constantSymbol) && locale === 'sk' && (
                <div>
                  {invoice.variableSymbol && <p>VS: {invoice.variableSymbol}</p>}
                  {invoice.constantSymbol && <p>KS: {invoice.constantSymbol}</p>}
                </div>
              )}
            </div>
          </div>
          {qrDataUrl && (
            <div className="text-center flex-shrink-0">
              <img src={qrDataUrl} alt="Payment QR" className="w-24 h-24" />
              <p className="text-[10px] text-gray-700 mt-0.5">
                {locale === 'en' ? 'Scan to pay' : 'Naskenujte'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && <p className="text-gray-700 text-xs mb-2 whitespace-pre-wrap">{invoice.notes}</p>}
      {invoice.terms && <p className="text-gray-700 text-xs whitespace-pre-wrap">{invoice.terms}</p>}

      {/* Signature & Stamp overlay */}
      <div className="flex justify-end items-end mt-12">
        <SignatureStampBlock invoice={invoice} locale={locale} />
      </div>
    </div>
  );
}

export function InvoicePreview({ invoice, locale }: TemplateProps) {
  switch (invoice.template) {
    case 'classic':
      return <ClassicTemplate invoice={invoice} locale={locale} />;
    case 'minimal':
      return <MinimalTemplate invoice={invoice} locale={locale} />;
    case 'modern':
    default:
      return <ModernTemplate invoice={invoice} locale={locale} />;
  }
}
