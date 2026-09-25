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
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
        <p className="text-xs text-red-700 font-semibold">{error || 'Cliente não encontrado.'}</p>
        <Link href="/customers">
          <Button variant="outline" size="sm" className="text-xs">
            Voltar para Clientes
          </Button>
        </Link>
      </div>
    );
  }

  const { customer, metrics, timeline, trips, purchases, guestJourneys, campaignsReceived } = data;

  const getStageBadge = (st: string) => {
    switch (st) {
      case 'CUSTOMER_PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Cliente Pago</span>;
      case 'PROSPECT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Prospect (Preview)</span>;
      case 'CUSTOMER_UNPAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Cadastrado Sem Compra</span>;
      case 'LEAD':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Lead</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Inativo</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Action bar */}
      <div className="flex items-center justify-between">
        <Link href="/customers" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista de clientes
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCustomerData}
          disabled={isLoading}
          className="text-xs h-8 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Recarregar Dados
        </Button>
      </div>

      {/* Customer 360 Header Card */}
      <Card className="p-6 bg-white border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#001F5B]/10 flex items-center justify-center text-[#001F5B] shrink-0 font-black text-lg">
              {customer.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{customer.fullName || 'Sem Nome'}</h1>
                {getStageBadge(metrics.stage)}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
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
                <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  Origem: {customer.origin || 'ORGANIC'}
                </span>
              </div>
            </div>
          </div>

          {/* Consent and Security Card */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#001F5B]" />
              <span className="text-xs font-semibold text-slate-700">Consentimento LGPD</span>
            </div>
            <div className="flex items-center gap-2">
              {customer.marketingConsent ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Marketing Autorizado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                  Não Autorizado / Opt-out
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleConsent}
                disabled={isUpdatingConsent}
                className="text-[11px] h-7 px-2"
              >
                {customer.marketingConsent ? 'Revogar Consentimento' : 'Registrar Opt-in'}
              </Button>
            </div>
            {customer.marketingConsentAt && (
              <span className="text-[10px] text-slate-400">
                Registrado em: {new Date(customer.marketingConsentAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {/* 4 Core Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Gasto</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              R$ {(metrics.totalSpent / 100).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{metrics.purchasesCount} compra(s) realizada(s)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Viagens Criadas</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {metrics.tripsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Roteiros na conta</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jornadas Guest</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {metrics.guestJourneysCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Planejamentos anônimos reivindicados</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Comunicações</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {metrics.campaignsReceivedCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Campanhas de marketing enviadas</div>
          </div>
        </div>
      </Card>

      {/* Tabs Section: Timeline vs Trips vs Purchases vs Journeys vs Campaigns */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="timeline" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Timeline Cronológica ({timeline.length})
          </TabsTrigger>
          <TabsTrigger value="trips" className="text-xs">
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Viagens ({trips.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Compras ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="journeys" className="text-xs">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Jornadas Anônimas ({guestJourneys.length})
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs">
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            E-mails Recebidos ({campaignsReceived.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. CHRONOLOGICAL TIMELINE */}
        <TabsContent value="timeline">
          <Card className="p-6 bg-white border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#001F5B]" />
              Histórico Cronológico Unificado da Jornada
            </h3>

            {timeline.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                Nenhum evento registrado ainda para este cliente.
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {timeline.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#001F5B] group-hover:scale-125 transition-transform" />
                    
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{evt.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(evt.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{evt.description}</p>
                      
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <div className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-500 overflow-x-auto">
                          {JSON.stringify(evt.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 2. TRIPS TAB */}
        <TabsContent value="trips">
          <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Destino</th>
                    <th className="px-4 py-3">Título</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Acesso Premium</th>
                    <th className="px-4 py-3">Criado em</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma viagem associada a este usuário.
                      </td>
                    </tr>
                  ) : (
                    trips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{t.destination}</td>
                        <td className="px-4 py-3 text-slate-600">{t.title || 'Roteiro'}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(t.startDate).toLocaleDateString('pt-BR')} até {new Date(t.endDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {t.premiumUnlocked ? (
                            <span className="text-emerald-700 font-semibold">Liberado</span>
                          ) : (
                            <span className="text-slate-400">Gratuito</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/trips/${t.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                              Ver Roteiro
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 3. PURCHASES TAB */}
        <TabsContent value="purchases">
          <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">ID da Compra</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma compra registrada para este cliente.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-900">{p.id.substring(0, 10)}...</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.productType}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          R$ {(p.finalAmount / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.paymentMethod || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {new Date(p.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 4. GUEST JOURNEYS TAB */}
        <TabsContent value="journeys">
          <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">ID da Jornada</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3">Destino Planejado</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Fingerprint</th>
                    <th className="px-4 py-3">Iniciada em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {guestJourneys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma jornada anônima anterior associada.
                      </td>
                    </tr>
                  ) : (
                    guestJourneys.map((gj) => (
                      <tr key={gj.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-900">{gj.id.substring(0, 10)}...</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{gj.origin}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{gj.destination || 'Em definição'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                            {gj.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{gj.fingerprint || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {new Date(gj.createdAt).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 5. CAMPAIGNS RECEIVED TAB */}
        <TabsContent value="campaigns">
          <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Campanha</th>
                    <th className="px-4 py-3">Status do Envio</th>
                    <th className="px-4 py-3">Enviado em</th>
                    <th className="px-4 py-3">Entregue</th>
                    <th className="px-4 py-3">Aberto</th>
                    <th className="px-4 py-3">Clicado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {campaignsReceived.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma campanha de e-mail enviada para este cliente.
                      </td>
                    </tr>
                  ) : (
                    campaignsReceived.map((cr) => (
                      <tr key={cr.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{cr.campaignTitle}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {cr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {cr.sentAt ? new Date(cr.sentAt).toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {cr.deliveredAt ? 'Sim' : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {cr.openedAt ? 'Sim' : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {cr.clickedAt ? 'Sim' : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
