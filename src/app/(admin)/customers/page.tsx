'use client';

import { CommercialContacts } from '@/components/admin/commercial-contacts';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { listCustomers, CustomerSummary, CustomerFilterParams } from '@/services/customers.service';

export default function CustomersPage() {
  const [source, setSource] = useState<'APP' | 'CRM'>('APP');
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
      setError('Não foi possível carregar a lista de clientes.');
    } finally {
      setIsLoading(false);
    }
  }, [search, stage, hasPurchases, hasTrips, marketingConsent]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const hasActiveFilters = Boolean(
    search.trim() || stage || hasPurchases !== 'all' || hasTrips !== 'all' || marketingConsent !== 'all'
  );

  const resetFilters = () => {
    setSearch('');
    setStage('');
    setHasPurchases('all');
    setHasTrips('all');
    setMarketingConsent('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" aria-label="Fontes de clientes">
        <Button variant={source === 'APP' ? 'default' : 'outline'} onClick={() => setSource('APP')}>Compradores no App</Button>
        <Button variant={source === 'CRM' ? 'default' : 'outline'} onClick={() => setSource('CRM')}>Contatos comerciais</Button>
      </div>
      {source === 'CRM' ? <CommercialContacts /> : <>

      {/* Header */}
      <PageHeader
        category="CLIENTES & CRM"
        title="Clientes do aplicativo"
        subtitle="Contas do aplicativo classificadas por compra aprovada. Contatos comerciais ficam na outra aba; administradores ficam em Configurações."
        breadcrumbs={[{ label: 'Clientes & CRM' }, { label: 'Todos os Clientes' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers(meta.page)}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Link href="/leads">
              <Button size="sm" className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-semibold h-9 shadow-2xs">
                Ver Módulo de Leads <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, e-mail ou telefone..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todos os Estágios</option>
          <option value="CUSTOMER_PAID">Compra aprovada</option>

          <option value="CUSTOMER_UNPAID">Sem compra aprovada</option>


        </select>

        <select
          value={hasPurchases}
          onChange={(e) => setHasPurchases(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="all">Compras: Todas</option>
          <option value="true">Com Compra Realizada</option>
          <option value="false">Sem Compra</option>
        </select>

        <select
          value={hasTrips}
          onChange={(e) => setHasTrips(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="all">Viagens: Todas</option>
          <option value="true">Com Viagem Criada</option>
          <option value="false">Sem Viagem</option>
        </select>

        <select
          value={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="all">LGPD: Todos</option>
          <option value="true">Opt-in Marketing</option>
          <option value="false">Opt-out / Sem Consentimento</option>
        </select>
      </FilterBar>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => fetchCustomers(1)} className="text-rose-700 text-xs h-7">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Main Customers Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
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
                    Carregando base de clientes do 2GO Core...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="Nenhum cliente encontrado"
                      description="Tente ajustar os termos de pesquisa ou remover os filtros de segmentação ativados."
                      action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Contact */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.fullName || 'Sem Nome'}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                      {c.phone && <div className="text-[10px] text-slate-400">{c.phone}</div>}
                    </td>

                    {/* Origin */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        App · {c.origin || 'mobile'}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <StatusBadge status={c.stage} />
                    </td>

                    {/* Trips Count */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {c.tripsCount}
                      </div>
                    </td>

                    {/* Purchases Count */}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                        {c.purchasesCount}
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">
                      R$ {c.totalSpent.toFixed(2)}
                    </td>

                    {/* Marketing Consent */}
                    <td className="px-4 py-3 text-center">
                      {c.marketingConsent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Opt-in
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          Opt-out
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
                          className="text-xs h-7 px-2.5 border-[#001F5B]/30 text-[#001F5B] hover:bg-[#001F5B] hover:text-white transition-colors font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/40 text-xs text-slate-600">
          <div>
            Mostrando <b>{customers.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => fetchCustomers(meta.page - 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isLoading}
              onClick={() => fetchCustomers(meta.page + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
      </>}
    </div>
  );
}
