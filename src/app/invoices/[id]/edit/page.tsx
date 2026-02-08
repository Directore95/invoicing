'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t, regionConfig, formatCurrency, Locale } from '@/lib/i18n';
import { Invoice, InvoiceItem, Company, InvoiceTemplate } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

function buildInvoiceFromCompany(company: Company, locale: Locale): Partial<Invoice> {
  return {
    companyId: company.id,
    companyName: company.name,
    companyLegalName: company.legalName,
    companyStreet: company.street,
    companyCity: company.city,
    companyState: company.state,
    companyZip: company.zip,
    companyCountry: company.country,
    companyPhone: company.phone,
    companyEmail: company.email,
    companyTaxId: company.taxId,
    companyRegistrationNumber: company.registrationNumber,
    companyVatId: company.vatId,
    companyBankName: company.bankName,
    companyBankAccount: company.bankAccount,
    companyRoutingNumber: company.routingNumber,
    companyIban: company.iban,
    companySwiftCode: company.swiftCode,
    companyLogo: company.logo,
    companySignature: company.signature,
    companyStamp: company.stamp,
    currency: company.currency,
    taxRate: company.defaultTaxRate,
    notes: company.defaultNotes,
    terms: company.defaultTerms,
  };
}

function emptyInvoice(locale: Locale, invoiceNumber: string): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
  const rc = regionConfig[locale];
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30);

  return {
    locale,
    invoiceNumber,
    invoiceDate: today.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    companyId: '',
    companyName: '',
    companyLegalName: '',
    companyStreet: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    companyCountry: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxId: '',
    companyRegistrationNumber: '',
    companyVatId: '',
    companyBankName: '',
    companyBankAccount: '',
    companyRoutingNumber: '',
    companyIban: '',
    companySwiftCode: '',
    companyLogo: '',
    companySignature: '',
    companyStamp: '',
    clientName: '',
    clientEmail: '',
    clientStreet: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientCountry: locale === 'en' ? 'United States' : 'Slovensko',
    clientTaxId: '',
    clientRegistrationNumber: '',
    clientVatId: '',
    items: [{ id: uuidv4(), description: '', quantity: 1, unit: locale === 'en' ? 'pc' : 'ks', rate: 0, amount: 0 }],
    currency: rc.currency,
    subtotal: 0,
    taxRate: rc.defaultTaxRate,
    taxAmount: 0,
    discount: 0,
    discountType: 'fixed',
    total: 0,
    variableSymbol: '',
    constantSymbol: locale === 'sk' ? '0308' : '',
    poNumber: '',
    notes: '',
    terms: rc.defaultTerms,
    status: 'draft',
    paymentMethod: locale === 'en' ? 'Bank Transfer' : 'Bankový prevod',
    paidAt: null,
    template: 'modern',
  };
}

