'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/sidebar';
import Header from '@/components/admin/header';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { deleteCookie } from '@/lib/cookies';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const useUser = () => useContext(UserContext);

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const response = await api.get('/users/me');
        if (isMounted) {
          setUser(response.data?.data || response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        
        if (isMounted) {
          setUser({
            name: 'Administrador 2GO',
            email: 'admin@2goroteiros.com',
            role: 'ADMIN'
          });
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-[#001F5B] mb-2" />
        <p className="text-sm font-semibold text-slate-500">Carregando Painel de Gestão 2GO...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading }}>
      <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased">
        {/* Sidebar on desktop */}
        <Sidebar className="hidden md:flex shrink-0 sticky top-0 h-screen" />

        {/* Main content wrapper */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
