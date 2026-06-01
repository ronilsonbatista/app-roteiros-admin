import api from '@/lib/axios';

export type BaseTripStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BaseTripVisibility = 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
export type ItineraryCategory = 
  | 'TOURIST_ATTRACTION' 
  | 'MUSEUM' 
  | 'RESTAURANT' 
  | 'CAFE' 
  | 'BAR' 
  | 'BEACH' 
  | 'PARK' 
  | 'SHOPPING' 
  | 'EXPERIENCE' 
  | 'TRANSPORT' 
  | 'EVENT' 
  | 'NIGHTLIFE' 
  | 'FREE_ACTIVITY' 
  | 'PAID_ACTIVITY';

export interface BaseAttraction {
  id: string;
  baseTripDayId: string;
  name: string;
  category: ItineraryCategory;
  shortDescription?: string | null;
  fullDescription?: string | null;
  image?: string | null;
  address?: string | null;
  googleMapsLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  period?: string | null;
  duration?: number | null;
  cost?: number | null;
  currency?: string | null;
  requiresTicket: boolean;
  ticketLink?: string | null;
  requiresReservation: boolean;
  reservationLink?: string | null;
  priority?: number | null;
  accessibility?: string | null;
  goodForKids: boolean;
  goodForElders: boolean;
  observations?: string | null;
  notes?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseRestaurant {
  id: string;
  baseTripDayId: string;
  name: string;
  cuisineType?: string | null;
  priceRange?: string | null;
  priceLevel?: number | null;
  address?: string | null;
  googleMapsLink?: string | null;
  rating?: number | null;
  openingHours?: string | null;
  reservationLink?: string | null;
  recommendedDish?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BaseTripDay {
  id: string;
  baseTripId: string;
  dayNumber: number;
  title?: string | null;
  description?: string | null;
  region?: string | null;
  suggestedTransport?: string | null;
  estimatedCost?: number | null;
  attractions?: BaseAttraction[];
  restaurants?: BaseRestaurant[];
  createdAt: string;
  updatedAt: string;
}

export interface BaseTrip {
  id: string;
  title: string;
  destination: string;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  numberOfDays: number;
  profile?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  coverImage?: string | null;
  bestTime?: string | null;
  climate?: string | null;
  averageBudget?: number | null;
  currency?: string | null;
  language?: string | null;
  tags: string[];
  status: BaseTripStatus;
  visibility: BaseTripVisibility;
  createdByAdminId?: string | null;
  createdAt: string;
  updatedAt: string;
  days?: BaseTripDay[];
  _count?: {
    days: number;
  };
}

// DTO Interfaces for writes
export interface CreateBaseTripDto {
  title: string;
  destination: string;
  country?: string;
  city?: string;
  region?: string;
  numberOfDays: number;
  profile?: string;
  shortDescription?: string;
  fullDescription?: string;
  coverImage?: string;
  bestTime?: string;
  climate?: string;
  averageBudget?: number;
  currency?: string;
  language?: string;
  tags?: string[];
  status?: BaseTripStatus;
  visibility?: BaseTripVisibility;
}

export type UpdateBaseTripDto = Partial<CreateBaseTripDto>;

export interface CreateBaseTripDayDto {
  dayNumber: number;
  title?: string;
  description?: string;
  region?: string;
  suggestedTransport?: string;
  estimatedCost?: number;
}

export type UpdateBaseTripDayDto = Partial<CreateBaseTripDayDto>;

export interface CreateBaseAttractionDto {
  name: string;
  category: ItineraryCategory;
  shortDescription?: string;
  fullDescription?: string;
  image?: string;
  address?: string;
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
  period?: string;
  duration?: number;
  cost?: number;
  currency?: string;
  requiresTicket?: boolean;
  ticketLink?: string;
  requiresReservation?: boolean;
  reservationLink?: string;
  priority?: number;
  accessibility?: string;
  goodForKids?: boolean;
  goodForElders?: boolean;
  observations?: string;
  notes?: string;
  order: number;
}

export type UpdateBaseAttractionDto = Partial<CreateBaseAttractionDto>;

export interface CreateBaseRestaurantDto {
  name: string;
  cuisineType?: string;
  priceRange?: string;
  priceLevel?: number;
  address?: string;
  googleMapsLink?: string;
  rating?: number;
  openingHours?: string;
  reservationLink?: string;
  recommendedDish?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  order: number;
}

export type UpdateBaseRestaurantDto = Partial<CreateBaseRestaurantDto>;

/**
 * List all base trips (templates)
 */
export async function listBaseTrips(): Promise<BaseTrip[]> {
  const response = await api.get('/admin/base-trips');
  return response.data?.data || response.data || [];
}

/**
 * Get detailed information for a base trip, including days, attractions, and restaurants
 */
export async function getBaseTripDetails(id: string): Promise<BaseTrip> {
  const response = await api.get(`/admin/base-trips/${id}`);
  return response.data?.data || response.data;
}

/**
 * Create a new Base Trip
 */
export async function createBaseTrip(dto: CreateBaseTripDto): Promise<BaseTrip> {
  const response = await api.post('/admin/base-trips', dto);
  return response.data?.data || response.data;
}

/**
 * Update a Base Trip
 */
export async function updateBaseTrip(id: string, dto: UpdateBaseTripDto): Promise<BaseTrip> {
  const response = await api.patch(`/admin/base-trips/${id}`, dto);
  return response.data?.data || response.data;
}

/**
 * Delete a Base Trip
 */
export async function deleteBaseTrip(id: string): Promise<BaseTrip> {
  const response = await api.delete(`/admin/base-trips/${id}`);
  return response.data?.data || response.data;
}

/**
 * Add a day to a Base Trip
 */
export async function createBaseTripDay(baseTripId: string, dto: CreateBaseTripDayDto): Promise<BaseTripDay> {
  const response = await api.post(`/admin/base-trips/${baseTripId}/days`, dto);
  return response.data?.data || response.data;
}

/**
 * Update a Base Trip Day
 */
export async function updateBaseTripDay(id: string, dto: UpdateBaseTripDayDto): Promise<BaseTripDay> {
  const response = await api.patch(`/admin/base-trip-days/${id}`, dto);
  return response.data?.data || response.data;
}

/**
 * Delete a Base Trip Day
 */
export async function deleteBaseTripDay(id: string): Promise<BaseTripDay> {
  const response = await api.delete(`/admin/base-trip-days/${id}`);
  return response.data?.data || response.data;
}

/**
 * Add an attraction to a Base Trip Day
 */
export async function createBaseAttraction(dayId: string, dto: CreateBaseAttractionDto): Promise<BaseAttraction> {
  const response = await api.post(`/admin/base-trip-days/${dayId}/attractions`, dto);
  return response.data?.data || response.data;
}

/**
 * Update a Base Attraction
 */
export async function updateBaseAttraction(id: string, dto: UpdateBaseAttractionDto): Promise<BaseAttraction> {
  const response = await api.patch(`/admin/base-attractions/${id}`, dto);
  return response.data?.data || response.data;
}

/**
 * Delete a Base Attraction
 */
export async function deleteBaseAttraction(id: string): Promise<BaseAttraction> {
  const response = await api.delete(`/admin/base-attractions/${id}`);
  return response.data?.data || response.data;
}

/**
 * Add a restaurant to a Base Trip Day
 */
export async function createBaseRestaurant(dayId: string, dto: CreateBaseRestaurantDto): Promise<BaseRestaurant> {
  const response = await api.post(`/admin/base-trip-days/${dayId}/restaurants`, dto);
  return response.data?.data || response.data;
}

/**
 * Update a Base Restaurant
 */
export async function updateBaseRestaurant(id: string, dto: UpdateBaseRestaurantDto): Promise<BaseRestaurant> {
  const response = await api.patch(`/admin/base-restaurants/${id}`, dto);
  return response.data?.data || response.data;
}

/**
 * Delete a Base Restaurant
 */
export async function deleteBaseRestaurant(id: string): Promise<BaseRestaurant> {
  const response = await api.delete(`/admin/base-restaurants/${id}`);
  return response.data?.data || response.data;
}
