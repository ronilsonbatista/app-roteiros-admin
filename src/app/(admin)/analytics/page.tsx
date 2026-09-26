'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getOverview,
  getRevenue,
  getAiUsage,
  getTopDestinations,
  getUsersGrowth,
  getTripsGrowth,
  getStorageStats,
  getSystemHealth,
  OverviewStats,
  RevenueStats,
  AiUsageStats,
  TopDestinations,
  SystemHealth,
  StorageStats
} from '@/services/analytics.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  RotateCw,
  Users,
  Map,
  DollarSign,
  Cpu,
  BarChart3,
  TrendingUp,
  HardDrive,
  Globe,
  Compass,
  Coins,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  // Stats data
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [aiUsage, setAiUsage] = useState<AiUsageStats | null>(null);
  const [destinations, setDestinations] = useState<TopDestinations | null>(null);
  const [usersGrowth, setUsersGrowth] = useState<any[]>([]);
  const [tripsGrowth, setTripsGrowth] = useState<any[]>([]);
  const [storage, setStorage] = useState<StorageStats | null>(null);

  // Trigger Client Mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      let startDate: string | undefined;
      
      if (timeframe === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
      } else if (timeframe === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
      } else if (timeframe === '90d') {
        startDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString();
      } else if (timeframe === 'ytd') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }

      const [
        overviewRes,
        revenueRes,
        aiUsageRes,
        destinationsRes,
        uGrowthRes,
        tGrowthRes,
        storageRes
      ] = await Promise.all([
        getOverview().catch(() => null),
        getRevenue(startDate).catch(() => null),
        getAiUsage().catch(() => null),
        getTopDestinations().catch(() => null),
        getUsersGrowth().catch(() => ({})),
        getTripsGrowth().catch(() => ({})),
        getStorageStats().catch(() => null)
      ]);

      setOverview(overviewRes);
      setRevenue(revenueRes);
      setAiUsage(aiUsageRes);
      setDestinations(destinationsRes);
      setStorage(storageRes);

      // Format growth maps to arrays for recharts
      if (uGrowthRes) {
        const arr = Object.entries(uGrowthRes).map(([month, count]) => ({
          month,
          novos: count
        }));
        setUsersGrowth(arr);
      }

      if (tGrowthRes) {
        const arr = Object.entries(tGrowthRes).map(([month, count]) => ({
          month,
          viagens: count
        }));
        setTripsGrowth(arr);
      }
    } catch (err: any) {
      console.error('Analytics load error:', err);
      setError('Erro ao carregar dados de inteligência analítica.');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    if (isMounted) {
      loadData();
    }
  }, [isMounted, loadData]);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  const formatStorageSize = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="ANALYTICS & BI"
        title="Métricas da Plataforma 2GO"
        subtitle="Inteligência de negócios: evolução de cadastros, faturamento, consumo de IA e destinos populares"
        breadcrumbs={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Métricas & BI' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg border border-slate-200/90 shadow-2xs flex items-center text-xs">
              {(['7d', '30d', '90d', 'ytd'] as const).map((t) => {
                const labels = { '7d': '7 dias', '30d': '30 dias', '90d': '90 dias', ytd: 'Ano Atual' };
                const isSel = timeframe === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isSel ? 'bg-[#001F5B] text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="text-xs h-8 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="BASE TOTAL DE USUÁRIOS"
          value={overview?.users?.total || 0}
          subtitle={`+${overview?.users?.newLast30Days || 0} novos nos últimos 30 dias`}
          icon={Users}
        />
        <MetricCard
          title="TOTAL DE VIAGENS GERADAS"
          value={overview?.trips?.total || 0}
          subtitle={`${overview?.trips?.premiumUnlocked || 0} com Full Access liberado`}
          icon={Globe}
        />
        <MetricCard
          title="FATURAMENTO ACUMULADO"
          value={formatCurrency(overview?.billing?.totalRevenue)}
          subtitle={`${overview?.billing?.paidPurchases || 0} compras pagas`}
          icon={Coins}
        />
        <MetricCard
          title="TOKENS IA CONSUMIDOS"
          value={overview?.ai?.estimatedTokensUsed || aiUsage?.totalTokensUsed || 0}
          subtitle={`${overview?.ai?.totalRequests || 0} solicitações ao modelo`}
          icon={Sparkles}
        />
      </div>

      {/* Charts Row: Users Growth & Trips Growth */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#001F5B]" />
              Crescimento de Usuários Cadastrados
            </h3>
          </div>
          <div className="h-64 w-full pt-2">
            {usersGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usersGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#001F5B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#001F5B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="novos" stroke="#001F5B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sem dados suficientes de crescimento mensal.
              </div>
            )}
          </div>
        </Card>

        {/* Trips Growth Chart */}
        <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF6A00]" />
              Roteiros de Viagem Criados por Mês
            </h3>
          </div>
          <div className="h-64 w-full pt-2">
            {tripsGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripsGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="viagens" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sem dados suficientes de geração de roteiros.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Destinations & Storage Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Destinations Table */}
        <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4 md:col-span-2">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Destinos Mais Buscados no 2GO
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="px-3 py-2">Destino</th>
                  <th className="px-3 py-2 text-right">Roteiros Gerados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {destinations?.tripsDestinations && destinations.tripsDestinations.length > 0 ? (
                  destinations.tripsDestinations.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{d.destination}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-[#001F5B]">{d._count || d.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-slate-400">
                      Sem dados de destinos registrados ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Storage Stats */}
        <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#001F5B]" />
              Armazenamento de Mídia
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total de Arquivos</span>
              <p className="text-lg font-bold text-slate-900">{storage?.totalFiles || 0}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Tamanho Ocupado</span>
              <p className="text-lg font-bold text-slate-900">{formatStorageSize(storage?.totalSize)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
