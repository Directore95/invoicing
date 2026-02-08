'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /invoices/new -> /invoices/new/edit (which is handled by [id]/edit)
export default function NewInvoiceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/invoices/new/edit');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
}
