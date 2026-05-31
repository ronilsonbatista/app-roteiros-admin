'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, Users, Settings, LogOut, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { deleteCookie } from '@/lib/cookies';

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export default function Sidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Roteiros', href: '/roteiros', icon: Map, disabled: true },
    { name: 'Clientes', href: '/clientes', icon: Users, disabled: true },
    { name: 'Relatórios', href: '/relatorios', icon: FileText, disabled: true },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, disabled: true },
  ];

  const handleLogout = () => {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
    if (onItemClick) onItemClick();
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#001F5B] border-r border-[#001F5B]/10 text-slate-100 w-64", className)}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="relative w-28 h-8 flex items-center justify-start bg-white/10 p-1.5 rounded-md">
          <Image
            src="/brand/logo-2go.png"
            alt="Logo 2GO Roteiros"
            width={100}
            height={30}
            priority
            className="h-auto w-auto object-contain max-h-6 rounded"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest block">Admin</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <div key={item.name}>
              {item.disabled ? (
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 cursor-not-allowed select-none"
                  title="Funcionalidade indisponível (Apenas login implementado)"
                >
                  <Icon className="w-4 h-4 shrink-0 text-white/30" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-[9px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded uppercase tracking-wider">Breve</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#FF6A00] text-white font-semibold shadow-md shadow-[#FF6A00]/20 pl-3.5"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-300")} />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </div>
  );
}
