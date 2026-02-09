'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import AuthGuard from './AuthGuard';
import { useStore } from '@/lib/store';

function FirestoreSync({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const setUserId = useStore((s) => s.setUserId);

  useEffect(() => {
    setUserId(user?.uid ?? null);
  }, [user, setUserId]);

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
