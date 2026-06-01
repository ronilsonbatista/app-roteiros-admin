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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  RotateCw,
  Users,
  Map,
  DollarSign,
  Cpu,
  Database,
  ShieldAlert,
  BarChart3,
  Calendar,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
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
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Trigger Client Mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calculate startDate based on selected timeframe
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
        overviewData,
        revenueData,
        aiUsageData,
        destData,
        rawUsersGrowth,
        rawTripsGrowth,
        storageData,
        healthData
      ] = await Promise.all([
        getOverview(),
        getRevenue(startDate),
        getAiUsage(),
        getTopDestinations(),
        getUsersGrowth(),
        getTripsGrowth(),
        getStorageStats(),
        getSystemHealth()
      ]);

      setOverview(overviewData);
      setRevenue(revenueData);
      setAiUsage(aiUsageData);
      setDestinations(destData);
      setStorage(storageData);
      setHealth(healthData);

      // Process monthly datasets & filter by timeframe if needed
      const currentYearStr = now.getFullYear().toString();
      
      const formatMonthlyGrowth = (rawData: Record<string, number>) => {
        return Object.entries(rawData)
          .map(([month, count]) => {
            const [year, m] = month.split('-');
            const monthLabel = `${m}/${year.substring(2)}`;
            return { month, monthLabel, year, count };
          })
          .sort((a, b) => a.month.localeCompare(b.month));
      };

      let formattedUsers = formatMonthlyGrowth(rawUsersGrowth);
      let formattedTrips = formatMonthlyGrowth(rawTripsGrowth);

      // Apply client-side timeline filtering
      if (timeframe === '7d' || timeframe === '30d') {
        // Show only last 3 months for tight ranges
        formattedUsers = formattedUsers.slice(-3);
        formattedTrips = formattedTrips.slice(-3);
      } else if (timeframe === '90d') {
        formattedUsers = formattedUsers.slice(-6);
        formattedTrips = formattedTrips.slice(-6);
      } else if (timeframe === 'ytd') {
        // Show only current year months
        formattedUsers = formattedUsers.filter(item => item.year === currentYearStr);
        formattedTrips = formattedTrips.filter(item => item.year === currentYearStr);
      }

      setUsersGrowth(formattedUsers);
      setTripsGrowth(formattedTrips);

    } catch (err: any) {
      console.error('Error loading analytics details:', err);
      setError('Ocorreu um erro ao buscar os dados analíticos do dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSuccessRate = () => {
    if (!overview?.ai) return 0;
    const { totalRequests, successRequests } = overview.ai;
    return totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#001F5B] font-heading">Analytics Executivo</h1>
          <p className="text-muted-foreground mt-1">
            Métricas de desempenho, crescimento de usuários, geração de viagens, faturamento consolidado e monitoramento operacional.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                timeframe === '7d' ? 'bg-white text-[#001F5B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                timeframe === '30d' ? 'bg-white text-[#001F5B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setTimeframe('90d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                timeframe === '90d' ? 'bg-white text-[#001F5B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              90 Dias
            </button>
            <button
              onClick={() => setTimeframe('ytd')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                timeframe === 'ytd' ? 'bg-white text-[#001F5B] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Ano Atual
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 gap-2 border-slate-200 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-100 bg-rose-50/50">
          <CardContent className="p-8 text-center text-rose-800 flex flex-col items-center justify-center gap-2.5">
            <AlertTriangle className="w-10 h-10 text-rose-600" />
            <p className="font-semibold text-lg">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="mt-2 border-rose-200 hover:bg-rose-100/50 text-rose-800 font-semibold cursor-pointer"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="p-40 text-center flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#001F5B]" />
          <p className="text-sm font-semibold text-slate-500">Montando painel analítico da plataforma...</p>
        </div>
      ) : (
        <>
          {/* Executive Metrics Overview Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Users card */}
            <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-[#001F5B]/5 text-[#001F5B] rounded-xl shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Usuários</span>
                  <span className="text-2xl font-bold text-slate-800 block truncate">{overview?.users?.total || 0}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    +{overview?.users?.newLast30Days || 0} nos últimos 30d
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trips card */}
            <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <Map className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Viagens Criadas</span>
                  <span className="text-2xl font-bold text-slate-800 block truncate">{overview?.trips?.total || 0}</span>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                    {overview?.trips?.premiumUnlocked || 0} premium desbloqueadas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue card */}
            <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200 bg-[#FF6A00]/5 border-[#FF6A00]/10">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-[#FF6A00]/10 text-[#FF6A00] rounded-xl shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Receita Acumulada</span>
                  <span className="text-2xl font-bold text-[#FF6A00] block truncate">
                    {formatCurrency(overview?.billing?.totalRevenue || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    {overview?.billing?.paidPurchases || 0} vendas aprovadas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Storage Sizing & Health */}
            <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-500 rounded-xl shrink-0">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Storage Utilizado</span>
                  <span className="text-2xl font-bold text-slate-800 block truncate">
                    {formatSize(storage?.totalSize || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    {storage?.totalFiles || 0} mídias físicas salvas
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sub-KPI Grid */}
          <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Compras Pendentes</span>
              <span className="font-bold text-amber-600 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {overview?.billing?.pendingPurchases || 0}
              </span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Requisições de IA</span>
              <span className="font-bold text-slate-800 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                {overview?.ai?.totalRequests || 0}
              </span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Taxa Sucesso IA</span>
              <span className="font-bold text-emerald-600 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {getSuccessRate().toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status do Sistema</span>
              {health?.databaseStatus === 'OK' ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Operacional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-red-700 text-xs bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerta
                </span>
              )}
            </div>
          </div>

          {/* Recharts Charts Layout */}
          {isMounted && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Users Growth Chart */}
              <Card className="shadow-xs border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">Crescimento de Usuários</h3>
                  <p className="text-xs text-slate-400">Total de novos usuários cadastrados por mês</p>
                </div>
                <div className="h-72">
                  {usersGrowth.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados históricos</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usersGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#001F5B"
                          strokeWidth={2.5}
                          name="Novos Usuários"
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Trips Growth Chart */}
              <Card className="shadow-xs border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">Geração de Roteiros</h3>
                  <p className="text-xs text-slate-400">Total de roteiros criados por mês na plataforma</p>
                </div>
                <div className="h-72">
                  {tripsGrowth.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem dados históricos</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tripsGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="monthLabel" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#FF6A00"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorTrips)"
                          name="Viagens"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* AI Usage stats */}
              <Card className="shadow-xs border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">Uso de IA por Modelo</h3>
                  <p className="text-xs text-slate-400">Quantidade de chamadas de geração distribuídas por LLM</p>
                </div>
                <div className="h-72">
                  {!aiUsage?.requestsByModel || aiUsage.requestsByModel.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem logs registrados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={aiUsage.requestsByModel.map(item => ({
                          name: item.model.replace('gpt-4o-mini', '4o-mini').substring(0, 12),
                          quantidade: item._count || item.count || 0
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#001F5B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Top Destinations */}
              <Card className="shadow-xs border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">Destinos Mais Procurados</h3>
                  <p className="text-xs text-slate-400">Cidades mais buscadas por usuários</p>
                </div>
                <div className="h-72">
                  {!destinations?.tripsDestinations || destinations.tripsDestinations.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem viagens cadastradas</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={destinations.tripsDestinations.slice(0, 5).map(item => ({
                          name: item.destination.substring(0, 15),
                          viagens: item._count || item.count || 0
                        }))}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} stroke="#cbd5e1" width={90} />
                        <Tooltip />
                        <Bar dataKey="viagens" fill="#FF6A00" radius={[0, 4, 4, 0]} maxBarSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Destinations Table and System Details Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Top Destinations detail list */}
            <Card className="shadow-xs border-slate-100 md:col-span-2 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#001F5B]" />
                  <h3 className="font-bold text-slate-800">Tabela de Cidades Populares</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Top Destinos</span>
              </div>
              
              {!destinations?.tripsDestinations || destinations.tripsDestinations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Nenhum destino registrado.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Cidade / Destino</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Quantidade de Roteiros</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Relevância</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.tripsDestinations.slice(0, 5).map((item, idx) => {
                      const total = overview?.trips?.total || 1;
                      const percentage = (((item._count || item.count || 0) / total) * 100).toFixed(1);
                      return (
                        <TableRow key={item.destination} className="hover:bg-slate-50/40">
                          <TableCell className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-4 font-mono font-bold">#{idx + 1}</span>
                            {item.destination}
                          </TableCell>
                          <TableCell className="font-bold text-slate-700 text-right">
                            {item._count || item.count || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 font-bold font-mono">{percentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>

            {/* Health Infrastructure Detailed card */}
            <Card className="shadow-xs border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#001F5B]" />
                <h3 className="font-bold text-slate-800">Serviços e Conexões</h3>
              </div>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-600">Banco de Dados</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    health?.databaseStatus === 'OK'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {health?.databaseStatus || 'OK'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-600">Conexão OpenAI API</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    health?.openaiConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {health?.openaiConfigured ? 'Conectado' : 'Sem Key'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-600">Conexão Google Maps</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    health?.googlePlacesConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {health?.googlePlacesConfigured ? 'Conectado' : 'Sem Key'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-600">Storage de Uploads</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    health?.uploadsFolderExists
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {health?.uploadsFolderExists ? 'Pasta Ativa' : 'Ausente'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-600">Provedor Mídia</span>
                  <span className="font-mono text-xs font-bold text-[#001F5B] bg-[#001F5B]/5 px-2 py-0.5 rounded">
                    {health?.mediaStorageProvider || 'local'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
