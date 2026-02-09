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

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <FirestoreSync>
          {children}
        </FirestoreSync>
      </AuthGuard>
    </AuthProvider>
  );
}