export default function InvoiceFormPage() {
  const params = useParams();
  const router = useRouter();
  const { settings, companies, invoices, addInvoice, updateInvoice, getNextInvoiceNumber, getDefaultCompany } = useStore();
  const locale = settings.locale;
  const rc = regionConfig[locale];

  const isNew = params.id === 'new';
  const existing = !isNew ? invoices.find((inv) => inv.id === params.id) : null;

  const [form, setForm] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>(() => {
    if (existing) return { ...existing };
    const inv = emptyInvoice(locale, getNextInvoiceNumber());
    const defaultCompany = getDefaultCompany();
    if (defaultCompany) {
      return { ...inv, ...buildInvoiceFromCompany(defaultCompany, locale) };
    }
    return inv;
  });

  const recalculate = useCallback((items: InvoiceItem[], taxRate: number, discount: number, discountType: 'percentage' | 'fixed') => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    let discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;
    return { subtotal, taxAmount, total };
  }, []);

  const updateForm = (updates: Partial<typeof form>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.items || updates.taxRate !== undefined || updates.discount !== undefined || updates.discountType) {
        const calc = recalculate(next.items, next.taxRate, next.discount, next.discountType);
        return { ...next, ...calc };
      }
      return next;
    });
  };

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      updateForm(buildInvoiceFromCompany(company, locale));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...form.items];
    (newItems[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    updateForm({ items: newItems });
  };

  const addItem = () => {
    updateForm({
      items: [...form.items, { id: uuidv4(), description: '', quantity: 1, unit: locale === 'en' ? 'pc' : 'ks', rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    updateForm({ items: newItems });
  };

  const handleSave = () => {
    if (!form.clientName.trim()) {
      alert(locale === 'en' ? 'Client name is required' : 'Meno klienta je povinné');
      return;
    }
    if (form.items.length === 0 || form.items.every((item) => !item.description)) {
      alert(locale === 'en' ? 'Add at least one item' : 'Pridajte aspoň jednu položku');
      return;
    }

    // Auto-set variable symbol for SK
    let finalForm = { ...form };
    if (locale === 'sk' && !finalForm.variableSymbol) {
      finalForm.variableSymbol = finalForm.invoiceNumber.replace(/\D/g, '');
    }

    if (isNew) {
      const saved = addInvoice(finalForm);
      router.push(`/invoices/${saved.id}`);
    } else {
      updateInvoice(params.id as string, finalForm);
      router.push(`/invoices/${params.id}`);
    }
  };

  const unitOptions = Object.entries(
    locale === 'en'
      ? { pc: 'pc', hr: 'hr', day: 'day', service: 'service', month: 'month', project: 'project' }
      : { ks: 'ks', hod: 'hod', deň: 'deň', služba: 'služba', mesiac: 'mesiac', projekt: 'projekt' }
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? t(locale, 'invoice.createInvoice') : t(locale, 'invoice.editInvoice')}
            </h1>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t(locale, 'common.save')}
          </button>
        </div>

        <div className="space-y-6">
          {/* Company Selection & Invoice Meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Company Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.selectCompany')}</label>
                <select
                  value={form.companyId}
                  onChange={(e) => handleCompanySelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{locale === 'en' ? '-- Select company --' : '-- Vyberte spoločnosť --'}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.invoiceNumber')}</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => updateForm({ invoiceNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.invoiceDate')}</label>
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => updateForm({ invoiceDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.dueDate')}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateForm({ dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Template & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'en' ? 'Template' : 'Šablóna'}
                </label>
                <select
                  value={form.template}
                  onChange={(e) => updateForm({ template: e.target.value as InvoiceTemplate })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.paymentMethod')}</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => updateForm({ paymentMethod: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {rc.paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {/* Region-specific fields */}
              {locale === 'sk' && rc.invoiceFields.variableSymbol && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{rc.invoiceFields.variableSymbol.label}</label>
                  <input
                    type="text"
                    value={form.variableSymbol}
                    onChange={(e) => updateForm({ variableSymbol: e.target.value })}
                    placeholder={rc.invoiceFields.variableSymbol.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {locale === 'sk' && rc.invoiceFields.constantSymbol && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{rc.invoiceFields.constantSymbol.label}</label>
                  <input
                    type="text"
                    value={form.constantSymbol}
                    onChange={(e) => updateForm({ constantSymbol: e.target.value })}
                    placeholder={rc.invoiceFields.constantSymbol.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              {locale === 'en' && rc.invoiceFields.poNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{rc.invoiceFields.poNumber.label}</label>
                  <input
                    type="text"
                    value={form.poNumber}
                    onChange={(e) => updateForm({ poNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'invoice.to')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(locale, 'invoice.clientName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => updateForm({ clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.clientEmail')}</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => updateForm({ clientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'en' ? 'Street Address' : 'Ulica'}</label>
                <input
                  type="text"
                  value={form.clientStreet}
                  onChange={(e) => updateForm({ clientStreet: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'company.city')}</label>
                <input
                  type="text"
                  value={form.clientCity}
                  onChange={(e) => updateForm({ clientCity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'company.state')}</label>
                <input
                  type="text"
                  value={form.clientState}
                  onChange={(e) => updateForm({ clientState: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'company.zip')}</label>
                <input
                  type="text"
                  value={form.clientZip}
                  onChange={(e) => updateForm({ clientZip: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'company.country')}</label>
                <input
                  type="text"
                  value={form.clientCountry}
                  onChange={(e) => updateForm({ clientCountry: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Region-specific client fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'en' ? 'Client Tax ID' : 'DIČ klienta'}
                </label>
                <input
                  type="text"
                  value={form.clientTaxId}
                  onChange={(e) => updateForm({ clientTaxId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {locale === 'sk' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IČO klienta</label>
                    <input
                      type="text"
                      value={form.clientRegistrationNumber}
                      onChange={(e) => updateForm({ clientRegistrationNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IČ DPH klienta</label>
                    <input
                      type="text"
                      value={form.clientVatId}
                      onChange={(e) => updateForm({ clientVatId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'invoice.items')}</h2>

            {/* Items Header */}
            <div className="grid grid-cols-[1fr_80px_70px_100px_100px_40px] gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
              <span>{t(locale, 'invoice.itemDescription')}</span>
              <span className="text-center">{t(locale, 'invoice.itemUnit')}</span>
              <span className="text-right">{t(locale, 'invoice.itemQuantity')}</span>
              <span className="text-right">{t(locale, 'invoice.itemRate')}</span>
              <span className="text-right">{t(locale, 'invoice.itemAmount')}</span>
              <span></span>
            </div>

            {/* Items */}
            {form.items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_70px_100px_100px_40px] gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  placeholder={locale === 'en' ? 'Description...' : 'Popis...'}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {unitOptions.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-sm font-medium text-right py-2 pr-2">
                  {formatCurrency(item.amount, locale)}
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  disabled={form.items.length <= 1}
                  className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 rounded"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t(locale, 'invoice.addItem')}
            </button>

            {/* Totals */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t(locale, 'invoice.subtotal')}</span>
                    <span className="font-medium">{formatCurrency(form.subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{t(locale, 'invoice.discount')}</span>
                      <select
                        value={form.discountType}
                        onChange={(e) => updateForm({ discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-xs"
                      >
                        <option value="fixed">{rc.currencySymbol}</option>
                        <option value="percentage">%</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(e) => updateForm({ discount: parseFloat(e.target.value) || 0 })}
                      className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{rc.taxName} (%)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.taxRate}
                      onChange={(e) => updateForm({ taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {form.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{rc.taxName}</span>
                      <span>{formatCurrency(form.taxAmount, locale)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>{t(locale, 'invoice.total')}</span>
                    <span className="text-blue-600">{formatCurrency(form.total, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  rows={4}
                  placeholder={locale === 'en' ? 'Additional notes for the client...' : 'Dodatočné poznámky pre klienta...'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'invoice.terms')}</label>
                <textarea
                  value={form.terms}
                  onChange={(e) => updateForm({ terms: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t(locale, 'common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isNew ? t(locale, 'invoice.createInvoice') : t(locale, 'common.save')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
