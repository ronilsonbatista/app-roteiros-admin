'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listPurchases,
  getPurchaseDetails,
  listProducts,
  getBillingKPIs,
  Purchase,
  BillingKPIs
} from '@/services/billing.service';
import {
  unlockPremium,
  lockPremium,
  getTripDetails,
  listUsersForSelection,
  Trip
} from '@/services/trips.service';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  RotateCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
  DollarSign,
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
  Crown,
  Lock,
  Loader2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function BillingAdminPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [kpis, setKpis] = useState<BillingKPIs>({
    totalPurchases: 0,
    paidPurchases: 0,
    pendingPurchases: 0,
    totalRevenue: 0,
    monthRevenue: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [isKpiLoading, setIsKpiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productIdFilter, setProductIdFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [localPeriodFilterActive, setLocalPeriodFilterActive] = useState(false);

  // Detail Drawer
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [associatedTrip, setAssociatedTrip] = useState<Trip | null>(null);
  
  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'unlock' | 'lock';
    tripId: string;
    purchaseId: string;
  } | null>(null);

  // Load KPIs
  const fetchKPIs = useCallback(async () => {
    setIsKpiLoading(true);
    try {
      const data = await getBillingKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Error fetching billing KPIs:', err);
    } finally {
      setIsKpiLoading(false);
    }
  }, []);

  // Load Products & Users for filter selectors
  const fetchFilterData = useCallback(async () => {
    try {
      const [prodsData, usersData] = await Promise.all([
        listProducts(),
        listUsersForSelection()
      ]);
      setProducts(prodsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  }, []);

  // Load Purchases
  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (userIdFilter !== 'ALL') params.userId = userIdFilter;
      if (productIdFilter !== 'ALL') params.productId = productIdFilter;

      const response = await listPurchases(params);
      
      // Period filter (handled client-side since API doesn't support period filtering directly)
      let filteredData = response.data;
      if (startDateFilter || endDateFilter) {
        setLocalPeriodFilterActive(true);
        filteredData = filteredData.filter(p => {
          const createdDate = new Date(p.createdAt);
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

      setPurchases(filteredData);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError('Não foi possível carregar as transações de compras.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, userIdFilter, productIdFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    fetchKPIs();
    fetchFilterData();
  }, [fetchKPIs, fetchFilterData]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Open Details Drawer
  const handleViewDetails = async (purchase: Purchase) => {
    setIsDetailsOpen(true);
    setAssociatedTrip(null);
    setConfirmAction(null);
    
    try {
      const details = await getPurchaseDetails(purchase.id);
      setSelectedPurchase(details);
      
      // If purchase has tripId, fetch trip details to get premium status
      if (details.tripId) {
        const trip = await getTripDetails(details.tripId);
        setAssociatedTrip(trip);
      }
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      setSelectedPurchase(purchase); // fallback to list row data
    }
  };

  // Lock/Unlock Premium Actions
  const handleTogglePremium = async (type: 'unlock' | 'lock', tripId: string, purchaseId: string) => {
    setIsActionLoading(true);
    try {
      if (type === 'unlock') {
        await unlockPremium(tripId);
      } else {
        await lockPremium(tripId);
      }
      
      // Refresh current details
      if (selectedPurchase && selectedPurchase.id === purchaseId) {
        const trip = await getTripDetails(tripId);
        setAssociatedTrip(trip);
      }
      
      setConfirmAction(null);
      fetchPurchases();
      fetchKPIs();
    } catch (err) {
      console.error('Failed to change premium status:', err);
      alert('Erro ao atualizar status de acesso premium da viagem.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REFUNDED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'CANCELLED': return 'Cancelado';
      case 'EXPIRED': return 'Expirado';
      case 'REFUNDED': return 'Reembolsado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#001F5B] font-heading">Monetização e Compras</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie compras, ative acesso premium e acompanhe as métricas de faturamento.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchKPIs();
              fetchPurchases();
            }}
            className="h-9 shrink-0 gap-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compras Totais</span>
              <div className="p-2 bg-slate-50 text-slate-500 rounded-md">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-slate-800">{kpis.totalPurchases}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Transações registradas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compras Pagas</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-emerald-600">{kpis.paidPurchases}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Pagamentos processados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendentes</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-amber-600">{kpis.pendingPurchases}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Aguardando pagamento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Total</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-28 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.totalRevenue)}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Faturamento acumulado</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-100 hover:shadow-md transition-all duration-200 bg-[#001F5B]/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold text-[#001F5B] uppercase tracking-wider">Receita do Mês</span>
              <div className="p-2 bg-[#001F5B]/10 text-[#001F5B] rounded-md">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-1">
              {isKpiLoading ? (
                <div className="h-7 w-28 bg-slate-100 animate-pulse rounded" />
              ) : (
                <span className="text-2xl font-bold text-[#001F5B]">{formatCurrency(kpis.monthRevenue)}</span>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Faturamento do mês atual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="shadow-xs border-slate-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4 text-[#001F5B] font-semibold text-sm">
            <Filter className="w-4 h-4" />
            Filtros de Pesquisa
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {/* User Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comprador</label>
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
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="EXPIRED">Expirado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
            </div>

            {/* Product Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                value={productIdFilter}
                onChange={(e) => {
                  setProductIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">Todos os Produtos</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Period Filters */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data de Início</label>
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
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data de Fim</label>
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
              <AlertCircle className="w-4 h-4 shrink-0" />
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

      {/* Purchases Data Table */}
      <Card className="shadow-xs border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5 text-[#001F5B]" />
            <h3 className="font-bold text-slate-800">Transações de Compras</h3>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            Mostrando {purchases.length} de {meta.total} registros
          </span>
        </div>

        {error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 border-t border-rose-100 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPurchases}
              className="mt-2 border-rose-200 hover:bg-rose-100/50 text-rose-800 font-semibold cursor-pointer"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#001F5B]" />
            <p className="text-sm font-semibold">Carregando lista de transações...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
            <p className="font-semibold text-slate-500">Nenhuma compra encontrada</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Não existem registros de compras no sistema para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 w-[140px]">ID da Compra</TableHead>
                  <TableHead className="font-semibold text-slate-700">Comprador</TableHead>
                  <TableHead className="font-semibold text-slate-700">Produto</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Data da Transação</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Premium</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <TableCell className="font-mono text-xs text-slate-500 font-medium">
                      {purchase.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">
                          {purchase.user?.fullName || 'Usuário Sem Nome'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {purchase.user?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-sm">{purchase.product?.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {purchase.product?.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-right">
                      {formatCurrency(purchase.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(purchase.status)}`}>
                        {translateStatus(purchase.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs font-medium">
                      {formatDate(purchase.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      {purchase.tripId ? (
                        <div className="inline-flex items-center justify-center" title="Viagem Associada">
                          <Crown className="w-4 h-4 text-amber-500 fill-amber-100" />
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(purchase)}
                        className="h-8 border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Detalhar
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

      {/* Transaction Details Slide-Over Drawer */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md p-0 flex flex-col h-full shadow-2xl z-50">
          {selectedPurchase ? (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <SheetHeader className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#001F5B]/5 text-[#001F5B] rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-bold text-slate-800">Detalhes da Compra</SheetTitle>
                    <SheetDescription className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {selectedPurchase.id}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Drawer Body Scroll Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Callout Card */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedPurchase.status === 'PAID' 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                    : 'bg-amber-50/50 border-amber-100 text-amber-800'
                }`}>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status da Transação</span>
                    <span className="text-base font-bold">{translateStatus(selectedPurchase.status)}</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedPurchase.status)}`}>
                    {selectedPurchase.status}
                  </span>
                </div>

                {/* Comprador Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comprador</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-100 rounded-full text-slate-500 shadow-2xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">
                          {selectedPurchase.user?.fullName || 'Usuário Sem Nome'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {selectedPurchase.user?.email}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2.5 border-t border-slate-200/50 flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">ID do Usuário:</span>
                      <span className="font-mono text-slate-600 select-all">{selectedPurchase.userId}</span>
                    </div>
                  </div>
                </div>

                {/* Produto e Faturamento Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Produto e Valores</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-100 rounded-lg text-slate-500 shadow-2xs">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">
                          {selectedPurchase.product?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Tipo: {selectedPurchase.product?.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2.5 border-t border-slate-200/50 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Valor Unitário:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(selectedPurchase.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Moeda:</span>
                        <span className="font-semibold text-slate-600">{selectedPurchase.currency}</span>
                      </div>
                      {selectedPurchase.mockPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">ID de Transação:</span>
                          <span className="font-mono text-slate-600 select-all">{selectedPurchase.mockPaymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Associado à Viagem Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acesso Premium e Viagem</h4>
                  {selectedPurchase.tripId ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-slate-400 font-semibold block">Viagem Associada:</span>
                          <span className="text-sm font-bold text-[#001F5B] leading-snug">
                            {selectedPurchase.trip?.title || 'Viagem Planejada'}
                          </span>
                        </div>
                        <Link
                          href={`/trips/${selectedPurchase.tripId}`}
                          className="p-1.5 hover:bg-slate-200/50 text-[#001F5B] rounded-lg shrink-0 transition-colors"
                          title="Visualizar Viagem"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/50 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-semibold">Status Premium:</span>
                          {associatedTrip?.premiumUnlockedAt ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-amber-200">
                              <Crown className="w-3 h-3 fill-amber-200 text-amber-500" />
                              Desbloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[10px] border border-slate-200">
                              <Lock className="w-3 h-3 text-slate-400" />
                              Básico
                            </span>
                          )}
                        </div>
                        {associatedTrip?.premiumUnlockedAt && (
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Liberado em:</span>
                            <span className="font-semibold text-slate-600">
                              {formatDate(associatedTrip.premiumUnlockedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Sem viagem específica vinculada</p>
                    </div>
                  )}
                </div>

                {/* Histórico e Datas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Histórico de Datas</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Criado em:</span>
                      <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.createdAt)}</span>
                    </div>
                    {selectedPurchase.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Pago em:</span>
                        <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.paidAt)}</span>
                      </div>
                    )}
                    {selectedPurchase.cancelledAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Cancelado em:</span>
                        <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.cancelledAt)}</span>
                      </div>
                    )}
                    {selectedPurchase.expiredAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Expirado em:</span>
                        <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.expiredAt)}</span>
                      </div>
                    )}
                    {selectedPurchase.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Reembolsado em:</span>
                        <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.refundedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Actions Section */}
              <div className="p-6 border-t border-slate-100 shrink-0 space-y-3 bg-slate-50/50">
                {/* Confirmation Flow UI */}
                {confirmAction ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-semibold leading-normal">
                        Você tem certeza que deseja {confirmAction.type === 'unlock' ? 'liberar' : 'remover'} o premium desta viagem?
                      </p>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => setConfirmAction(null)}
                        className="h-8 border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Não, Cancelar
                      </Button>
                      <Button
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => handleTogglePremium(confirmAction.type, confirmAction.tripId, confirmAction.purchaseId)}
                        className={`h-8 text-xs font-semibold cursor-pointer ${
                          confirmAction.type === 'unlock'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        }`}
                      >
                        {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Sim, Confirmar'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Functional actions if trip exists */}
                    {selectedPurchase.tripId && (
                      <div className="grid grid-cols-2 gap-2">
                        {associatedTrip?.premiumUnlockedAt ? (
                          <Button
                            variant="outline"
                            onClick={() => setConfirmAction({
                              type: 'lock',
                              tripId: selectedPurchase.tripId!,
                              purchaseId: selectedPurchase.id
                            })}
                            className="w-full h-10 border-red-200 hover:bg-red-50 text-red-700 font-bold gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Lock className="w-4 h-4" />
                            Remover Premium
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setConfirmAction({
                              type: 'unlock',
                              tripId: selectedPurchase.tripId!,
                              purchaseId: selectedPurchase.id
                            })}
                            className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1.5 cursor-pointer shadow-sm col-span-2"
                          >
                            <Crown className="w-4 h-4 fill-white/20" />
                            Liberar Premium
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Non-functional / Disabled payment actions */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          disabled
                          variant="outline"
                          className="h-10 border-slate-200 text-slate-400 font-semibold cursor-not-allowed select-none bg-slate-100"
                          title="Indisponível no painel administrativo"
                        >
                          Confirmar Pagamento
                        </Button>
                        <Button
                          disabled
                          variant="outline"
                          className="h-10 border-slate-200 text-slate-400 font-semibold cursor-not-allowed select-none bg-slate-100"
                          title="Indisponível no painel administrativo"
                        >
                          Cancelar Compra
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium text-center">
                        Operações de faturamento manual (confirmar/cancelar) estão desativadas por restrições da API administrativa.
                      </p>
                    </div>
                  </>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full h-10 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer shrink-0"
                >
                  Fechar Painel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#001F5B]" />
              <p className="text-sm font-semibold text-slate-500">Buscando dados da transação...</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
