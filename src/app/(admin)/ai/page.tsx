'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listAIRequests,
  getAIRequestDetails,
  getAIUsageKPIs,
  AIRequest,
  AIUsageKPIs
} from '@/services/ai.service';
import { listUsersForSelection } from '@/services/trips.service';
import { User } from '@/services/users.service';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  Eye,
  Coins,
  RefreshCw
} from 'lucide-react';

export default function AiAdminPage() {
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [kpis, setKpis] = useState<AIUsageKPIs>({
    totalRequests: 0,
    successRequests: 0,
    failedRequests: 0,
    successRate: 0,
    averageTime: 0,
    tokensUsed: 0,
    usageByProvider: {},
    usageByModel: {}
  });
  const [users, setUsers] = useState<User[]>([]);

  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isKpiLoading, setIsKpiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');

  // Detail Drawer
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'prompt' | 'response' | 'error'>('prompt');

  // Load KPIs
  const fetchKPIs = useCallback(async () => {
    setIsKpiLoading(true);
    try {
      const data = await getAIUsageKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Error fetching AI KPIs:', err);
    } finally {
      setIsKpiLoading(false);
    }
  }, []);

  // Load Requests
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (userIdFilter !== 'ALL') filters.userId = userIdFilter;
      if (providerFilter !== 'ALL') filters.provider = providerFilter;
      if (modelFilter !== 'ALL') filters.model = modelFilter;

      const response = await listAIRequests(filters);
      setRequests(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching AI requests:', err);
      setError('Não foi possível carregar os logs de geração por IA.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, userIdFilter, providerFilter, modelFilter]);

  // Load Users List
  const fetchUsers = useCallback(async () => {
    try {
      const data = await listUsersForSelection();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    fetchUsers();
  }, [fetchKPIs, fetchUsers]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open Details
  const handleOpenDetails = async (id: string) => {
    setIsDetailsOpen(true);
    setSelectedRequest(null);
    try {
      const details = await getAIRequestDetails(id);
      setSelectedRequest(details);
    } catch (err) {
      console.error('Error loading request details:', err);
    }
  };

  const hasActiveFilters = Boolean(
    userIdFilter !== 'ALL' || statusFilter !== 'ALL' || providerFilter !== 'ALL' || modelFilter !== 'ALL'
  );

  const resetFilters = () => {
    setUserIdFilter('ALL');
    setStatusFilter('ALL');
    setProviderFilter('ALL');
    setModelFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="INTELIGÊNCIA ARTIFICIAL"
        title="Logs & Telemetria de Requisições IA"
        subtitle="Registro completo de gerações de roteiros, consumo de tokens, tempo de resposta e falhas do modelo OpenAI"
        breadcrumbs={[
          { label: 'Inteligência', href: '/intelligence' },
          { label: 'Logs de Requisições' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchKPIs();
                fetchRequests();
              }}
              disabled={isLoading || isKpiLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading || isKpiLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Link href="/intelligence/playground">
              <Button size="sm" className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Playground IA
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 AI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="TOTAL DE SOLICITAÇÕES"
          value={kpis.totalRequests}
          subtitle={`${kpis.successRequests} com sucesso`}
          icon={Sparkles}
        />
        <MetricCard
          title="TAXA DE SUCESSO"
          value={`${kpis.successRate.toFixed(1)}%`}
          subtitle={`${kpis.failedRequests} falhas registradas`}
          icon={CheckCircle2}
        />
        <MetricCard
          title="TOKENS CONSUMIDOS"
          value={kpis.tokensUsed}
          subtitle="Prompt + Resposta GPT"
          icon={Coins}
        />
        <MetricCard
          title="TEMPO MÉDIO DE LATÊNCIA"
          value={`${((kpis.averageTime || 0) / 1000).toFixed(2)}s`}
          subtitle="Duração média por chamada"
          icon={Clock}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Todos os Status</option>
          <option value="SUCCESS">SUCCESS (Sucesso)</option>
          <option value="FAILED">FAILED (Falha)</option>
          <option value="PENDING">PENDING (Em Andamento)</option>
        </select>

        <select
          value={modelFilter}
          onChange={(e) => {
            setModelFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Todos os Modelos</option>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
        </select>

        <select
          value={userIdFilter}
          onChange={(e) => {
            setUserIdFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700 max-w-[200px]"
        >
          <option value="ALL">Todos os Usuários</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
          ))}
        </select>
      </FilterBar>

      {/* Requests Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">ID Requisição</th>
                <th className="px-4 py-3">Provedor / Modelo</th>
                <th className="px-4 py-3">Usuário Solicitante</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Tokens</th>
                <th className="px-4 py-3 text-center">Duração</th>
                <th className="px-4 py-3">Data/Hora</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando logs de requisições de IA...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      icon={Cpu}
                      title="Nenhuma requisição encontrada"
                      description="Não foram encontrados registros para os filtros selecionados."
                      action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {r.id.substring(0, 8)}...
                    </td>

                    {/* Provider & Model */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{r.provider || 'OpenAI'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.model || 'gpt-4o-mini'}</div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      {r.user ? (
                        <div>
                          <div className="font-semibold text-slate-900">{r.user.fullName}</div>
                          <div className="text-[11px] text-slate-500">{r.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Anônimo / Sistema</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Tokens */}
                    <td className="px-4 py-3 text-center font-mono font-semibold">
                      {r.tokensUsed || 0}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-center font-mono text-[11px]">
                      {(r as any).durationMs ? `${((r as any).durationMs / 1000).toFixed(2)}s` : '-'}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(r.createdAt).toLocaleString('pt-BR')}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetails(r.id)}
                        className="text-xs h-7 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspecionar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/40 text-xs text-slate-600">
          <div>
            Mostrando <b>{requests.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= meta.totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-white border-l border-slate-200 p-6 space-y-4 overflow-y-auto">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Inspeção da Requisição IA</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Detalhes de prompt, payload gerado e rastro de erro.
            </SheetDescription>
          </SheetHeader>

          {selectedRequest ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Status</span>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Provedor / Modelo</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedRequest.provider} ({selectedRequest.model})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Tokens Utilizados</span>
                  <span className="font-mono font-bold text-slate-900">{selectedRequest.tokensUsed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Duração</span>
                  <span className="font-mono text-slate-900">{(selectedRequest as any).durationMs ? `${((selectedRequest as any).durationMs / 1000).toFixed(2)}s` : '-'}</span>
                </div>
              </div>

              <Tabs value={drawerTab} onValueChange={(v) => setDrawerTab(v as any)} className="space-y-3">
                <TabsList className="bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger value="prompt" className="text-xs font-semibold px-3 py-1">Prompt de Entrada</TabsTrigger>
                  <TabsTrigger value="response" className="text-xs font-semibold px-3 py-1">Resposta Gerada</TabsTrigger>
                  {selectedRequest.errorMessage && (
                    <TabsTrigger value="error" className="text-xs font-semibold px-3 py-1 text-rose-600">Erro</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="prompt">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {(selectedRequest as any).promptText || selectedRequest.prompt || 'Sem texto de prompt registrado.'}
                  </pre>
                </TabsContent>

                <TabsContent value="response">
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {(selectedRequest as any).responseText || (typeof selectedRequest.response === 'object' ? JSON.stringify(selectedRequest.response, null, 2) : selectedRequest.response) || 'Sem resposta registrada.'}
                  </pre>
                </TabsContent>

                {selectedRequest.errorMessage && (
                  <TabsContent value="error">
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-mono text-xs whitespace-pre-wrap">
                      {selectedRequest.errorMessage}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Carregando detalhes...
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
