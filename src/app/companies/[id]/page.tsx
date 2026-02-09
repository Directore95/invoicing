'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ImageUpload from '@/components/ImageUpload';
import { useStore } from '@/lib/store';
import { t, regionConfig, Locale } from '@/lib/i18n';
import { Company } from '@/lib/types';

const emptyCompany = (locale: Locale): Omit<Company, 'id' | 'createdAt' | 'updatedAt'> => ({
  locale,
  name: '',
  legalName: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: locale === 'en' ? 'United States' : 'Slovensko',
  phone: '',
  email: '',
  website: '',
  taxId: '',
  registrationNumber: '',
  vatId: '',
  icdph: '',
  bankName: '',
  bankAccount: '',
  routingNumber: '',
  iban: '',
  swiftCode: '',
  currency: regionConfig[locale].currency,
  defaultPaymentTerms: 30,
  defaultNotes: '',
  defaultTerms: regionConfig[locale].defaultTerms,
  defaultTaxRate: regionConfig[locale].defaultTaxRate,
  logo: '',
  signature: '',
  stamp: '',
  isDefault: false,
});

export default function CompanyFormPage() {
  const params = useParams();
  const router = useRouter();
  const { settings, companies, addCompany, updateCompany } = useStore();
  const locale = settings.locale;
  const rc = regionConfig[locale];
  const isNew = params.id === 'new';

  const existing = !isNew ? companies.find((c) => c.id === params.id) : null;
  const [form, setForm] = useState<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>(
    existing ? { ...existing } : emptyCompany(locale)
  );

  useEffect(() => {
    if (!isNew && !existing) {
      router.push('/companies');
    }
  }, [isNew, existing, router]);

  const updateField = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert(locale === 'en' ? 'Company name is required' : 'Názov spoločnosti je povinný');
      return;
    }
    if (isNew) {
      const isFirst = companies.length === 0;
      addCompany({ ...form, isDefault: isFirst || form.isDefault });
    } else {
      updateCompany(params.id as string, form);
    }
    router.push('/companies');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/companies')} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? t(locale, 'company.addCompany') : t(locale, 'company.editCompany')}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
              {locale === 'en' ? 'Fill in your business details below' : 'Vyplňte údaje o vašej spoločnosti'}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Business Details */}
          <Section title={t(locale, 'company.businessDetails')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t(locale, 'company.companyName')} value={form.name} onChange={(v) => updateField('name', v)} required />
              <Input label={t(locale, 'company.legalName')} value={form.legalName} onChange={(v) => updateField('legalName', v)} />

              {/* Region-specific business IDs */}
              {rc.companyFields.taxId && (
                <Input
                  label={rc.companyFields.taxId.label}
                  value={form.taxId}
                  onChange={(v) => updateField('taxId', v)}
                  placeholder={rc.companyFields.taxId.placeholder}
                  required={rc.companyFields.taxId.required}
                />
              )}
              {rc.companyFields.registrationNumber && (
                <Input
                  label={rc.companyFields.registrationNumber.label}
                  value={form.registrationNumber}
                  onChange={(v) => updateField('registrationNumber', v)}
                  placeholder={rc.companyFields.registrationNumber.placeholder}
                  required={rc.companyFields.registrationNumber.required}
                />
              )}
              {rc.companyFields.vatId && (
                <Input
                  label={rc.companyFields.vatId.label}
                  value={form.vatId}
                  onChange={(v) => { updateField('vatId', v); updateField('icdph', v); }}
                  placeholder={rc.companyFields.vatId.placeholder}
                />
              )}
            </div>
          </Section>

          {/* Address */}
          <Section title={t(locale, 'company.address')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label={t(locale, 'company.street')} value={form.street} onChange={(v) => updateField('street', v)} />
              </div>
              <Input label={t(locale, 'company.city')} value={form.city} onChange={(v) => updateField('city', v)} />
              <Input label={t(locale, 'company.state')} value={form.state} onChange={(v) => updateField('state', v)} />
              <Input label={t(locale, 'company.zip')} value={form.zip} onChange={(v) => updateField('zip', v)} />
              <Input label={t(locale, 'company.country')} value={form.country} onChange={(v) => updateField('country', v)} />
            </div>
          </Section>

          {/* Contact */}
          <Section title={t(locale, 'company.contactDetails')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t(locale, 'company.phone')} value={form.phone} onChange={(v) => updateField('phone', v)} />
              <Input label={t(locale, 'company.email')} value={form.email} onChange={(v) => updateField('email', v)} type="email" />
              <Input label={t(locale, 'company.website')} value={form.website} onChange={(v) => updateField('website', v)} />
            </div>
          </Section>

          {/* Bank Details */}
          <Section title={t(locale, 'company.bankDetails')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t(locale, 'company.bankName')} value={form.bankName} onChange={(v) => updateField('bankName', v)} />
              {rc.bankFields.accountNumber && (
                <Input
                  label={rc.bankFields.accountNumber.label}
                  value={form.bankAccount}
                  onChange={(v) => updateField('bankAccount', v)}
                  placeholder={rc.bankFields.accountNumber.placeholder}
                />
              )}
              {rc.bankFields.routingNumber && (
                <Input
                  label={rc.bankFields.routingNumber.label}
                  value={form.routingNumber}
                  onChange={(v) => updateField('routingNumber', v)}
                  placeholder={rc.bankFields.routingNumber.placeholder}
                />
              )}
              {rc.bankFields.iban && (
                <Input
                  label={rc.bankFields.iban.label}
                  value={form.iban}
                  onChange={(v) => updateField('iban', v)}
                  placeholder={rc.bankFields.iban.placeholder}
                />
              )}
              {rc.bankFields.swift && (
                <Input
                  label={rc.bankFields.swift.label}
                  value={form.swiftCode}
                  onChange={(v) => updateField('swiftCode', v)}
                  placeholder={rc.bankFields.swift.placeholder}
                />
              )}
            </div>
          </Section>

          {/* Defaults */}
          <Section title={locale === 'en' ? 'Invoice Defaults' : 'Predvolené nastavenia faktúr'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label={t(locale, 'company.paymentTerms')} value={String(form.defaultPaymentTerms)} onChange={(v) => updateField('defaultPaymentTerms', parseInt(v) || 0)} type="number" />
              <Input label={locale === 'en' ? 'Default Tax Rate (%)' : 'Predvolená sadzba DPH (%)'} value={String(form.defaultTaxRate)} onChange={(v) => updateField('defaultTaxRate', parseFloat(v) || 0)} type="number" />
              <Input label={t(locale, 'company.currency')} value={form.currency} onChange={(v) => updateField('currency', v)} />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'company.notes')}</label>
                <textarea
                  value={form.defaultNotes}
                  onChange={(e) => updateField('defaultNotes', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{locale === 'en' ? 'Default Terms & Conditions' : 'Predvolené obchodné podmienky'}</label>
                <textarea
                  value={form.defaultTerms}
                  onChange={(e) => updateField('defaultTerms', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </Section>

          {/* Branding */}
          <Section title={locale === 'en' ? 'Branding & Signature' : 'Značka a podpis'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUpload
                label={locale === 'en' ? 'Company Logo' : 'Logo spoločnosti'}
                hint={locale === 'en' ? 'Displayed on invoices' : 'Zobrazí sa na faktúrach'}
                value={form.logo}
                onChange={(v) => updateField('logo', v)}
              />
              <ImageUpload
                label={t(locale, 'company.signature')}
                hint={locale === 'en' ? 'Auto-placed on invoices' : 'Automaticky umiestnený na faktúrach'}
                value={form.signature}
                onChange={(v) => updateField('signature', v)}
              />
              <ImageUpload
                label={t(locale, 'company.stamp')}
                hint={locale === 'en' ? 'Auto-placed on invoices' : 'Automaticky umiestnená na faktúrach'}
                value={form.stamp}
                onChange={(v) => updateField('stamp', v)}
              />
            </div>
          </Section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => router.push('/companies')}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t(locale, 'common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t(locale, 'common.save')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
      />
    </div>
  );
}
