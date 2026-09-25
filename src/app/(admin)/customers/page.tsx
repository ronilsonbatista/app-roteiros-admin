'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag, 
  MapPin, 
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { listCustomers, CustomerSummary, CustomerFilterParams } from '@/services/customers.service';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [hasPurchases, setHasPurchases] = useState<string>('all');
  const [hasTrips, setHasTrips] = useState<string>('all');
  const [marketingConsent, setMarketingConsent] = useState<string>('all');

  const fetchCustomers = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CustomerFilterParams = {
        page: pageToLoad,
        limit: 15,
        search: search.trim() || undefined,
        stage: stage || undefined,
        hasPurchases: hasPurchases === 'true' ? true : hasPurchases === 'false' ? false : undefined,
        hasTrips: hasTrips === 'true' ? true : hasTrips === 'false' ? false : undefined,
        marketingConsent: marketingConsent === 'true' ? true : marketingConsent === 'false' ? false : undefined,
      };

      const res = await listCustomers(params);
      setCustomers(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      console.error('Failed to list customers', err);
      setError('Não foi possível carregar a lista de clientes. Verifique sua conexão com o Core.');
    } finally {
      setIsLoading(false);
    }
  }, [search, stage, hasPurchases, hasTrips, marketingConsent]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const getStageBadge = (st: string) => {
    switch (st) {
      case 'CUSTOMER_PAID':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Cliente Pago</span>;
      case 'PROSPECT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">Prospect (Preview)</span>;
      case 'CUSTOMER_UNPAID':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">Cadastrado</span>;
      case 'LEAD':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Lead Inicial</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">Inativo</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#001F5B]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clientes & CRM 360</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle operacional centralizado de todos os usuários, jornadas anônimas e clientes do ecossistema 2GO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCustomers(meta.page)}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/leads">
            <Button size="sm" className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs">
              Ver Leads & Funil
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-[#001F5B]" />
          Filtros de Segmentação
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Nome, email, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
            />
          </div>

          {/* Stage */}
          <div>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="">Todos os Estágios</option>
              <option value="CUSTOMER_PAID">Cliente Pago</option>
              <option value="PROSPECT">Prospect (Preview)</option>
              <option value="CUSTOMER_UNPAID">Cadastrado Sem Compra</option>
              <option value="LEAD">Lead Inicial</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>

          {/* Purchases */}
          <div>
            <select
              value={hasPurchases}
              onChange={(e) => setHasPurchases(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="all">Compras: Todas</option>
              <option value="true">Com Compra Realizada</option>
              <option value="false">Sem Nenhuma Compra</option>
            </select>
          </div>

          {/* Trips */}
          <div>
            <select
              value={hasTrips}
              onChange={(e) => setHasTrips(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="all">Viagens: Todas</option>
              <option value="true">Com Viagem Criada</option>
              <option value="false">Sem Viagem</option>
            </select>
          </div>

          {/* Marketing Consent */}
          <div>
            <select
              value={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="all">Consentimento: Todos</option>
              <option value="true">Opt-in Marketing (LGPD)</option>
              <option value="false">Sem Consentimento / Opt-out</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchCustomers(1)} className="text-red-700 text-xs">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Main Customers Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Cliente / Contato</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Estágio</th>
                <th className="px-4 py-3 text-center">Viagens</th>
                <th className="px-4 py-3 text-center">Compras</th>
                <th className="px-4 py-3">Total Gasto</th>
                <th className="px-4 py-3 text-center">LGPD / Marketing</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando base de clientes do Core...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Contact */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.fullName || 'Sem Nome'}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                      {c.phone && <div className="text-[10px] text-slate-400">{c.phone}</div>}
                    </td>

                    {/* Origin */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                        {c.origin || 'ORGANIC'}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      {getStageBadge(c.stage)}
                    </td>

                    {/* Trips Count */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {c.tripsCount}
                      </div>
                    </td>

                    {/* Purchases Count */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <ShoppingBag className="w-3 h-3 text-purple-600" />
                        {c.purchasesCount}
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      R$ {(c.totalSpent / 100).toFixed(2)}
                    </td>

                    {/* Marketing Consent */}
                    <td className="px-4 py-3 text-center">
                      {c.marketingConsent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Opt-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          Excluído
                        </span>
                      )}
                    </td>

                    {/* Registration Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link href={`/customers/${c.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2.5 border-[#001F5B]/20 text-[#001F5B] hover:bg-[#001F5B]/5 font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" />
                          Visão 360°
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
          <div>
            Mostrando <b>{customers.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => fetchCustomers(meta.page - 1)}
              className="h-7 text-xs px-2.5"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isLoading}
              onClick={() => fetchCustomers(meta.page + 1)}
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
