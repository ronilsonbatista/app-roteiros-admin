'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Database,
  Filter,
  User as UserIcon,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Code,
  Terminal,
  ExternalLink,
  Loader2,
  FileCode,
  MapPin
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
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [localPeriodFilterActive, setLocalPeriodFilterActive] = useState(false);

  // Detail Drawer
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'response' | 'error'>('prompt');

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

  // Load Users list for filter
  const fetchFilterData = useCallback(async () => {
    try {
      const usersData = await listUsersForSelection();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  }, []);

  // Load AI Requests Logs
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (userIdFilter !== 'ALL') params.userId = userIdFilter;
      if (providerFilter !== 'ALL') params.provider = providerFilter;
      if (modelFilter !== 'ALL') params.model = modelFilter;

      const response = await listAIRequests(params);
      
      // Period filter (handled client-side since API doesn't support period filtering directly)
      let filteredData = response.data;
      if (startDateFilter || endDateFilter) {
        setLocalPeriodFilterActive(true);
        filteredData = filteredData.filter(req => {
          const createdDate = new Date(req.createdAt);
          if (startDateFilter && createdDate < new Date(startDateFilter + 'T00:00:00')) {
            return false;
          }
          if (endDateFilter && createdDate > new Date(endDateFilter + 'T23:59:59')) {
            return false;
          }
          return true;
        });
      } else {
        setLocalPeriodFilterActive(false);
      }

      setRequests(filteredData);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching AI logs:', err);
      setError('Não foi possível carregar os logs de requisições de IA.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, userIdFilter, providerFilter, modelFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    fetchKPIs();
    fetchFilterData();
  }, [fetchKPIs, fetchFilterData]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open Details Drawer
  const handleViewDetails = async (req: AIRequest) => {
    setIsDetailsOpen(true);
    setSelectedRequest(null);
    try {
      const details = await getAIRequestDetails(req.id);
      setSelectedRequest(details);
      
      // Set active tab based on status
      if (details.status === 'FAILED') {
        setActiveTab('error');
      } else {
        setActiveTab('prompt');
      }
    } catch (err) {
      console.error('Error fetching AI log details:', err);
      setSelectedRequest(req); // fallback
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Sucesso';
      case 'FAILED': return 'Falha';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  };

  const calculateDuration = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const durationSeconds = (end - start) / 1000;
    return durationSeconds > 0 ? `${durationSeconds.toFixed(2)}s` : '0.00s';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#001F5B] font-heading">Operação Administrativa de IA</h1>
          <p className="text-muted-foreground mt-1">
            Monitore o tempo de execução, consumo de tokens, taxas de erro e logs das gerações de roteiros por inteligência artificial.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchKPIs();
              fetchRequests();
            }}
            className="h-9 shrink-0 gap-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Monitoring Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Gerações</span>
              <div className="p-2 bg-slate-50 text-slate-500 rounded-md">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-slate-800">{kpis.totalRequests}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Chamadas feitas à API de IA</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sucesso</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{kpis.successRequests}</span>
                  <span className="text-xs font-bold text-emerald-500">({kpis.successRate.toFixed(1)}%)</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Requisições bem sucedidas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Falha</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-md">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-rose-600">{kpis.failedRequests}</span>
                  <span className="text-xs font-bold text-rose-500">({(100 - kpis.successRate).toFixed(1)}%)</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Erros de processamento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tempo Médio</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-24 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-slate-800">{kpis.averageTime.toFixed(2)}s</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Duração de resposta</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200 bg-[#001F5B]/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-[#001F5B] uppercase tracking-wider">Tokens Estimados</span>
              <div className="p-2 bg-[#001F5B]/10 text-[#001F5B] rounded-md">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-28 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-[#001F5B]">{kpis.tokensUsed.toLocaleString('pt-BR')}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Total consumido</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model & Provider breakdown cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-xs border-slate-100">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uso por Provider</h3>
          </div>
          <CardContent className="p-4 space-y-2">
            {isKpiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ) : Object.keys(kpis.usageByProvider).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sem dados disponíveis</p>
            ) : (
              Object.entries(kpis.usageByProvider).map(([provider, count]) => (
                <div key={provider} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700">{provider}</span>
                  </div>
                  <span className="font-bold text-[#001F5B]">{count} gerações</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uso por Modelo</h3>
          </div>
          <CardContent className="p-4 space-y-2">
            {isKpiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ) : Object.keys(kpis.usageByModel).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sem dados disponíveis</p>
            ) : (
              Object.entries(kpis.usageByModel).map(([model, count]) => (
                <div key={model} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-700 font-mono text-xs">{model}</span>
                  </div>
                  <span className="font-bold text-[#001F5B]">{count} gerações</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="shadow-xs border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#001F5B] font-semibold text-sm">
            <Filter className="w-4 h-4" />
            Filtros dos Logs de IA
          </div>
          <div className="grid gap-4 md:grid-cols-6">
            {/* User Filter */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Todos os Usuários</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                ))}
              </select>
            </div>

            {/* Provider Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={providerFilter}
                onChange={(e) => {
                  setProviderFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Todos os Providers</option>
                <option value="OPENAI">OpenAI</option>
                <option value="GOOGLE">Google Gemini</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Todos os Status</option>
                <option value="SUCCESS">Sucesso</option>
                <option value="FAILED">Falha</option>
                <option value="PENDING">Pendente</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Início</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Fim</label>
              <input
                type="date"
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={endDateFilter}
                onChange={(e) => {
                  setEndDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {(startDateFilter || endDateFilter) && (
            <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Nota:</strong> O filtro de período é aplicado localmente na página atual devido a limitações da API.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 ml-auto px-2 py-0 text-xs font-semibold hover:bg-amber-100 text-amber-800 shrink-0 cursor-pointer"
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                }}
              >
                Limpar Período
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Logs Data Table */}
      <Card className="shadow-xs border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-[#001F5B]" />
            <h3 className="font-bold text-slate-800">Logs de Requisições de IA</h3>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            Mostrando {requests.length} de {meta.total} registros
          </span>
        </div>

        {error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 border-t border-rose-100 flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="mt-2 border-rose-200 hover:bg-rose-100/50 text-rose-800 font-semibold cursor-pointer"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#001F5B]" />
            <p className="text-sm font-semibold">Carregando logs do console...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <BookOpen className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-slate-500">Nenhum log encontrado</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Não existem registros de geração de roteiros para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 w-[140px]">ID do Log</TableHead>
                  <TableHead className="font-semibold text-slate-700">Usuário</TableHead>
                  <TableHead className="font-semibold text-slate-700">Destino da Viagem</TableHead>
                  <TableHead className="font-semibold text-slate-700">Modelo Utilizado</TableHead>
                  <TableHead className="font-semibold text-slate-700">Provider</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Duração</TableHead>
                  <TableHead className="font-semibold text-slate-700">Data de Requisição</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <TableCell className="font-mono text-xs text-slate-500 font-medium">
                      {req.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600 block truncate max-w-[180px]" title={req.userId}>
                        {req.userId.substring(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      {req.tripId ? (
                        <div className="flex items-center gap-1.5 text-slate-700 text-sm font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">Viagem</span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">
                            ({req.tripId.substring(0, 5)}...)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700 font-medium">
                      {req.model}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800 text-sm">{req.provider}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(req.status)}`}>
                        {translateStatus(req.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-slate-700">
                      {calculateDuration(req.createdAt, req.updatedAt)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs font-medium">
                      {formatDate(req.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(req)}
                        className="h-8 border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Inspecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs text-slate-400 font-semibold">
                Página {meta.page} de {meta.totalPages || 1}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 border-slate-200 text-slate-600 cursor-pointer"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
                  disabled={currentPage === meta.totalPages || meta.totalPages === 0 || isLoading}
                  className="h-8 border-slate-200 text-slate-600 cursor-pointer"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* AI Log Details Slide-Over Drawer */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          {selectedRequest ? (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <SheetHeader className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#001F5B]/5 text-[#001F5B] rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-bold text-slate-800">Log de Execução da IA</SheetTitle>
                    <SheetDescription className="text-xs text-slate-400 font-mono mt-0.5">
                      Log ID: {selectedRequest.id}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Drawer Body Scroll Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta details cards */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Provider & Modelo</span>
                    <span className="text-xs font-bold text-slate-700 font-mono block">
                      {selectedRequest.provider} / {selectedRequest.model}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duração de Execução</span>
                    <span className="text-xs font-bold text-slate-700 font-mono block">
                      {calculateDuration(selectedRequest.createdAt, selectedRequest.updatedAt)}
                    </span>
                  </div>
                  <div className="space-y-0.5 mt-2.5 pt-2.5 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Consumo de Tokens</span>
                    <span className="text-xs font-bold text-slate-700 font-mono block">
                      {selectedRequest.tokensUsed ? selectedRequest.tokensUsed.toLocaleString('pt-BR') : 'Não informado'}
                    </span>
                  </div>
                  <div className="space-y-0.5 mt-2.5 pt-2.5 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status da Resposta</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {translateStatus(selectedRequest.status)}
                    </span>
                  </div>
                </div>

                {/* User & Trip linkage */}
                <div className="space-y-2 text-xs bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold">Usuário Solicitante:</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.user?.fullName || selectedRequest.user?.email || selectedRequest.userId}</span>
                  </div>
                  {selectedRequest.trip && (
                    <div className="flex justify-between items-center py-1 border-t border-slate-200/40">
                      <span className="text-slate-400 font-semibold">Roteiro da Viagem:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#001F5B]">{selectedRequest.trip.title} ({selectedRequest.trip.destination})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  )}
                  {selectedRequest.baseTrip && (
                    <div className="flex justify-between items-center py-1 border-t border-slate-200/40">
                      <span className="text-slate-400 font-semibold">Template Base Utilizado:</span>
                      <span className="font-semibold text-slate-800">{selectedRequest.baseTrip.title}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1 border-t border-slate-200/40">
                    <span className="text-slate-400 font-semibold">Timestamp:</span>
                    <span className="font-semibold text-slate-600 font-mono text-[10px]">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                </div>

                {/* Tab selector for Prompt, Response, or Error */}
                <div className="border-b border-slate-200 shrink-0">
                  <nav className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('prompt')}
                      className={`pb-2.5 px-1.5 font-bold text-xs border-b-2 tracking-wide transition-all ${
                        activeTab === 'prompt'
                          ? 'border-[#FF6A00] text-[#FF6A00]'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Prompt Enviado
                    </button>
                    <button
                      onClick={() => setActiveTab('response')}
                      className={`pb-2.5 px-1.5 font-bold text-xs border-b-2 tracking-wide transition-all ${
                        activeTab === 'response'
                          ? 'border-[#FF6A00] text-[#FF6A00]'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      JSON de Resposta
                    </button>
                    {selectedRequest.status === 'FAILED' && (
                      <button
                        onClick={() => setActiveTab('error')}
                        className={`pb-2.5 px-1.5 font-bold text-xs border-b-2 tracking-wide transition-all ${
                          activeTab === 'error'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Mensagem de Erro
                      </button>
                    )}
                  </nav>
                </div>

                {/* Tab content view */}
                <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                  {activeTab === 'prompt' && (
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase pb-2 border-b border-slate-800">
                        <Terminal className="w-3.5 h-3.5" />
                        System / Context Prompt
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto text-emerald-400 pt-2 selection:bg-emerald-800 selection:text-white">
                        {selectedRequest.prompt || '// Nenhum prompt adicional registrado no payload'}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'response' && (
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase pb-2 border-b border-slate-800">
                        <FileCode className="w-3.5 h-3.5" />
                        JSON de Saída Estruturado
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto text-sky-400 pt-2 selection:bg-sky-800 selection:text-white">
                        {selectedRequest.response 
                          ? JSON.stringify(selectedRequest.response, null, 2) 
                          : '// Sem dados de resposta em formato JSON'}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'error' && (
                    <div className="p-4 bg-rose-950/20 text-rose-300 space-y-2 border border-rose-900/30 rounded-xl">
                      <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold tracking-widest uppercase pb-2 border-b border-rose-900/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Detalhes do Erro da Geração
                      </div>
                      <p className="text-xs font-mono whitespace-pre-wrap leading-relaxed pt-2">
                        {selectedRequest.errorMessage || 'Erro desconhecido durante o processamento do pipeline de IA.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Actions Section */}
              <div className="p-6 border-t border-slate-100 shrink-0 space-y-3 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      disabled
                      variant="outline"
                      className="h-10 border-slate-200 text-slate-400 font-semibold cursor-not-allowed select-none bg-slate-100"
                      title="Funcionalidade indisponível no painel administrativo"
                    >
                      Reexecutar Geração
                    </Button>
                    <Button
                      disabled
                      variant="outline"
                      className="h-10 border-slate-200 text-slate-400 font-semibold cursor-not-allowed select-none bg-slate-100"
                      title="Funcionalidade indisponível no painel administrativo"
                    >
                      Gerar Novamente
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center leading-normal">
                    Operações de reexecução e geração direta não estão disponíveis por limitações de propriedade e escopo da API de IA.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full h-10 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer shrink-0"
                >
                  Fechar Inspecionador
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#001F5B]" />
              <p className="text-sm font-semibold text-slate-500">Buscando dados da requisição...</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
