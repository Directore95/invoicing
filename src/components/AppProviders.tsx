'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthGuard from './AuthGuard';
import { useStore } from '@/lib/store';

function FirestoreSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const setUserId = useStore((s) => s.setUserId);
  const firestoreReady = useStore((s) => s.firestoreReady);

  useEffect(() => {
    setUserId(user?.uid ?? null);
  }, [user, setUserId]);

  // Show loading while Firestore data loads
  if (user && !firestoreReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl mb-3 animate-pulse">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <FirestoreSync>
          <ThemeSync>
            {children}
          </ThemeSync>
        </FirestoreSync>
      </AuthGuard>
    </AuthProvider>
  );
}
