'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Funnel,
  Map, 
  Compass, 
  CreditCard, 
  Megaphone,
  MailCheck,
  Layers,
  FileText,
  Sparkles, 
  FlaskConical,
  BarChart3, 
  Image as ImageIcon, 
  ServerCog,
  UserCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { deleteCookie } from '@/lib/cookies';

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

interface NavGroup {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: string;
  }>;
}

export default function Sidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navGroups: NavGroup[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { name: 'Dashboard Executivo', href: '/dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'CLIENTES & CRM',
      items: [
        { name: 'Viajantes', href: '/users', icon: Users },
        { name: 'Clientes', href: '/customers', icon: Users },
        { name: 'Leads & Funil', href: '/leads', icon: Funnel },
      ],
    },
    {
      title: 'VIAGENS',
      items: [
        { name: 'Viagens no App', href: '/trips', icon: Map },
        { name: 'Editor de Roteiros', href: '/itinerary-editor', icon: FileText },
        { name: 'Roteiros Base', href: '/base-trips', icon: Compass },
      ],
    },
    {
      title: 'COMERCIAL',
      items: [
        { name: 'Compras & Cupons', href: '/billing', icon: CreditCard },
      ],
    },
    {
      title: 'MARKETING',
      items: [
        { name: 'Campanhas', href: '/marketing', icon: Megaphone, exact: true },
        { name: 'Templates', href: '/marketing/templates', icon: MailCheck },
        { name: 'Segmentos', href: '/marketing/segments', icon: Layers },
      ],
    },
    {
      title: 'CONTEÚDO',
      items: [
        { name: 'Blog & CMS', href: '/blog', icon: FileText },
      ],
    },
    {
      title: 'INTELIGÊNCIA',
      items: [
        { name: 'IA & Diretrizes', href: '/intelligence', icon: Sparkles, exact: true },
        { name: 'Playground IA', href: '/intelligence/playground', icon: FlaskConical },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Métricas da Plataforma', href: '/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { name: 'Provider Health & Logs', href: '/system', icon: ServerCog },
        { name: 'Configurações', href: '/settings', icon: UserCheck },
        { name: 'Mídias', href: '/media', icon: ImageIcon },
      ],
    },
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
    <aside className={cn("flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-700 w-64 select-none shrink-0", className)}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-slate-50/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-24 h-7 flex items-center justify-start">
            <Image
              src="/brand/logo-2go.png"
              alt="Logo 2GO Roteiros"
              width={96}
              height={28}
              priority
              className="h-auto w-auto object-contain max-h-7"
            />
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-2.5">
            <span className="text-[10px] text-[#001F5B] font-bold tracking-tight leading-none uppercase">Painel de Gestão</span>
            <span className="text-[9px] text-[#FF6A00] font-mono leading-none mt-0.5">Control Center</span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#001F5B]/8 text-[#001F5B] font-semibold border-l-2 border-[#FF6A00] pl-2.5"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors", 
                          isActive ? "text-[#001F5B]" : "text-slate-400 group-hover:text-slate-700"
                        )} 
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40 shrink-0 space-y-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-150 cursor-pointer text-xs h-9"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </aside>
  );
}
