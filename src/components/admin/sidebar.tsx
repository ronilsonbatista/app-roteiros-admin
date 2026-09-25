'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
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
  LogOut 
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
      title: 'Visão Geral',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Clientes & CRM',
      items: [
        { name: 'Todos os Clientes', href: '/customers', icon: Users },
        { name: 'Leads & Funil', href: '/leads', icon: Funnel },
      ],
    },
    {
      title: 'Viagens',
      items: [
        { name: 'Viagens', href: '/trips', icon: Map },
        { name: 'Roteiros Base', href: '/base-trips', icon: Compass },
      ],
    },
    {
      title: 'Comercial',
      items: [
        { name: 'Compras & Cupons', href: '/billing', icon: CreditCard },
      ],
    },
    {
      title: 'Marketing & Remarketing',
      items: [
        { name: 'Campanhas', href: '/marketing', icon: Megaphone, exact: true },
        { name: 'Templates', href: '/marketing/templates', icon: MailCheck },
        { name: 'Segmentos', href: '/marketing/segments', icon: Layers },
      ],
    },
    {
      title: 'Conteúdo & CMS',
      items: [
        { name: 'Blog & Artigos', href: '/blog', icon: FileText },
      ],
    },
    {
      title: 'Inteligência Artificial',
      items: [
        { name: 'Central de IA & Diretrizes', href: '/intelligence', icon: Sparkles, exact: true },
        { name: 'Playground & Simulação', href: '/intelligence/playground', icon: FlaskConical },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Métricas & Funil', href: '/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { name: 'Usuários Admin', href: '/users', icon: UserCheck },
        { name: 'Status & Auditoria', href: '/system', icon: ServerCog },
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
    <div className={cn("flex flex-col h-full bg-[#001F5B] border-r border-[#001F5B]/10 text-slate-100 w-64 select-none", className)}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 shrink-0">
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
          <span className="text-[10px] text-[#FF6A00] font-black uppercase tracking-widest block">Control Center</span>
          <span className="text-[9px] text-white/50 block font-medium">Ecossistema 2GO</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#FF6A00] text-white font-semibold shadow-md shadow-[#FF6A00]/25 pl-3.5"
                        : "text-slate-300 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-300")} />
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">
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

      {/* Logout Footer Section */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 cursor-pointer text-xs h-9"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </div>
  );
}
