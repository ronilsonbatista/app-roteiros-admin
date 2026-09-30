'use client';
import { TravelPreferences } from '@/components/admin/travel-preferences';
import { ItineraryAiActions } from '@/components/admin/itinerary-ai-actions';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getTripDetails,
  updateTrip,
  createTripDay,
  updateTripDay,
  deleteTripDay,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItem,
  listTripParticipants,
  addTripParticipant,
  removeTripParticipant,
  unlockPremium,
  lockPremium,
  searchPlaces,
  enrichItineraryItem,
  getTripAccommodation,
  upsertTripAccommodation,
  deleteTripAccommodation,
  getItemAlternatives,
  substituteItineraryItem,
  getDayMealRecommendations,
  pinMealToItem,
  getItineraryItemDetails,
  Trip,
  TripDay,
  ItineraryItem,
  ItineraryCategory,
  TripParticipant,
  PlaceSearchResult,
  TicketStatus,
  TransitMode,
  ItemAlternative,
  AlternativesResponse,
  MealRecommendation,
  VerifiedItemDetails
} from '@/services/trips.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { PageHeader } from '@/components/admin/page-header';

import {
  ArrowLeft,
  RotateCw,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Crown,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Globe,
  Map,
  FileText,
  DollarSign,
  Utensils,
  Car,
  Tag,
  Link2,
  Navigation,
  Hotel,
  Ticket,
  Footprints,
  Bus,
  Bike,
  PlaneTakeoff,
  PlaneLanding,
  Shuffle
} from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form & Drawer States
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [placeDrawerOpen, setPlaceDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active editing references
  const [editingDay, setEditingDay] = useState<TripDay | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [enrichingItemId, setEnrichingItemId] = useState<string | null>(null);

  // Form Fields - Day
  const [dayNumber, setDayNumber] = useState(1);
  const [dayTitle, setDayTitle] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const [dayDate, setDayDate] = useState('');

  // Form Fields - Itinerary Item
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemCategory, setItemCategory] = useState<ItineraryCategory>('TOURIST_ATTRACTION');
  const [itemLocation, setItemLocation] = useState('');
  const [itemTimeLabel, setItemTimeLabel] = useState('');
  const [itemPeriod, setItemPeriod] = useState('');
  const [itemDuration, setItemDuration] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [itemCurrency, setItemCurrency] = useState('BRL');
  const [itemExternalLink, setItemExternalLink] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemOrder, setItemOrder] = useState(1);

  // Form Fields - Participant Invitation
  const [participantEmail, setParticipantEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Form Fields - Google Places Search
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Accommodation Drawer / Form
  const [accommodationDrawerOpen, setAccommodationDrawerOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [accAddress, setAccAddress] = useState('');
  const [accNeighborhood, setAccNeighborhood] = useState('');
  const [accZipCode, setAccZipCode] = useState('');
  const [accCheckInDate, setAccCheckInDate] = useState('');
  const [accCheckInTime, setAccCheckInTime] = useState('');
  const [accCheckOutDate, setAccCheckOutDate] = useState('');
  const [accCheckOutTime, setAccCheckOutTime] = useState('');
  const [accProviderPlaceId, setAccProviderPlaceId] = useState('');
  const [accLatitude, setAccLatitude] = useState<number | undefined>();
  const [accLongitude, setAccLongitude] = useState<number | undefined>();
  const [isSavingAcc, setIsSavingAcc] = useState(false);
  const [accSearchQuery, setAccSearchQuery] = useState('');
  const [accSearchResults, setAccSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearchingAccPlaces, setIsSearchingAccPlaces] = useState(false);

  // Alternatives & Substitution Modal
  const [alternativesModalOpen, setAlternativesModalOpen] = useState(false);
  const [selectedItemForAlternatives, setSelectedItemForAlternatives] = useState<ItineraryItem | null>(null);
  const [alternativesData, setAlternativesData] = useState<AlternativesResponse | null>(null);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [isSubstituting, setIsSubstituting] = useState(false);

  // Meal Recommendations Modal
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [selectedItemForMeal, setSelectedItemForMeal] = useState<ItineraryItem | null>(null);
  const [selectedDayIdForMeal, setSelectedDayIdForMeal] = useState<string | null>(null);
  const [mealRecommendations, setMealRecommendations] = useState<MealRecommendation[]>([]);
  const [isLoadingMealRecs, setIsLoadingMealRecs] = useState(false);
  const [isPinningMeal, setIsPinningMeal] = useState(false);

  // Verified Details Drawer
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<VerifiedItemDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Quick Duration updating state
  const [updatingDurationItemId, setUpdatingDurationItemId] = useState<string | null>(null);

  // Fetch full details of the trip
  const fetchTripDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTripDetails(tripId);
      setTrip(data);
      
      // Auto-compute next day number
      const nextDayNum = data.days && data.days.length > 0 
        ? Math.max(...data.days.map(d => d.dayNumber)) + 1 
        : 1;
      setDayNumber(nextDayNum);

      // Load participants
      setIsParticipantsLoading(true);
      const parts = await listTripParticipants(tripId);
      setParticipants(parts);
    } catch (err: any) {
      console.error('Error fetching trip details:', err);
      setError('Viagem não encontrada ou erro de comunicação com o servidor.');
    } finally {
      setIsLoading(false);
      setIsParticipantsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Premium Access Toggling
  const handleTogglePremium = async () => {
    if (!trip) return;
    setIsSaving(true);
    try {
      if (trip.premiumUnlockedAt) {
        await lockPremium(tripId);
        alert('Acesso Premium removido com sucesso.');
      } else {
        await unlockPremium(tripId);
        alert('Acesso Premium liberado com sucesso!');
      }
      fetchTripDetails();
    } catch (err) {
      console.error('Error toggling premium:', err);
      alert('Erro ao alterar o plano de acesso da viagem.');
    } finally {
      setIsSaving(false);
    }
  };

  // Day Form Drawers
  const handleOpenDay = (day: TripDay | null = null) => {
    setEditingDay(day);
    if (day) {
      setDayNumber(day.dayNumber);
      setDayTitle(day.title || '');
      setDayDescription(day.description || '');
      setDayDate(day.date ? day.date.split('T')[0] : '');
    } else {
      const nextDayNum = trip?.days && trip.days.length > 0 
        ? Math.max(...trip.days.map(d => d.dayNumber)) + 1 
        : 1;
      setDayNumber(nextDayNum);
      setDayTitle('');
      setDayDescription('');
      setDayDate('');
    }
    setDayDrawerOpen(true);
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      dayNumber: Number(dayNumber),
      title: dayTitle.trim() || undefined,
      description: dayDescription.trim() || undefined,
      date: dayDate ? new Date(dayDate).toISOString() : undefined
    };

    try {
      if (editingDay) {
        await updateTripDay(editingDay.id, payload);
        alert('Dia de viagem atualizado.');
      } else {
        await createTripDay(tripId, payload);
        alert('Dia de viagem adicionado.');
      }
      setDayDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error saving day:', err);
      alert('Erro ao salvar o dia da viagem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async (dayId: string, dayNum: number) => {
    if (!window.confirm(`Deseja realmente excluir o Dia ${dayNum}? Todos os itens de itinerário vinculados a ele serão excluídos permanentemente.`)) {
      return;
    }

    try {
      await deleteTripDay(dayId);
      alert('Dia excluído com sucesso.');
      fetchTripDetails();
    } catch (err) {
      console.error('Error deleting day:', err);
      alert('Erro ao excluir o dia da viagem.');
    }
  };

  // Itinerary Item Form Drawers
  const handleOpenItem = (dayId: string, item: ItineraryItem | null = null) => {
    setActiveDayId(dayId);
    setEditingItem(item);
    if (item) {
      setItemTitle(item.title);
      setItemDescription(item.description || '');
      setItemCategory(item.category);
      setItemLocation(item.location || '');
      setItemTimeLabel(item.timeLabel || '');
      setItemPeriod(item.period || '');
      setItemDuration(item.duration ? item.duration.toString() : '');
      setItemCost(item.cost ? item.cost.toString() : '');
      setItemCurrency(item.currency || 'BRL');
      setItemExternalLink(item.externalLink || '');
      setItemNotes(item.notes || '');
      setItemOrder(item.order);
    } else {
      setItemTitle('');
      setItemDescription('');
      setItemCategory('TOURIST_ATTRACTION');
      setItemLocation('');
      setItemTimeLabel('');
      setItemPeriod('');
      setItemDuration('');
      setItemCost('');
      setItemCurrency('BRL');
      setItemExternalLink('');
      setItemNotes('');
      // Auto order
      const targetDay = trip?.days?.find(d => d.id === dayId);
      const nextOrder = targetDay?.items && targetDay.items.length > 0
        ? Math.max(...targetDay.items.map(i => i.order)) + 1
        : 1;
      setItemOrder(nextOrder);
    }
    setItemDrawerOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) {
      alert('Título do item é obrigatório.');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: itemTitle,
      description: itemDescription.trim() || undefined,
      category: itemCategory,
      location: itemLocation.trim() || undefined,
      timeLabel: itemTimeLabel.trim() || undefined,
      period: itemPeriod.trim() || undefined,
      duration: itemDuration.trim() ? Number(itemDuration) : undefined,
      cost: itemCost.trim() ? Number(itemCost) : undefined,
      currency: itemCurrency || undefined,
      externalLink: itemExternalLink.trim() || undefined,
      notes: itemNotes.trim() || undefined,
      order: Number(itemOrder)
    };

    try {
      if (editingItem) {
        await updateItineraryItem(editingItem.id, payload);
        alert('Item de itinerário atualizado.');
      } else if (activeDayId) {
        await createItineraryItem(activeDayId, payload);
        alert('Item de itinerário adicionado.');
      }
      setItemDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Erro ao salvar o item de itinerário.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!window.confirm(`Deseja realmente remover o item "${title}"?`)) return;
    try {
      await deleteItineraryItem(itemId);
      alert('Item removido com sucesso.');
      fetchTripDetails();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Erro ao remover o item de itinerário.');
    }
  };

  // Reorder Item
  const handleReorder = async (itemId: string, currentOrder: number, direction: 'UP' | 'DOWN') => {
    const newOrder = direction === 'UP' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await reorderItineraryItem(itemId, newOrder);
      fetchTripDetails();
    } catch (err) {
      console.error('Error reordering item:', err);
      alert('Erro ao alterar ordem do item.');
    }
  };

  // Participant Operations
  const handleInviteParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantEmail.trim()) return;
    setIsInviting(true);
    try {
      await addTripParticipant(tripId, participantEmail.trim());
      alert('Convidado enviado com sucesso!');
      setParticipantEmail('');
      // Reload
      const parts = await listTripParticipants(tripId);
      setParticipants(parts);
    } catch (err: any) {
      console.error('Error inviting participant:', err);
      alert(err.response?.data?.message || 'Erro ao convidar participante.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveParticipant = async (partId: string, email: string) => {
    if (!window.confirm(`Remover "${email}" desta viagem?`)) return;
    try {
      await removeTripParticipant(tripId, partId);
      alert('Participante removido.');
      // Reload
      const parts = await listTripParticipants(tripId);
      setParticipants(parts);
    } catch (err) {
      console.error('Error removing participant:', err);
      alert('Erro ao remover o participante.');
    }
  };

  // Google Places Enrichment
  const handleOpenPlaceSearch = (itemId: string) => {
    setEnrichingItemId(itemId);
    setPlaceSearchQuery('');
    setPlaceSearchResults([]);
    setSelectedPlaceId(null);
    setPlaceDrawerOpen(true);
  };

  const handleSearchPlacesClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeSearchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const results = await searchPlaces(placeSearchQuery.trim());
      setPlaceSearchResults(results);
    } catch (err) {
      console.error('Error searching places:', err);
      alert('Erro ao buscar locais no Google Places.');
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleEnrichItemSubmit = async (placeId: string) => {
    if (!enrichingItemId) return;
    setIsSaving(true);
    try {
      await enrichItineraryItem(enrichingItemId, placeId);
      alert('Item de itinerário enriquecido com sucesso!');
      setPlaceDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error enriching item:', err);
      alert('Erro ao enriquecer o item de itinerário.');
    } finally {
      setIsSaving(false);
    }
  };

  // Accommodation Handlers
  const handleOpenAccommodation = () => {
    if (trip?.accommodation) {
      setAccName(trip.accommodation.name || '');
      setAccAddress(trip.accommodation.address || '');
      setAccNeighborhood(trip.accommodation.neighborhood || '');
      setAccZipCode(trip.accommodation.zipCode || '');
      setAccCheckInDate(trip.accommodation.checkInDate || (trip.accommodation.checkInDateTime ? trip.accommodation.checkInDateTime.split('T')[0] : ''));
      setAccCheckInTime(trip.accommodation.checkInTime || '');
      setAccCheckOutDate(trip.accommodation.checkOutDate || (trip.accommodation.checkOutDateTime ? trip.accommodation.checkOutDateTime.split('T')[0] : ''));
      setAccCheckOutTime(trip.accommodation.checkOutTime || '');
      setAccProviderPlaceId(trip.accommodation.providerPlaceId || '');
      setAccLatitude(trip.accommodation.latitude ?? undefined);
      setAccLongitude(trip.accommodation.longitude ?? undefined);
    } else {
      setAccName('');
      setAccAddress('');
      setAccNeighborhood('');
      setAccZipCode('');
      setAccCheckInDate(trip?.startDate ? trip.startDate.split('T')[0] : '');
      setAccCheckInTime('14:00');
      setAccCheckOutDate(trip?.endDate ? trip.endDate.split('T')[0] : '');
      setAccCheckOutTime('11:00');
      setAccProviderPlaceId('');
      setAccLatitude(undefined);
      setAccLongitude(undefined);
    }
    setAccSearchQuery('');
    setAccSearchResults([]);
    setAccommodationDrawerOpen(true);
  };

  const handleSearchAccPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accSearchQuery.trim()) return;
    setIsSearchingAccPlaces(true);
    try {
      const results = await searchPlaces(accSearchQuery.trim());
      setAccSearchResults(results);
    } catch (err) {
      console.error('Error searching accommodation places:', err);
      alert('Erro ao buscar locais no Google Places.');
    } finally {
      setIsSearchingAccPlaces(false);
    }
  };

  const handleSelectAccPlace = (place: PlaceSearchResult) => {
    setAccName(place.name);
    setAccAddress(place.formattedAddress);
    setAccProviderPlaceId(place.providerPlaceId);
    setAccLatitude(place.latitude);
    setAccLongitude(place.longitude);
  };

  const handleSaveAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) {
      alert('O nome da hospedagem é obrigatório.');
      return;
    }
    setIsSavingAcc(true);
    try {
      const payload: any = {
        name: accName.trim(),
        address: accAddress.trim() || undefined,
        neighborhood: accNeighborhood.trim() || undefined,
        zipCode: accZipCode.trim() || undefined,
        providerPlaceId: accProviderPlaceId.trim() || undefined,
        latitude: accLatitude,
        longitude: accLongitude,
        checkInDate: accCheckInDate || undefined,
        checkInTime: accCheckInTime || undefined,
        checkOutDate: accCheckOutDate || undefined,
        checkOutTime: accCheckOutTime || undefined,
      };
      if (accCheckInDate) {
        payload.checkInDateTime = new Date(`${accCheckInDate}T${accCheckInTime || '14:00'}:00`).toISOString();
      }
      if (accCheckOutDate) {
        payload.checkOutDateTime = new Date(`${accCheckOutDate}T${accCheckOutTime || '11:00'}:00`).toISOString();
      }
      await upsertTripAccommodation(tripId, payload);
      alert('Hospedagem salva com sucesso e deslocamentos recalculados!');
      setAccommodationDrawerOpen(false);
      fetchTripDetails();
    } catch (err: any) {
      console.error('Error saving accommodation:', err);
      alert(err.response?.data?.message || 'Erro ao salvar hospedagem.');
    } finally {
      setIsSavingAcc(false);
    }
  };

  const handleDeleteAccommodation = async () => {
    if (!window.confirm('Deseja realmente remover a hospedagem desta viagem?')) return;
    setIsSavingAcc(true);
    try {
      await deleteTripAccommodation(tripId);
      alert('Hospedagem removida com sucesso!');
      setAccommodationDrawerOpen(false);
      fetchTripDetails();
    } catch (err: any) {
      console.error('Error deleting accommodation:', err);
      alert(err.response?.data?.message || 'Erro ao remover hospedagem.');
    } finally {
      setIsSavingAcc(false);
    }
  };

  // Quick Duration change (recalculates subsequent items)
  const handleQuickDurationChange = async (item: ItineraryItem, deltaMinutes: number) => {
    const current = item.duration || 60;
    const nextDuration = Math.max(15, current + deltaMinutes);
    if (nextDuration === current) return;
    setUpdatingDurationItemId(item.id);
    try {
      await updateItineraryItem(item.id, { duration: nextDuration });
      await fetchTripDetails();
    } catch (err) {
      console.error('Error updating duration:', err);
      alert('Erro ao atualizar duração da atividade.');
    } finally {
      setUpdatingDurationItemId(null);
    }
  };

  // Alternatives & Substitution Handlers
  const handleOpenAlternatives = async (item: ItineraryItem) => {
    setSelectedItemForAlternatives(item);
    setAlternativesData(null);
    setAlternativesModalOpen(true);
    setIsLoadingAlternatives(true);
    try {
      const data = await getItemAlternatives(item.id);
      setAlternativesData(data);
    } catch (err: any) {
      console.error('Error loading alternatives:', err);
      alert(err.response?.data?.message || 'Erro ao carregar alternativas para este item.');
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleExecuteSubstitute = async (alt: ItemAlternative) => {
    if (!selectedItemForAlternatives || !alternativesData) return;
    const remaining = alternativesData.quota.remainingSwaps;
    if (remaining <= 0) {
      alert('A cota de trocas para esta viagem já foi esgotada.');
      return;
    }
    if (remaining === 1) {
      const confirmed = window.confirm(
        'ATENÇÃO: Esta é a última substituição disponível da sua cota! Após esta troca, a cota de substituições desta viagem será esgotada. Deseja prosseguir com a troca?'
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Substituir "${selectedItemForAlternatives.title}" por "${alt.title}"?`);
      if (!confirmed) return;
    }

    setIsSubstituting(true);
    try {
      await substituteItineraryItem(selectedItemForAlternatives.id, {
        title: alt.title,
        description: alt.description,
        category: alt.category,
        location: alt.location,
        providerPlaceId: alt.providerPlaceId,
        latitude: alt.latitude,
        longitude: alt.longitude,
        cost: alt.cost,
        currency: alt.currency,
        duration: alt.duration,
        ticketStatus: alt.ticketStatus,
      });
      alert('Item substituído com sucesso e cronograma recalculado!');
      setAlternativesModalOpen(false);
      fetchTripDetails();
    } catch (err: any) {
      console.error('Error substituting item:', err);
      alert(err.response?.data?.message || 'Erro ao realizar a substituição.');
    } finally {
      setIsSubstituting(false);
    }
  };

  // Meal Recommendations Handlers
  const handleOpenMealRecommendations = async (dayId: string, item: ItineraryItem) => {
    setSelectedDayIdForMeal(dayId);
    setSelectedItemForMeal(item);
    setMealRecommendations([]);
    setMealModalOpen(true);
    setIsLoadingMealRecs(true);
    try {
      const data = await getDayMealRecommendations(dayId, item.period || undefined);
      setMealRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error('Error loading meal recommendations:', err);
      alert(err.response?.data?.message || 'Erro ao carregar recomendações gastronômicas.');
    } finally {
      setIsLoadingMealRecs(false);
    }
  };

  const handleExecutePinMeal = async (rec: MealRecommendation) => {
    if (!selectedItemForMeal) return;
    if (!window.confirm(`Fixar restaurante "${rec.title}" no item "${selectedItemForMeal.title}"?`)) return;

    setIsPinningMeal(true);
    try {
      await pinMealToItem(selectedItemForMeal.id, {
        title: rec.title,
        description: rec.description,
        location: rec.location,
        providerPlaceId: rec.providerPlaceId,
        latitude: rec.latitude,
        longitude: rec.longitude,
        cost: rec.cost,
        currency: rec.currency,
        googleMapsLink: rec.googleMapsUri,
      });
      alert('Restaurante fixado com sucesso e deslocamentos recalculados!');
      setMealModalOpen(false);
      fetchTripDetails();
    } catch (err: any) {
      console.error('Error pinning meal:', err);
      alert(err.response?.data?.message || 'Erro ao fixar restaurante.');
    } finally {
      setIsPinningMeal(false);
    }
  };

  // Verified Item Details Handler
  const handleOpenVerifiedDetails = async (item: ItineraryItem) => {
    setSelectedItemDetails(null);
    setDetailsDrawerOpen(true);
    setIsLoadingDetails(true);
    try {
      const data = await getItineraryItemDetails(item.id);
      setSelectedItemDetails(data);
    } catch (err: any) {
      console.error('Error loading item details:', err);
      alert('Erro ao buscar detalhes verificados do item.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Translation helpers
  const translateCategory = (cat: ItineraryCategory): string => {
    const map: Record<ItineraryCategory, string> = {
      TOURIST_ATTRACTION: 'Atração Turística',
      MUSEUM: 'Museu',
      RESTAURANT: 'Restaurante',
      CAFE: 'Café',
      BAR: 'Bar',
      BEACH: 'Praia',
      PARK: 'Parque / Natureza',
      SHOPPING: 'Compras',
      EXPERIENCE: 'Experiência',
      TRANSPORT: 'Transporte',
      EVENT: 'Evento',
      NIGHTLIFE: 'Vida Noturna',
      FREE_ACTIVITY: 'Atividade Livre',
      PAID_ACTIVITY: 'Atividade Paga'
    };
    return map[cat] || cat;
  };

  const formatDatePT = (dateStr?: string | null, calendarDate = false) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(calendarDate ? { timeZone: 'UTC' } : {})
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const formatPrice = (amount?: number | null, currency = 'BRL') => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  };

  const formatDateTimePT = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const formatDistance = (meters?: number | null) => {
    if (meters == null) return '';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  const renderTransitInfo = (item: ItineraryItem) => {
    if (item.transitDistanceMeters == null && item.transitDurationMinutes == null) {
      return null;
    }
    const mode = item.transitMode || 'WALKING';
    let ModeIcon = Footprints;
    let modeLabel = 'A pé';
    if (mode === 'DRIVING') {
      ModeIcon = Car;
      modeLabel = 'Carro / Táxi';
    } else if (mode === 'TRANSIT') {
      ModeIcon = Bus;
      modeLabel = 'Transporte Público';
    } else if (mode === 'BICYCLING') {
      ModeIcon = Bike;
      modeLabel = 'Bicicleta';
    }

    return (
      <div className="flex items-center gap-2 py-1 px-2.5 my-1.5 rounded-lg bg-slate-100/80 border border-slate-200/70 text-[10px] text-slate-600 w-fit">
        <ModeIcon className="w-3.5 h-3.5 text-[#001F5B]" />
        <span className="font-semibold">{modeLabel}</span>
        {item.transitDurationMinutes != null && (
          <span className="font-bold text-slate-800">• {item.transitDurationMinutes} min</span>
        )}
        {item.transitDistanceMeters != null && (
          <span className="text-slate-500">({formatDistance(item.transitDistanceMeters)})</span>
        )}
      </div>
    );
  };

  const renderTicketBadge = (ticketStatus?: TicketStatus) => {
    if (!ticketStatus) return null;
    if (ticketStatus === 'FREE') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
          <Ticket className="w-3 h-3 text-emerald-600" />
          Ingresso Gratuito
        </span>
      );
    }
    if (ticketStatus === 'TICKET_REQUIRED') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
          <Ticket className="w-3 h-3 text-amber-600" />
          Ingresso Obrigatório
        </span>
      );
    }
    if (ticketStatus === 'UNKNOWN') {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
          <Ticket className="w-3 h-3 text-slate-400" />
          Ingresso a Confirmar
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="GESTOR DE ROTEIRO"
        title={trip?.title || trip?.destination || 'Detalhes da Viagem'}
        subtitle={`Destino: ${trip?.destination || 'N/D'} • Criado por ${trip?.user?.fullName || 'Usuário'} (${trip?.user?.email || ''})`}
        breadcrumbs={[
          { label: 'Viagens', href: '/trips' },
          { label: trip?.destination || 'Roteiro' }
        ]}
        actions={
          <div className="flex items-center gap-3">
            {/* Active Premium switch toggle */}
            {trip && (
              <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 p-1.5 px-3 rounded-lg shadow-2xs">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${trip.premiumUnlockedAt ? 'text-amber-600' : 'text-slate-400'}`}>
                  Full Access
                </span>
                <button
                  type="button"
                  onClick={handleTogglePremium}
                  disabled={isSaving}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    trip.premiumUnlockedAt ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      trip.premiumUnlockedAt ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTripDetails}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>

            <Button
              size="sm"
              onClick={() => handleOpenDay()}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Adicionar Dia
            </Button>
          </div>
        }
      />

      {trip && <ItineraryAiActions id={trip.id} kind="trips" empty={!trip.days?.length} draft={trip.status === 'DRAFT'} onSaved={fetchTripDetails} />}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {trip && (
        <>
          {/* Trip Key Metrics: Arrival, Departure, Swaps Quota, Main Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chegada */}
            <Card className="border-slate-200 bg-white p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#001F5B] flex items-center justify-center shrink-0">
                  <PlaneLanding className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Chegada</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {trip.arrivalDateTime
                      ? formatDateTimePT(trip.arrivalDateTime)
                      : trip.startDate
                      ? formatDatePT(trip.startDate)
                      : 'Data não definida'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Saída */}
            <Card className="border-slate-200 bg-white p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                  <PlaneTakeoff className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Saída</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {trip.departureDateTime
                      ? formatDateTimePT(trip.departureDateTime)
                      : trip.endDate
                      ? formatDatePT(trip.endDate)
                      : 'Data não definida'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Cota de Trocas */}
            <Card className="border-slate-200 bg-white p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Shuffle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cota de Trocas</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {trip.usedSwapsCount ?? 0} de {trip.allowedSwapsCount ?? 4} utilizadas
                  </span>
                </div>
              </div>
            </Card>

            {/* Status / Destino Principal */}
            <Card className="border-slate-200 bg-white p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Destino Principal</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {trip.destination || 'N/D'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Multi-destinos banner if present in preferences */}
          {Array.isArray(trip.preferences?.destinations) && trip.preferences.destinations.length > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#001F5B] shrink-0" />
                <span className="font-extrabold text-[#001F5B] uppercase text-[10px] tracking-wider">
                  Rota Multi-Destinos ({trip.preferences.destinations.length} cidades):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {trip.preferences.destinations.map((dest: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 font-semibold text-slate-800 text-[11px] shadow-2xs">
                    <MapPin className="w-3 h-3 text-[#FF6A00]" />
                    <span>{dest.name || dest.city}</span>
                    {dest.arrivalDate && (
                      <span className="text-[9px] text-slate-400 font-normal">
                        ({formatDatePT(dest.arrivalDate)}{dest.arrivalTime ? ` ${dest.arrivalTime}` : ''} → {dest.departureDate ? formatDatePT(dest.departureDate) : ''}{dest.departureTime ? ` ${dest.departureTime}` : ''})
                      </span>
                    )}
                    {idx < (trip.preferences?.destinations?.length ?? 0) - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-300 ml-1" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Split Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
          <div className="md:col-span-4 h-96 bg-slate-100 rounded-2xl" />
          <div className="md:col-span-8 h-96 bg-slate-100 rounded-2xl" />
        </div>
      ) : trip ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Owner & Participants & Collapsible Preferences (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Bloco de Hospedagem */}
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-[#001F5B]/5 flex items-center justify-between">
                <h3 className="font-extrabold text-[#001F5B] text-xs uppercase tracking-wider flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-[#001F5B]" />
                  Hospedagem
                </h3>
                <div className="flex items-center gap-2">
                  {trip.accommodation && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                      Confirmada
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAccommodation}
                    className="text-[10px] h-6 px-2 font-bold text-[#001F5B] border-[#001F5B]/20 hover:bg-[#001F5B]/10 cursor-pointer"
                  >
                    {trip.accommodation ? 'Editar' : 'Cadastrar'}
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                {trip.accommodation ? (
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{trip.accommodation.name}</div>
                    {trip.accommodation.address && (
                      <p className="text-[11px] text-slate-500 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{trip.accommodation.address}{trip.accommodation.neighborhood ? ` - ${trip.accommodation.neighborhood}` : ''}</span>
                      </p>
                    )}
                    {trip.accommodation.providerPlaceId && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded w-fit">
                        <Navigation className="w-3 h-3 text-emerald-500" />
                        Localização Validada via Google Places
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-in</span>
                        <span className="font-semibold text-slate-800">
                          {trip.accommodation.checkInDateTime
                            ? formatDateTimePT(trip.accommodation.checkInDateTime)
                            : trip.accommodation.checkInDate
                            ? formatDatePT(trip.accommodation.checkInDate)
                            : 'Não informado'}
                          {trip.accommodation.checkInTime ? ` às ${trip.accommodation.checkInTime}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-out</span>
                        <span className="font-semibold text-slate-800">
                          {trip.accommodation.checkOutDateTime
                            ? formatDateTimePT(trip.accommodation.checkOutDateTime)
                            : trip.accommodation.checkOutDate
                            ? formatDatePT(trip.accommodation.checkOutDate)
                            : 'Não informado'}
                          {trip.accommodation.checkOutTime ? ` às ${trip.accommodation.checkOutTime}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs space-y-2">
                    <Hotel className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <p className="font-medium text-slate-600">Sem hospedagem cadastrada</p>
                    <p className="text-[10px] text-slate-400">Cadastre a hospedagem para vincular ao Day 1 e calcular trajetos automaticamente.</p>
                    <Button
                      size="sm"
                      onClick={handleOpenAccommodation}
                      className="mt-2 text-xs bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold h-7 px-3 rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar Hospedagem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Details */}
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-[#001F5B]/5">
                <h3 className="font-extrabold text-[#001F5B] text-xs uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Proprietário da Viagem
                </h3>
              </div>
              <CardContent className="p-5 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#001F5B]/5 border border-[#001F5B]/10 flex items-center justify-center font-bold text-[#001F5B] uppercase text-sm shrink-0">
                  {trip.user?.fullName ? trip.user.fullName.substring(0, 2) : 'US'}
                </div>
                <div className="min-w-0">
                  <strong className="text-slate-800 text-xs font-bold block truncate">
                    {trip.user?.fullName || 'Usuário Sem Nome'}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                    {trip.user?.email}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Travel Preferences */}
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-[#001F5B] text-xs uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF6A00]" />
                  Preferências Salvas
                </h3>
              </div>
              <CardContent className="p-4">
                {trip.preferences ? (
                  <TravelPreferences preferences={trip.preferences} />
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Nenhuma preferência cadastrada.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Participants Management */}
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  Membros / Participantes
                </h3>
              </div>
              <CardContent className="p-4 space-y-4">
                {/* Invite Form */}
                <form onSubmit={handleInviteParticipant} className="flex gap-2">
                  <Input
                    required
                    type="email"
                    placeholder="Adicionar email do convidado..."
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    className="h-9 text-xs border-slate-200 rounded-lg flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isInviting}
                    className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-3 font-semibold rounded-lg shrink-0 cursor-pointer"
                  >
                    Convidar
                  </Button>
                </form>

                {/* List participants */}
                {isParticipantsLoading ? (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="h-9 bg-slate-50 rounded-lg" />
                    <div className="h-9 bg-slate-50 rounded-lg" />
                  </div>
                ) : participants.length === 0 ? (
                  <p className="text-center text-slate-400 italic text-[11px] py-2">
                    Nenhum membro compartilhado nesta viagem.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {participants.map((part) => (
                      <div
                        key={part.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50/75 border border-slate-100 rounded-xl text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <strong className="text-slate-800 text-xs block truncate leading-none">
                            {part.email}
                          </strong>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                              part.accepted 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-orange-50 text-orange-700 border border-orange-100'
                            }`}>
                              {part.accepted ? 'Aceitou' : 'Pendente'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              Adicionado em: {formatDatePT(part.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveParticipant(part.id, part.email)}
                          className="text-slate-400 hover:text-red-600 rounded-md h-7 w-7 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Day-by-Day timeline itinerary builder (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 pl-1">
              <Map className="w-5 h-5 text-[#FF6A00]" />
              Cronograma da Viagem ({trip.days?.length || 0} dias)
            </h2>

            {(!trip.days || trip.days.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl min-h-[300px]">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-950 mb-1">Nenhum Dia Criado</h3>
                <p className="text-slate-500 text-xs max-w-sm mb-6">
                  Comece a estruturar a viagem criando os dias do roteiro.
                </p>
                <Button
                  onClick={() => handleOpenDay()}
                  className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Criar Dia 1
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {trip.days.map((day) => (
                  <Card key={day.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                    
                    {/* Day Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/10 flex items-center justify-center font-extrabold text-sm shrink-0">
                          {day.dayNumber}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {day.title || `Dia ${day.dayNumber}`}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {day.date ? formatDatePT(day.date, true) : 'Data não definida'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                        <div className="flex gap-1 border-l border-slate-250 pl-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDay(day)}
                            className="text-slate-400 hover:text-[#001F5B] cursor-pointer h-7 w-7 rounded-md"
                            title="Editar Dia"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDay(day.id, day.dayNumber)}
                            className="text-slate-400 hover:text-red-600 cursor-pointer h-7 w-7 rounded-md"
                            title="Excluir Dia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Day Description */}
                    {day.description && (
                      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    )}

                    <CardContent className="p-5 space-y-6">
                      
                      {/* Itinerary Timeline */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            Roteiro / Linha do Tempo ({day.items?.length || 0})
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenItem(day.id)}
                            className="text-xs font-bold text-[#001F5B] hover:text-[#FF6A00] hover:bg-slate-50 cursor-pointer h-7 px-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Novo Item
                          </Button>
                        </div>

                        {(!day.items || day.items.length === 0) ? (
                          <p className="text-center text-slate-400 italic text-[11px] py-4">
                            Nenhum item adicionado neste dia de roteiro.
                          </p>
                        ) : (
                          // Vertical timeline alignment
                          <div className="relative border-l-2 border-slate-100 pl-4.5 ml-2.5 space-y-6 pt-2">
                            {day.items.map((item) => (
                              <div key={item.id} className="relative group">
                                {/* Timeline bullet */}
                                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#FF6A00] flex items-center justify-center shrink-0 group-hover:bg-[#FF6A00] transition-colors" />

                                <div className="p-4 bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl transition-all duration-150 relative flex flex-col sm:flex-row justify-between gap-4">
                                  
                                  {/* Item Details */}
                                  <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-start flex-wrap gap-2">
                                      {item.timeLabel && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase">
                                          <Clock className="w-3 h-3 text-slate-500" />
                                          {item.timeLabel}
                                        </span>
                                      )}
                                      
                                      <span className="text-[9px] font-extrabold text-[#001F5B] bg-[#001F5B]/5 border border-[#001F5B]/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        {translateCategory(item.category)}
                                      </span>

                                      {item.period && (
                                        <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-slate-200 text-slate-600 uppercase">
                                          {item.period}
                                        </span>
                                      )}

                                      {renderTicketBadge(item.ticketStatus)}
                                    </div>

                                    {/* Transit connector when available from backend */}
                                    {renderTransitInfo(item)}

                                    <h6 className="font-bold text-slate-900 text-xs leading-snug">
                                      {item.title}
                                    </h6>

                                    {item.description && (
                                      <p className="text-[11px] text-slate-500 leading-normal">
                                        {item.description}
                                      </p>
                                    )}

                                    {/* Location details & Maps links */}
                                    {item.location && (
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate" title={item.location}>
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        {item.location}
                                      </span>
                                    )}

                                    {/* Place Enrichment badge information */}
                                    {item.providerPlaceId && (
                                      <div className="mt-1 flex flex-wrap gap-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 p-1.5 rounded-lg w-fit">
                                        <Navigation className="w-3 h-3 text-emerald-500" />
                                        Referência de localização
                                      </div>
                                    )}

                                    {item.notes && (
                                      <div className="mt-1.5 p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[10px] text-slate-700 leading-relaxed font-medium">
                                        <div className="flex items-center gap-1 font-bold text-amber-800 mb-1">
                                          <Info className="w-3 h-3 text-amber-600 shrink-0" />
                                          Orientações Práticas, Deslocamento & Alternativas
                                        </div>
                                        <p className="whitespace-pre-line text-slate-600">{item.notes}</p>
                                      </div>
                                    )}

                                    {/* Extra quick metadata info & Duration Stepper */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold bg-slate-100/80 border border-slate-200/70 px-2 py-0.5 rounded-md">
                                        <span>Duração: {item.duration || 60}m</span>
                                        <button
                                          type="button"
                                          disabled={updatingDurationItemId === item.id}
                                          onClick={() => handleQuickDurationChange(item, -15)}
                                          className="w-4 h-4 flex items-center justify-center rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold cursor-pointer disabled:opacity-50"
                                          title="Diminuir 15 minutos (recalcula horários subsequentes)"
                                        >
                                          -
                                        </button>
                                        <button
                                          type="button"
                                          disabled={updatingDurationItemId === item.id}
                                          onClick={() => handleQuickDurationChange(item, 15)}
                                          className="w-4 h-4 flex items-center justify-center rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold cursor-pointer disabled:opacity-50"
                                          title="Aumentar 15 minutos (recalcula horários subsequentes)"
                                        >
                                          +
                                        </button>
                                      </div>
                                      {item.cost !== undefined && item.cost !== null && (
                                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                          Estimativa: {formatPrice(item.cost, item.currency || 'EUR')}
                                        </span>
                                      )}
                                      {item.externalLink && (
                                        <a href={item.externalLink} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 font-bold hover:underline flex items-center gap-0.5">
                                          Link Externo <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right side operations */}
                                  <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2.5 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                                    {/* Reorder Arrows */}
                                    <div className="flex items-center gap-0.5 shrink-0 bg-slate-100 border border-slate-200/55 rounded-lg p-0.5">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleReorder(item.id, item.order, 'UP')}
                                        className="h-6 w-6 rounded-md hover:bg-white text-slate-400 hover:text-slate-800 cursor-pointer"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </Button>
                                      <span className="text-[10px] font-extrabold text-slate-500 w-5 text-center">
                                        {item.order}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleReorder(item.id, item.order, 'DOWN')}
                                        className="h-6 w-6 rounded-md hover:bg-white text-slate-400 hover:text-slate-800 cursor-pointer"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-1 shrink-0 mt-auto justify-end">
                                      {/* Substituir (Quota Swap) */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenAlternatives(item)}
                                        className="text-[10px] font-bold text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer h-7 px-2 flex items-center gap-1"
                                        title="Substituir item usando a cota de trocas"
                                      >
                                        <Shuffle className="w-3 h-3 text-purple-600" />
                                        Substituir
                                      </Button>

                                      {/* Recomendações de Refeição */}
                                      {['RESTAURANT', 'CAFE', 'BAR'].includes(item.category) && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenMealRecommendations(day.id, item)}
                                          className="text-[10px] font-bold text-amber-700 border-amber-200 hover:bg-amber-50 cursor-pointer h-7 px-2 flex items-center gap-1"
                                          title="Ver restaurantes recomendados da base/Places e fixar"
                                        >
                                          <Utensils className="w-3 h-3 text-amber-600" />
                                          Refeições
                                        </Button>
                                      )}

                                      {/* Detalhes Verificados */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenVerifiedDetails(item)}
                                        className="text-slate-500 hover:text-[#001F5B] hover:bg-slate-100 cursor-pointer h-7 w-7 rounded-md"
                                        title="Ver dados verificados do Google Places"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>

                                      {/* Vincular Place */}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenPlaceSearch(item.id)}
                                        className="text-[10px] font-bold text-[#001F5B] border-slate-200 hover:bg-[#001F5B]/5 cursor-pointer h-7 px-2"
                                        title="Vincular dados de localização reais do Google Places"
                                      >
                                        Google Place
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenItem(day.id, item)}
                                        className="text-slate-400 hover:text-[#001F5B] cursor-pointer h-7 w-7 rounded-md"
                                        title="Editar Item"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteItem(item.id, item.title)}
                                        className="text-slate-400 hover:text-red-600 cursor-pointer h-7 w-7 rounded-md"
                                        title="Excluir Item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl min-h-[400px]">
          <Compass className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
          <h3 className="text-base font-bold text-slate-900">Roteiro não encontrado</h3>
        </div>
      )}

      {/* Drawer: Create / Edit Day */}
      <Sheet open={dayDrawerOpen} onOpenChange={setDayDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveDay} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {editingDay ? 'Editar Dia de Viagem' : 'Adicionar Dia de Viagem'}
              </h2>
              <p className="text-white/70 text-xs mt-1">Configure o dia no cronograma do viajante.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número do Dia *</label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Math.max(1, Number(e.target.value)))}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Dia</label>
                <Input
                  type="text"
                  placeholder="Ex: Chegada e Check-in"
                  value={dayTitle}
                  onChange={(e) => setDayTitle(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Calendário</label>
                <Input
                  type="date"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição do Dia</label>
                <textarea
                  rows={4}
                  placeholder="Ex: Dia dedicado a se locomover da estação até o hotel e explorar o centro histórico..."
                  value={dayDescription}
                  onChange={(e) => setDayDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDayDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer"
              >
                {isSaving ? 'Salvando...' : editingDay ? 'Salvar Alterações' : 'Criar Dia'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Drawer: Create / Edit Itinerary Item */}
      <Sheet open={itemDrawerOpen} onOpenChange={setItemDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveItem} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {editingItem ? 'Editar Item do Itinerário' : 'Adicionar Item ao Itinerário'}
              </h2>
              <p className="text-white/70 text-xs mt-1">Configure o horário, nome e detalhes da atividade diária.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Atividade *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Café no Angelina"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoria *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as ItineraryCategory)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                  >
                    <option value="TOURIST_ATTRACTION">Atração Turística</option>
                    <option value="MUSEUM">Museu</option>
                    <option value="RESTAURANT">Restaurante</option>
                    <option value="CAFE">Café</option>
                    <option value="BAR">Bar</option>
                    <option value="BEACH">Praia</option>
                    <option value="PARK">Parque / Natureza</option>
                    <option value="SHOPPING">Compras</option>
                    <option value="EXPERIENCE">Experiência</option>
                    <option value="TRANSPORT">Transporte</option>
                    <option value="EVENT">Evento</option>
                    <option value="NIGHTLIFE">Vida Noturna</option>
                    <option value="FREE_ACTIVITY">Atividade Livre</option>
                    <option value="PAID_ACTIVITY">Atividade Paga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário (Ex: 09:00)</label>
                  <Input
                    type="text"
                    placeholder="Ex: 09:00"
                    value={itemTimeLabel}
                    onChange={(e) => setItemTimeLabel(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Período (Ex: Manhã)</label>
                  <Input
                    type="text"
                    placeholder="Ex: Manhã, Tarde, Noite"
                    value={itemPeriod}
                    onChange={(e) => setItemPeriod(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Estimado</label>
                  <Input
                    type="number"
                    placeholder="Ex: 45"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Moeda</label>
                  <Input
                    type="text"
                    placeholder="BRL"
                    value={itemCurrency}
                    onChange={(e) => setItemCurrency(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duração (Minutos)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 60"
                    value={itemDuration}
                    onChange={(e) => setItemDuration(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordem de Exibição *</label>
                  <Input
                    required
                    type="number"
                    value={itemOrder}
                    onChange={(e) => setItemOrder(Number(e.target.value))}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Local / Endereço</label>
                <Input
                  type="text"
                  placeholder="Ex: Av. Champs-Élysées, 75008 Paris"
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link Externo (Web Site)</label>
                <Input
                  type="text"
                  placeholder="Ex: https://google.com"
                  value={itemExternalLink}
                  onChange={(e) => setItemExternalLink(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição da Atividade</label>
                <textarea
                  rows={3}
                  placeholder="Resuma os detalhes e o que fazer nesta parada do roteiro..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notas Internas</label>
                <textarea
                  rows={3}
                  placeholder="Anotações internas sobre ingressos, reservas ou horários operacionais..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer"
              >
                {isSaving ? 'Salvando...' : editingItem ? 'Salvar Item' : 'Criar Item'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Drawer: Google Places Link Search & Enrichment */}
      <Sheet open={placeDrawerOpen} onOpenChange={setPlaceDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">Vincular Google Place</h2>
              <p className="text-white/70 text-xs mt-1">Busque localizações reais no banco do Google Places para enriquecer as coordenadas e endereços do item.</p>
            </div>

            {/* Places search input */}
            <div className="p-6 border-b border-slate-100 shrink-0">
              <form onSubmit={handleSearchPlacesClick} className="flex gap-2">
                <Input
                  required
                  type="text"
                  placeholder="Nome do local (Ex: Eiffel Tower Paris)..."
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  className="h-10 text-xs border-slate-200 rounded-lg flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSearchingPlaces}
                  className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-4 h-10 text-xs cursor-pointer flex items-center gap-1"
                >
                  {isSearchingPlaces ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
                </Button>
              </form>
            </div>

            {/* Results listing */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isSearchingPlaces ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-16 bg-slate-50 rounded-xl" />
                  <div className="h-16 bg-slate-50 rounded-xl" />
                  <div className="h-16 bg-slate-50 rounded-xl" />
                </div>
              ) : placeSearchResults.length === 0 ? (
                <p className="text-center text-slate-400 italic text-xs py-8">
                  Digite e faça uma busca para ver as localizações correspondentes do Google.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {placeSearchResults.map((place) => (
                    <div
                      key={place.providerPlaceId}
                      className="p-4 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[120px] bg-slate-50/50 hover:bg-white hover:border-[#FF6A00]/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <strong className="text-slate-900 text-xs font-bold block leading-tight">
                          {place.name}
                        </strong>
                        <span className="text-[10px] text-slate-400 leading-normal block">
                          {place.formattedAddress}
                        </span>
                        
                        {place.rating !== undefined && (
                          <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded w-fit block mt-1">
                            ★ {place.rating} ({place.userRatingsTotal || 0} avaliações)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          ID: {place.providerPlaceId.substring(0, 12)}...
                        </span>
                        <Button
                          disabled={isSaving}
                          onClick={() => handleEnrichItemSubmit(place.providerPlaceId)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7.5 rounded-lg text-[10px] px-3.5 cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          Vincular Local
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlaceDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Drawer: Hospedagem (Create / Edit / Delete) */}
      <Sheet open={accommodationDrawerOpen} onOpenChange={setAccommodationDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveAccommodation} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <Hotel className="w-5 h-5 text-amber-400" />
                {trip?.accommodation ? 'Gerenciar Hospedagem' : 'Cadastrar Hospedagem'}
              </h2>
              <p className="text-white/70 text-xs mt-1">
                Configure a hospedagem oficial da viagem. Os deslocamentos do Dia 1 serão calculados a partir dela.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Google Places search helper for Accommodation */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-[#001F5B] uppercase tracking-wider block">
                  Buscar Hotel no Google Places (Opcional)
                </span>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ex: Hotel Bernini Rome..."
                    value={accSearchQuery}
                    onChange={(e) => setAccSearchQuery(e.target.value)}
                    className="h-9 text-xs border-slate-200 rounded-lg flex-1 bg-white"
                  />
                  <Button
                    type="button"
                    onClick={handleSearchAccPlaces}
                    disabled={isSearchingAccPlaces}
                    className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-3 h-9 text-xs cursor-pointer"
                  >
                    {isSearchingAccPlaces ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>

                {accSearchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2 pt-2 border-t border-slate-200/60">
                    {accSearchResults.map((place) => (
                      <div
                        key={place.providerPlaceId}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-[#FF6A00]/50 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <strong className="text-slate-800 text-xs block truncate">{place.name}</strong>
                          <span className="text-[10px] text-slate-400 block truncate">{place.formattedAddress}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSelectAccPlace(place)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-6 px-2 rounded-md shrink-0 cursor-pointer"
                        >
                          Usar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Hotel / Acomodação *</label>
                <Input
                  required
                  type="text"
                  placeholder="Ex: Hotel Nazionale"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço Completo</label>
                <Input
                  type="text"
                  placeholder="Ex: Piazza di Monte Citorio, 131, 00186 Roma RM"
                  value={accAddress}
                  onChange={(e) => setAccAddress(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bairro</label>
                  <Input
                    type="text"
                    placeholder="Ex: Centro Storico"
                    value={accNeighborhood}
                    onChange={(e) => setAccNeighborhood(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CEP / Código Postal</label>
                  <Input
                    type="text"
                    placeholder="Ex: 00186"
                    value={accZipCode}
                    onChange={(e) => setAccZipCode(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Check-in</label>
                  <Input
                    type="date"
                    value={accCheckInDate}
                    onChange={(e) => setAccCheckInDate(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário Check-in</label>
                  <Input
                    type="time"
                    value={accCheckInTime}
                    onChange={(e) => setAccCheckInTime(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Check-out</label>
                  <Input
                    type="date"
                    value={accCheckOutDate}
                    onChange={(e) => setAccCheckOutDate(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário Check-out</label>
                  <Input
                    type="time"
                    value={accCheckOutTime}
                    onChange={(e) => setAccCheckOutTime(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {accProviderPlaceId && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    Place ID Vinculado
                  </div>
                  <div className="text-slate-600 truncate">ID: {accProviderPlaceId}</div>
                  {accLatitude && accLongitude && (
                    <div className="text-slate-500">Coordenadas: {accLatitude.toFixed(5)}, {accLongitude.toFixed(5)}</div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              {trip?.accommodation ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingAcc}
                  onClick={handleDeleteAccommodation}
                  className="border-red-200 hover:bg-red-50 text-red-600 font-semibold cursor-pointer rounded-lg px-3 h-10 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAccommodationDrawerOpen(false)}
                  className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSavingAcc}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer shadow-sm"
              >
                {isSavingAcc ? 'Salvando...' : 'Salvar Hospedagem'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Drawer: Modal de Alternativas e Substituição com Cota */}
      <Sheet open={alternativesModalOpen} onOpenChange={setAlternativesModalOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-purple-400" />
                Substituir Atração
              </h2>
              <p className="text-white/70 text-xs mt-1">
                Substitua &quot;{selectedItemForAlternatives?.title}&quot; por uma opção verificada da base ou Google Places.
              </p>
            </div>

            {/* Quota Banner */}
            {alternativesData?.quota && (
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {alternativesData.quota.remainingSwaps}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cota de Trocas</span>
                      <strong className="text-xs text-slate-900 font-bold block">
                        {alternativesData.quota.usedSwapsCount} de {alternativesData.quota.allowedSwapsCount} utilizadas ({alternativesData.quota.remainingSwaps} restantes)
                      </strong>
                    </div>
                  </div>
                  {alternativesData.quota.remainingSwaps === 1 && (
                    <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                      Última Troca
                    </span>
                  )}
                  {alternativesData.quota.remainingSwaps <= 0 && (
                    <span className="text-[9px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                      Cota Esgotada
                    </span>
                  )}
                </div>

                {alternativesData.quota.remainingSwaps === 1 && (
                  <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Atenção: Esta é a sua última substituição disponível nesta viagem!</span>
                  </div>
                )}

                {alternativesData.quota.remainingSwaps <= 0 && (
                  <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-800 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Você atingiu o limite de trocas para esta viagem. Novas substituições estão bloqueadas.</span>
                  </div>
                )}
              </div>
            )}

            {/* Alternatives List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingAlternatives ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                </div>
              ) : !alternativesData || alternativesData.alternatives.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Shuffle className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma alternativa disponível</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Não encontramos atrações substitutas cadastradas na base ou no Google Places para esta categoria nesta localidade.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {alternativesData.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-white hover:border-purple-300 transition-all duration-150 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-xs font-extrabold text-slate-900 block leading-tight">
                            {alt.title}
                          </strong>
                          {alt.location && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {alt.location}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          alt.source === 'BASE_TRIP' 
                            ? 'bg-blue-50 text-[#001F5B] border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {alt.source === 'BASE_TRIP' ? 'Base Curada' : 'Google Places'}
                        </span>
                      </div>

                      {alt.description && (
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {alt.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        {alt.rating !== undefined && (
                          <span className="font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            ★ {alt.rating}
                          </span>
                        )}
                        {alt.duration && (
                          <span className="text-slate-500 font-medium">
                            {alt.duration} min
                          </span>
                        )}
                        {alt.cost !== undefined && alt.cost !== null && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {formatPrice(alt.cost, alt.currency || 'EUR')}
                          </span>
                        )}
                        {renderTicketBadge(alt.ticketStatus)}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Button
                          disabled={isSubstituting || (alternativesData.quota.remainingSwaps <= 0)}
                          onClick={() => handleExecuteSubstitute(alt)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs h-8 px-4 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          Substituir por este
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAlternativesModalOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Drawer: Modal de Recomendações de Refeições */}
      <Sheet open={mealModalOpen} onOpenChange={setMealModalOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#FF6A00]" />
                Recomendações Gastronômicas
              </h2>
              <p className="text-white/70 text-xs mt-1">
                Sugestões da curadoria e Google Places para &quot;{selectedItemForMeal?.title}&quot;.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMealRecs ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                </div>
              ) : mealRecommendations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma recomendação encontrada</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Não encontramos restaurantes recomendados para este período nesta cidade.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {mealRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-white hover:border-[#FF6A00]/50 transition-all duration-150 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-xs font-extrabold text-slate-900 block leading-tight">
                            {rec.title}
                          </strong>
                          {rec.location && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {rec.location}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          rec.source === 'BASE_TRIP' 
                            ? 'bg-blue-50 text-[#001F5B] border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {rec.source === 'BASE_TRIP' ? 'Base Curada' : 'Google Places'}
                        </span>
                      </div>

                      {rec.description && (
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {rec.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        {rec.rating !== undefined && (
                          <span className="font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            ★ {rec.rating} {rec.userRatingsTotal ? `(${rec.userRatingsTotal})` : ''}
                          </span>
                        )}
                        {rec.priceLevel && (
                          <span className="text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                            {rec.priceLevel}
                          </span>
                        )}
                        {rec.cost !== undefined && rec.cost !== null && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {formatPrice(rec.cost, rec.currency || 'EUR')}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Button
                          disabled={isPinningMeal}
                          onClick={() => handleExecutePinMeal(rec)}
                          className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-bold text-xs h-8 px-4 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          Fixar no Roteiro
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMealModalOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Drawer: Detalhes Verificados da Atração */}
      <Sheet open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Inspeção de Dados Verificados
                </span>
              </div>
              <h2 className="font-extrabold text-base text-white">
                {selectedItemDetails?.title || 'Detalhes do Item'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {selectedItemDetails?.category && (
                  <span className="text-[9px] font-extrabold text-white bg-white/20 px-2 py-0.5 rounded uppercase">
                    {translateCategory(selectedItemDetails.category)}
                  </span>
                )}
                {renderTicketBadge(selectedItemDetails?.ticketStatus)}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingDetails ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-28 bg-slate-50 rounded-2xl" />
                  <div className="h-20 bg-slate-50 rounded-2xl" />
                </div>
              ) : selectedItemDetails ? (
                <>
                  {/* Bloco Google Places Verificado */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#001F5B] flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        Google Places Verificado
                      </span>
                      {selectedItemDetails.verifiedDetails ? (
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Verificado
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                          Não Vinculado
                        </span>
                      )}
                    </div>

                    {selectedItemDetails.verifiedDetails ? (
                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-900 block text-sm font-bold">
                            {selectedItemDetails.verifiedDetails.name}
                          </strong>
                          {selectedItemDetails.verifiedDetails.formattedAddress && (
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{selectedItemDetails.verifiedDetails.formattedAddress}</span>
                            </p>
                          )}
                        </div>

                        {selectedItemDetails.verifiedDetails.rating !== undefined && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                              ★ {selectedItemDetails.verifiedDetails.rating}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({selectedItemDetails.verifiedDetails.userRatingsTotal || 0} avaliações reais)
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-1.5 pt-2 text-[11px]">
                          {selectedItemDetails.verifiedDetails.internationalPhoneNumber && (
                            <div className="text-slate-600">
                              <span className="font-bold text-slate-400 uppercase text-[9px] block">Telefone:</span>
                              {selectedItemDetails.verifiedDetails.internationalPhoneNumber}
                            </div>
                          )}
                          {selectedItemDetails.verifiedDetails.websiteUri && (
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[9px] block">Site Oficial:</span>
                              <a
                                href={selectedItemDetails.verifiedDetails.websiteUri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-semibold hover:underline flex items-center gap-1 break-all"
                              >
                                {selectedItemDetails.verifiedDetails.websiteUri}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                          {selectedItemDetails.verifiedDetails.googleMapsUri && (
                            <div className="pt-1">
                              <a
                                href={selectedItemDetails.verifiedDetails.googleMapsUri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100/70"
                              >
                                Ver no Google Maps
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-2">
                        Este item ainda não possui Place ID verificado no Google Places. Clique no botão &quot;Google Place&quot; no card para vincular.
                      </p>
                    )}
                  </div>

                  {/* Bloco Deslocamento */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#001F5B] block border-b border-slate-200/80 pb-2">
                      Métricas de Deslocamento
                    </span>
                    {selectedItemDetails.transitDistanceMeters != null || selectedItemDetails.transitDurationMinutes != null ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Modo de trânsito:</span>
                          <span className="font-bold text-slate-800">{selectedItemDetails.transitMode || 'WALKING'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Duração estimada:</span>
                          <span className="font-bold text-slate-800">{selectedItemDetails.transitDurationMinutes ?? 'N/D'} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Distância aproximada:</span>
                          <span className="font-bold text-slate-800">{formatDistance(selectedItemDetails.transitDistanceMeters)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Deslocamento não calculado para este item (primeiro item sem hospedagem ou coordenadas pendentes).
                      </p>
                    )}
                  </div>

                  {/* Bloco Descrição e Notas */}
                  <div className="space-y-3">
                    {selectedItemDetails.description && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Descrição</span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                          {selectedItemDetails.description}
                        </p>
                      </div>
                    )}
                    {selectedItemDetails.notes && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Orientações e Notas Práticas</span>
                        <div className="text-xs text-slate-700 leading-relaxed bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl whitespace-pre-line">
                          {selectedItemDetails.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailsDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
