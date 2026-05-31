'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, LayoutDashboard, Map, Users, Settings, LogOut, FileText } from 'lucide-react';
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
    <div className={cn("flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 w-64", className)}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/10">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white tracking-wide text-sm block">RoteirosAdmin</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Painel de Controle</span>
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed select-none"
                  title="Funcionalidade indisponível (Apenas login implementado)"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-[9px] bg-slate-800/40 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">Breve</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-violet-600/10 text-violet-400 font-semibold border-l-2 border-violet-500 pl-2.5"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-violet-400" : "text-slate-400")} />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </div>
  );
}
