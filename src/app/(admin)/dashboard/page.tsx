'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  UsersRound, 
  Globe, 
  Crown, 
  CreditCard, 
  Coins, 
  Sparkles, 
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  UploadCloud,
  Cpu,
  MapPin,
  TrendingUp,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  BarChart3,
  UserCheck,
  Mail,
  Receipt
} from 'lucide-react';
import { useUser } from '@/app/(admin)/layout';
import { 
  getDashboardOverview, 
  DashboardOverview 
} from '@/services/dashboard.service';
import { getProviderHealth, ProviderHealthResponse } from '@/services/system.service';
import { getFunnel, FunnelStats } from '@/services/analytics.service';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user } = useUser();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [providerHealth, setProviderHealth] = useState<ProviderHealthResponse | null>(null);
  const [funnel, setFunnel] = useState<FunnelStats | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = user?.name || 'Administrador';

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
        getProviderHealth().catch(() => null),
        getFunnel(startDate, now.toISOString()).catch(() => null),
      ]);

      setOverview(overviewRes);
      setProviderHealth(healthRes);
      setFunnel(funnelRes);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Não foi possível carregar os dados do painel.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalUsers = overview?.totalUsers ?? overview?.total_users ?? 0;
  const totalTrips = overview?.totalTrips ?? overview?.total_trips ?? 0;
  const premiumTrips = overview?.premiumTrips ?? overview?.premium_trips ?? 0;
  const paidPurchases = overview?.paidPurchases ?? overview?.paid_purchases ?? 0;
  const pendingPurchases = overview?.pendingPurchases ?? overview?.pending_purchases ?? 0;
  const totalRevenue = overview?.totalRevenue ?? overview?.total_revenue ?? 0;
  const aiRequests = overview?.aiRequestsCount ?? overview?.aiRequests ?? 0;

  const averageTicket = paidPurchases > 0 ? totalRevenue / paidPurchases : 0;
  const overallConversion = funnel?.summary?.overallConversionRate ?? 0;

  // Provider Health summary formatting
  const getProviderStatusKey = (providerObj?: { status?: string; configured?: boolean }) => {
    if (!providerObj) return 'NOT_CONFIGURED';
    if (providerObj.configured === false) return 'NOT_CONFIGURED';
    const st = (providerObj.status || '').toLowerCase();
    if (['healthy', 'ok', 'up', 'operational', 'configured'].includes(st)) return 'OPERATIONAL';
    if (['warn', 'attention'].includes(st)) return 'ATTENTION';
    if (providerObj.configured) return 'OPERATIONAL';
    return 'UNAVAILABLE';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-rose-200 rounded-xl my-6">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Falha na Comunicação</h3>
        <p className="text-slate-500 text-xs max-w-md mb-4">{error}</p>
        <Button 
          onClick={() => fetchData()}
          className="bg-[#001F5B] hover:bg-[#FF6A00] text-white flex items-center gap-2 cursor-pointer rounded-lg h-9 px-4 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="OPERAÇÃO & VISÃO EXECUTIVA"
        title="Painel de Gestão"
        subtitle={`Resumo analítico do ecossistema 2GO • Sessão de ${userName}`}
        breadcrumbs={[{ label: 'Painel' }]}
        actions={
          <div className="flex items-center gap-2">
            {/* Period Selector Tabs */}
            <div className="bg-white p-1 rounded-lg border border-slate-200/90 shadow-2xs flex items-center text-xs">
              {(['today', '7d', '30d', 'all'] as const).map((filter) => {
                const labels: Record<string, string> = {
                  today: 'Hoje',
                  '7d': '7 dias',
                  '30d': '30 dias',
                  all: 'Tudo',
                };
                const isSelected = dateFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#001F5B] text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            <Button 
              variant="outline"
              size="sm"
              disabled={isLoading || isRefreshing}
              onClick={() => fetchData(true)}
              className="text-xs h-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#001F5B]' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Main KPI Grid — Executive SaaS Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="RECEITA TOTAL (BRUTO)"
          value={formatCurrency(totalRevenue)}
          subtitle={`${paidPurchases} compras confirmadas`}
          icon={Coins}
          href="/billing"
          variant="default"
        />

        <MetricCard
          title="COMPRAS PAGAS"
          value={paidPurchases}
          subtitle={`+${pendingPurchases} pendentes de pagamento`}
          icon={CreditCard}
          href="/billing"
        />

        <MetricCard
          title="CLIENTES CADASTRADOS"
          value={totalUsers}
          subtitle="Base total de usuários"
          icon={UsersRound}
          href="/customers"
        />

        <MetricCard
          title="TICKET MÉDIO"
          value={formatCurrency(averageTicket)}
          subtitle={`Faturamento por compra paga`}
          icon={Receipt}
          href="/billing"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="VIAGENS GERADAS NO APP"
          value={totalTrips}
          subtitle={`${premiumTrips} com acesso Premium desbloqueado`}
          icon={Globe}
          href="/trips"
        />

        <MetricCard
          title="GERAÇÕES DE ROTEIRO POR IA"
          value={aiRequests}
          subtitle="Solicitações via OpenAI GPT"
          icon={Sparkles}
          href="/intelligence"
        />

        <MetricCard
          title="CONVERSÃO GLOBAL DO FUNIL"
          value={`${Number(overallConversion || 0).toFixed(1)}%`}
          subtitle="Taxa de visitantes para compradores"
          icon={TrendingUp}
          href="/leads"
        />
      </div>

      {/* Conversion Funnel Breakdown Section */}
      {funnel && Array.isArray(funnel.funnel) && funnel.funnel.length > 0 && (
        <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
                Funil de Aquisição & Conversão 2GO (Dados Reais)
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhamento contínuo da jornada do cliente do onboarding ao checkout.
              </p>
            </div>
            <Link 
              href="/leads" 
              className="text-xs text-[#001F5B] hover:text-[#FF6A00] font-semibold flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Ver Módulo de Leads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {funnel.funnel.map((st, i) => (
              <div 
                key={st.stage} 
                className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between hover:bg-white hover:shadow-2xs transition-all"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Etapa {i + 1}
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1 truncate" title={st.stage}>
                  {st.stage}
                </div>
                <div className="text-xl font-bold text-slate-900 mt-2 font-sans">
                  {st.count}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  {i === 0 ? 'Visitantes' : `${st.conversionFromPrevious}% conv.`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Executive Row: Platform Health & Operational Information */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* System Health Status */}
        <Card className="border border-slate-200/90 bg-white shadow-2xs md:col-span-2 rounded-xl">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Server className="w-4 h-4 text-[#001F5B]" />
                Status dos Provedores & Infraestrutura
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Saúde operacional das integrações de produção (Sem exibição de dados sensíveis)
              </CardDescription>
            </div>
            <Link href="/system" className="text-xs text-[#001F5B] hover:underline font-semibold">
              Auditoria Completa
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { 
                  name: 'PostgreSQL DB', 
                  desc: 'Banco relacional', 
                  key: getProviderStatusKey(providerHealth?.providers?.database),
                  icon: Database 
                },
                { 
                  name: 'OpenAI API', 
                  desc: 'Síntese & Roteiros IA', 
                  key: getProviderStatusKey(providerHealth?.providers?.openai),
                  icon: Cpu 
                },
                { 
                  name: 'Google Places', 
                  desc: 'Geolocalização', 
                  key: getProviderStatusKey(providerHealth?.providers?.googlePlaces),
                  icon: MapPin 
                },
                { 
                  name: 'Resend Email', 
                  desc: 'Envio transacional', 
                  key: getProviderStatusKey(providerHealth?.providers?.email),
                  icon: Mail 
                },
                { 
                  name: 'Mercado Pago', 
                  desc: 'Gateway checkout', 
                  key: getProviderStatusKey(providerHealth?.providers?.mercadoPago),
                  icon: CreditCard 
                },
                { 
                  name: 'Armazenamento', 
                  desc: 'Proxy de Mídia / S3', 
                  key: getProviderStatusKey(providerHealth?.providers?.mediaStorage),
                  icon: UploadCloud 
                },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.name} className="p-3 rounded-lg border border-slate-200/60 bg-slate-50/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-white border border-slate-200/60 text-[#001F5B] shrink-0">
                        <ItemIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <StatusBadge status={item.key} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations Navigation */}
        <Card className="border border-slate-200/90 bg-white shadow-2xs rounded-xl flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6A00]" />
                Ações Rápidas de Gestão
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              <Link
                href="/customers"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700"
              >
                <span>Gerenciar Clientes & CRM</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/billing"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700"
              >
                <span>Consultar Compras & Cupons</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/blog"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700"
              >
                <span>Gestão do Blog & CMS</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/intelligence/playground"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-slate-700"
              >
                <span>Simulador IA (Playground)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </CardContent>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 rounded-b-xl">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Ambiente:</span>
              <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">Produção / 2GO Core</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
