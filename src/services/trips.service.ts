import api from '@/lib/axios';
import { User } from './users.service';

export type TripStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

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

export type TransitMode = 'WALKING' | 'DRIVING' | 'TRANSIT' | 'BICYCLING';
export type TicketStatus = 'FREE' | 'TICKET_REQUIRED' | 'UNKNOWN';

export interface ItineraryItem {
  id: string;
  tripDayId: string;
  title: string;
  description?: string | null;
  category: ItineraryCategory;
  location?: string | null;
  googleMapsLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeLabel?: string | null;
  period?: string | null;
  duration?: number | null;
  cost?: number | null;
  currency?: string | null;
  externalLink?: string | null;
  notes?: string | null;
  order: number;
  providerPlaceId?: string | null;
  placeProvider?: string | null;
  transitDistanceMeters?: number | null;
  transitDurationMinutes?: number | null;
  transitMode?: TransitMode;
  ticketStatus?: TicketStatus;
  isEditable: boolean;
  isUserModified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  date?: string | null;
  dayNumber: number;
  title?: string | null;
  description?: string | null;
  items?: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TripParticipant {
  id: string;
  tripId: string;
  email: string;
  role: 'VIEWER';
  accepted: boolean;
  inviteToken: string;
  invitedById?: string | null;
  invitedBy?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  acceptedById?: string | null;
  acceptedBy?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripAccommodation {
  id: string;
  tripId: string;
  name: string;
  address?: string | null;
  neighborhood?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  providerPlaceId?: string | null;
  checkInDateTime?: string | null;
  checkOutDateTime?: string | null;
  checkInDate?: string | null;
  checkInTime?: string | null;
  checkOutDate?: string | null;
  checkOutTime?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  coverImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: TripStatus;
  preferences?: Record<string, any> | null;
  arrivalDateTime?: string | null;
  departureDateTime?: string | null;
  allowedSwapsCount?: number;
  usedSwapsCount?: number;
  accommodation?: TripAccommodation | null;
  createdAt: string;
  updatedAt: string;
  premiumUnlockedAt?: string | null;
  user?: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    photoUrl?: string | null;
  } | null;
  days?: TripDay[];
  participants?: TripParticipant[];
  _count?: {
    days: number;
    participants: number;
  };
}

export interface TripListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TripListResponse {
  data: Trip[];
  meta: TripListMeta;
}

export interface PlaceSearchResult {
  provider: 'GOOGLE';
  providerPlaceId: string;
  name: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  userRatingsTotal?: number;
  googleMapsUri?: string;
  websiteUri?: string | null;
  types?: string[];
  priceLevel?: string;
}

export interface PlaceDetails {
  name: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  internationalPhoneNumber?: string | null;
  websiteUri?: string | null;
  googleMapsUri?: string;
  priceLevel?: number;
  types?: string[];
}

/**
 * List user trips for a specific user (administrative endpoint)
 */
export async function listUserTrips(userId: string): Promise<Trip[]> {
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
  return result?.data || result || [];
}

/**
 * List all trips globally (paginated and filtered)
 */
export async function listAllTrips(filters: {
  userId?: string;
  destination?: string;
  status?: TripStatus;
  premium?: boolean;
  page?: number;
  limit?: number;
}): Promise<TripListResponse> {
  const params: Record<string, any> = {
    page: filters.page || 1,
    limit: filters.limit || 10
  };
  
  if (filters.userId) params.userId = filters.userId;
  if (filters.destination) params.destination = filters.destination;
  if (filters.status) params.status = filters.status;
  if (filters.premium !== undefined) params.premium = filters.premium;
  
  const response = await api.get('/admin/trips', { params });
  return response.data?.data || response.data || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
}

/**
 * Detail a single trip, including user, days, items, participants, and purchases
 */
export async function getTripDetails(id: string): Promise<Trip> {
  const response = await api.get(`/admin/trips/${id}`);
  return response.data?.data || response.data;
}

// ==========================================
// Formatting & Helpers for Trips & Itineraries
// ==========================================

const CONTINENT_MAP: Record<string, string> = {
  // Europa
  paris: 'Europa', franca: 'Europa', france: 'Europa',
  roma: 'Europa', rome: 'Europa', italia: 'Europa', italy: 'Europa', florenc: 'Europa', florenca: 'Europa', florence: 'Europa',
  veneza: 'Europa', venice: 'Europa', milao: 'Europa', milan: 'Europa', napoles: 'Europa', naples: 'Europa',
  madrid: 'Europa', barcelona: 'Europa', sevilha: 'Europa', sevilla: 'Europa', espanha: 'Europa', spain: 'Europa',
  lisboa: 'Europa', lisbon: 'Europa', porto: 'Europa', portugal: 'Europa',
  londres: 'Europa', london: 'Europa', reino_unido: 'Europa', uk: 'Europa', inglaterra: 'Europa', england: 'Europa', edimburgo: 'Europa',
  amsterda: 'Europa', amsterdam: 'Europa', holanda: 'Europa', netherlands: 'Europa',
  berlim: 'Europa', berlin: 'Europa', munique: 'Europa', munich: 'Europa', alemanha: 'Europa', germany: 'Europa', frankfurt: 'Europa',
  viena: 'Europa', vienna: 'Europa', austria: 'Europa',
  praga: 'Europa', prague: 'Europa', rep_tcheca: 'Europa', czech: 'Europa',
  budapeste: 'Europa', budapest: 'Europa', hungria: 'Europa', hungary: 'Europa',
  atenas: 'Europa', athens: 'Europa', grecia: 'Europa', greece: 'Europa', santorini: 'Europa', mykonos: 'Europa',
  zurique: 'Europa', zurich: 'Europa', genebra: 'Europa', geneva: 'Europa', suica: 'Europa', switzerland: 'Europa',
  bruxelas: 'Europa', brussels: 'Europa', belgica: 'Europa', belgium: 'Europa',
  dublin: 'Europa', irlanda: 'Europa', ireland: 'Europa',
  copenhague: 'Europa', copenhagen: 'Europa', dinamarca: 'Europa',
  estocolmo: 'Europa', stockholm: 'Europa', suecia: 'Europa',
  oslo: 'Europa', noruega: 'Europa',
  helsinque: 'Europa', helsinki: 'Europa', finlandia: 'Europa',
  varsovia: 'Europa', warsaw: 'Europa', polonia: 'Europa',
  europa: 'Europa', europe: 'Europa',

  // Ásia
  toquio: 'Ásia', tokyo: 'Ásia', quioto: 'Ásia', kyoto: 'Ásia', osaka: 'Ásia', japao: 'Ásia', japan: 'Ásia', hiroshima: 'Ásia',
  seul: 'Ásia', seoul: 'Ásia', coreia: 'Ásia', korea: 'Ásia',
  bangkok: 'Ásia', tailandia: 'Ásia', thailand: 'Ásia', phuket: 'Ásia', chiang_mai: 'Ásia',
  singapura: 'Ásia', singapore: 'Ásia',
  bali: 'Ásia', jakarta: 'Ásia', indonesia: 'Ásia',
  pequim: 'Ásia', beijing: 'Ásia', xangai: 'Ásia', shanghai: 'Ásia', china: 'Ásia', hong_kong: 'Ásia',
  taiwan: 'Ásia', taipei: 'Ásia',
  hanoi: 'Ásia', vietna: 'Ásia', vietnam: 'Ásia',
  dubai: 'Ásia', emirados: 'Ásia', uae: 'Ásia', doha: 'Ásia', qatar: 'Ásia',
  india: 'Ásia', delhi: 'Ásia', mumbai: 'Ásia',
  asia: 'Ásia',

  // América do Sul
  brasil: 'América do Sul', brazil: 'América do Sul', sao_paulo: 'América do Sul', rio_de_janeiro: 'América do Sul', salvador: 'América do Sul', florianopolis: 'América do Sul', noronha: 'América do Sul', gramado: 'América do Sul',
  argentina: 'América do Sul', buenos_aires: 'América do Sul', bariloche: 'América do Sul', mendoza: 'América do Sul',
  chile: 'América do Sul', santiago: 'América do Sul', atacama: 'América do Sul',
  peru: 'América do Sul', lima: 'América do Sul', cusco: 'América do Sul', machu_picchu: 'América do Sul',
  colombia: 'América do Sul', bogota: 'América do Sul', cartagena: 'América do Sul', medellin: 'América do Sul',
  uruguai: 'América do Sul', montevideu: 'América do Sul', punta_del_este: 'América do Sul',

  // América do Norte
  nova_york: 'América do Norte', new_york: 'América do Norte', miami: 'América do Norte', orlando: 'América do Norte', los_angeles: 'América do Norte', san_francisco: 'América do Norte', las_vegas: 'América do Norte', chicago: 'América do Norte', eua: 'América do Norte', usa: 'América do Norte', estados_unidos: 'América do Norte',
  toronto: 'América do Norte', vancouver: 'América do Norte', montreal: 'América do Norte', canada: 'América do Norte',
  mexico: 'América do Norte', cancun: 'América do Norte',

  // África
  cairo: 'África', egito: 'África', egypt: 'África',
  cidade_do_cabo: 'África', cape_town: 'África', africa_do_sul: 'África',
  marrocos: 'África', morocco: 'África', marrakech: 'África', casablanca: 'África',

  // Oceania
  sydney: 'Oceania', melbourne: 'Oceania', australia: 'Oceania', nova_zelandia: 'Oceania', new_zealand: 'Oceania', auckland: 'Oceania'
};

function inferContinent(term: string): string | null {
  const clean = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
  for (const [key, cont] of Object.entries(CONTINENT_MAP)) {
    if (clean.includes(key)) return cont;
  }
  return null;
}

/**
 * Calcula a quantidade real de dias de uma viagem para exibição consistente
 */
export function getTripDaysCount(trip: Trip): number | null {
  if (trip.days && trip.days.length > 0) return trip.days.length;
  if (trip._count?.days && trip._count.days > 0) return trip._count.days;
  if ((trip as any).numberOfDays) return (trip as any).numberOfDays;
  if (trip.startDate && trip.endDate) {
    const s = new Date(trip.startDate).getTime();
    const e = new Date(trip.endDate).getTime();
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      const diff = Math.round((e - s) / (1000 * 3600 * 24)) + 1;
      if (diff > 0) return diff;
    }
  }
  const dests = (trip.preferences as any)?.destinations;
  if (Array.isArray(dests) && dests.length > 0) {
    const sum = dests.reduce((acc: number, d: any) => {
      const dDays = Number(d.numberOfDays || d.daysCount || d.days || 0);
      return acc + (dDays > 0 ? dDays : 0);
    }, 0);
    if (sum > 0) return sum;
  }
  return null;
}

