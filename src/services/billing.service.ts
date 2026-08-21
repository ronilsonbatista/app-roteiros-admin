import api from '@/lib/axios';

export interface PurchaseProduct {
  id: string;
  name: string;
  type: string;
}

export interface PurchaseCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

export interface PurchaseTrip {
  id: string;
  title: string;
}

export interface PurchaseUser {
  id: string;
  email: string;
  fullName: string;
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  couponId: string | null;
  tripId: string | null;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'CHARGEBACK';
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  currency: string;
  provider?: string | null;
  providerPaymentId?: string | null;
  paymentMethod?: string | null;
  mockPaymentId: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  refundedAt: string | null;
  chargebackAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: PurchaseUser;
  product: PurchaseProduct;
  coupon?: PurchaseCoupon | null;
  trip: PurchaseTrip | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  active: boolean;
  productType?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseListResponse {
  data: Purchase[];
  meta: PurchaseListMeta;
}

export interface BillingKPIs {
  totalPurchases: number;
  paidPurchases: number;
  pendingPurchases: number;
  totalRevenue: number;
  monthRevenue: number;
}

export async function listPurchases(filters: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  productId?: string;
  tripId?: string;
}): Promise<PurchaseListResponse> {
  const response = await api.get('/admin/purchases', { params: filters });
  return response.data?.data || response.data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
}

export async function getPurchaseDetails(id: string): Promise<Purchase> {
  const response = await api.get(`/admin/purchases/${id}`);
  return response.data?.data || response.data;
}

export async function listProducts(): Promise<any[]> {
  const response = await api.get('/admin/products');
  return response.data?.data || response.data || [];
}

export async function createProduct(data: {
  name: string;
  description?: string;
  type: string;
  price: number;
  currency?: string;
}): Promise<any> {
  const response = await api.post('/admin/products', data);
  return response.data?.data || response.data;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    active?: boolean;
  },
): Promise<any> {
  const response = await api.patch(`/admin/products/${id}`, data);
  return response.data?.data || response.data;
}

export async function deactivateProduct(id: string): Promise<any> {
  const response = await api.patch(`/admin/products/${id}/deactivate`);
  return response.data?.data || response.data;
}

export async function listCoupons(): Promise<Coupon[]> {
  const response = await api.get('/admin/coupons');
  return response.data?.data || response.data || [];
}

export async function createCoupon(data: {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  productType?: string;
  startsAt?: string;
  expiresAt?: string;
  active?: boolean;
}): Promise<Coupon> {
  const response = await api.post('/admin/coupons', data);
  return response.data?.data || response.data;
}

export async function updateCoupon(
  id: string,
  data: {
    code?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    productType?: string;
    startsAt?: string;
    expiresAt?: string;
    active?: boolean;
  },
): Promise<Coupon> {
  const response = await api.patch(`/admin/coupons/${id}`, data);
  return response.data?.data || response.data;
}

export async function deactivateCoupon(id: string): Promise<Coupon> {
  const response = await api.patch(`/admin/coupons/${id}/deactivate`);
  return response.data?.data || response.data;
}

export async function getBillingKPIs(): Promise<BillingKPIs> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [overviewResponse, revenueResponse] = await Promise.all([
    api.get('/admin/dashboard/overview'),
    api.get('/admin/dashboard/revenue', { params: { startDate: startOfMonth } }),
  ]);

  const overview = overviewResponse.data?.data || overviewResponse.data || {};
  const revenue = revenueResponse.data?.data || revenueResponse.data || {};

  const paid = overview.billing?.paidPurchases || 0;
  const pending = overview.billing?.pendingPurchases || 0;

  return {
    totalPurchases: paid + pending,
    paidPurchases: paid,
    pendingPurchases: pending,
    totalRevenue: overview.billing?.totalRevenue || 0,
    monthRevenue: revenue.totalRevenue || 0,
  };
}
