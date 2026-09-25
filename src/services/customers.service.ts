import api from '@/lib/axios';

export interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  origin: string;
  stage: 'LEAD' | 'PROSPECT' | 'CUSTOMER_PAID' | 'CUSTOMER_UNPAID' | 'INACTIVE';
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  tripsCount: number;
  purchasesCount: number;
  totalSpent: number;
}

export interface CustomerListResponse {
  data: CustomerSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  marketingConsent?: boolean;
  hasPurchases?: boolean;
  hasTrips?: boolean;
  origin?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimelineEvent {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Customer360Data {
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    origin: string;
    marketingConsent: boolean;
    marketingConsentAt: string | null;
    unsubscribedAt: string | null;
    createdAt: string;
    updatedAt: string;
    lastActiveAt: string | null;
    travelProfile: any;
  };
  metrics: {
    stage: 'LEAD' | 'PROSPECT' | 'CUSTOMER_PAID' | 'CUSTOMER_UNPAID' | 'INACTIVE';
    totalSpent: number;
    purchasesCount: number;
    tripsCount: number;
    guestJourneysCount: number;
    campaignsReceivedCount: number;
  };
  timeline: TimelineEvent[];
  trips: Array<{
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: string;
    premiumUnlocked: boolean;
    createdAt: string;
  }>;
  purchases: Array<{
    id: string;
    productType: string;
    finalAmount: number;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
  guestJourneys: Array<{
    id: string;
    fingerprint: string | null;
    ipAddress: string | null;
    origin: string;
    destination: string | null;
    status: string;
    createdAt: string;
  }>;
  campaignsReceived: Array<{
    id: string;
    campaignId: string;
    campaignTitle: string;
    status: string;
    sentAt: string | null;
    deliveredAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
  }>;
}

export interface LeadItem {
  id: string;
  fingerprint: string | null;
  ipAddress: string | null;
  email: string | null;
  origin: string;
  marketingConsent: boolean;
  status: string;
  destination: string | null;
  createdAt: string;
  lastActiveAt: string;
  claimedAt: string | null;
  user: { id: string; fullName: string; email: string } | null;
  trip: { id: string; destination: string; status: string } | null;
}

export interface LeadsListResponse {
  data: LeadItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listCustomers(params: CustomerFilterParams = {}): Promise<CustomerListResponse> {
  const response = await api.get('/admin/customers', { params });
  return response.data?.data || response.data;
}

export async function getCustomer360(id: string): Promise<Customer360Data> {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data?.data || response.data;
}

export async function updateCustomerConsent(id: string, marketingConsent: boolean) {
  const response = await api.patch(`/admin/customers/${id}/consent`, { marketingConsent });
  return response.data?.data || response.data;
}

export async function listLeads(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  claimed?: boolean;
} = {}): Promise<LeadsListResponse> {
  const response = await api.get('/admin/leads', { params });
  return response.data?.data || response.data;
}

export async function getLeadDetails(id: string) {
  const response = await api.get(`/admin/leads/${id}`);
  return response.data?.data || response.data;
}
