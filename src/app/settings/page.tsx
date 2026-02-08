'use client';

import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t, regionConfig } from '@/lib/i18n';
import { InvoiceTemplate } from '@/lib/types';

export default function SettingsPage() {
  const { settings, updateSettings, setLocale } = useStore();
  const locale = settings.locale;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t(locale, 'settings.title')}</h1>
          <p className="text-gray-500 mt-1">
            {locale === 'en' ? 'Configure your invoicing preferences' : 'Nastavte vaše fakturačné preferencie'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Region & Language */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t(locale, 'settings.region')} & {t(locale, 'settings.language')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t(locale, 'settings.region')}
                </label>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      locale === 'en'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    United States
                  </button>
                  <button
                    onClick={() => setLocale('sk')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      locale === 'sk'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="text-lg">🇸🇰</span>
                    Slovensko
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {locale === 'en'
                    ? 'Changes language, currency (USD/EUR), tax fields, and compliance settings.'
                    : 'Zmení jazyk, menu (USD/EUR), daňové polia a nastavenia súladu.'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{locale === 'en' ? 'Active Configuration' : 'Aktívna konfigurácia'}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{locale === 'en' ? 'Language' : 'Jazyk'}: <span className="font-medium">{locale === 'en' ? 'English' : 'Slovenčina'}</span></p>
                    <p>{locale === 'en' ? 'Currency' : 'Mena'}: <span className="font-medium">{regionConfig[locale].currency} ({regionConfig[locale].currencySymbol})</span></p>
                    <p>{locale === 'en' ? 'Tax' : 'Daň'}: <span className="font-medium">{regionConfig[locale].taxName} ({regionConfig[locale].defaultTaxRate}%)</span></p>
                    <p>{locale === 'en' ? 'Date Format' : 'Formát dátumu'}: <span className="font-medium">{regionConfig[locale].dateFormat}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'en' ? 'Invoice Configuration' : 'Nastavenia faktúr'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'settings.invoicePrefix')}</label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => updateSettings({ invoicePrefix: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {locale === 'en' ? `Next: ${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}` : `Ďalšia: ${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'en' ? 'Next Invoice Number' : 'Ďalšie číslo faktúry'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.nextInvoiceNumber}
                  onChange={(e) => updateSettings({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'settings.defaultTaxRate')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.defaultTaxRate}
                    onChange={(e) => updateSettings({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'settings.defaultPaymentTerms')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={settings.defaultPaymentTerms}
                    onChange={(e) => updateSettings({ defaultPaymentTerms: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500 text-sm">{locale === 'en' ? 'days' : 'dní'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'settings.invoiceTemplate')}</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['modern', 'classic', 'minimal'] as InvoiceTemplate[]).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => updateSettings({ defaultTemplate: tmpl })}
                  className={`p-4 rounded-xl border-2 transition-colors text-center ${
                    settings.defaultTemplate === tmpl
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2">
                    {tmpl === 'modern' && <ModernIcon active={settings.defaultTemplate === tmpl} />}
                    {tmpl === 'classic' && <ClassicIcon active={settings.defaultTemplate === tmpl} />}
                    {tmpl === 'minimal' && <MinimalIcon active={settings.defaultTemplate === tmpl} />}
                  </div>
                  <p className={`text-sm font-medium ${settings.defaultTemplate === tmpl ? 'text-blue-700' : 'text-gray-700'}`}>
                    {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tmpl === 'modern' && (locale === 'en' ? 'Clean with accent bar' : 'Čistý s farebným pruhom')}
                    {tmpl === 'classic' && (locale === 'en' ? 'Traditional formal' : 'Tradičný formálny')}
                    {tmpl === 'minimal' && (locale === 'en' ? 'Ultra clean' : 'Ultra čistý')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Default Notes & Terms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'en' ? 'Default Content' : 'Predvolený obsah'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'settings.defaultNotes')}</label>
                <textarea
                  value={settings.defaultNotes}
                  onChange={(e) => updateSettings({ defaultNotes: e.target.value })}
                  rows={3}
                  placeholder={locale === 'en' ? 'Default notes that appear on every invoice...' : 'Predvolené poznámky na každej faktúre...'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'settings.defaultTerms')}</label>
                <textarea
                  value={settings.defaultTerms}
                  onChange={(e) => updateSettings({ defaultTerms: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ModernIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200'} bg-white p-1.5`}>
      <div className={`h-1 rounded-full mb-1.5 ${active ? 'bg-blue-400' : 'bg-gray-200'}`} />
      <div className="h-0.5 bg-gray-100 mb-1 w-3/4" />
      <div className="h-0.5 bg-gray-100 mb-1 w-1/2" />
      <div className="h-3 bg-gray-50 rounded mb-1" />
      <div className={`h-0.5 rounded-full ${active ? 'bg-blue-200' : 'bg-gray-100'}`} />
    </div>
  );
}

function ClassicIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200'} bg-white p-1.5`}>
      <div className={`h-1 mb-1.5 ${active ? 'bg-gray-700' : 'bg-gray-300'}`} />
      <div className="h-0.5 bg-gray-100 mb-1 w-full" />
      <div className="h-0.5 bg-gray-100 mb-1 w-full" />
      <div className={`h-3 ${active ? 'bg-gray-100' : 'bg-gray-50'} mb-1 border border-gray-200`} />
      <div className="h-1 bg-gray-200" />
    </div>
  );
}

function MinimalIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200'} bg-white p-2`}>
      <div className="h-0.5 bg-gray-100 mb-2 w-1/3" />
      <div className="h-0.5 bg-gray-100 mb-1 w-2/3" />
      <div className="h-0.5 bg-gray-100 mb-1 w-1/2" />
      <div className="h-0.5 bg-gray-50 mb-3 w-3/4" />
      <div className={`h-0.5 ${active ? 'bg-gray-200' : 'bg-gray-100'} w-1/2 ml-auto`} />
    </div>
  );
}
