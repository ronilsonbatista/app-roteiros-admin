'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Funnel, 
  RefreshCw, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { listLeads, LeadItem } from '@/services/customers.service';
import { getFunnel, FunnelStats } from '@/services/analytics.service';

export default function LeadsFunnelPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [funnelData, setFunnelData] = useState<FunnelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFunnel, setIsLoadingFunnel] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [claimedFilter, setClaimedFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');

  const fetchFunnel = useCallback(async () => {
    setIsLoadingFunnel(true);
    try {
      const res = await getFunnel();
      setFunnelData(res);
    } catch (err) {
      console.error('Failed to load funnel stats', err);
    } finally {
      setIsLoadingFunnel(false);
    }
  }, []);

  const fetchLeadsData = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const claimedVal = claimedFilter === 'claimed' ? true : claimedFilter === 'unclaimed' ? false : undefined;
      const res = await listLeads({
        page: pageToLoad,
        limit: 15,
        search: search.trim() || undefined,
        status: status || undefined,
        claimed: claimedVal,
      });
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to list leads', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, claimedFilter]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  useEffect(() => {
    fetchLeadsData(1);
  }, [fetchLeadsData]);

  const hasActiveFilters = Boolean(search.trim() || status || claimedFilter !== 'all');

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setClaimedFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="CLIENTES & CRM"
        title="Leads, Prospects & Funil Comercial"
        subtitle="Mapeamento completo de visitantes, respostas de questionário e conversão para conta autenticada"
        breadcrumbs={[
          { label: 'Clientes & CRM', href: '/customers' },
          { label: 'Leads & Funil' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchFunnel();
                fetchLeadsData(meta.page);
              }}
              disabled={isLoading || isLoadingFunnel}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading || isLoadingFunnel ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Link href="/customers">
              <Button size="sm" className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs font-semibold h-9 shadow-2xs">
                Ver Base Completa de Clientes
              </Button>
            </Link>
          </div>
        }
      />

      {/* Funnel Stage Visualization Card */}
      <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
            Performance de Conversão do Funil (Eventos do Core)
          </div>
          {funnelData?.summary && (
            <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-md border border-slate-200/60 font-mono">
              Conversão Geral: <span className="text-emerald-700 font-bold">{funnelData.summary.overallConversionRate}%</span>
            </div>
          )}
        </div>

        {isLoadingFunnel ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#001F5B]" />
            Carregando inteligência de conversão do funil...
          </div>
        ) : funnelData?.funnel ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {funnelData.funnel.map((st, i) => (
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
        ) : null}
      </Card>

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por destino, sessão, email..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todos os Estágios de Lead</option>
          <option value="QUESTIONNAIRE_STARTED">Questionário Iniciado</option>
          <option value="ITINERARY_GENERATED">Roteiro Gerado (Draft)</option>
          <option value="PREVIEW_VIEWED">Preview Visualizado</option>
          <option value="CHECKOUT_STARTED">Checkout Iniciado</option>
          <option value="CONVERTED">Convertido em Cliente</option>
        </select>

        <select
          value={claimedFilter}
          onChange={(e) => setClaimedFilter(e.target.value as any)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="all">Status de Cadastro: Todos</option>
          <option value="claimed">Com Conta Vinculada</option>
          <option value="unclaimed">Jornada Anônima</option>
        </select>
      </FilterBar>

      {/* Leads Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">ID Sessão / Lead</th>
                <th className="px-4 py-3">Estágio do Funil</th>
                <th className="px-4 py-3">Destino do Roteiro</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Conta Vinculada</th>
                <th className="px-4 py-3">Última Atividade</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando leads e jornadas anônimas...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={Funnel}
                      title="Nenhum lead encontrado"
                      description="Não foram encontrados registros para os filtros selecionados."
                      action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Session / Lead ID */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-semibold text-slate-900">{l.id.substring(0, 8)}...</div>
                      {(l.email || l.user?.email || (l as any).userEmail) && (
                        <div className="text-[11px] text-slate-500 font-sans">{l.email || l.user?.email || (l as any).userEmail}</div>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status || (l as any).stage || 'GUEST_IDLE'} />
                    </td>

                    {/* Destination */}
                    <td className="px-4 py-3">
                      {l.destination ? (
                        <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {l.destination}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Não informado</span>
                      )}
                    </td>

                    {/* Origin */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        {l.origin || 'ORGANIC'}
                      </span>
                    </td>

                    {/* Claimed Status */}
                    <td className="px-4 py-3">
                      {(l.claimedAt || l.user || (l as any).claimed) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          {l.user?.fullName || (l as any).userName || 'Com Conta'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                          <UserX className="w-3 h-3 text-slate-400" />
                          Visitante Anônimo
                        </span>
                      )}
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(l.lastActiveAt || (l as any).updatedAt || l.createdAt).toLocaleString('pt-BR')}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {(l.user?.id || (l as any).userId) ? (
                        <Link href={`/customers/${l.user?.id || (l as any).userId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5 border-[#001F5B]/30 text-[#001F5B] hover:bg-[#001F5B] hover:text-white transition-colors font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            Visão 360°
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Anônimo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/40 text-xs text-slate-600">
          <div>
            Mostrando <b>{leads.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => fetchLeadsData(meta.page - 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isLoading}
              onClick={() => fetchLeadsData(meta.page + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
