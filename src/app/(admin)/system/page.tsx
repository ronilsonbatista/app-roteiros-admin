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
  FileCode,
  Shield,
  UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
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

  const getStatusKey = (providerObj?: { status?: string; configured?: boolean }) => {
    if (!providerObj || !providerObj.configured) return 'NOT_CONFIGURED';
    const st = (providerObj.status || '').toLowerCase();
    if (['healthy', 'ok', 'up', 'operational'].includes(st)) return 'OPERATIONAL';
    if (['warn', 'attention'].includes(st)) return 'ATTENTION';
    return 'UNAVAILABLE';
  };

  const hasActiveFilters = Boolean(entityFilter || actionFilter);

  const resetAuditFilters = () => {
    setEntityFilter('');
    setActionFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="SISTEMA & INFRAESTRUTURA"
        title="Status do Sistema, Integridade & Auditoria"
        subtitle="Monitoramento em tempo real de provedores externos, travas de segurança e trilha de auditoria administrativa"
        breadcrumbs={[
          { label: 'Sistema', href: '/system' },
          { label: 'Status & Auditoria' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchHealth();
                fetchAudit(auditMeta.page);
              }}
              disabled={isLoadingHealth || isLoadingAudit}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingHealth || isLoadingAudit ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar Status
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200/90 rounded-xl shadow-2xs">
          <TabsTrigger value="providers" className="text-xs font-semibold px-4 py-1.5">
            Saúde dos Provedores (Health)
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-semibold px-4 py-1.5">
            Trilha de Auditoria ({auditMeta.total || auditLogs.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold px-4 py-1.5">
            Travas de Segurança
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Provider Health */}
        <TabsContent value="providers" className="space-y-6">
          {isLoadingHealth ? (
            <Card className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200/90">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Consultando endpoints de integridade dos provedores...
            </Card>
          ) : healthData ? (
            <div className="space-y-6">
              {/* Provider Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Database */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 text-[#001F5B]">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">PostgreSQL</h3>
                        <p className="text-[10px] text-slate-400">Persistência Relacional</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.database)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Configurado: <b>{healthData.providers?.database?.configured ? 'Sim' : 'Não'}</b></span>
                    <span>Status: <b>{healthData.providers?.database?.status || 'OK'}</b></span>
                  </div>
                </Card>

                {/* OpenAI */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">OpenAI API</h3>
                        <p className="text-[10px] text-slate-400">Geração por IA</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.openai)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Modelo: <b>{healthData.providers?.openai?.model || 'gpt-4o-mini'}</b></span>
                    <span>Status: <b>{healthData.providers?.openai?.status || 'OK'}</b></span>
                  </div>
                </Card>

                {/* Google Places */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Google Places</h3>
                        <p className="text-[10px] text-slate-400">Enriquecimento de Locais</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.googlePlaces)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>API Geocoding: <b>{healthData.providers?.googlePlaces?.configured ? 'Ativa' : 'Pendente'}</b></span>
                    <span>Status: <b>{healthData.providers?.googlePlaces?.status || 'OK'}</b></span>
                  </div>
                </Card>

                {/* Resend Email */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Resend (E-mail)</h3>
                        <p className="text-[10px] text-slate-400">E-mails Transacionais</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.email)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Remetente DNS: <b>{healthData.providers?.email?.senderConfigured ? 'Verificado' : 'Pendente'}</b></span>
                    <span>Status: <b>{healthData.providers?.email?.status || 'OK'}</b></span>
                  </div>
                </Card>

                {/* Mercado Pago */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Mercado Pago</h3>
                        <p className="text-[10px] text-slate-400">Gateway de Checkout</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.mercadoPago)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Webhook: <b>{healthData.providers?.mercadoPago?.webhookConfigured ? 'Configurado' : 'Pendente'}</b></span>
                    <span>Mocks: <b>{healthData.providers?.mercadoPago?.mocksEnabled ? 'Sim' : 'Desativado'}</b></span>
                  </div>
                </Card>

                {/* Storage */}
                <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Armazenamento</h3>
                        <p className="text-[10px] text-slate-400">Uploads & Mídia</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusKey(healthData.providers?.mediaStorage)} />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Provedor: <b>{healthData.providers?.mediaStorage?.provider || 'S3 / Proxy'}</b></span>
                    <span>Bucket: <b>{healthData.providers?.mediaStorage?.bucketConfigured ? 'Pronto' : 'Pendente'}</b></span>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* Tab 2: Audit Logs */}
        <TabsContent value="audit" className="space-y-4">
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetAuditFilters}
          >
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="">Todas as Entidades</option>
              <option value="USER">USER (Usuários)</option>
              <option value="TRIP">TRIP (Viagens)</option>
              <option value="PURCHASE">PURCHASE (Compras)</option>
              <option value="CAMPAIGN">CAMPAIGN (Campanhas)</option>
              <option value="GUIDELINE">GUIDELINE (Diretrizes)</option>
              <option value="SYSTEM">SYSTEM (Sistema)</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="">Todas as Ações</option>
              <option value="CREATE">CREATE (Criação)</option>
              <option value="UPDATE">UPDATE (Atualização)</option>
              <option value="DELETE">DELETE (Exclusão)</option>
              <option value="UNLOCK">UNLOCK (Desbloqueio)</option>
              <option value="LOGIN">LOGIN (Autenticação)</option>
            </select>
          </FilterBar>

          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-3">Ação Registrada</th>
                    <th className="px-4 py-3">Entidade</th>
                    <th className="px-4 py-3">Ator / Usuário Admin</th>
                    <th className="px-4 py-3">Endereço IP</th>
                    <th className="px-4 py-3">Data / Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingAudit ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                        Carregando trilha de auditoria...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <EmptyState
                          icon={FileCode}
                          title="Nenhum registro de auditoria"
                          description="Nenhum evento registrado com os filtros selecionados."
                          action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetAuditFilters } : undefined}
                        />
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                            {log.entityType} #{log.entityId?.substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{log.userEmail || 'Sistema (Automático)'}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
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
                Mostrando <b>{auditLogs.length}</b> de <b>{auditMeta.total}</b> registros (Página {auditMeta.page} de {auditMeta.totalPages || 1})
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={auditMeta.page <= 1 || isLoadingAudit}
                  onClick={() => fetchAudit(auditMeta.page - 1)}
                  className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={auditMeta.page >= auditMeta.totalPages || isLoadingAudit}
                  onClick={() => fetchAudit(auditMeta.page + 1)}
                  className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
                >
                  Próxima
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Security Flags */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#001F5B]" />
              Travas & Flags de Segurança Ativas
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">MARKETING_EMAIL_ENABLED</span>
                  <span className="text-slate-500">Trava de disparo em massa em produção.</span>
                </div>
                <StatusBadge 
                  status={healthData?.securityFlags?.marketingEmailEnabled ? 'ATTENTION' : 'OPERATIONAL'} 
                  label={healthData?.securityFlags?.marketingEmailEnabled ? 'Habilitado (Cuidado)' : 'Bloqueado Seguro'} 
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">MOCK_PAYMENTS_ENABLED</span>
                  <span className="text-slate-500">Permite simulação de pagamento de teste.</span>
                </div>
                <StatusBadge 
                  status={healthData?.securityFlags?.mockPaymentsEnabled ? 'ATTENTION' : 'OPERATIONAL'} 
                  label={healthData?.securityFlags?.mockPaymentsEnabled ? 'Mocks Ativos' : 'Apenas Checkout Real'} 
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
