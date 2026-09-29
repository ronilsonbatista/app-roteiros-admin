'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  ShoppingBag, 
  Layers, 
  Megaphone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  RefreshCw,
  Coins,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { getCustomer360, updateCustomerConsent, Customer360Data } from '@/services/customers.service';

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [data, setData] = useState<Customer360Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerData = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCustomer360(customerId);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load Customer 360', err);
      setError('Não foi possível carregar os detalhes do cliente.');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleToggleConsent = async () => {
    if (!data) return;
    const current = data.customer.marketingConsent;
    const nextVal = !current;
    
    setIsUpdatingConsent(true);
    try {
      await updateCustomerConsent(customerId, nextVal);
      await fetchCustomerData();
    } catch (err: any) {
      console.error('Failed to toggle consent', err);
      alert('Erro ao atualizar consentimento do cliente.');
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#001F5B]" />
        <span className="text-xs">Carregando visão Customer 360°...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-rose-200 rounded-xl text-center space-y-3">
        <p className="text-sm text-rose-700 font-semibold">{error || 'Cliente não encontrado.'}</p>
        <Link href="/customers">
          <Button variant="outline" size="sm" className="text-xs h-8">
            Voltar para Clientes
          </Button>
        </Link>
      </div>
    );
  }

  const { customer, metrics, timeline, trips, purchases, guestJourneys, campaignsReceived } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        category="CUSTOMER 360°"
        title={customer.fullName || 'Cliente sem nome'}
        subtitle={`Visão unificada de engajamento, histórico financeiro e comunicações • ID: ${customer.id.substring(0, 8)}...`}
        breadcrumbs={[
          { label: 'Clientes & CRM', href: '/customers' },
          { label: customer.fullName || 'Cliente 360' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button variant="outline" size="sm" className="text-xs h-9 bg-white border-slate-200 text-slate-700">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Voltar
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomerData}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Profile Overview Banner */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#001F5B] text-white flex items-center justify-center shrink-0 font-bold text-xl shadow-2xs">
              {customer.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{customer.fullName || 'Sem Nome'}</h2>
                <StatusBadge status={metrics.stage} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer.email}
                </span>
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {customer.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Cadastrado em {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* LGPD Consent Toggle Action */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#001F5B]" />
                Consentimento LGPD Marketing:
              </span>
              <StatusBadge 
                status={customer.marketingConsent ? 'ACTIVE' : 'INACTIVE'} 
                label={customer.marketingConsent ? 'Opt-in' : 'Opt-out'} 
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingConsent}
              onClick={handleToggleConsent}
              className="w-full text-[11px] h-7 bg-white text-slate-700 hover:bg-slate-100"
            >
              {isUpdatingConsent ? 'Atualizando...' : customer.marketingConsent ? 'Revogar Opt-in' : 'Conceder Opt-in'}
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="LIFETIME VALUE (LTV)"
            value={`R$ ${metrics.totalSpent.toFixed(2)}`}
            subtitle="Total acumulado pago"
            icon={Coins}
          />
          <MetricCard
            title="VIAGENS NO APP"
            value={metrics.tripsCount}
            subtitle="Roteiros gerados"
            icon={MapPin}
          />
          <MetricCard
            title="TRANSAÇÕES DE COMPRA"
            value={metrics.purchasesCount}
            subtitle="Checkout processado"
            icon={ShoppingBag}
          />
          <MetricCard
            title="JORNADAS DE NAVEGAÇÃO"
            value={metrics.guestJourneysCount}
            subtitle="Previews & Questionários"
            icon={Layers}
          />
        </div>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-200/90 rounded-xl shadow-2xs">
          <TabsTrigger value="overview" className="text-xs font-semibold px-4 py-1.5">Visão Geral & Timeline</TabsTrigger>
          <TabsTrigger value="trips" className="text-xs font-semibold px-4 py-1.5">Viagens ({trips.length})</TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs font-semibold px-4 py-1.5">Compras ({purchases.length})</TabsTrigger>
          <TabsTrigger value="journeys" className="text-xs font-semibold px-4 py-1.5">Jornadas ({guestJourneys.length})</TabsTrigger>
          <TabsTrigger value="comms" className="text-xs font-semibold px-4 py-1.5">Comunicações ({campaignsReceived.length})</TabsTrigger>
        </TabsList>

        {/* Tab: Overview & Timeline */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6A00]" />
              Linha do Tempo de Atividades
            </h3>

            {timeline.length === 0 ? (
              <EmptyState title="Nenhuma atividade registrada" description="Este cliente ainda não possui eventos na timeline." />
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timeline.map((evt, idx) => (
                  <div key={(evt as any).id || `${evt.type}-${evt.timestamp}-${idx}`} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#001F5B] ring-4 ring-white" />
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(evt.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Trips */}
        <TabsContent value="trips">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {trips.length === 0 ? (
              <EmptyState icon={MapPin} title="Nenhuma viagem criada" description="Este cliente ainda não criou nenhum roteiro no aplicativo." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">Destino / Título</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Dias</th>
                      <th className="px-4 py-3">Criada em</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {trips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{t.destination}</div>
                          <div className="text-[11px] text-slate-500">{t.title || 'Roteiro de Viagem'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 font-semibold">{(t as any).daysCount || '-'} dias</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/trips/${t.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Purchases */}
        <TabsContent value="purchases">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {purchases.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Nenhuma compra registrada" description="Este cliente ainda não realizou transações de pagamento." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">ID Compra</th>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">{p.id.substring(0, 8)}...</td>
                        <td className="px-4 py-3">{(p as any).product?.name || p.productType || 'Acesso Roteiro 2GO'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">R$ {p.finalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Guest Journeys */}
        <TabsContent value="journeys">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {guestJourneys.length === 0 ? (
              <EmptyState icon={Layers} title="Nenhuma jornada anônima" description="Nenhuma atividade pré-cadastro associada a este usuário." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">Destino</th>
                      <th className="px-4 py-3">Estágio</th>
                      <th className="px-4 py-3">Origem</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {guestJourneys.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-900">{j.destination || 'Geral'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={(j as any).stage || j.status} />
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">{j.origin || 'ORGANIC'}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(j.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Communications */}
        <TabsContent value="comms">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {campaignsReceived.length === 0 ? (
              <EmptyState icon={Megaphone} title="Nenhuma comunicação enviada" description="Nenhum e-mail de campanha ou remarketing foi disparado para este cliente." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">Campanha</th>
                      <th className="px-4 py-3">Assunto</th>
                      <th className="px-4 py-3">Status Envio</th>
                      <th className="px-4 py-3">Enviado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {campaignsReceived.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-900">{c.campaignTitle || (c as any).campaignName}</td>
                        <td className="px-4 py-3 text-slate-600">{(c as any).subject || '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.sentAt ? new Date(c.sentAt).toLocaleDateString('pt-BR') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
