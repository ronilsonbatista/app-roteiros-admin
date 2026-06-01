import api from '@/lib/axios';

export interface PurchaseProduct {
  id: string;
  name: string;
  type: string;
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
  tripId: string | null;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  amount: number;
  currency: string;
  mockPaymentId: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: PurchaseUser;
  product: PurchaseProduct;
  trip: PurchaseTrip | null;
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

/**
 * List all transactions/purchases with query filters and pagination
 */
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

/**
 * Get detailed information for a specific purchase
 */
export async function getPurchaseDetails(id: string): Promise<Purchase> {
  const response = await api.get(`/admin/purchases/${id}`);
  return response.data?.data || response.data;
}

/**
 * Get all available products
 */
export async function listProducts(): Promise<any[]> {
  const response = await api.get('/admin/products');
  return response.data?.data || response.data || [];
}

/**
 * Fetch overview KPIs and calculate monthly revenue
 */
export async function getBillingKPIs(): Promise<BillingKPIs> {
  const now = new Date();
  // Get start of current month in UTC/Local ISO depending on preference.
  // We construct the start of month: YYYY-MM-01
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
