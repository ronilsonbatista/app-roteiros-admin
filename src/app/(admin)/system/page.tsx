'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ServerCog, 
  ShieldCheck, 
  Database, 
  Cpu, 
  MapPin, 
  Mail, 
  CreditCard, 
  HardDrive, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getProviderHealth, 
  listAuditLogs, 
  ProviderHealthResponse, 
  AuditLogItem 
} from '@/services/system.service';

export default function SystemStatusPage() {
  const [healthData, setHealthData] = useState<ProviderHealthResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditMeta, setAuditMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);

  // Audit Filters
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    try {
      const res = await getProviderHealth();
      setHealthData(res);
    } catch (err) {
      console.error('Failed to load provider health', err);
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  const fetchAudit = useCallback(async (pageToLoad = 1) => {
    setIsLoadingAudit(true);
    try {
      const res = await listAuditLogs({
        page: pageToLoad,
        limit: 15,
        entityType: entityFilter || undefined,
        action: actionFilter || undefined,
      });
      setAuditLogs(res.data);
      setAuditMeta(res.meta);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoadingAudit(false);
    }
  }, [entityFilter, actionFilter]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    fetchAudit(1);
  }, [fetchAudit]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ServerCog className="w-6 h-6 text-[#001F5B]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Status do Sistema & Auditoria</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoramento operacional de provedores de infraestrutura e trilha de auditoria de ações administrativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchHealth();
              fetchAudit(auditMeta.page);
            }}
            disabled={isLoadingHealth || isLoadingAudit}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth || isLoadingAudit ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="providers" className="text-xs">
            <ServerCog className="w-3.5 h-3.5 mr-1.5" />
            Saúde dos Provedores
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Trilha de Auditoria ({auditMeta.total})
          </TabsTrigger>
        </TabsList>

        {/* 1. PROVIDERS HEALTH TAB */}
        <TabsContent value="providers" className="space-y-6">
          {isLoadingHealth ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Verificando saúde dos provedores no Core...
            </div>
          ) : healthData ? (
            <div className="space-y-6">
              {/* Security Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Ambiente</span>
                  <div className="font-bold text-slate-900 uppercase font-mono mt-0.5">{healthData.environment}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Swagger Público</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {healthData.securityFlags.swaggerEnabled ? 'Habilitado' : 'Desabilitado (Seguro)'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">E-mail Marketing</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {healthData.securityFlags.marketingEmailEnabled ? 'Ativo' : 'Bloqueado (Fail-Closed)'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Mock Pagamentos</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {healthData.securityFlags.mockPaymentsEnabled ? 'Habilitado' : 'Desabilitado'}
                  </div>
                </div>
              </div>

              {/* Provider Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Database */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.database.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {healthData.providers.database.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Conexão primária do Core com banco relacional PostgreSQL (Railway).
                  </p>
                </Card>

                {/* OpenAI */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.openai.name}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      healthData.providers.openai.configured ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {healthData.providers.openai.configured ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {healthData.providers.openai.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Modelo configurado: <b>{healthData.providers.openai.model}</b>. Credencial segura sem vazamento.
                  </p>
                </Card>

                {/* Google Places */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.googlePlaces.name}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      healthData.providers.googlePlaces.configured ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {healthData.providers.googlePlaces.configured ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {healthData.providers.googlePlaces.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enriquecimento de atrações turísticas, fotos e geolocalização.
                  </p>
                </Card>

                {/* Resend Email */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.email.name}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      healthData.providers.email.configured ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {healthData.providers.email.configured ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {healthData.providers.email.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Disparo de OTP transacional e campanhas com consentimento.
                  </p>
                </Card>

                {/* Mercado Pago */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.mercadoPago.name}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      healthData.providers.mercadoPago.configured ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      {healthData.providers.mercadoPago.configured ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {healthData.providers.mercadoPago.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gateway de pagamento para desbloqueio do Full Access. Webhooks certificados.
                  </p>
                </Card>

                {/* Media Storage */}
                <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-900 text-xs">{healthData.providers.mediaStorage.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {healthData.providers.mediaStorage.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Armazenamento persistente de mídia (S3 / Local Proxy).
                  </p>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* 2. AUDIT LOG TAB */}
        <TabsContent value="audit" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">Todas as Entidades</option>
              <option value="CAMPAIGN">Campanhas</option>
              <option value="BLOG_POST">Blog</option>
              <option value="KNOWLEDGE_ARTICLE">Base de Conhecimento</option>
              <option value="AI_GUIDELINE">Diretrizes IA</option>
              <option value="USER">Usuários / Clientes</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">Todas as Ações</option>
              <option value="CREATE">Criação (CREATE)</option>
              <option value="UPDATE">Atualização (UPDATE)</option>
              <option value="DELETE">Exclusão (DELETE)</option>
              <option value="PUBLISH">Publicação (PUBLISH)</option>
              <option value="SCHEDULE">Agendamento (SCHEDULE)</option>
            </select>
          </div>

          {/* Audit Logs Table */}
          <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Data / Hora</th>
                    <th className="px-4 py-3">Administrador</th>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Entidade</th>
                    <th className="px-4 py-3">ID da Entidade</th>
                    <th className="px-4 py-3">IP / Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingAudit ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                        Carregando registros de auditoria...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        Nenhum registro de auditoria encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-900">
                          {log.userEmail || 'Sistema Automatizado'}
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-700">
                          {log.entityType}
                        </td>

                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                          {log.entityId ? log.entityId.substring(0, 10) + '...' : '-'}
                        </td>

                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
              <div>
                Total: <b>{auditMeta.total}</b> registros (Página {auditMeta.page} de {auditMeta.totalPages || 1})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={auditMeta.page <= 1 || isLoadingAudit}
                  onClick={() => fetchAudit(auditMeta.page - 1)}
                  className="h-7 text-xs px-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={auditMeta.page >= auditMeta.totalPages || isLoadingAudit}
                  onClick={() => fetchAudit(auditMeta.page + 1)}
                  className="h-7 text-xs px-2.5"
                >
                  Próxima
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
