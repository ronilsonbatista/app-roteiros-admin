import api from '@/lib/axios';

export interface ProviderHealthResponse {
  environment: string;
  timestamp: string;
  providers: {
    database: { name: string; status: string; configured: boolean };
    openai: { name: string; status: string; configured: boolean; model: string };
    googlePlaces: { name: string; status: string; configured: boolean };
    email: {
      name: string;
      status: string;
      configured: boolean;
      senderConfigured: boolean;
      marketingCampaignsEnabled: boolean;
    };
    mercadoPago: {
      name: string;
      status: string;
      configured: boolean;
      webhookConfigured: boolean;
      mocksEnabled: boolean;
    };
    mediaStorage: {
      name: string;
      status: string;
      provider: string;
      bucketConfigured: boolean;
      configured?: boolean;
    };
  };
  securityFlags: {
    swaggerEnabled: boolean;
    mockPaymentsEnabled: boolean;
    marketingEmailEnabled: boolean;
  };
}

export interface GlobalSearchResult {
  users: Array<{ id: string; fullName: string; email: string; role: string }>;
  trips: Array<{ id: string; title: string; destination: string; status: string }>;
  purchases: Array<{ id: string; finalAmount: number; status: string; createdAt: string }>;
  blogPosts: Array<{ id: string; title: string; slug: string; status: string }>;
  knowledgeArticles: Array<{ id: string; title: string; category: string; destination: string | null }>;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getProviderHealth(): Promise<ProviderHealthResponse> {
  try {
    const res = await api.get('/admin/system/provider-health');
    return res.data?.data || res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const fallback = await api.get('/admin/system/providers');
      return fallback.data?.data || fallback.data;
    }
    throw err;
  }
}

export async function executeGlobalSearch(query: string): Promise<GlobalSearchResult> {
  const res = await api.get('/admin/system/search', { params: { q: query } });
  return res.data?.data || res.data;
}

export async function listAuditLogs(params: {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
} = {}): Promise<AuditLogsResponse> {
  const res = await api.get('/admin/system/audit-logs', { params });
  return res.data?.data || res.data;
}
