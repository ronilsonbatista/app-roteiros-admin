'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UsersRound, 
  UserX, 
  Globe, 
  Crown, 
  CreditCard, 
  Clock, 
  Coins, 
  Sparkles, 
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  UploadCloud,
  Cpu,
  MapPin,
  CheckCircle2,
  XCircle,
  UserCheck,
  Shield,
  Funnel,
  TrendingUp,
  Megaphone,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useUser } from '@/app/(admin)/layout';
import { 
  getDashboardOverview, 
  getSystemHealth, 
  DashboardOverview, 
  SystemHealth 
} from '@/services/dashboard.service';
import { getFunnel, FunnelStats } from '@/services/analytics.service';

export default function DashboardPage() {
  const { user } = useUser();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [funnel, setFunnel] = useState<FunnelStats | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = user?.name || 'Administrador';
  const userEmail = user?.email || 'admin@roteiros.com';
  const userRole = user?.role || 'administrator';

  const fetchData = useCallback(async (showRefreshingState = false) => {
    if (showRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    let startDate: string | undefined;
    const now = new Date();
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today.toISOString();
    } else if (dateFilter === '7d') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      startDate = d7.toISOString();
    } else if (dateFilter === '30d') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      startDate = d30.toISOString();
    }

    try {
      const [overviewRes, healthRes, funnelRes] = await Promise.all([
        getDashboardOverview(),
        getSystemHealth(),
        getFunnel(startDate, now.toISOString()),
      ]);

      setOverview(overviewRes);
      setHealth(healthRes);
      setFunnel(funnelRes);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Não foi possível atualizar os dados do painel.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const checkStatus = (val: any): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return ['up', 'healthy', 'ok', 'true'].includes(lower);
    }
    return false;
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalUsers = overview?.totalUsers ?? overview?.total_users ?? 0;
  const blockedUsers = overview?.blockedUsers ?? overview?.blocked_users ?? 0;
  const totalTrips = overview?.totalTrips ?? overview?.total_trips ?? 0;
  const premiumTrips = overview?.premiumTrips ?? overview?.premium_trips ?? 0;
  const paidPurchases = overview?.paidPurchases ?? overview?.paid_purchases ?? 0;
  const pendingPurchases = overview?.pendingPurchases ?? overview?.pending_purchases ?? 0;
  const totalRevenue = overview?.totalRevenue ?? overview?.total_revenue ?? 0;
  const aiRequests = overview?.aiRequestsCount ?? overview?.aiRequests ?? 0;
  const aiFailedRequests = overview?.aiFailedRequestsCount ?? overview?.aiFailedRequests ?? 0;

  const apiStatus = health?.api ?? (health ? 'OK' : undefined);
  const dbStatus = health?.database ?? (health as any)?.databaseStatus;
  const uploadStatus = health?.uploadFolder ?? health?.upload_folder ?? (health as any)?.uploadsFolderExists;
  const openaiStatus = health?.openai ?? (health as any)?.openaiConfigured;
  const mapsStatus = health?.googleMaps ?? (health as any)?.googlePlacesConfigured;

  const healthChecks = [
    { name: 'API Core Principal', status: apiStatus, icon: Server, desc: 'Ponto de entrada do sistema' },
    { name: 'Banco PostgreSQL', status: dbStatus, icon: Database, desc: 'Persistência relacional' },
    { name: 'Armazenamento Mídia', status: uploadStatus, icon: UploadCloud, desc: 'S3 / Proxy persistente' },
    { name: 'OpenAI API', status: openaiStatus, icon: Cpu, desc: 'Geração e síntese de roteiros' },
    { name: 'Google Maps Places', status: mapsStatus, icon: MapPin, desc: 'Geolocalização de atrações' },
  ];

  const metrics = [
    {
      title: 'Total de Clientes/Usuários',
      value: totalUsers.toString(),
      icon: UsersRound,
      color: 'text-[#001F5B] bg-[#001F5B]/5 border-[#001F5B]/10',
      description: 'Cadastros no ecossistema',
      href: '/customers',
    },
    {
      title: 'Receita Total Confirmada',
      value: formatCurrency(totalRevenue),
      icon: Coins,
      color: 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10',
      description: 'Faturamento bruto acumulado',
      href: '/billing',
    },
    {
      title: 'Compras Pagas',
      value: paidPurchases.toString(),
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
      description: 'Transações aprovadas',
      href: '/billing',
    },
    {
      title: 'Total de Viagens',
      value: totalTrips.toString(),
      icon: Globe,
      color: 'text-[#5E6118] bg-[#5E6118]/5 border-[#5E6118]/10',
      description: 'Roteiros criados no app',
      href: '/trips',
    },
    {
      title: 'Viagens Premium',
      value: premiumTrips.toString(),
      icon: Crown,
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
      description: 'Full Access liberado',
      href: '/trips',
    },
    {
      title: 'Requisições IA',
      value: aiRequests.toString(),
      icon: Sparkles,
      color: 'text-violet-500 bg-violet-500/5 border-violet-500/10',
      description: 'Solicitações de roteiro por IA',
      href: '/ai',
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4 animate-bounce duration-[3s]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Falha na Comunicação</h3>
        <p className="text-slate-500 text-sm max-w-md mb-6">{error}</p>
        <Button 
          onClick={() => fetchData()}
          className="bg-[#001F5B] hover:bg-[#FF6A00] text-white flex items-center gap-2 cursor-pointer rounded-xl h-11 px-6 shadow"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Control Center Executivo</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Olá, {userName}!
          </h1>
          <p className="text-slate-500 text-xs">
            Visão centralizada de clientes, funil de conversão, operações financeiras e status dos provedores.
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateFilter('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateFilter === '7d' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setDateFilter('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateFilter === '30d' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tudo
            </button>
          </div>

          <Button 
            variant="outline"
            size="sm"
            disabled={isLoading || isRefreshing}
            onClick={() => fetchData(true)}
            className="text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#001F5B]' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Funnel Real Overview Banner */}
      {funnel && (
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
              Funil de Conversão do Ecossistema (Números Reais do Core)
            </div>
            <Link href="/leads" className="text-xs text-[#001F5B] hover:underline font-semibold flex items-center gap-1">
              Ver Detalhes dos Leads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {funnel.funnel.map((st, i) => (
              <div 
                key={st.stage} 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Etapa {i + 1}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate" title={st.stage}>
                  {st.stage}
                </div>
                <div className="text-lg font-black text-slate-900 mt-2">
                  {st.count}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {i === 0 ? 'Visitantes' : `${st.conversionFromPrevious}% conv.`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6 Key Operational KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <Link key={metric.title} href={metric.href}>
              <Card className="border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all text-slate-700 rounded-2xl cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg border ${metric.color}`}>
                    <MetricIcon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-950 tracking-tight">{metric.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Row: Session & System Health */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <Card className="border-slate-200 bg-white shadow-xs text-slate-700 md:col-span-3 lg:col-span-1 rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#001F5B]" />
              Sessão Administrativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Usuário</span>
              <div className="text-xs font-bold text-slate-800">{userName}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">E-mail</span>
              <div className="text-xs font-bold text-slate-800 truncate">{userEmail}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Papel (RBAC)</span>
              <div className="text-xs font-bold text-[#FF6A00] uppercase font-mono mt-0.5">{userRole}</div>
            </div>
          </CardContent>
        </Card>

        {/* System Health Status Panel */}
        <Card className="border-slate-200 bg-white shadow-xs text-slate-700 md:col-span-3 lg:col-span-2 rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FF6A00]" />
                Status dos Provedores & Infraestrutura
              </CardTitle>
            </div>
            <Link href="/system" className="text-xs text-[#001F5B] hover:underline font-semibold">
              Ver Auditoria Completa
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {healthChecks.map((service) => {
                const ServiceIcon = service.icon;
                const online = checkStatus(service.status);
                
                return (
                  <div 
                    key={service.name} 
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${online ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10' : 'text-red-500 bg-red-500/5 border-red-500/10'}`}>
                        <ServiceIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{service.name}</p>
                        <p className="text-[10px] text-slate-400">{service.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 pl-2">
                      {online ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ativo</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Inativo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
