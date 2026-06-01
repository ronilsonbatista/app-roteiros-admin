import api from '@/lib/axios';

export interface AIRequest {
  id: string;
  userId: string;
  tripId: string | null;
  baseTripId: string | null;
  provider: string;
  model: string;
  prompt: string;
  response: any;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  tokensUsed: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  trip?: {
    id: string;
    title: string;
    destination: string;
  };
  baseTrip?: {
    id: string;
    title: string;
  };
}

export interface AIRequestListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AIRequestListResponse {
  data: AIRequest[];
  meta: AIRequestListMeta;
}

export interface AIUsageKPIs {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  successRate: number;
  averageTime: number; // in seconds
  tokensUsed: number;
  usageByProvider: Record<string, number>;
  usageByModel: Record<string, number>;
}

/**
 * List all AI requests logs with query filters and pagination
 */
export async function listAIRequests(filters: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  tripId?: string;
  baseTripId?: string;
  provider?: string;
  model?: string;
}): Promise<AIRequestListResponse> {
  const response = await api.get('/admin/ai-requests', { params: filters });
  return response.data?.data || response.data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
}

/**
 * Get detailed logs for a single AI request
 */
export async function getAIRequestDetails(id: string): Promise<AIRequest> {
  const response = await api.get(`/admin/ai-requests/${id}`);
  return response.data?.data || response.data;
}

/**
 * Fetch and format AI monitoring metrics and provider/model statistics
 */
export async function getAIUsageKPIs(): Promise<AIUsageKPIs> {
  const [overviewResponse, usageResponse] = await Promise.all([
    api.get('/admin/dashboard/overview'),
    api.get('/admin/dashboard/ai-usage'),
  ]);

  const overview = overviewResponse.data?.data || overviewResponse.data || {};
  const usage = usageResponse.data?.data || usageResponse.data || {};

  const total = overview.ai?.totalRequests || 0;
  const success = overview.ai?.successRequests || 0;
  const failed = overview.ai?.failedRequests || 0;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  const usageByProvider: Record<string, number> = {};
  if (Array.isArray(usage.requestsByProvider)) {
    usage.requestsByProvider.forEach((item: any) => {
      usageByProvider[item.provider] = item._count || item.count || 0;
    });
  }

  const usageByModel: Record<string, number> = {};
  if (Array.isArray(usage.requestsByModel)) {
    usage.requestsByModel.forEach((item: any) => {
      usageByModel[item.model] = item._count || item.count || 0;
    });
  }

  // Calculate average execution time in seconds from a sample of recent logs
  let averageTime = 0;
  try {
    const sample = await listAIRequests({ page: 1, limit: 20 });
    if (sample.data && sample.data.length > 0) {
      const times = sample.data.map(req => {
        const start = new Date(req.createdAt).getTime();
        const end = new Date(req.updatedAt).getTime();
        return (end - start) / 1000;
      });
      averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
  } catch (err) {
    console.error('Error calculating average execution time:', err);
  }

  return {
    totalRequests: total,
    successRequests: success,
    failedRequests: failed,
    successRate,
    averageTime: averageTime || 0,
    tokensUsed: overview.ai?.estimatedTokensUsed || 0,
    usageByProvider,
    usageByModel,
  };
}
