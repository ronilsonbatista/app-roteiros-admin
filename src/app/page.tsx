'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-2" />
      <p className="text-sm font-medium text-slate-400">Direcionando...</p>
    </div>
  );
}
