'use client';

import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate, t, Locale, regionConfig } from '@/lib/i18n';

interface TemplateProps {
  invoice: Invoice;
  locale: Locale;
}

// ============================================================
// MODERN TEMPLATE - Clean, minimal with accent color bar
// ============================================================
export function ModernTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto text-sm" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {invoice.companyLogo && (
            <img src={invoice.companyLogo} alt="Logo" className="h-16 mb-3 object-contain" />
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'en' ? 'INVOICE' : 'FAKTÚRA'}
          </h1>
          <p className="text-blue-600 font-semibold mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
            {t(locale, 'invoice.invoiceDate')}
          </p>
          <p className="font-medium">{formatDate(invoice.invoiceDate, locale)}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 mt-2">
            {t(locale, 'invoice.dueDate')}
          </p>
          <p className="font-medium">{formatDate(invoice.dueDate, locale)}</p>
          {invoice.variableSymbol && locale === 'sk' && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 mt-2">Variabilný symbol</p>
              <p className="font-medium">{invoice.variableSymbol}</p>
            </>
          )}
          {invoice.constantSymbol && locale === 'sk' && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 mt-2">Konštantný symbol</p>
              <p className="font-medium">{invoice.constantSymbol}</p>
            </>
          )}
          {invoice.poNumber && locale === 'en' && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 mt-2">PO Number</p>
              <p className="font-medium">{invoice.poNumber}</p>
            </>
          )}
        </div>
      </div>

      {/* Blue accent bar */}
      <div className="h-1 bg-blue-600 mb-8 rounded-full" />

      {/* Parties */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 font-semibold">
            {t(locale, 'invoice.from')}
          </p>
          <p className="font-bold text-gray-900">{invoice.companyLegalName || invoice.companyName}</p>
          <p className="text-gray-600">{invoice.companyStreet}</p>
          <p className="text-gray-600">
            {invoice.companyCity}{invoice.companyState ? `, ${invoice.companyState}` : ''} {invoice.companyZip}
          </p>
          <p className="text-gray-600">{invoice.companyCountry}</p>
          {invoice.companyTaxId && (
            <p className="text-gray-600 mt-2">
              <span className="text-gray-400">{locale === 'en' ? 'Tax ID: ' : 'DIČ: '}</span>
              {invoice.companyTaxId}
            </p>
          )}
          {invoice.companyRegistrationNumber && (
            <p className="text-gray-600">
              <span className="text-gray-400">{locale === 'en' ? 'Reg #: ' : 'IČO: '}</span>
              {invoice.companyRegistrationNumber}
            </p>
          )}
          {invoice.companyVatId && locale === 'sk' && (
            <p className="text-gray-600">
              <span className="text-gray-400">IČ DPH: </span>
              {invoice.companyVatId}
            </p>
          )}
          {invoice.companyPhone && <p className="text-gray-600 mt-1">{invoice.companyPhone}</p>}
          {invoice.companyEmail && <p className="text-gray-600">{invoice.companyEmail}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 font-semibold">
            {t(locale, 'invoice.to')}
          </p>
          <p className="font-bold text-gray-900">{invoice.clientName}</p>
          <p className="text-gray-600">{invoice.clientStreet}</p>
          <p className="text-gray-600">
            {invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}
          </p>
          <p className="text-gray-600">{invoice.clientCountry}</p>
          {invoice.clientTaxId && (
            <p className="text-gray-600 mt-2">
              <span className="text-gray-400">{locale === 'en' ? 'Tax ID: ' : 'DIČ: '}</span>
              {invoice.clientTaxId}
            </p>
          )}
          {invoice.clientRegistrationNumber && locale === 'sk' && (
            <p className="text-gray-600">
              <span className="text-gray-400">IČO: </span>
              {invoice.clientRegistrationNumber}
            </p>
          )}
          {invoice.clientVatId && locale === 'sk' && (
            <p className="text-gray-600">
              <span className="text-gray-400">IČ DPH: </span>
              {invoice.clientVatId}
            </p>
          )}
          {invoice.clientEmail && <p className="text-gray-600 mt-1">{invoice.clientEmail}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 text-xs uppercase tracking-wide text-gray-400 font-semibold">{t(locale, 'invoice.itemDescription')}</th>
            <th className="text-center py-3 text-xs uppercase tracking-wide text-gray-400 font-semibold w-16">{t(locale, 'invoice.itemUnit')}</th>
            <th className="text-right py-3 text-xs uppercase tracking-wide text-gray-400 font-semibold w-20">{t(locale, 'invoice.itemQuantity')}</th>
            <th className="text-right py-3 text-xs uppercase tracking-wide text-gray-400 font-semibold w-28">{t(locale, 'invoice.itemRate')}</th>
            <th className="text-right py-3 text-xs uppercase tracking-wide text-gray-400 font-semibold w-28">{t(locale, 'invoice.itemAmount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-3 px-2 text-gray-800">{item.description}</td>
              <td className="py-3 px-2 text-center text-gray-600">{item.unit}</td>
              <td className="py-3 px-2 text-right text-gray-600">{item.quantity}</td>
              <td className="py-3 px-2 text-right text-gray-600">{formatCurrency(item.rate, locale)}</td>
              <td className="py-3 px-2 text-right font-medium text-gray-800">{formatCurrency(item.amount, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72">
          <div className="flex justify-between py-2 text-gray-600">
            <span>{t(locale, 'invoice.subtotal')}</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-2 text-gray-600">
              <span>{t(locale, 'invoice.discount')}</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 text-gray-600">
              <span>{rc.taxName} ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-blue-600 mt-2">
            <span className="font-bold text-lg text-gray-900">{t(locale, 'invoice.total')}</span>
            <span className="font-bold text-lg text-blue-600">{formatCurrency(invoice.total, locale)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
          {t(locale, 'company.bankDetails')}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {invoice.companyBankName && (
            <p className="text-gray-600"><span className="text-gray-400">{t(locale, 'company.bankName')}: </span>{invoice.companyBankName}</p>
          )}
          {locale === 'sk' && invoice.companyIban && (
            <p className="text-gray-600"><span className="text-gray-400">IBAN: </span>{invoice.companyIban}</p>
          )}
          {locale === 'en' && invoice.companyBankAccount && (
            <p className="text-gray-600"><span className="text-gray-400">Account: </span>{invoice.companyBankAccount}</p>
          )}
          {locale === 'en' && invoice.companyRoutingNumber && (
            <p className="text-gray-600"><span className="text-gray-400">Routing: </span>{invoice.companyRoutingNumber}</p>
          )}
          {invoice.companySwiftCode && (
            <p className="text-gray-600"><span className="text-gray-400">SWIFT/BIC: </span>{invoice.companySwiftCode}</p>
          )}
          {invoice.variableSymbol && locale === 'sk' && (
            <p className="text-gray-600"><span className="text-gray-400">VS: </span>{invoice.variableSymbol}</p>
          )}
        </div>
      </div>

      {/* Payment method */}
      {invoice.paymentMethod && (
        <p className="text-gray-600 mb-4 text-sm">
          <span className="text-gray-400">{t(locale, 'invoice.paymentMethod')}: </span>{invoice.paymentMethod}
        </p>
      )}

      {/* Notes & Terms */}
      {invoice.notes && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">{t(locale, 'invoice.notes')}</p>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
      {invoice.terms && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">{t(locale, 'invoice.terms')}</p>
          <p className="text-gray-500 text-xs whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}

      {/* Signature & Stamp */}
      <div className="flex justify-end items-end gap-8 mt-8 pt-6 border-t border-gray-200">
        {invoice.companyStamp && (
          <div className="text-center">
            <img src={invoice.companyStamp} alt="Stamp" className="h-20 object-contain opacity-80" />
          </div>
        )}
        {invoice.companySignature && (
          <div className="text-center">
            <img src={invoice.companySignature} alt="Signature" className="h-16 object-contain" />
            <div className="border-t border-gray-300 mt-1 pt-1">
              <p className="text-xs text-gray-400">{locale === 'en' ? 'Authorized Signature' : 'Podpis'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CLASSIC TEMPLATE - Traditional, formal invoice layout
// ============================================================
export function ClassicTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];

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
              <p className="text-gray-500 text-xs">{invoice.companyStreet}, {invoice.companyCity} {invoice.companyZip}</p>
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
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">{t(locale, 'invoice.from')}</h3>
          <p className="font-semibold">{invoice.companyLegalName || invoice.companyName}</p>
          <p className="text-gray-600">{invoice.companyStreet}</p>
          <p className="text-gray-600">{invoice.companyCity}{invoice.companyState ? `, ${invoice.companyState}` : ''} {invoice.companyZip}</p>
          <p className="text-gray-600">{invoice.companyCountry}</p>
          {invoice.companyTaxId && <p className="text-gray-600 mt-1">{locale === 'en' ? 'EIN' : 'DIČ'}: {invoice.companyTaxId}</p>}
          {invoice.companyRegistrationNumber && <p className="text-gray-600">{locale === 'en' ? 'Reg' : 'IČO'}: {invoice.companyRegistrationNumber}</p>}
          {invoice.companyVatId && locale === 'sk' && <p className="text-gray-600">IČ DPH: {invoice.companyVatId}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">{t(locale, 'invoice.to')}</h3>
          <p className="font-semibold">{invoice.clientName}</p>
          <p className="text-gray-600">{invoice.clientStreet}</p>
          <p className="text-gray-600">{invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}</p>
          <p className="text-gray-600">{invoice.clientCountry}</p>
          {invoice.clientTaxId && <p className="text-gray-600 mt-1">{locale === 'en' ? 'Tax ID' : 'DIČ'}: {invoice.clientTaxId}</p>}
          {invoice.clientRegistrationNumber && locale === 'sk' && <p className="text-gray-600">IČO: {invoice.clientRegistrationNumber}</p>}
          {invoice.clientVatId && locale === 'sk' && <p className="text-gray-600">IČ DPH: {invoice.clientVatId}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
            {locale === 'en' ? 'Invoice Details' : 'Údaje faktúry'}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">{t(locale, 'invoice.invoiceNumber')}:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t(locale, 'invoice.invoiceDate')}:</span>
              <span>{formatDate(invoice.invoiceDate, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t(locale, 'invoice.dueDate')}:</span>
              <span>{formatDate(invoice.dueDate, locale)}</span>
            </div>
            {invoice.poNumber && locale === 'en' && (
              <div className="flex justify-between">
                <span className="text-gray-500">PO #:</span>
                <span>{invoice.poNumber}</span>
              </div>
            )}
            {invoice.variableSymbol && locale === 'sk' && (
              <div className="flex justify-between">
                <span className="text-gray-500">VS:</span>
                <span>{invoice.variableSymbol}</span>
              </div>
            )}
            {invoice.constantSymbol && locale === 'sk' && (
              <div className="flex justify-between">
                <span className="text-gray-500">KS:</span>
                <span>{invoice.constantSymbol}</span>
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
              <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
              <td className="py-2 px-3">{item.description}</td>
              <td className="py-2 px-3 text-center text-gray-600">{item.unit}</td>
              <td className="py-2 px-3 text-right">{item.quantity}</td>
              <td className="py-2 px-3 text-right">{formatCurrency(item.rate, locale)}</td>
              <td className="py-2 px-3 text-right font-medium">{formatCurrency(item.amount, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Bank side by side */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bank Details */}
        <div className="border border-gray-300 rounded p-3">
          <h4 className="font-bold text-gray-800 text-xs uppercase mb-2">{t(locale, 'company.bankDetails')}</h4>
          {invoice.companyBankName && <p className="text-gray-600 text-xs">{t(locale, 'company.bankName')}: {invoice.companyBankName}</p>}
          {locale === 'sk' && invoice.companyIban && <p className="text-gray-600 text-xs">IBAN: {invoice.companyIban}</p>}
          {locale === 'en' && invoice.companyBankAccount && <p className="text-gray-600 text-xs">Account: {invoice.companyBankAccount}</p>}
          {locale === 'en' && invoice.companyRoutingNumber && <p className="text-gray-600 text-xs">Routing: {invoice.companyRoutingNumber}</p>}
          {invoice.companySwiftCode && <p className="text-gray-600 text-xs">SWIFT: {invoice.companySwiftCode}</p>}
          {invoice.paymentMethod && <p className="text-gray-600 text-xs mt-1">{t(locale, 'invoice.paymentMethod')}: {invoice.paymentMethod}</p>}
        </div>

        {/* Totals */}
        <div>
          <div className="flex justify-between py-1.5 text-gray-600 text-sm">
            <span>{t(locale, 'invoice.subtotal')}:</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1.5 text-gray-600 text-sm">
              <span>{t(locale, 'invoice.discount')}:</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-1.5 text-gray-600 text-sm">
              <span>{rc.taxName} ({invoice.taxRate}%):</span>
              <span>{formatCurrency(invoice.taxAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2 text-lg font-bold">
            <span>{t(locale, 'invoice.total')}:</span>
            <span>{formatCurrency(invoice.total, locale)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-3">
          <p className="font-bold text-xs text-gray-800 mb-1">{t(locale, 'invoice.notes')}:</p>
          <p className="text-gray-600 text-xs whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
      {invoice.terms && (
        <div className="mb-6 border-t border-gray-200 pt-3">
          <p className="font-bold text-xs text-gray-800 mb-1">{t(locale, 'invoice.terms')}:</p>
          <p className="text-gray-500 text-xs whitespace-pre-wrap">{invoice.terms}</p>
        </div>
      )}

      {/* Signature & Stamp */}
      <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-300">
        <div>
          {invoice.companyStamp && (
            <img src={invoice.companyStamp} alt="Stamp" className="h-20 object-contain opacity-80" />
          )}
        </div>
        <div className="text-center">
          {invoice.companySignature && (
            <img src={invoice.companySignature} alt="Signature" className="h-16 object-contain" />
          )}
          <div className="border-t border-gray-400 w-48 mt-2 pt-1">
            <p className="text-xs text-gray-500">{locale === 'en' ? 'Authorized Signature' : 'Podpis a pečiatka'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MINIMAL TEMPLATE - Ultra clean, whitespace-focused
// ============================================================
export function MinimalTemplate({ invoice, locale }: TemplateProps) {
  const rc = regionConfig[locale];

  return (
    <div className="bg-white p-10 max-w-[210mm] mx-auto text-sm font-light" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {invoice.companyLogo ? (
            <img src={invoice.companyLogo} alt="Logo" className="h-12 mb-4 object-contain" />
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{invoice.companyName}</h2>
          )}
          <p className="text-gray-400 text-xs">{invoice.companyStreet}</p>
          <p className="text-gray-400 text-xs">{invoice.companyCity}{invoice.companyState ? `, ${invoice.companyState}` : ''} {invoice.companyZip}</p>
          {invoice.companyEmail && <p className="text-gray-400 text-xs mt-1">{invoice.companyEmail}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-light text-gray-300 tracking-widest uppercase mb-4">
            {locale === 'en' ? 'Invoice' : 'Faktúra'}
          </h1>
          <p className="text-gray-900 font-medium">{invoice.invoiceNumber}</p>
          <p className="text-gray-400 text-xs mt-2">{formatDate(invoice.invoiceDate, locale)}</p>
          <p className="text-gray-400 text-xs">
            {t(locale, 'invoice.dueDate')}: {formatDate(invoice.dueDate, locale)}
          </p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10">
        <p className="text-gray-300 text-xs uppercase tracking-widest mb-3">{t(locale, 'invoice.to')}</p>
        <p className="text-gray-900 font-medium">{invoice.clientName}</p>
        <p className="text-gray-500">{invoice.clientStreet}</p>
        <p className="text-gray-500">{invoice.clientCity}{invoice.clientState ? `, ${invoice.clientState}` : ''} {invoice.clientZip}</p>
        {invoice.clientTaxId && <p className="text-gray-400 text-xs mt-1">{locale === 'en' ? 'Tax ID' : 'DIČ'}: {invoice.clientTaxId}</p>}
        {invoice.clientRegistrationNumber && locale === 'sk' && <p className="text-gray-400 text-xs">IČO: {invoice.clientRegistrationNumber}</p>}
      </div>

      {/* Items */}
      <div className="mb-10">
        <div className="border-b border-gray-100 pb-2 mb-3 flex text-xs text-gray-300 uppercase tracking-widest">
          <div className="flex-1">{t(locale, 'invoice.itemDescription')}</div>
          <div className="w-16 text-center">{t(locale, 'invoice.itemUnit')}</div>
          <div className="w-20 text-right">{t(locale, 'invoice.itemQuantity')}</div>
          <div className="w-24 text-right">{t(locale, 'invoice.itemRate')}</div>
          <div className="w-28 text-right">{t(locale, 'invoice.itemAmount')}</div>
        </div>
        {invoice.items.map((item) => (
          <div key={item.id} className="flex py-3 border-b border-gray-50">
            <div className="flex-1 text-gray-700">{item.description}</div>
            <div className="w-16 text-center text-gray-400">{item.unit}</div>
            <div className="w-20 text-right text-gray-500">{item.quantity}</div>
            <div className="w-24 text-right text-gray-500">{formatCurrency(item.rate, locale)}</div>
            <div className="w-28 text-right text-gray-800">{formatCurrency(item.amount, locale)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-2 text-gray-400">
            <span>{t(locale, 'invoice.subtotal')}</span>
            <span>{formatCurrency(invoice.subtotal, locale)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-2 text-gray-400">
              <span>{t(locale, 'invoice.discount')}</span>
              <span>-{invoice.discountType === 'percentage' ? `${invoice.discount}%` : formatCurrency(invoice.discount, locale)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 text-gray-400">
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

      {/* Bank & Payment */}
      <div className="border-t border-gray-100 pt-6 mb-6 text-xs text-gray-400">
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

      {/* Notes */}
      {invoice.notes && <p className="text-gray-400 text-xs mb-2 whitespace-pre-wrap">{invoice.notes}</p>}
      {invoice.terms && <p className="text-gray-300 text-xs whitespace-pre-wrap">{invoice.terms}</p>}

      {/* Signature & Stamp */}
      <div className="flex justify-end items-end gap-6 mt-12">
        {invoice.companyStamp && (
          <img src={invoice.companyStamp} alt="Stamp" className="h-16 object-contain opacity-60" />
        )}
        {invoice.companySignature && (
          <div className="text-center">
            <img src={invoice.companySignature} alt="Signature" className="h-14 object-contain" />
            <div className="border-t border-gray-200 mt-1 pt-1 w-40">
              <p className="text-xs text-gray-300">{locale === 'en' ? 'Signature' : 'Podpis'}</p>
            </div>
          </div>
        )}
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
