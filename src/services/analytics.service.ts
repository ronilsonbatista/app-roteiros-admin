import api from '@/lib/axios';

export interface OverviewStats {
  users: {
    total: number;
    blocked: number;
    newLast30Days: number;
  };
  trips: {
    total: number;
    premiumUnlocked: number;
    sharedTrips: number;
  };
  billing: {
    totalRevenue: number;
    paidPurchases: number;
    pendingPurchases: number;
  };
  ai: {
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    estimatedTokensUsed: number;
  };
}

export interface RevenueStats {
  totalRevenue: number;
  revenueByProductType: Record<string, number>;
  purchasesByStatus: Array<{ status: string; count: number }>;
}

export interface AiUsageStats {
  requestsByProvider: Array<{ provider: string; _count: number; count?: number }>;
  requestsByModel: Array<{ model: string; _count: number; count?: number }>;
  totalTokensUsed: number;
  topUsers: Array<{ userId: string; _count: number; count?: number }>;
  recentFailures: Array<{ id: string; provider: string; errorMessage: string; createdAt: string }>;
}

export interface TopDestinations {
  tripsDestinations: Array<{ destination: string; _count: number; count?: number }>;
  baseTripsDestinations: Array<{ destination: string; _count: number; count?: number }>;
}

export interface SystemHealth {
  databaseStatus: 'OK' | 'DOWN';
  uploadsFolderExists: boolean;
  openaiConfigured: boolean;
  googlePlacesConfigured: boolean;
  mediaStorageProvider: string;
  timestamp: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  breakdown: Record<string, { files: number; size: number }>;
}

/**
 * Fetch platform overview KPIs
 */
export async function getOverview(): Promise<OverviewStats> {
  const response = await api.get('/admin/dashboard/overview');
  return response.data?.data || response.data;
}

/**
 * Fetch revenue statistics with optional date boundaries
 */
export async function getRevenue(startDate?: string, endDate?: string): Promise<RevenueStats> {
  const params: Record<string, any> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/admin/dashboard/revenue', { params });
  return response.data?.data || response.data;
}

/**
 * Fetch AI generation and token usage statistics
 */
export async function getAiUsage(): Promise<AiUsageStats> {
  const response = await api.get('/admin/dashboard/ai-usage');
  return response.data?.data || response.data;
}

/**
 * Fetch most popular trip and base trip destinations
 */
export async function getTopDestinations(): Promise<TopDestinations> {
  const response = await api.get('/admin/dashboard/top-destinations');
  return response.data?.data || response.data;
}

/**
 * Fetch monthly user growth dataset
 */
export async function getUsersGrowth(): Promise<Record<string, number>> {
  const response = await api.get('/admin/dashboard/users-growth');
  return response.data?.data || response.data;
}

/**
 * Fetch monthly trip creation growth dataset
 */
export async function getTripsGrowth(): Promise<Record<string, number>> {
  const response = await api.get('/admin/dashboard/trips-growth');
  return response.data?.data || response.data;
}

/**
 * Fetch storage sizing and folder breakdown details
 */
export async function getStorageStats(): Promise<StorageStats> {
  const response = await api.get('/admin/dashboard/storage');
  return response.data?.data || response.data;
}

/**
 * Fetch platform system health status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const response = await api.get('/admin/dashboard/system-health');
  return response.data?.data || response.data;
}
