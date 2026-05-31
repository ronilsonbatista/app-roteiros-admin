import api from '@/lib/axios';

export interface DashboardOverview {
  totalUsers?: number;
  total_users?: number;
  blockedUsers?: number;
  blocked_users?: number;
  totalTrips?: number;
  total_trips?: number;
  premiumTrips?: number;
  premium_trips?: number;
  paidPurchases?: number;
  paid_purchases?: number;
  pendingPurchases?: number;
  pending_purchases?: number;
  totalRevenue?: number;
  total_revenue?: number;
  aiRequestsCount?: number;
  aiRequests?: number;
  ai_requests_count?: number;
  ai_requests?: number;
  aiFailedRequestsCount?: number;
  aiFailedRequests?: number;
  ai_failed_requests_count?: number;
  ai_failed_requests?: number;
}

export interface SystemHealth {
  api: boolean | string;
  database: boolean | string;
  uploadFolder?: boolean | string;
  upload_folder?: boolean | string;
  openai?: boolean | string;
  openAi?: boolean | string;
  open_ai?: boolean | string;
  googleMaps?: boolean | string;
  google_maps?: boolean | string;
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get('/admin/dashboard/overview');
  // Handle response.data.data from the global envelope
  return response.data?.data || response.data;
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get('/admin/dashboard/system-health');
  // Handle response.data.data from the global envelope
  return response.data?.data || response.data;
};
