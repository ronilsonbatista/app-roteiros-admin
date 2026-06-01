import api from '@/lib/axios';

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Upload logged-in user avatar
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/media/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.data || response.data;
}

/**
 * Upload cover image for a user's trip
 */
export async function uploadTripCover(tripId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/media/upload/trips/${tripId}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.data || response.data;
}

/**
 * Upload cover image for an admin base trip template
 */
export async function uploadBaseTripCover(baseTripId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/media/upload/admin/base-trip/${baseTripId}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.data || response.data;
}

/**
 * Upload image for a base attraction template
 */
export async function uploadBaseAttractionImage(attractionId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/media/upload/admin/base-attraction/${attractionId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.data || response.data;
}

/**
 * Upload image for a base restaurant template
 */
export async function uploadBaseRestaurantImage(restaurantId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/media/upload/admin/base-restaurant/${restaurantId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.data || response.data;
}