/**
 * Formata destino e título de acordo com o padrão 2GO:
 * Padrão: "Continente: Cidade1, Cidade2, ..." + subtítulo = título personalizado
 * Fallback: "Multi-destino: Cidade1, Cidade2, ..." se continentes mistos
 */
export function formatTripDestinationTitle(trip: Trip): {
  formattedDestination: string;
  customTitle: string;
  isMulti: boolean;
  cities: string[];
} {
  const rawDest = (trip.destination || '').trim();
  const customTitle = (trip.title || '').trim() || 'Roteiro de Viagem';

  // 1. Extrai cidades de preferences.destinations ou do campo destination
  let cities: string[] = [];
  const prefDests = (trip.preferences as any)?.destinations;

  if (Array.isArray(prefDests) && prefDests.length > 0) {
    cities = prefDests
      .map((d: any) => (d.name || d.city || '').trim())
      .filter(Boolean);
  } else if (rawDest) {
    // Se já tiver formato "Continente: Cidade1, Cidade2", extrai
    const colonSplit = rawDest.split(':');
    const destBody = colonSplit.length > 1 ? colonSplit.slice(1).join(':') : rawDest;

    cities = destBody
      .split(/[→\->,/]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (cities.length === 0) {
    return {
      formattedDestination: rawDest || 'Destino não informado',
      customTitle,
      isMulti: false,
      cities: [],
    };
  }

  // 2. Se rawDest já começa com "Continente: ", preserve
  if (rawDest.includes(':')) {
    const parts = rawDest.split(':');
    const prefix = parts[0].trim();
    if (['Europa', 'Ásia', 'América do Sul', 'América do Norte', 'África', 'Oceania', 'Multi-destino'].includes(prefix)) {
      return {
        formattedDestination: rawDest,
        customTitle,
        isMulti: cities.length >= 2,
        cities,
      };
    }
  }

  // 3. Infere continentes das cidades
  const detectedContinents = new Set<string>();
  cities.forEach((city) => {
    const cont = inferContinent(city);
    if (cont) detectedContinents.add(cont);
  });

  let prefix = 'Multi-destino';
  if (detectedContinents.size === 1) {
    prefix = Array.from(detectedContinents)[0];
  } else if (detectedContinents.size === 0) {
    // Tenta inferir pelo rawDest completo
    const fallbackCont = inferContinent(rawDest);
    prefix = fallbackCont || (cities.length > 1 ? 'Multi-destino' : 'Destino');
  } else {
    // Múltiplos continentes (ex: Ásia + Europa)
    prefix = 'Multi-destino';
  }

  const formattedDestination = `${prefix}: ${cities.join(', ')}`;

  return {
    formattedDestination,
    customTitle,
    isMulti: cities.length >= 2,
    cities,
  };
}

/**
 * Create a new trip for a specific user
 */
export async function createTripForUser(userId: string, payload: {
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  status?: TripStatus;
  preferences?: Record<string, any>;
}): Promise<Trip> {
  const safePayload = {
    ...payload,
    startDate: payload.startDate
      ? payload.startDate.includes('T')
        ? payload.startDate
        : `${payload.startDate}T00:00:00.000Z`
      : undefined,
    endDate: payload.endDate
      ? payload.endDate.includes('T')
        ? payload.endDate
        : `${payload.endDate}T00:00:00.000Z`
      : undefined,
  };
  const response = await api.post(`/admin/users/${userId}/trips`, safePayload);
  return response.data?.data || response.data;
}

/**
 * Update general specifications of a trip
 */
export async function updateTrip(id: string, payload: {
  title?: string;
  destination?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: TripStatus;
  preferences?: Record<string, any> | null;
}): Promise<Trip> {
  const response = await api.patch(`/admin/trips/${id}`, payload);
  return response.data?.data || response.data;
}

/**
 * Delete a trip completely
 */
export async function deleteTrip(id: string): Promise<Trip> {
  const response = await api.delete(`/admin/trips/${id}`);
  return response.data?.data || response.data;
}

/**
 * Add a day to a trip
 */
export async function createTripDay(tripId: string, payload: {
  dayNumber: number;
  title?: string;
  description?: string;
  date?: string;
}): Promise<TripDay> {
  const response = await api.post(`/admin/trips/${tripId}/days`, payload);
  return response.data?.data || response.data;
}

/**
 * Update specifications of a day
 */
export async function updateTripDay(id: string, payload: {
  dayNumber?: number;
  title?: string | null;
  description?: string | null;
  date?: string | null;
}): Promise<TripDay> {
  const response = await api.patch(`/admin/trip-days/${id}`, payload);
  return response.data?.data || response.data;
}

/**
 * Delete a day from a trip
 */
export async function deleteTripDay(id: string): Promise<TripDay> {
  const response = await api.delete(`/admin/trip-days/${id}`);
  return response.data?.data || response.data;
}

/**
 * Add an itinerary item to a trip day
 */
export async function createItineraryItem(tripDayId: string, payload: {
  title: string;
  description?: string;
  category: ItineraryCategory;
  location?: string;
  timeLabel?: string;
  period?: string;
  duration?: number;
  cost?: number;
  currency?: string;
  externalLink?: string;
  notes?: string;
  order: number;
}): Promise<ItineraryItem> {
  const response = await api.post(`/admin/trip-days/${tripDayId}/items`, payload);
  return response.data?.data || response.data;
}

/**
 * Update specifications of an itinerary item
 */
export async function updateItineraryItem(id: string, payload: {
  title?: string;
  description?: string | null;
  category?: ItineraryCategory;
  location?: string | null;
  timeLabel?: string | null;
  period?: string | null;
  duration?: number | null;
  cost?: number | null;
  currency?: string | null;
  externalLink?: string | null;
  notes?: string | null;
  order?: number;
}): Promise<ItineraryItem> {
  const response = await api.patch(`/admin/itinerary-items/${id}`, payload);
  return response.data?.data || response.data;
}

/**
 * Delete an itinerary item
 */
export async function deleteItineraryItem(id: string): Promise<ItineraryItem> {
  const response = await api.delete(`/admin/itinerary-items/${id}`);
  return response.data?.data || response.data;
}

/**
 * Reorder position of an itinerary item
 */
export async function reorderItineraryItem(id: string, order: number): Promise<ItineraryItem> {
  const response = await api.patch(`/admin/itinerary-items/${id}/reorder`, { order });
  return response.data?.data || response.data;
}

/**
 * Search Google Places
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const response = await api.get('/places/search', { params: { query } });
  return response.data?.data || response.data || [];
}

/**
 * Get place details
 */
export async function getPlaceDetails(providerPlaceId: string): Promise<PlaceDetails> {
  const response = await api.get(`/places/${providerPlaceId}`);
  return response.data?.data || response.data;
}

/**
 * Enrich itinerary item with google place
 */
export async function enrichItineraryItem(id: string, providerPlaceId: string): Promise<ItineraryItem> {
  const response = await api.patch(`/admin/itinerary-items/${id}/place`, { providerPlaceId });
  return response.data?.data || response.data;
}

/**
 * List participants of a trip
 */
export async function listTripParticipants(tripId: string): Promise<TripParticipant[]> {
  const response = await api.get(`/admin/trips/${tripId}/participants`);
  return response.data?.data || response.data || [];
}

/**
 * Add / Invite a participant
 */
export async function addTripParticipant(tripId: string, email: string): Promise<TripParticipant> {
  const response = await api.post(`/admin/trips/${tripId}/participants`, { email });
  return response.data?.data || response.data;
}

/**
 * Remove a participant from a trip
 */
export async function removeTripParticipant(tripId: string, participantId: string): Promise<TripParticipant> {
  const response = await api.delete(`/admin/trips/${tripId}/participants/${participantId}`);
  return response.data?.data || response.data;
}

/**
 * Unlock Premium for a trip
 */
export async function unlockPremium(tripId: string): Promise<Trip> {
  const response = await api.patch(`/admin/trips/${tripId}/unlock-premium`);
  return response.data?.data || response.data;
}

/**
 * Lock Premium (revert to basic) for a trip
 */
export async function lockPremium(tripId: string): Promise<Trip> {
  const response = await api.patch(`/admin/trips/${tripId}/lock-premium`);
  return response.data?.data || response.data;
}

export interface ItemAlternative {
  id?: string;
  source: 'BASE_TRIP' | 'GOOGLE_PLACES';
  title: string;
  description?: string;
  category?: ItineraryCategory;
  location?: string;
  providerPlaceId?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  cost?: number;
  currency?: string;
  duration?: number;
  ticketStatus?: TicketStatus;
  photoUrl?: string;
}

export interface AlternativesResponse {
  itemId: string;
  quota: {
    allowedSwapsCount: number;
    usedSwapsCount: number;
    remainingSwaps: number;
  };
  alternatives: ItemAlternative[];
}

export interface MealRecommendation {
  source: 'BASE_TRIP' | 'GOOGLE_PLACES';
  title: string;
  description?: string;
  location?: string;
  providerPlaceId?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: string;
  cost?: number;
  currency?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  period?: string;
}

export interface MealRecommendationsResponse {
  dayId: string;
  period?: string;
  recommendations: MealRecommendation[];
}

export interface VerifiedItemDetails extends ItineraryItem {
  verifiedDetails?: {
    name?: string;
    formattedAddress?: string;
    rating?: number;
    userRatingsTotal?: number;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    googleMapsUri?: string;
    types?: string[];
  } | null;
}

/**
 * Get Trip Accommodation
 */
export async function getTripAccommodation(tripId: string): Promise<TripAccommodation | null> {
  const response = await api.get(`/trips/${tripId}/accommodation`);
  return response.data?.data || response.data || null;
}

/**
 * Upsert Trip Accommodation
 */
export async function upsertTripAccommodation(tripId: string, payload: {
  name: string;
  address?: string;
  neighborhood?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  providerPlaceId?: string;
  checkInDateTime?: string;
  checkOutDateTime?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
}): Promise<TripAccommodation> {
  const response = await api.post(`/trips/${tripId}/accommodation`, payload);
  return response.data?.data || response.data;
}

/**
 * Delete Trip Accommodation
 */
export async function deleteTripAccommodation(tripId: string): Promise<{ success: boolean }> {
  const response = await api.delete(`/trips/${tripId}/accommodation`);
  return response.data?.data || response.data;
}

/**
 * Get item alternatives for substitution with swap quota
 */
export async function getItemAlternatives(itemId: string): Promise<AlternativesResponse> {
  const response = await api.get(`/itinerary-items/${itemId}/alternatives`);
  return response.data?.data || response.data;
}

/**
 * Substitute an itinerary item using quota
 */
export async function substituteItineraryItem(itemId: string, payload: {
  title: string;
  description?: string;
  category?: ItineraryCategory;
  location?: string;
  providerPlaceId?: string;
  latitude?: number;
  longitude?: number;
  cost?: number;
  currency?: string;
  duration?: number;
  ticketStatus?: TicketStatus;
}): Promise<{ item: ItineraryItem; remainingSwaps: number }> {
  const response = await api.post(`/itinerary-items/${itemId}/substitute`, payload);
  return response.data?.data || response.data;
}

/**
 * Get meal recommendations for a day and period
 */
export async function getDayMealRecommendations(dayId: string, period?: string): Promise<MealRecommendationsResponse> {
  const response = await api.get(`/trip-days/${dayId}/meal-recommendations`, {
    params: period ? { period } : {}
  });
  return response.data?.data || response.data;
}

/**
 * Pin meal recommendation into an itinerary item
 */
export async function pinMealToItem(itemId: string, payload: {
  title: string;
  description?: string;
  location?: string;
  providerPlaceId?: string;
  latitude?: number;
  longitude?: number;
  cost?: number;
  currency?: string;
  notes?: string;
  googleMapsLink?: string;
}): Promise<ItineraryItem> {
  const response = await api.patch(`/itinerary-items/${itemId}/pin-meal`, payload);
  return response.data?.data || response.data;
}

/**
 * Get verified item details
 */
export async function getItineraryItemDetails(itemId: string): Promise<VerifiedItemDetails> {
  const response = await api.get(`/itinerary-items/${itemId}`);
  return response.data?.data || response.data;
}
