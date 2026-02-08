'use client';

import Layout from '@/components/Layout';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import Link from 'next/link';

export default function CompaniesPage() {
  const { settings, companies, deleteCompany, setDefaultCompany } = useStore();
  const locale = settings.locale;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(locale, 'company.title')}</h1>
          <p className="text-gray-500 mt-1">
            {locale === 'en' ? 'Manage your business profiles' : 'Spravujte svoje firemné profily'}
          </p>
        </div>
        <Link
          href="/companies/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t(locale, 'company.addCompany')}
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">
            {locale === 'en' ? 'No companies yet' : 'Zatiaľ žiadne spoločnosti'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {locale === 'en'
              ? 'Add your first company to get started with invoicing.'
              : 'Pridajte svoju prvú spoločnosť a začnite fakturovať.'}
          </p>
          <Link
            href="/companies/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {t(locale, 'company.addCompany')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <img src={company.logo} alt="" className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    {company.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {t(locale, 'company.isDefault')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p>{company.street}</p>
                <p>{company.city}{company.state ? `, ${company.state}` : ''} {company.zip}</p>
                {company.email && <p className="text-gray-400">{company.email}</p>}
                {company.taxId && (
                  <p className="text-gray-400">
                    {locale === 'en' ? 'EIN' : 'DIČ'}: {company.taxId}
                  </p>
                )}
                {company.registrationNumber && locale === 'sk' && (
                  <p className="text-gray-400">IČO: {company.registrationNumber}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/companies/${company.id}`}
                  className="flex-1 text-center text-sm text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                >
                  {t(locale, 'common.edit')}
                </Link>
                {!company.isDefault && (
                  <button
                    onClick={() => setDefaultCompany(company.id)}
                    className="flex-1 text-center text-sm text-gray-500 hover:bg-gray-50 py-1.5 rounded-lg transition-colors"
                  >
                    {t(locale, 'company.setDefault')}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(t(locale, 'common.confirm'))) {
                      deleteCompany(company.id);
                    }
                  }}
                  className="text-sm text-red-500 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors"
                >
                  {t(locale, 'common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
