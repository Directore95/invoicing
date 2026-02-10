import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import { Company, Invoice, InvoiceStatus, AppSettings, defaultSettings } from './types';
import { Locale, regionConfig } from './i18n';

// ============================================================
// Firestore paths helper
// ============================================================
function userDoc(userId: string) {
  return doc(db, 'users', userId);
}
function companiesCol(userId: string) {
  return collection(db, 'users', userId, 'companies');
}
function companyDoc(userId: string, companyId: string) {
  return doc(db, 'users', userId, 'companies', companyId);
}
function invoicesCol(userId: string) {
  return collection(db, 'users', userId, 'invoices');
}
function invoiceDoc(userId: string, invoiceId: string) {
  return doc(db, 'users', userId, 'invoices', invoiceId);
}
function partnersCol(userId: string) {
  return collection(db, 'users', userId, 'partners');
}
function partnerDoc(userId: string, partnerId: string) {
  return doc(db, 'users', userId, 'partners', partnerId);
}

/** Log and surface Firestore errors */
function handleFirestoreError(operation: string, error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[Firestore] ${operation} failed:`, msg, error);
}

// ============================================================
// Partner type (reusable client profiles)
// ============================================================
export interface Partner {
  id: string;
  userId: string;
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  taxId: string;
  registrationNumber: string;
  vatId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Store interface
// ============================================================
interface AppStore {
  // Auth
  userId: string | null;
  setUserId: (userId: string | null) => void;
  firestoreReady: boolean;

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

  // Partners
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Partner;
  updatePartner: (id: string, data: Partial<Partner>) => void;
  deletePartner: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  cloneInvoice: (id: string) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  getNextInvoiceNumber: () => string;

  // Firestore listeners
  _unsubscribers: (() => void)[];
  subscribeToFirestore: (userId: string) => void;
  unsubscribeFromFirestore: () => void;
}

// ============================================================
// Zustand store - synced with Firestore
// ============================================================
export const useStore = create<AppStore>()((set, get) => ({
  // Auth
  userId: null,
  firestoreReady: false,
  setUserId: (userId) => {
    const prev = get().userId;
    if (prev === userId) return;

    // Unsubscribe from previous user's data
    get().unsubscribeFromFirestore();

    if (userId) {
      set({ userId, firestoreReady: false });
      get().subscribeToFirestore(userId);
    } else {
      set({
        userId: null,
        firestoreReady: false,
        companies: [],
        invoices: [],
        partners: [],
        settings: defaultSettings,
      });
    }
  },

  // Settings
  settings: defaultSettings,
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    // Persist to Firestore
    const { userId, settings } = get();
    if (userId) {
      const merged = { ...settings, ...updates };
      setDoc(userDoc(userId), { ...merged, userId }, { merge: true }).catch((e) =>
        handleFirestoreError('updateSettings', e)
      );
    }
  },
  setLocale: (locale) => {
    const updates = {
      locale,
      defaultTaxRate: regionConfig[locale].defaultTaxRate,
    };
    get().updateSettings(updates);
  },

  // Companies
  companies: [],
  addCompany: (companyData) => {
    const { userId } = get();
    const now = new Date().toISOString();
    const id = uuidv4();
    const company: Company = {
      ...companyData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    // Optimistic local update
    set((state) => ({ companies: [...state.companies, company] }));
    // Persist
    if (userId) {
      setDoc(companyDoc(userId, id), { ...company, userId }).catch((e) =>
        handleFirestoreError('addCompany', e)
      );
    }
    return company;
  },
  updateCompany: (id, data) => {
    set((state) => ({
      companies: state.companies.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
    const { userId } = get();
    if (userId) {
      updateDoc(companyDoc(userId, id), { ...data, updatedAt: new Date().toISOString() }).catch(
        (e) => handleFirestoreError('updateCompany', e)
      );
    }
  },
  deleteCompany: (id) => {
    set((state) => ({ companies: state.companies.filter((c) => c.id !== id) }));
    const { userId } = get();
    if (userId) {
      deleteDoc(companyDoc(userId, id)).catch((e) =>
        handleFirestoreError('deleteCompany', e)
      );
    }
  },
  setDefaultCompany: (id) => {
    const { companies, userId } = get();
    const updated = companies.map((c) => ({ ...c, isDefault: c.id === id }));
    set({ companies: updated });
    if (userId) {
      updated.forEach((c) => {
        updateDoc(companyDoc(userId, c.id), { isDefault: c.isDefault }).catch((e) =>
          handleFirestoreError('setDefaultCompany', e)
        );
      });
    }
  },
  getDefaultCompany: () => {
    const { companies } = get();
    return companies.find((c) => c.isDefault) || companies[0];
  },

  // Partners
  partners: [],
  addPartner: (partnerData) => {
    const { userId } = get();
    const now = new Date().toISOString();
    const id = uuidv4();
    const partner: Partner = {
      ...partnerData,
      id,
      userId: userId || '',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ partners: [...state.partners, partner] }));
    if (userId) {
      setDoc(partnerDoc(userId, id), partner).catch((e) =>
        handleFirestoreError('addPartner', e)
      );
    }
    return partner;
  },
  updatePartner: (id, data) => {
    set((state) => ({
      partners: state.partners.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
    const { userId } = get();
    if (userId) {
      updateDoc(partnerDoc(userId, id), { ...data, updatedAt: new Date().toISOString() }).catch(
        (e) => handleFirestoreError('updatePartner', e)
      );
    }
  },
  deletePartner: (id) => {
    set((state) => ({ partners: state.partners.filter((p) => p.id !== id) }));
    const { userId } = get();
    if (userId) {
      deleteDoc(partnerDoc(userId, id)).catch((e) =>
        handleFirestoreError('deletePartner', e)
      );
    }
  },

  // Invoices
  invoices: [],
  addInvoice: (invoiceData) => {
    const { userId } = get();
    const now = new Date().toISOString();
    const id = uuidv4();
    const invoice: Invoice = {
      ...invoiceData,
      id,
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
    if (userId) {
      setDoc(invoiceDoc(userId, id), { ...invoice, userId }).catch((e) =>
        handleFirestoreError('addInvoice', e)
      );
      // Also update the next invoice number in settings
      const { settings } = get();
      setDoc(userDoc(userId), { ...settings, userId }, { merge: true }).catch((e) =>
        handleFirestoreError('addInvoice:settings', e)
      );
    }
    return invoice;
  },
  updateInvoice: (id, data) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv
      ),
    }));
    const { userId } = get();
    if (userId) {
      updateDoc(invoiceDoc(userId, id), { ...data, updatedAt: new Date().toISOString() }).catch(
        (e) => handleFirestoreError('updateInvoice', e)
      );
    }
  },
  deleteInvoice: (id) => {
    set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
    const { userId } = get();
    if (userId) {
      deleteDoc(invoiceDoc(userId, id)).catch((e) =>
        handleFirestoreError('deleteInvoice', e)
      );
    }
  },
  cloneInvoice: (id) => {
    const state = get();
    const original = state.invoices.find((inv) => inv.id === id);
    if (!original) throw new Error('Invoice not found');
    const now = new Date().toISOString();
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (state.settings.defaultPaymentTerms || 30));

    const newId = uuidv4();
    const cloned: Invoice = {
      ...original,
      id: newId,
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
    const { userId } = get();
    if (userId) {
      setDoc(invoiceDoc(userId, newId), { ...cloned, userId }).catch((e) =>
        handleFirestoreError('cloneInvoice', e)
      );
      const { settings } = get();
      setDoc(userDoc(userId), { ...settings, userId }, { merge: true }).catch((e) =>
        handleFirestoreError('cloneInvoice:settings', e)
      );
    }
    return cloned;
  },
  updateInvoiceStatus: (id, status) => {
    const now = new Date().toISOString();
    const paidAt = status === 'paid' ? now : null;
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status, paidAt: paidAt ?? inv.paidAt, updatedAt: now }
          : inv
      ),
    }));
    const { userId } = get();
    if (userId) {
      const inv = get().invoices.find((i) => i.id === id);
      if (inv) {
        updateDoc(invoiceDoc(userId, id), { status, paidAt: inv.paidAt, updatedAt: now }).catch(
          (e) => handleFirestoreError('updateInvoiceStatus', e)
        );
      }
    }
  },
  getNextInvoiceNumber: () => {
    const { settings } = get();
    return `${settings.invoicePrefix}${String(settings.nextInvoiceNumber).padStart(4, '0')}`;
  },

  // ============================================================
  // Firestore real-time listeners
  // ============================================================
  _unsubscribers: [],
  subscribeToFirestore: (userId: string) => {
    const unsubs: (() => void)[] = [];
    let settingsReady = false;
    let companiesReady = false;
    let invoicesReady = false;
    let partnersReady = false;

    const checkReady = () => {
      if (settingsReady && companiesReady && invoicesReady && partnersReady) {
        set({ firestoreReady: true });
      }
    };

    // Listen to user settings
    const unsubSettings = onSnapshot(
      userDoc(userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const settings: AppSettings = {
            locale: data.locale || defaultSettings.locale,
            invoicePrefix: data.invoicePrefix || defaultSettings.invoicePrefix,
            nextInvoiceNumber: data.nextInvoiceNumber ?? defaultSettings.nextInvoiceNumber,
            defaultTaxRate: data.defaultTaxRate ?? defaultSettings.defaultTaxRate,
            defaultPaymentTerms: data.defaultPaymentTerms ?? defaultSettings.defaultPaymentTerms,
            defaultNotes: data.defaultNotes || defaultSettings.defaultNotes,
            defaultTerms: data.defaultTerms || defaultSettings.defaultTerms,
            defaultTemplate: data.defaultTemplate || defaultSettings.defaultTemplate,
            theme: data.theme || defaultSettings.theme,
          };
          set({ settings });
        } else {
          // First login - create settings doc
          setDoc(userDoc(userId), { ...defaultSettings, userId }).catch((e) =>
            handleFirestoreError('initSettings', e)
          );
        }
        settingsReady = true;
        checkReady();
      },
      (error) => {
        handleFirestoreError('onSnapshot:settings', error);
        settingsReady = true;
        checkReady();
      }
    );
    unsubs.push(unsubSettings);

    // Listen to companies
    const unsubCompanies = onSnapshot(
      query(companiesCol(userId)),
      (snap) => {
        const companies: Company[] = snap.docs.map((d) => {
          const data = d.data();
          return { ...data, id: d.id } as Company;
        });
        set({ companies });
        companiesReady = true;
        checkReady();
      },
      (error) => {
        handleFirestoreError('onSnapshot:companies', error);
        companiesReady = true;
        checkReady();
      }
    );
    unsubs.push(unsubCompanies);

    // Listen to invoices
    const unsubInvoices = onSnapshot(
      query(invoicesCol(userId)),
      (snap) => {
        const invoices: Invoice[] = snap.docs.map((d) => {
          const data = d.data();
          return { ...data, id: d.id } as Invoice;
        });
        set({ invoices });
        invoicesReady = true;
        checkReady();
      },
      (error) => {
        handleFirestoreError('onSnapshot:invoices', error);
        invoicesReady = true;
        checkReady();
      }
    );
    unsubs.push(unsubInvoices);

    // Listen to partners
    const unsubPartners = onSnapshot(
      query(partnersCol(userId)),
      (snap) => {
        const partners: Partner[] = snap.docs.map((d) => {
          const data = d.data();
          return { ...data, id: d.id } as Partner;
        });
        set({ partners });
        partnersReady = true;
        checkReady();
      },
      (error) => {
        handleFirestoreError('onSnapshot:partners', error);
        partnersReady = true;
        checkReady();
      }
    );
    unsubs.push(unsubPartners);

    set({ _unsubscribers: unsubs });
  },

  unsubscribeFromFirestore: () => {
    const { _unsubscribers } = get();
    _unsubscribers.forEach((unsub) => unsub());
    set({ _unsubscribers: [] });
  },
}));
