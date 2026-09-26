'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listPurchases,
  getPurchaseDetails,
  listProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
  listCoupons,
  createCoupon,
  updateCoupon,
  deactivateCoupon,
  getBillingKPIs,
  Purchase,
  Coupon,
  BillingKPIs,
} from '@/services/billing.service';
import {
  unlockPremium,
  lockPremium,
  getTripDetails,
  listUsersForSelection,
  Trip,
} from '@/services/trips.service';
import { User } from '@/services/users.service';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';

import {
  RotateCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  User as UserIcon,
  ShoppingBag,
  Crown,
  Lock,
  Loader2,
  FileText,
  AlertTriangle,
  Tag,
  Plus,
  Percent,
  Coins,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function BillingAdminPage() {
  const [activeTab, setActiveTab] = useState<'purchases' | 'coupons' | 'products'>('purchases');

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [kpis, setKpis] = useState<BillingKPIs>({
    totalPurchases: 0,
    paidPurchases: 0,
    pendingPurchases: 0,
    totalRevenue: 0,
    monthRevenue: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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

  // Detail Drawer
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [associatedTrip, setAssociatedTrip] = useState<Trip | null>(null);

  // Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [couponValue, setCouponValue] = useState('');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('ITINERARY_FULL_ACCESS');
  const [productPrice, setProductPrice] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Fetch KPIs
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

  // Fetch Purchases
  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (userIdFilter !== 'ALL') filters.userId = userIdFilter;
      if (productIdFilter !== 'ALL') filters.productId = productIdFilter;

      const response = await listPurchases(filters);
      setPurchases(response.data);
      setMeta(response.meta);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Não foi possível carregar o histórico de transações.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, userIdFilter, productIdFilter]);

  // Fetch Catalog Data
  const fetchCatalogData = useCallback(async () => {
    try {
      const [prodsData, coupData, usersData] = await Promise.all([
        listProducts().catch(() => []),
        listCoupons().catch(() => []),
        listUsersForSelection().catch(() => []),
      ]);
      setProducts(prodsData);
      setCoupons(coupData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    fetchCatalogData();
  }, [fetchKPIs, fetchCatalogData]);

  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab, fetchPurchases]);

  // View purchase details
  const handleOpenDetails = async (purchaseId: string) => {
    setIsDetailsOpen(true);
    setSelectedPurchase(null);
    setAssociatedTrip(null);
    try {
      const details = await getPurchaseDetails(purchaseId);
      setSelectedPurchase(details);
      if (details.tripId) {
        const tripData = await getTripDetails(details.tripId).catch(() => null);
        setAssociatedTrip(tripData);
      }
    } catch (err) {
      console.error('Error loading purchase details:', err);
    }
  };

  const handleUnlockTrip = async (tripId: string) => {
    setIsActionLoading(true);
    try {
      await unlockPremium(tripId);
      alert('Roteiro desbloqueado com sucesso!');
      if (selectedPurchase) {
        handleOpenDetails(selectedPurchase.id);
      }
    } catch (err) {
      console.error('Error unlocking trip:', err);
      alert('Erro ao desbloquear o roteiro.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;
    setIsSavingCoupon(true);
    try {
      await createCoupon({
        code: couponCode.toUpperCase().trim(),
        discountType: couponType,
        discountValue: Number(couponValue),
        active: true,
      });
      setIsCouponModalOpen(false);
      setCouponCode('');
      setCouponValue('');
      fetchCatalogData();
    } catch (err) {
      console.error('Error creating coupon:', err);
      alert('Erro ao criar cupom de desconto.');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice) return;
    setIsSavingProduct(true);
    try {
      await createProduct({
        name: productName.trim(),
        type: productType,
        price: Number(productPrice) * 100, // in cents
        currency: 'BRL',
      });
      setIsProductModalOpen(false);
      setProductName('');
      setProductPrice('');
      fetchCatalogData();
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Erro ao criar produto no catálogo.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const formatCurrency = (amountInCents?: number) => {
    if (amountInCents === undefined || amountInCents === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountInCents / 100);
  };

  const hasActiveFilters = Boolean(userIdFilter !== 'ALL' || statusFilter !== 'ALL' || productIdFilter !== 'ALL');

  const resetFilters = () => {
    setUserIdFilter('ALL');
    setStatusFilter('ALL');
    setProductIdFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="COMERCIAL & OPERAÇÕES"
        title="Gestão Comercial, Compras & Cupons"
        subtitle="Acompanhamento financeiro em tempo real, catálogo de produtos e cupons de desconto 2GO"
        breadcrumbs={[
          { label: 'Comercial', href: '/billing' },
          { label: 'Compras & Cupons' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchKPIs();
                fetchPurchases();
                fetchCatalogData();
              }}
              disabled={isLoading || isKpiLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading || isKpiLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="FATURAMENTO TOTAL"
          value={formatCurrency(kpis.totalRevenue)}
          subtitle="Receita acumulada confirmada"
          icon={Coins}
        />
        <MetricCard
          title="FATURAMENTO DO MÊS"
          value={formatCurrency(kpis.monthRevenue)}
          subtitle="Receita bruta no mês vigente"
          icon={TrendingUp}
        />
        <MetricCard
          title="COMPRAS APROVADAS"
          value={kpis.paidPurchases}
          subtitle="Transações pagas com sucesso"
          icon={CheckCircle2}
        />
        <MetricCard
          title="COMPRAS PENDENTES"
          value={kpis.pendingPurchases}
          subtitle="Aguardando confirmação de pagamento"
          icon={CreditCard}
        />
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-white p-1 border border-slate-200/90 rounded-xl shadow-2xs">
            <TabsTrigger value="purchases" className="text-xs font-semibold px-4 py-1.5">
              Histórico de Compras ({meta.total || purchases.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs font-semibold px-4 py-1.5">
              Produtos ({products.length})
            </TabsTrigger>
            <TabsTrigger value="coupons" className="text-xs font-semibold px-4 py-1.5">
              Cupons de Desconto ({coupons.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'coupons' && (
            <Button
              size="sm"
              onClick={() => setIsCouponModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Novo Cupom de Desconto
            </Button>
          )}

          {activeTab === 'products' && (
            <Button
              size="sm"
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Novo Produto no Catálogo
            </Button>
          )}
        </div>

        {/* Tab 1: Purchases */}
        <TabsContent value="purchases" className="space-y-4">
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
              <option value="ALL">Todos os Status de Pagamento</option>
              <option value="PAID">PAID (Pago)</option>
              <option value="PENDING">PENDING (Pendente)</option>
              <option value="CANCELLED">CANCELLED (Cancelado)</option>
              <option value="REFUNDED">REFUNDED (Reembolsado)</option>
              <option value="EXPIRED">EXPIRED (Expirado)</option>
            </select>

            <select
              value={productIdFilter}
              onChange={(e) => {
                setProductIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
            >
              <option value="ALL">Todos os Produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700 max-w-[200px]"
            >
              <option value="ALL">Todos os Clientes</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
              ))}
            </select>
          </FilterBar>

          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-3">ID Transação</th>
                    <th className="px-4 py-3">Cliente / Comprador</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 font-mono">Valor Total</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                        Carregando histórico de compras...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <EmptyState
                          icon={Receipt}
                          title="Nenhuma compra registrada"
                          description="Não foram encontradas transações com os filtros selecionados."
                          action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                        />
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                          {p.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{p.user?.fullName || 'Cliente 2GO'}</div>
                          <div className="text-[11px] text-slate-500">{p.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {p.product?.name || 'Acesso Roteiro 2GO'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 font-sans">
                          {formatCurrency(p.finalAmount || p.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(p.id)}
                            className="text-xs h-7 px-2.5 border-slate-200 text-[#001F5B] hover:bg-[#001F5B] hover:text-white transition-colors font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detalhes
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
                Mostrando <b>{purchases.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
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
        </TabsContent>

        {/* Tab 2: Products */}
        <TabsContent value="products" className="space-y-4">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {products.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Nenhum produto no catálogo" description="Crie o primeiro produto para disponibilizar no checkout 2GO." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">Nome do Produto</th>
                      <th className="px-4 py-3">Tipo de Produto</th>
                      <th className="px-4 py-3">Preço</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{p.type}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.active ? 'ACTIVE' : 'INACTIVE'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 3: Coupons */}
        <TabsContent value="coupons" className="space-y-4">
          <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
            {coupons.length === 0 ? (
              <EmptyState icon={Tag} title="Nenhum cupom cadastrado" description="Crie cupons de desconto para ações de marketing e remarketing." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="px-4 py-3">Código do Cupom</th>
                      <th className="px-4 py-3">Tipo de Desconto</th>
                      <th className="px-4 py-3">Valor do Desconto</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-bold text-[#001F5B]">{c.code}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {c.discountType === 'PERCENTAGE' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `R$ ${c.discountValue}`}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.active ? 'ACTIVE' : 'INACTIVE'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sheet: Purchase Details */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 space-y-4 overflow-y-auto">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Detalhes da Transação</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Informações financeiras do checkout e vinculação com roteiro.
            </SheetDescription>
          </SheetHeader>

          {selectedPurchase ? (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">ID Compra</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedPurchase.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Status</span>
                  <StatusBadge status={selectedPurchase.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Valor Pago</span>
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(selectedPurchase.finalAmount || selectedPurchase.amount)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Cliente / Comprador</span>
                <p className="font-semibold text-slate-900">{selectedPurchase.user?.fullName || 'Não informado'}</p>
                <p className="text-slate-500">{selectedPurchase.user?.email}</p>
              </div>

              {selectedPurchase.tripId && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Roteiro Vinculado</span>
                  <p className="font-semibold text-slate-900">{associatedTrip?.destination || selectedPurchase.tripId}</p>
                  {associatedTrip && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">Status Full Access:</span>
                      <StatusBadge status={associatedTrip.premiumUnlockedAt ? 'PREMIUM' : 'FREE'} />
                    </div>
                  )}
                  {associatedTrip && !associatedTrip.premiumUnlockedAt && (
                    <Button
                      size="sm"
                      onClick={() => handleUnlockTrip(associatedTrip.id)}
                      disabled={isActionLoading}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                    >
                      Desbloquear Full Access Manualmente
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Carregando detalhes...
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal: Create Coupon */}
      <Sheet open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 space-y-4">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Criar Cupom de Desconto</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Cadastre um código promocional para o checkout 2GO.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateCouponSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Código do Cupom *</label>
              <Input
                type="text"
                placeholder="Ex: PROMO2GO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50 uppercase font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tipo de Desconto *</label>
              <select
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-800"
              >
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Valor do Desconto *</label>
              <Input
                type="number"
                placeholder="Ex: 15 (para 15% ou R$ 15,00)"
                value={couponValue}
                onChange={(e) => setCouponValue(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsCouponModalOpen(false)} className="text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingCoupon} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold cursor-pointer">
                {isSavingCoupon ? 'Salvando...' : 'Criar Cupom'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Modal: Create Product */}
      <Sheet open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 space-y-4">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Criar Produto no Catálogo</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Cadastre uma nova oferta comercial para checkout.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateProductSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome do Produto *</label>
              <Input
                type="text"
                placeholder="Ex: Roteiro Premium Full Access"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tipo *</label>
              <Input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Preço em R$ *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 29.90"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)} className="text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingProduct} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold cursor-pointer">
                {isSavingProduct ? 'Salvando...' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
