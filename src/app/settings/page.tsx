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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t(locale, 'settings.title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {locale === 'en' ? 'Configure your invoicing preferences' : 'Nastavte vaše fakturačné preferencie'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Region & Language */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t(locale, 'settings.region')} & {t(locale, 'settings.language')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {t(locale, 'settings.region')}
                </label>
                <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700 p-1">
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      locale === 'en'
                        ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg">🇺🇸</span>
                    United States
                  </button>
                  <button
                    onClick={() => setLocale('sk')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                      locale === 'sk'
                        ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-lg">🇸🇰</span>
                    Slovensko
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  {locale === 'en'
                    ? 'Changes language, currency (USD/EUR), tax fields, and compliance settings.'
                    : 'Zmení jazyk, menu (USD/EUR), daňové polia a nastavenia súladu.'}
                </p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">{locale === 'en' ? 'Active Configuration' : 'Aktívna konfigurácia'}</p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
                    <p>{locale === 'en' ? 'Language' : 'Jazyk'}: <span className="font-medium">{locale === 'en' ? 'English' : 'Slovenčina'}</span></p>
                    <p>{locale === 'en' ? 'Currency' : 'Mena'}: <span className="font-medium">{regionConfig[locale].currency} ({regionConfig[locale].currencySymbol})</span></p>
                    <p>{locale === 'en' ? 'Tax' : 'Daň'}: <span className="font-medium">{regionConfig[locale].taxName} ({regionConfig[locale].defaultTaxRate}%)</span></p>
                    <p>{locale === 'en' ? 'Date Format' : 'Formát dátumu'}: <span className="font-medium">{regionConfig[locale].dateFormat}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {locale === 'en' ? 'Appearance' : 'Vzhľad'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {locale === 'en' ? 'Theme' : 'Téma'}
              </label>
              <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700 p-1 max-w-xs">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    settings.theme === 'light'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  {locale === 'en' ? 'Light' : 'Svetlá'}
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  {locale === 'en' ? 'Dark' : 'Tmavá'}
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {locale === 'en' ? 'Invoice Configuration' : 'Nastavenia faktúr'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'settings.invoicePrefix')}</label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => updateSettings({ invoicePrefix: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  {locale === 'en' ? `Next: ${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}` : `Ďalšia: ${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {locale === 'en' ? 'Next Invoice Number' : 'Ďalšie číslo faktúry'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.nextInvoiceNumber}
                  onChange={(e) => updateSettings({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'settings.defaultTaxRate')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.defaultTaxRate}
                    onChange={(e) => updateSettings({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                  <span className="text-gray-500 dark:text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'settings.defaultPaymentTerms')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={settings.defaultPaymentTerms}
                    onChange={(e) => updateSettings({ defaultPaymentTerms: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{locale === 'en' ? 'days' : 'dní'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t(locale, 'settings.invoiceTemplate')}</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['modern', 'classic', 'minimal'] as InvoiceTemplate[]).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => updateSettings({ defaultTemplate: tmpl })}
                  className={`p-4 rounded-xl border-2 transition-colors text-center ${
                    settings.defaultTemplate === tmpl
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="mb-2">
                    {tmpl === 'modern' && <ModernIcon active={settings.defaultTemplate === tmpl} />}
                    {tmpl === 'classic' && <ClassicIcon active={settings.defaultTemplate === tmpl} />}
                    {tmpl === 'minimal' && <MinimalIcon active={settings.defaultTemplate === tmpl} />}
                  </div>
                  <p className={`text-sm font-medium ${settings.defaultTemplate === tmpl ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {tmpl === 'modern' && (locale === 'en' ? 'Clean with accent bar' : 'Čistý s farebným pruhom')}
                    {tmpl === 'classic' && (locale === 'en' ? 'Traditional formal' : 'Tradičný formálny')}
                    {tmpl === 'minimal' && (locale === 'en' ? 'Ultra clean' : 'Ultra čistý')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Default Notes & Terms */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {locale === 'en' ? 'Default Content' : 'Predvolený obsah'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'settings.defaultNotes')}</label>
                <textarea
                  value={settings.defaultNotes}
                  onChange={(e) => updateSettings({ defaultNotes: e.target.value })}
                  rows={3}
                  placeholder={locale === 'en' ? 'Default notes that appear on every invoice...' : 'Predvolené poznámky na každej faktúre...'}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t(locale, 'settings.defaultTerms')}</label>
                <textarea
                  value={settings.defaultTerms}
                  onChange={(e) => updateSettings({ defaultTerms: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
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
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 p-1.5`}>
      <div className={`h-1 rounded-full mb-1.5 ${active ? 'bg-blue-400' : 'bg-gray-200 dark:bg-slate-500'}`} />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-3/4" />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-1/2" />
      <div className="h-3 bg-gray-50 dark:bg-slate-600 rounded mb-1" />
      <div className={`h-0.5 rounded-full ${active ? 'bg-blue-200' : 'bg-gray-100 dark:bg-slate-600'}`} />
    </div>
  );
}

function ClassicIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 p-1.5`}>
      <div className={`h-1 mb-1.5 ${active ? 'bg-gray-700' : 'bg-gray-300 dark:bg-slate-500'}`} />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-full" />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-full" />
      <div className={`h-3 ${active ? 'bg-gray-100 dark:bg-slate-600' : 'bg-gray-50 dark:bg-slate-600'} mb-1 border border-gray-200 dark:border-slate-500`} />
      <div className="h-1 bg-gray-200 dark:bg-slate-500" />
    </div>
  );
}

function MinimalIcon({ active }: { active: boolean }) {
  return (
    <div className={`w-16 h-20 mx-auto rounded border ${active ? 'border-blue-300' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-700 p-2`}>
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-2 w-1/3" />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-2/3" />
      <div className="h-0.5 bg-gray-100 dark:bg-slate-600 mb-1 w-1/2" />
      <div className="h-0.5 bg-gray-50 dark:bg-slate-600 mb-3 w-3/4" />
      <div className={`h-0.5 ${active ? 'bg-gray-200 dark:bg-slate-500' : 'bg-gray-100 dark:bg-slate-600'} w-1/2 ml-auto`} />
    </div>
  );
}
