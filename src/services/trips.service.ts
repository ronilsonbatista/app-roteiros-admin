import api from '@/lib/axios';
import { User, UserTrip } from './users.service';

/**
 * List all trips for a specific user via administrative endpoint
 */
export async function listUserTrips(userId: string): Promise<UserTrip[]> {
  const response = await api.get(`/admin/users/${userId}/trips`);
  return response.data?.data || response.data || [];
}

/**
 * Helper to fetch users for selection and filtering target
 */
export async function listUsersForSelection(search?: string): Promise<User[]> {
  const params: Record<string, any> = { page: 1, limit: 100 };
  if (search) {
    params.search = search;
  }
  const response = await api.get('/admin/users', { params });
  const result = response.data?.data || response.data;
  // If api returns paginated envelope list { data: [...], meta: ... }
  return result?.data || result || [];
}
