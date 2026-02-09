import { Locale } from './i18n';

export interface Company {
  id: string;
  locale: Locale;
  name: string;
  legalName: string;
  // Address
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Contact
  phone: string;
  email: string;
  website: string;
  // Business IDs - US
  taxId: string;           // EIN for US
  registrationNumber: string; // State registration for US, IČO for SK
  // Business IDs - Slovak
  vatId: string;           // IČ DPH for SK
  icdph: string;           // IČ DPH (same, for form compatibility)
  // Bank - US
  bankName: string;
  bankAccount: string;     // Account number for US
  routingNumber: string;   // ABA routing for US
  // Bank - Slovak
  iban: string;            // IBAN for SK
  swiftCode: string;       // BIC/SWIFT for SK
  // Defaults
  currency: string;
  defaultPaymentTerms: number;
  defaultNotes: string;
  defaultTerms: string;
  defaultTaxRate: number;
  // Branding
  logo: string;            // base64 data URL
  signature: string;       // base64 data URL
  stamp: string;           // base64 data URL
  // Meta
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  locale: Locale;
  invoiceNumber: string;
  // Dates
  invoiceDate: string;
  dueDate: string;
  // Seller (from company)
  companyId: string;
  companyName: string;
  companyLegalName: string;
  companyStreet: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyCountry: string;
  companyPhone: string;
  companyEmail: string;
  companyTaxId: string;
  companyRegistrationNumber: string;
  companyVatId: string;
  companyBankName: string;
  companyBankAccount: string;
  companyRoutingNumber: string;
  companyIban: string;
  companySwiftCode: string;
  companyLogo: string;
  companySignature: string;
  companyStamp: string;
  // Client
  clientName: string;
  clientEmail: string;
  clientStreet: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  clientTaxId: string;
  clientRegistrationNumber: string;
  clientVatId: string;
  // Items
  items: InvoiceItem[];
  // Financials
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  // Slovak-specific
  variableSymbol: string;
  constantSymbol: string;
  // US-specific
  poNumber: string;
  // Other
  notes: string;
  terms: string;
  status: InvoiceStatus;
  paymentMethod: string;
  paidAt: string | null;
  template: InvoiceTemplate;
  // Meta
  createdAt: string;
  updatedAt: string;
}

export type InvoiceTemplate = 'modern' | 'classic' | 'minimal';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  locale: Locale;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultTaxRate: number;
  defaultPaymentTerms: number;
  defaultNotes: string;
  defaultTerms: string;
  defaultTemplate: InvoiceTemplate;
  theme: Theme;
}

export const defaultSettings: AppSettings = {
  locale: 'en',
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 1,
  defaultTaxRate: 0,
  defaultPaymentTerms: 30,
  defaultNotes: '',
  defaultTerms: '',
  defaultTemplate: 'modern',
  theme: 'light',
};
