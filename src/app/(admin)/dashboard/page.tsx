'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { useUser } from '@/app/(admin)/layout';
import { 
  getDashboardOverview, 
  getSystemHealth, 
  DashboardOverview, 
  SystemHealth 
} from '@/services/dashboard.service';

export default function DashboardPage() {
  const { user } = useUser();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
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

    try {
      // Load overview and system health concurrently
      const [overviewRes, healthRes] = await Promise.all([
        getDashboardOverview(),
        getSystemHealth()
      ]);

      setOverview(overviewRes);
      setHealth(healthRes);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(
        'Não foi possível atualizar os dados do painel. Verifique a conexão com o servidor.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resilient status checker mapping boolean and string statuses
  const checkStatus = (val: any): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return ['up', 'online', 'healthy', 'ok', 'true', 'funcionando', 'ativo'].includes(lower);
    }
    return false;
  };

  // Currency formatter
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Safe key extraction for overview (handling camelCase, snake_case)
  const totalUsers = overview?.totalUsers ?? overview?.total_users ?? 0;
  const blockedUsers = overview?.blockedUsers ?? overview?.blocked_users ?? 0;
  const totalTrips = overview?.totalTrips ?? overview?.total_trips ?? 0;
  const premiumTrips = overview?.premiumTrips ?? overview?.premium_trips ?? 0;
  const paidPurchases = overview?.paidPurchases ?? overview?.paid_purchases ?? 0;
  const pendingPurchases = overview?.pendingPurchases ?? overview?.pending_purchases ?? 0;
  const totalRevenue = overview?.totalRevenue ?? overview?.total_revenue ?? 0;
  
  const aiRequests = overview?.aiRequestsCount ?? 
                    overview?.aiRequests ?? 
                    overview?.ai_requests_count ?? 
                    overview?.ai_requests ?? 0;

  const aiFailedRequests = overview?.aiFailedRequestsCount ?? 
                          overview?.aiFailedRequests ?? 
                          overview?.ai_failed_requests_count ?? 
                          overview?.ai_failed_requests ?? 0;

  // Extract health states
  const apiStatus = health?.api;
  const dbStatus = health?.database;
  const uploadStatus = health?.uploadFolder ?? health?.upload_folder;
  const openaiStatus = health?.openai ?? health?.openAi ?? health?.open_ai;
  const mapsStatus = health?.googleMaps ?? health?.google_maps;

  // Health widget UI configurations
  const healthChecks = [
    { name: 'API Principal', status: apiStatus, icon: Server, desc: 'Ponto de entrada do sistema' },
    { name: 'Banco de Dados', status: dbStatus, icon: Database, desc: 'Persistência Postgres' },
    { name: 'Pasta de Uploads', status: uploadStatus, icon: UploadCloud, desc: 'Armazenamento de mídias' },
    { name: 'OpenAI API', status: openaiStatus, icon: Cpu, desc: 'Geração de roteiros por IA' },
    { name: 'Google Maps API', status: mapsStatus, icon: MapPin, desc: 'Serviços de geolocalização' },
  ];

  // 9 Metric Card Configurations
  const metrics = [
    {
      title: 'Total de Usuários',
      value: totalUsers.toString(),
      icon: UsersRound,
      color: 'text-[#001F5B] bg-[#001F5B]/5 border-[#001F5B]/10',
      description: 'Contas cadastradas no app',
    },
    {
      title: 'Usuários Bloqueados',
      value: blockedUsers.toString(),
      icon: UserX,
      color: 'text-[#FF6A00] bg-[#FF6A00]/5 border-[#FF6A00]/10',
      description: 'Acessos restritos por infração',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(totalRevenue),
      icon: Coins,
      color: 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10',
      description: 'Faturamento bruto acumulado',
    },
    {
      title: 'Total de Viagens',
      value: totalTrips.toString(),
      icon: Globe,
      color: 'text-[#5E6118] bg-[#5E6118]/5 border-[#5E6118]/10',
      description: 'Itinerários criados por usuários',
    },
    {
      title: 'Viagens Premium',
      value: premiumTrips.toString(),
      icon: Crown,
      color: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
      description: 'Planos e assinaturas pagas',
    },
    {
      title: 'Compras Pagas',
      value: paidPurchases.toString(),
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
      description: 'Transações aprovadas',
    },
    {
      title: 'Compras Pendentes',
      value: pendingPurchases.toString(),
      icon: Clock,
      color: 'text-orange-500 bg-orange-500/5 border-orange-500/10',
      description: 'Aguardando processamento',
    },
    {
      title: 'Requisições IA',
      value: aiRequests.toString(),
      icon: Sparkles,
      color: 'text-violet-500 bg-violet-500/5 border-violet-500/10',
      description: 'Solicitações de roteiro por IA',
    },
    {
      title: 'Requisições IA Falhas',
      value: aiFailedRequests.toString(),
      icon: AlertTriangle,
      color: aiFailedRequests > 0 ? 'text-red-500 bg-red-500/5 border-red-500/10' : 'text-slate-400 bg-slate-100 border-slate-200/50',
      description: 'Erros de resposta do LLM',
    },
  ];

  // Error Layout Render
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
      {/* Banner / Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Olá, {userName}!
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Painel administrativo 2GO Roteiros. Veja o status das APIs e dados gerais.
          </p>
        </div>
        
        <Button 
          variant="outline"
          disabled={isLoading || isRefreshing}
          onClick={() => fetchData(true)}
          className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0 rounded-xl h-11 px-5 shadow-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#001F5B]' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {isLoading ? (
        // Premium Pulse Loading Skeletons
        <div className="space-y-8 animate-pulse">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-[260px] bg-slate-200 border border-slate-100 rounded-3xl md:col-span-3 lg:col-span-1" />
            <div className="grid gap-6 sm:grid-cols-2 md:col-span-3 lg:col-span-2 h-[260px]">
              <div className="bg-slate-200 rounded-2xl" />
              <div className="bg-slate-200 rounded-2xl" />
            </div>
          </div>
          
          <div className="h-10 w-48 bg-slate-200 rounded" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 border border-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Row: User context & System Health status widgets */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* User Profile Card */}
            <Card className="border-slate-200 bg-white shadow-md text-slate-700 md:col-span-3 lg:col-span-1 rounded-3xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#001F5B]" />
                  Sessão Administrativa
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Autenticado via 2GO Roteiros API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nome</span>
                  <span className="text-sm font-bold text-slate-800">{userName}</span>
                </div>
                
                <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</span>
                  <span className="text-sm font-bold text-slate-800 truncate">{userEmail}</span>
                </div>
                
                <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#FF6A00]" />
                    Nível de Acesso
                  </span>
                  <span className="text-xs font-bold text-[#FF6A00] bg-[#FF6A00]/5 border border-[#FF6A00]/10 px-2 py-0.5 rounded w-fit capitalize mt-1">
                    {userRole}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* System Health Status Panel */}
            <Card className="border-slate-200 bg-white shadow-md text-slate-700 md:col-span-3 lg:col-span-2 rounded-3xl">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#FF6A00]" />
                  Status dos Serviços e Integrações
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Monitoramento em tempo real da saúde da infraestrutura
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {healthChecks.map((service) => {
                    const ServiceIcon = service.icon;
                    const online = checkStatus(service.status);
                    
                    return (
                      <div 
                        key={service.name} 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${online ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10' : 'text-red-500 bg-red-500/5 border-red-500/10'}`}>
                            <ServiceIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{service.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{service.desc}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 pl-3">
                          {online ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ativo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Inativo</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Section: Overview Metrics */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#001F5B]" />
              Métricas e Operações Gerais
            </h2>
            
            {/* Grid of 9 Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => {
                const MetricIcon = metric.icon;
                return (
                  <Card key={metric.title} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-slate-700 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                        {metric.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg border ${metric.color}`}>
                        <MetricIcon className="w-4 h-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-extrabold text-slate-950 tracking-tight">{metric.value}</div>
                      <p className="text-xs text-slate-400 mt-1">{metric.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
