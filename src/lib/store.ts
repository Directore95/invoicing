import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Company, Invoice, InvoiceItem, InvoiceStatus, AppSettings, defaultSettings } from './types';
import { Locale, regionConfig } from './i18n';

interface AppStore {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLocale: (locale: Locale) => void;

  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (id: string, data: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  setDefaultCompany: (id: string) => void;
  getDefaultCompany: () => Company | undefined;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  cloneInvoice: (id: string) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  getNextInvoiceNumber: () => string;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      setLocale: (locale) =>
        set((state) => ({
          settings: {
            ...state.settings,
            locale,
            defaultTaxRate: regionConfig[locale].defaultTaxRate,
          },
        })),

      // Companies
      companies: [],
      addCompany: (companyData) => {
        const now = new Date().toISOString();
        const company: Company = {
          ...companyData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          companies: [...state.companies, company],
        }));
        return company;
      },
      updateCompany: (id, data) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        })),
      deleteCompany: (id) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        })),
      setDefaultCompany: (id) =>
        set((state) => ({
          companies: state.companies.map((c) => ({
            ...c,
            isDefault: c.id === id,
          })),
        })),
      getDefaultCompany: () => {
        const { companies } = get();
        return companies.find((c) => c.isDefault) || companies[0];
      },

      // Invoices
      invoices: [],
      addInvoice: (invoiceData) => {
        const now = new Date().toISOString();
        const invoice: Invoice = {
          ...invoiceData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          invoices: [...state.invoices, invoice],
          settings: {
            ...state.settings,
            nextInvoiceNumber: state.settings.nextInvoiceNumber + 1,
          },
        }));
        return invoice;
      },
      updateInvoice: (id, data) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv
          ),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),
      cloneInvoice: (id) => {
        const state = get();
        const original = state.invoices.find((inv) => inv.id === id);
        if (!original) throw new Error('Invoice not found');
        const now = new Date().toISOString();
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + (state.settings.defaultPaymentTerms || 30));

        const cloned: Invoice = {
          ...original,
          id: uuidv4(),
          invoiceNumber: state.getNextInvoiceNumber(),
          invoiceDate: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'draft',
          paidAt: null,
          items: original.items.map((item) => ({ ...item, id: uuidv4() })),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          invoices: [...s.invoices, cloned],
          settings: {
            ...s.settings,
            nextInvoiceNumber: s.settings.nextInvoiceNumber + 1,
          },
        }));
        return cloned;
      },
      updateInvoiceStatus: (id, status) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status,
                  paidAt: status === 'paid' ? new Date().toISOString() : inv.paidAt,
                  updatedAt: new Date().toISOString(),
                }
              : inv
          ),
        })),
      getNextInvoiceNumber: () => {
        const { settings } = get();
        return `${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}`;
      },
    }),
    {
      name: 'invoicing-app-storage',
    }
  )
);
