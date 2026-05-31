import api from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  emailConfirmed: boolean;
  blockedAt: string | null;
  createdAt: string;
  _count?: {
    trips: number;
  };
}

export interface UserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListResponse {
  data: User[];
  meta: UserListMeta;
}

export type TravelStyle = 'ECONOMIC' | 'COMFORT' | 'LUXURY' | 'ADVENTURE' | 'FAMILY' | 'ROMANTIC' | 'PARTY' | 'CULTURAL';
export type BudgetLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PREMIUM';
export type TripStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export interface UserTravelProfile {
  id: string;
  userId: string;
  bio?: string | null;
  preferredStyles: TravelStyle[];
  budgetLevel?: BudgetLevel | null;
  favoriteCountries: string[];
  favoriteCities: string[];
  preferredLanguages: string[];
  foodPreferences: string[];
  accessibilityNeeds: string[];
  travelInterests: string[];
  travelCompanions: string[];
  avoidedDestinations: string[];
  preferredClimate: string[];
  bucketListDestinations: string[];
  prefersNightlife: boolean;
  prefersNature: boolean;
  prefersGastronomy: boolean;
  prefersMuseums: boolean;
  prefersShopping: boolean;
  prefersRelaxing: boolean;
  averageTripDuration?: number | null;
  passportCountry?: string | null;
  instagramHandle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserTrip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  coverImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: TripStatus;
  preferences?: any;
  createdAt: string;
  updatedAt: string;
  premiumUnlockedAt?: string | null;
}

/**
 * List all users with pagination and search filtering
 */
export async function listUsers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<UserListResponse> {
  const params: Record<string, any> = { page, limit };
  if (search) {
    params.search = search;
  }
  const response = await api.get('/admin/users', { params });
  return response.data?.data || response.data;
}

/**
 * Get detailed information for a specific user
 */
export async function getUserDetails(id: string): Promise<User> {
  const response = await api.get(`/admin/users/${id}`);
  return response.data?.data || response.data;
}

/**
 * Block a user from the platform
 */
export async function blockUser(id: string): Promise<{ id: string; email: string; blockedAt: string }> {
  const response = await api.patch(`/admin/users/${id}/block`);
  return response.data?.data || response.data;
}

/**
 * Unblock a user
 */
export async function unblockUser(id: string): Promise<{ id: string; email: string; blockedAt: null }> {
  const response = await api.patch(`/admin/users/${id}/unblock`);
  return response.data?.data || response.data;
}

/**
 * Revoke all active sessions (tokens) for a user
 */
export async function revokeUserSessions(id: string): Promise<{ message: string }> {
  const response = await api.post(`/admin/users/${id}/logout-all`);
  return response.data?.data || response.data;
}

/**
 * Get all trips belonging to a specific user
 */
export async function getUserTrips(id: string): Promise<UserTrip[]> {
  const response = await api.get(`/admin/users/${id}/trips`);
  return response.data?.data || response.data || [];
}

/**
 * Get the travel profile of a user, returning null if it doesn't exist (404)
 */
export async function getUserTravelProfile(id: string): Promise<UserTravelProfile | null> {
  try {
    const response = await api.get(`/admin/users/${id}/travel-profile`);
    return response.data?.data || response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
