'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Funnel, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Funnel className="w-6 h-6 text-[#001F5B]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads, Prospects & Funil de Conversão</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rastreamento de visitantes, questionários anônimos e transição de leads para clientes autenticados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchFunnel();
              fetchLeadsData(meta.page);
            }}
            disabled={isLoading || isLoadingFunnel}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isLoadingFunnel ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/customers">
            <Button size="sm" className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs">
              Ver Todos os Clientes
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Funnel Stages Cards */}
      <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-[#FF6A00]" />
            Funil Real do Produto (Baseado em Eventos do Core)
          </div>
          {funnelData?.summary && (
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              Taxa Geral de Conversão: <b className="text-emerald-700">{funnelData.summary.overallConversionRate}%</b>
            </div>
          )}
        </div>

        {isLoadingFunnel ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
            Carregando estágios do funil...
          </div>
        ) : funnelData?.funnel ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {funnelData.funnel.map((st, i) => (
              <div 
                key={st.stage} 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-[#FF6A00]/40 transition-colors"
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
                  {i === 0 ? 'Base Inicial' : `${st.conversionFromPrevious}% conv.`}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      {/* Filter Card for Leads */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Fingerprint, destino, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="">Todos os Status de Jornada</option>
              <option value="INITIAL">INITIAL (Início)</option>
              <option value="COLLECTING">COLLECTING (Questionário)</option>
              <option value="QUESTIONNAIRE_COMPLETED">QUESTIONNAIRE_COMPLETED</option>
              <option value="PREVIEW_GENERATED">PREVIEW_GENERATED</option>
              <option value="CLAIMED">CLAIMED (Convertido em Conta)</option>
            </select>
          </div>

          {/* Claimed Filter */}
          <div>
            <select
              value={claimedFilter}
              onChange={(e) => setClaimedFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="all">Todas as Jornadas</option>
              <option value="unclaimed">Somente Anônimos Não-Reivindicados</option>
              <option value="claimed">Reivindicados (Convertidos em Usuário)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Jornada / Fingerprint</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Conversão / Usuário</th>
                <th className="px-4 py-3">Iniciado em</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando jornadas e leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Nenhum lead ou jornada encontrado.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-900 font-semibold">{l.id.substring(0, 12)}...</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        FP: {l.fingerprint ? l.fingerprint.substring(0, 16) : 'N/A'}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {l.origin || 'ORGANIC'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {l.destination || 'Ainda não informado'}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'CLAIMED' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'PREVIEW_GENERATED' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {l.user ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            {l.user.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">{l.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                          Visitante Anônimo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(l.createdAt).toLocaleString('pt-BR')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {l.user ? (
                        <Link href={`/customers/${l.user.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                            Ver Cliente 360°
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
          <div>
            Mostrando <b>{leads.length}</b> de <b>{meta.total}</b> leads (Página {meta.page} de {meta.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => fetchLeadsData(meta.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isLoading}
              onClick={() => fetchLeadsData(meta.page + 1)}
              className="h-7 text-xs px-2.5"
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
