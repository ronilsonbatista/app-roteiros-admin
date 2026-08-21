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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  RotateCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  DollarSign,
  User as UserIcon,
  ShoppingBag,
  ExternalLink,
  Crown,
  Lock,
  Loader2,
  FileText,
  AlertTriangle,
  Tag,
  Plus,
  Percent,
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

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'unlock' | 'lock';
    tripId: string;
    purchaseId: string;
  } | null>(null);

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

  const fetchFilterData = useCallback(async () => {
    try {
      const [prodsData, usersData, couponsData] = await Promise.all([
        listProducts(),
        listUsersForSelection(),
        listCoupons(),
      ]);
      setProducts(prodsData);
      setUsers(usersData);
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (userIdFilter !== 'ALL') params.userId = userIdFilter;
      if (productIdFilter !== 'ALL') params.productId = productIdFilter;

      const response = await listPurchases(params);
      setPurchases(response.data || []);
      setMeta(response.meta || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setError('Não foi possível carregar as transações de compras.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, userIdFilter, productIdFilter]);

  useEffect(() => {
    fetchKPIs();
    fetchFilterData();
  }, [fetchKPIs, fetchFilterData]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleViewDetails = async (purchase: Purchase) => {
    setIsDetailsOpen(true);
    setAssociatedTrip(null);
    setConfirmAction(null);

    try {
      const details = await getPurchaseDetails(purchase.id);
      setSelectedPurchase(details);

      if (details.tripId) {
        const trip = await getTripDetails(details.tripId);
        setAssociatedTrip(trip);
      }
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      setSelectedPurchase(purchase);
    }
  };

  const handleTogglePremium = async (type: 'unlock' | 'lock', tripId: string, purchaseId: string) => {
    setIsActionLoading(true);
    try {
      if (type === 'unlock') {
        await unlockPremium(tripId);
      } else {
        await lockPremium(tripId);
      }

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

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;

    setIsSavingCoupon(true);
    try {
      await createCoupon({
        code: couponCode.trim().toUpperCase(),
        discountType: couponType,
        discountValue: parseFloat(couponValue),
      });
      setIsCouponModalOpen(false);
      setCouponCode('');
      setCouponValue('');
      const updatedCoupons = await listCoupons();
      setCoupons(updatedCoupons);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao criar cupom');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleToggleCouponActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCoupon(id, { active: !currentActive });
      const updatedCoupons = await listCoupons();
      setCoupons(updatedCoupons);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao atualizar cupom');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice) return;

    setIsSavingProduct(true);
    try {
      await createProduct({
        name: productName,
        type: productType,
        price: parseFloat(productPrice),
      });
      setIsProductModalOpen(false);
      setProductName('');
      setProductPrice('');
      const updatedProds = await listProducts();
      setProducts(updatedProds);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleToggleProductActive = async (id: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await deactivateProduct(id);
      } else {
        await updateProduct(id, { active: true });
      }
      const updatedProds = await listProducts();
      setProducts(updatedProds);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao atualizar produto');
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
      case 'CHARGEBACK':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
      case 'CHARGEBACK': return 'Contestação (Chargeback)';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#001F5B] font-heading">Monetização e Operação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie compras, cupons de desconto, produtos e suporte operacional.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchKPIs();
              fetchPurchases();
              fetchFilterData();
            }}
            className="h-9 shrink-0 gap-2 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'border-[#001F5B] text-[#001F5B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Transações e Compras
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-[#001F5B] text-[#001F5B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          Cupons ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#001F5B] text-[#001F5B]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Produtos ({products.length})
        </button>
      </div>

      {/* TAB 1: PURCHASES */}
      {activeTab === 'purchases' && (
        <>
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
                  <p className="text-[10px] text-slate-400 mt-1">Faturamento líquido</p>
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

            {isLoading ? (
              <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#001F5B]" />
                <p className="text-sm font-semibold">Carregando lista de transações...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
                <p className="font-semibold text-slate-500">Nenhuma compra encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 w-[140px]">ID da Compra</TableHead>
                      <TableHead className="font-semibold text-slate-700">Comprador</TableHead>
                      <TableHead className="font-semibold text-slate-700">Produto / Cupom</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Valor Final</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Data da Transação</TableHead>
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
                            {purchase.coupon && (
                              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Cupom: {purchase.coupon.code}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-right">
                          {formatCurrency(Number(purchase.finalAmount || purchase.amount))}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(purchase.status)}`}>
                            {translateStatus(purchase.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-medium">
                          {formatDate(purchase.createdAt)}
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
              </div>
            )}
          </Card>
        </>
      )}

      {/* TAB 2: COUPONS */}
      {activeTab === 'coupons' && (
        <Card className="shadow-xs border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-[#001F5B]" />
              <h3 className="font-bold text-slate-800">Gerenciamento de Cupons de Desconto</h3>
            </div>
            <Button
              onClick={() => setIsCouponModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#00143D] text-white font-semibold text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Cupom
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Código</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tipo de Desconto</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Data de Criação</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold text-slate-800 text-sm">
                      {c.code}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">
                      {c.discountType === 'PERCENTAGE' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-right">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(Number(c.discountValue))}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCouponActive(c.id, c.active)}
                        className="h-8 border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {c.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <Card className="shadow-xs border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-[#001F5B]" />
              <h3 className="font-bold text-slate-800">Catálogo de Produtos</h3>
            </div>
            <Button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#00143D] text-white font-semibold text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nome do Produto</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Preço</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-slate-800 text-sm">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-500">
                      {p.type}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-right">
                      {formatCurrency(Number(p.price))}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleProductActive(p.id, p.active)}
                        className="h-8 border-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        {p.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* CREATE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Criar Novo Cupom</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Código do Cupom</label>
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="EX: PROMO10"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Tipo de Desconto</label>
                <select
                  value={couponType}
                  onChange={(e: any) => setCouponType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                >
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Valor do Desconto</label>
                <Input
                  type="number"
                  step="0.01"
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  placeholder={couponType === 'PERCENTAGE' ? '10 (para 10%)' : '15.00'}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCouponModalOpen(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="bg-[#001F5B] hover:bg-[#00143D] text-white"
                >
                  {isSavingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Cupom'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">Criar Novo Produto</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nome do Produto</label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="EX: Roteiro Premium 2GO"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Tipo de Produto</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                >
                  <option value="ITINERARY_FULL_ACCESS">ITINERARY_FULL_ACCESS</option>
                  <option value="AI_CREDITS">AI_CREDITS</option>
                  <option value="PREMIUM_TEMPLATE">PREMIUM_TEMPLATE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="19.99"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isSavingProduct}
                  className="bg-[#001F5B] hover:bg-[#00143D] text-white"
                >
                  {isSavingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Slide-Over Drawer */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md p-0 flex flex-col h-full shadow-2xl z-50">
          {selectedPurchase ? (
            <div className="flex flex-col h-full">
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

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedPurchase.status === 'PAID' 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                    : selectedPurchase.status === 'CHARGEBACK'
                    ? 'bg-purple-50/50 border-purple-100 text-purple-800'
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

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valores e Snapshot de Preço</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Valor Original:</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(Number(selectedPurchase.originalAmount || selectedPurchase.amount))}
                      </span>
                    </div>
                    {selectedPurchase.coupon && (
                      <div className="flex justify-between text-emerald-700">
                        <span className="font-semibold flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Desconto (Cupom: {selectedPurchase.coupon.code}):
                        </span>
                        <span className="font-bold">
                          -{formatCurrency(Number(selectedPurchase.discountAmount || 0))}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                      <span>Valor Final Cobrado:</span>
                      <span>{formatCurrency(Number(selectedPurchase.finalAmount || selectedPurchase.amount))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provedor e Método</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Provedor:</span>
                      <span className="font-bold text-slate-800">{selectedPurchase.provider || 'MOCK'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Método de Pagamento:</span>
                      <span className="font-bold text-slate-800">{selectedPurchase.paymentMethod || 'PIX'}</span>
                    </div>
                    {selectedPurchase.providerPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">ID no Provedor:</span>
                        <span className="font-mono text-slate-700 select-all">{selectedPurchase.providerPaymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

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
                    {selectedPurchase.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Reembolsado em:</span>
                        <span className="font-semibold text-slate-600">{formatDate(selectedPurchase.refundedAt)}</span>
                      </div>
                    )}
                    {selectedPurchase.chargebackAt && (
                      <div className="flex justify-between text-purple-700 font-semibold">
                        <span>Contestação (Chargeback) em:</span>
                        <span>{formatDate(selectedPurchase.chargebackAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full h-10 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
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
