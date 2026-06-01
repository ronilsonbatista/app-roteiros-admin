'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getBaseTripDetails,
  createBaseTripDay,
  updateBaseTripDay,
  deleteBaseTripDay,
  createBaseAttraction,
  updateBaseAttraction,
  deleteBaseAttraction,
  createBaseRestaurant,
  updateBaseRestaurant,
  deleteBaseRestaurant,
  BaseTrip,
  BaseTripDay,
  BaseAttraction,
  BaseRestaurant,
  ItineraryCategory,
  BaseTripStatus,
  BaseTripVisibility
} from '@/services/base-trips.service';

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

import {
  ArrowLeft,
  RotateCw,
  Plus,
  Plane,
  MapPin,
  Calendar,
  Crown,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Compass,
  Globe,
  Coins,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Map,
  FileText,
  Utensils,
  Car,
  DollarSign,
  Smile,
  Accessibility,
  HeartHandshake
} from 'lucide-react';

export default function BaseTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<BaseTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal/Drawer controls
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [attractionDrawerOpen, setAttractionDrawerOpen] = useState(false);
  const [restaurantDrawerOpen, setRestaurantDrawerOpen] = useState(false);

  // Target IDs for nested creations
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<BaseTripDay | null>(null);
  const [editingAttraction, setEditingAttraction] = useState<BaseAttraction | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<BaseRestaurant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for Day
  const [dayNumber, setDayNumber] = useState(1);
  const [dayTitle, setDayTitle] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const [dayRegion, setDayRegion] = useState('');
  const [dayTransport, setDayTransport] = useState('');
  const [dayEstimatedCost, setDayEstimatedCost] = useState('');

  // Form states for Attraction
  const [attractionName, setAttractionName] = useState('');
  const [attractionCategory, setAttractionCategory] = useState<ItineraryCategory>('TOURIST_ATTRACTION');
  const [attractionShortDesc, setAttractionShortDesc] = useState('');
  const [attractionFullDesc, setAttractionFullDesc] = useState('');
  const [attractionDuration, setAttractionDuration] = useState('');
  const [attractionCost, setAttractionCost] = useState('');
  const [attractionCurrency, setAttractionCurrency] = useState('EUR');
  const [attractionAddress, setAttractionAddress] = useState('');
  const [attractionMapsLink, setAttractionMapsLink] = useState('');
  const [attractionRequiresTicket, setAttractionRequiresTicket] = useState(false);
  const [attractionTicketLink, setAttractionTicketLink] = useState('');
  const [attractionRequiresReservation, setAttractionRequiresReservation] = useState(false);
  const [attractionReservationLink, setAttractionReservationLink] = useState('');
  const [attractionGoodForKids, setAttractionGoodForKids] = useState(false);
  const [attractionGoodForElders, setAttractionGoodForElders] = useState(false);
  const [attractionAccessibility, setAttractionAccessibility] = useState('');
  const [attractionObservations, setAttractionObservations] = useState('');
  const [attractionNotes, setAttractionNotes] = useState('');
  const [attractionOrder, setAttractionOrder] = useState(1);
  const [attractionPeriod, setAttractionPeriod] = useState('');

  // Form states for Restaurant
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantCuisine, setRestaurantCuisine] = useState('');
  const [restaurantPriceRange, setRestaurantPriceRange] = useState('');
  const [restaurantPriceLevel, setRestaurantPriceLevel] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantMapsLink, setRestaurantMapsLink] = useState('');
  const [restaurantRating, setRestaurantRating] = useState('');
  const [restaurantHours, setRestaurantHours] = useState('');
  const [restaurantReservationLink, setRestaurantReservationLink] = useState('');
  const [restaurantDish, setRestaurantDish] = useState('');
  const [restaurantNotes, setRestaurantNotes] = useState('');
  const [restaurantOrder, setRestaurantOrder] = useState(1);

  // Fetch full details of the base trip
  const fetchTripDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBaseTripDetails(tripId);
      setTrip(data);
      
      // Auto-compute next day number
      const nextDay = data.days && data.days.length > 0 
        ? Math.max(...data.days.map(d => d.dayNumber)) + 1 
        : 1;
      setDayNumber(nextDay);
    } catch (err: any) {
      console.error('Error fetching base trip details:', err);
      setError('Roteiro base não encontrado ou erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Open Day Form
  const handleOpenDay = (item: BaseTripDay | null = null) => {
    setEditingDay(item);
    if (item) {
      setDayNumber(item.dayNumber);
      setDayTitle(item.title || '');
      setDayDescription(item.description || '');
      setDayRegion(item.region || '');
      setDayTransport(item.suggestedTransport || '');
      setDayEstimatedCost(item.estimatedCost ? item.estimatedCost.toString() : '');
    } else {
      const nextDay = trip?.days && trip.days.length > 0 
        ? Math.max(...trip.days.map(d => d.dayNumber)) + 1 
        : 1;
      setDayNumber(nextDay);
      setDayTitle('');
      setDayDescription('');
      setDayRegion('');
      setDayTransport('');
      setDayEstimatedCost('');
    }
    setDayDrawerOpen(true);
  };

  // Handle Day Creation or Update
  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      dayNumber: Number(dayNumber),
      title: dayTitle.trim() || undefined,
      description: dayDescription.trim() || undefined,
      region: dayRegion.trim() || undefined,
      suggestedTransport: dayTransport.trim() || undefined,
      estimatedCost: dayEstimatedCost.trim() ? Number(dayEstimatedCost) : undefined
    };
    try {
      if (editingDay) {
        await updateBaseTripDay(editingDay.id, payload);
        alert('Dia atualizado com sucesso.');
      } else {
        await createBaseTripDay(tripId, payload);
        alert('Dia criado com sucesso.');
      }
      setDayDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error saving day:', err);
      alert('Erro ao salvar o dia.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Day Deletion
  const handleDeleteDay = async (id: string, number: number) => {
    if (!window.confirm(`Deseja realmente excluir o Dia ${number}? Todas as atrações e restaurantes deste dia serão removidos.`)) return;
    try {
      await deleteBaseTripDay(id);
      alert('Dia excluído com sucesso.');
      fetchTripDetails();
    } catch (err) {
      console.error('Error deleting day:', err);
      alert('Erro ao excluir o dia.');
    }
  };

  // Open Attraction Form
  const handleOpenAttraction = (dayId: string, item: BaseAttraction | null = null) => {
    setActiveDayId(dayId);
    setEditingAttraction(item);
    if (item) {
      setAttractionName(item.name);
      setAttractionCategory(item.category);
      setAttractionShortDesc(item.shortDescription || '');
      setAttractionFullDesc(item.fullDescription || '');
      setAttractionDuration(item.duration ? item.duration.toString() : '');
      setAttractionCost(item.cost ? item.cost.toString() : '');
      setAttractionCurrency(item.currency || 'EUR');
      setAttractionAddress(item.address || '');
      setAttractionMapsLink(item.googleMapsLink || '');
      setAttractionRequiresTicket(item.requiresTicket);
      setAttractionTicketLink(item.ticketLink || '');
      setAttractionRequiresReservation(item.requiresReservation);
      setAttractionReservationLink(item.reservationLink || '');
      setAttractionGoodForKids(item.goodForKids);
      setAttractionGoodForElders(item.goodForElders);
      setAttractionAccessibility(item.accessibility || '');
      setAttractionObservations(item.observations || '');
      setAttractionNotes(item.notes || '');
      setAttractionOrder(item.order);
      setAttractionPeriod(item.period || '');
    } else {
      setAttractionName('');
      setAttractionCategory('TOURIST_ATTRACTION');
      setAttractionShortDesc('');
      setAttractionFullDesc('');
      setAttractionDuration('');
      setAttractionCost('');
      setAttractionCurrency('EUR');
      setAttractionAddress('');
      setAttractionMapsLink('');
      setAttractionRequiresTicket(false);
      setAttractionTicketLink('');
      setAttractionRequiresReservation(false);
      setAttractionReservationLink('');
      setAttractionGoodForKids(false);
      setAttractionGoodForElders(false);
      setAttractionAccessibility('');
      setAttractionObservations('');
      setAttractionNotes('');
      setAttractionPeriod('');
      // Autocomplete next order
      const day = trip?.days?.find(d => d.id === dayId);
      const nextOrder = day?.attractions && day.attractions.length > 0
        ? Math.max(...day.attractions.map(a => a.order)) + 1
        : 1;
      setAttractionOrder(nextOrder);
    }
    setAttractionDrawerOpen(true);
  };

  // Save Attraction (create or edit)
  const handleSaveAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attractionName.trim()) {
      alert('Nome da atração é obrigatório.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: attractionName,
      category: attractionCategory,
      shortDescription: attractionShortDesc.trim() || undefined,
      fullDescription: attractionFullDesc.trim() || undefined,
      duration: attractionDuration.trim() ? Number(attractionDuration) : undefined,
      cost: attractionCost.trim() ? Number(attractionCost) : undefined,
      currency: attractionCurrency || undefined,
      address: attractionAddress.trim() || undefined,
      googleMapsLink: attractionMapsLink.trim() || undefined,
      requiresTicket: attractionRequiresTicket,
      ticketLink: attractionTicketLink.trim() || undefined,
      requiresReservation: attractionRequiresReservation,
      reservationLink: attractionReservationLink.trim() || undefined,
      goodForKids: attractionGoodForKids,
      goodForElders: attractionGoodForElders,
      accessibility: attractionAccessibility.trim() || undefined,
      observations: attractionObservations.trim() || undefined,
      notes: attractionNotes.trim() || undefined,
      order: Number(attractionOrder),
      period: attractionPeriod.trim() || undefined
    };

    try {
      if (editingAttraction) {
        await updateBaseAttraction(editingAttraction.id, payload);
        alert('Atração atualizada com sucesso.');
      } else if (activeDayId) {
        await createBaseAttraction(activeDayId, payload);
        alert('Atração criada com sucesso.');
      }
      setAttractionDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error saving attraction:', err);
      alert('Erro ao salvar a atração.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Attraction
  const handleDeleteAttraction = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover a atração "${name}"?`)) return;
    try {
      await deleteBaseAttraction(id);
      alert('Atração removida.');
      fetchTripDetails();
    } catch (err) {
      console.error('Error deleting attraction:', err);
      alert('Erro ao remover atração.');
    }
  };

  // Open Restaurant Form
  const handleOpenRestaurant = (dayId: string, item: BaseRestaurant | null = null) => {
    setActiveDayId(dayId);
    setEditingRestaurant(item);
    if (item) {
      setRestaurantName(item.name);
      setRestaurantCuisine(item.cuisineType || '');
      setRestaurantPriceRange(item.priceRange || '');
      setRestaurantPriceLevel(item.priceLevel ? item.priceLevel.toString() : '');
      setRestaurantAddress(item.address || '');
      setRestaurantMapsLink(item.googleMapsLink || '');
      setRestaurantRating(item.rating ? item.rating.toString() : '');
      setRestaurantHours(item.openingHours || '');
      setRestaurantReservationLink(item.reservationLink || '');
      setRestaurantDish(item.recommendedDish || '');
      setRestaurantNotes(item.notes || '');
      setRestaurantOrder(item.order);
    } else {
      setRestaurantName('');
      setRestaurantCuisine('');
      setRestaurantPriceRange('');
      setRestaurantPriceLevel('');
      setRestaurantAddress('');
      setRestaurantMapsLink('');
      setRestaurantRating('');
      setRestaurantHours('');
      setRestaurantReservationLink('');
      setRestaurantDish('');
      setRestaurantNotes('');
      // Autocomplete next order
      const day = trip?.days?.find(d => d.id === dayId);
      const nextOrder = day?.restaurants && day.restaurants.length > 0
        ? Math.max(...day.restaurants.map(r => r.order)) + 1
        : 1;
      setRestaurantOrder(nextOrder);
    }
    setRestaurantDrawerOpen(true);
  };

  // Save Restaurant (create or edit)
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      alert('Nome do restaurante é obrigatório.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: restaurantName,
      cuisineType: restaurantCuisine.trim() || undefined,
      priceRange: restaurantPriceRange.trim() || undefined,
      priceLevel: restaurantPriceLevel.trim() ? Number(restaurantPriceLevel) : undefined,
      address: restaurantAddress.trim() || undefined,
      googleMapsLink: restaurantMapsLink.trim() || undefined,
      rating: restaurantRating.trim() ? Number(restaurantRating) : undefined,
      openingHours: restaurantHours.trim() || undefined,
      reservationLink: restaurantReservationLink.trim() || undefined,
      recommendedDish: restaurantDish.trim() || undefined,
      notes: restaurantNotes.trim() || undefined,
      order: Number(restaurantOrder)
    };

    try {
      if (editingRestaurant) {
        await updateBaseRestaurant(editingRestaurant.id, payload);
        alert('Restaurante atualizado com sucesso.');
      } else if (activeDayId) {
        await createBaseRestaurant(activeDayId, payload);
        alert('Restaurante criado com sucesso.');
      }
      setRestaurantDrawerOpen(false);
      fetchTripDetails();
    } catch (err) {
      console.error('Error saving restaurant:', err);
      alert('Erro ao salvar o restaurante.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o restaurante "${name}"?`)) return;
    try {
      await deleteBaseRestaurant(id);
      alert('Restaurante removido.');
      fetchTripDetails();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      alert('Erro ao remover o restaurante.');
    }
  };

  // Currency format helper
  const formatCurrency = (amount?: number | null, currency = 'BRL') => {
    if (amount === undefined || amount === null) return 'N/D';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/base-trips">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl h-10 w-10 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="space-y-0.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Compass className="w-5.5 h-5.5 text-[#001F5B]" />
              Roteiro Mestre: {trip?.title || 'Carregando...'}
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              Destino: {trip?.destination || 'N/D'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchTripDetails}
            disabled={isLoading}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-11 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            Atualizar Roteiro
          </Button>

          <Button
            onClick={() => handleOpenDay()}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-11 px-5 shadow-md flex items-center gap-2 cursor-pointer transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Adicionar Dia
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main dashboard content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
          <div className="md:col-span-4 h-80 bg-slate-200 rounded-2xl" />
          <div className="md:col-span-8 h-96 bg-slate-200 rounded-2xl" />
        </div>
      ) : trip ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: BaseTrip general specifications (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-[#001F5B]/5">
                <h3 className="font-extrabold text-[#001F5B] text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Especificações Gerais
                </h3>
              </div>
              
              <CardContent className="p-5 space-y-4 text-xs text-slate-700">
                {/* Destination & Country */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">País</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.country || 'N/D'}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cidade</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.city || 'N/D'}</strong>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Região</span>
                  <strong className="text-slate-800 text-sm font-bold block">{trip.region || 'N/D'}</strong>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total de Dias</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.numberOfDays} dias</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Perfil</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.profile || 'N/D'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Melhor Época</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.bestTime || 'N/D'}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clima</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.climate || 'N/D'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Orçamento Médio</span>
                    <strong className="text-slate-800 text-sm font-bold block">{formatCurrency(trip.averageBudget, trip.currency || 'BRL')}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Idioma Principal</span>
                    <strong className="text-slate-800 text-sm font-bold block">{trip.language || 'N/D'}</strong>
                  </div>
                </div>

                {/* Status / Visibility */}
                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      trip.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Visibilidade</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      trip.visibility === 'PUBLIC'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-slate-50 text-slate-500 border border-slate-100'
                    }`}>
                      {trip.visibility}
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                {trip.shortDescription && (
                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Descrição Curta</span>
                    <p className="text-xs text-slate-600 leading-normal">{trip.shortDescription}</p>
                  </div>
                )}

                {/* Full Description */}
                {trip.fullDescription && (
                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Descrição Completa</span>
                    <p className="text-xs text-slate-500 leading-normal max-h-48 overflow-y-auto pr-1">{trip.fullDescription}</p>
                  </div>
                )}

                {/* Tags */}
                {trip.tags && trip.tags.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel: Day-by-Day itinerary builder (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 pl-1">
              <Map className="w-5 h-5 text-[#FF6A00]" />
              Cronograma Diário ({trip.days?.length || 0} dias cadastrados)
            </h2>

            {(!trip.days || trip.days.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl min-h-[300px]">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-950 mb-1">Nenhum Dia Cadastrado</h3>
                <p className="text-slate-500 text-xs max-w-sm mb-6">
                  Este roteiro base ainda não possui nenhum dia de cronograma configurado. Adicione o primeiro dia para começar a inserir atrações.
                </p>
                <Button
                  onClick={() => handleOpenDay()}
                  className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Dia 1
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {trip.days.map((day) => (
                  <Card key={day.id} className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl overflow-hidden">
                    {/* Day header bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/10 flex items-center justify-center font-extrabold text-sm shrink-0">
                          {day.dayNumber}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {day.title || `Dia ${day.dayNumber}`}
                          </h4>
                          {day.region && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {day.region}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          {day.suggestedTransport && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/50">
                              <Car className="w-3.5 h-3.5 text-slate-500" />
                              {day.suggestedTransport}
                            </span>
                          )}
                          {day.estimatedCost !== undefined && day.estimatedCost !== null && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              {formatCurrency(day.estimatedCost, trip.currency || 'BRL')}
                            </span>
                          )}
                        </div>

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

                    {/* Day descriptions */}
                    {day.description && (
                      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {day.description}
                        </p>
                      </div>
                    )}

                    <CardContent className="p-5 space-y-6">
                      
                      {/* Attractions Subsection */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            Pontos Turísticos & Atrações ({day.attractions?.length || 0})
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAttraction(day.id)}
                            className="text-xs font-bold text-[#001F5B] hover:text-[#FF6A00] hover:bg-slate-50 cursor-pointer h-7 px-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Nova Atração
                          </Button>
                        </div>

                        {(!day.attractions || day.attractions.length === 0) ? (
                          <p className="text-center text-slate-400 italic text-[11px] py-4">
                            Nenhuma atração cadastrada neste dia.
                          </p>
                        ) : (
                          <div className="grid gap-3.5 sm:grid-cols-2">
                            {day.attractions.map((attr) => (
                              <div
                                key={attr.id}
                                className="p-3.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400">#{attr.order}</span>
                                      <h6 className="font-bold text-slate-900 text-xs leading-snug truncate max-w-[130px]" title={attr.name}>
                                        {attr.name}
                                      </h6>
                                    </div>
                                    <span className="text-[8px] font-extrabold text-slate-400 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded shrink-0 max-w-[80px] truncate uppercase tracking-widest">
                                      {attr.category.replace('_', ' ')}
                                    </span>
                                  </div>

                                  {attr.shortDescription && (
                                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                                      {attr.shortDescription}
                                    </p>
                                  )}

                                  {/* Quick info badges */}
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {attr.period && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                                        {attr.period}
                                      </span>
                                    )}
                                    {attr.duration && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {attr.duration} min
                                      </span>
                                    )}
                                    {attr.cost !== undefined && attr.cost !== null && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                        {formatCurrency(attr.cost, attr.currency || 'EUR')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-3 shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    {attr.requiresTicket && (
                                      <span className="text-[9px] font-bold text-amber-600" title="Ingresso obrigatório">
                                        🎟️ ticket
                                      </span>
                                    )}
                                    {attr.requiresReservation && (
                                      <span className="text-[9px] font-bold text-blue-600" title="Reserva obrigatória">
                                        📅 reserva
                                      </span>
                                    )}
                                    {(attr.goodForKids || attr.goodForElders) && (
                                      <span className="text-[9px] font-bold text-emerald-600" title="Acessível / Família">
                                        ❤️ family
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenAttraction(day.id, attr)}
                                      className="text-slate-400 hover:text-[#001F5B] cursor-pointer h-7 w-7 rounded-md"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteAttraction(attr.id, attr.name)}
                                      className="text-slate-400 hover:text-red-600 cursor-pointer h-7 w-7 rounded-md"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Restaurants Subsection */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                            Gastronomia & Restaurantes ({day.restaurants?.length || 0})
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRestaurant(day.id)}
                            className="text-xs font-bold text-[#001F5B] hover:text-[#FF6A00] hover:bg-slate-50 cursor-pointer h-7 px-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Novo Restaurante
                          </Button>
                        </div>

                        {(!day.restaurants || day.restaurants.length === 0) ? (
                          <p className="text-center text-slate-400 italic text-[11px] py-4">
                            Nenhum restaurante cadastrado neste dia.
                          </p>
                        ) : (
                          <div className="grid gap-3.5 sm:grid-cols-2">
                            {day.restaurants.map((rest) => (
                              <div
                                key={rest.id}
                                className="p-3.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400">#{rest.order}</span>
                                      <h6 className="font-bold text-slate-900 text-xs leading-snug truncate max-w-[140px]" title={rest.name}>
                                        {rest.name}
                                      </h6>
                                    </div>
                                    {rest.priceRange && (
                                      <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded shrink-0">
                                        {rest.priceRange}
                                      </span>
                                    )}
                                  </div>

                                  {rest.cuisineType && (
                                    <p className="text-[11px] font-semibold text-slate-700">
                                      Cozinha: {rest.cuisineType}
                                    </p>
                                  )}

                                  {rest.recommendedDish && (
                                    <p className="text-[10px] text-slate-400 italic">
                                      Prato sugerido: "{rest.recommendedDish}"
                                    </p>
                                  )}

                                  {rest.notes && (
                                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                                      {rest.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-3 shrink-0">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                    {rest.rating && (
                                      <span className="text-amber-500 flex items-center gap-0.5">
                                        ⭐ {rest.rating}
                                      </span>
                                    )}
                                    {rest.openingHours && (
                                      <span className="text-slate-400">
                                        🕒 {rest.openingHours.substring(0, 15)}...
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenRestaurant(day.id, rest)}
                                      className="text-slate-400 hover:text-[#001F5B] cursor-pointer h-7 w-7 rounded-md"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                                      className="text-slate-400 hover:text-red-600 cursor-pointer h-7 w-7 rounded-md"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
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

      {/* Drawer: Create / Edit Base Trip Day */}
      <Sheet open={dayDrawerOpen} onOpenChange={setDayDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveDay} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {editingDay ? 'Editar Dia de Roteiro' : 'Adicionar Dia de Roteiro'}
              </h2>
              <p className="text-white/70 text-xs mt-1">
                {editingDay ? 'Atualize as configurações e informações deste dia do cronograma.' : 'Insira as configurações deste dia. Você poderá adicionar atrações a ele em seguida.'}
              </p>
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
                  placeholder="Ex: Chegando em Paris e Torne Eiffel"
                  value={dayTitle}
                  onChange={(e) => setDayTitle(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Região / Bairro</label>
                <Input
                  type="text"
                  placeholder="Ex: Montmartre / 7ème Arrondissement"
                  value={dayRegion}
                  onChange={(e) => setDayRegion(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transporte Recomendado</label>
                <Input
                  type="text"
                  placeholder="Ex: Metrô / Caminhada"
                  value={dayTransport}
                  onChange={(e) => setDayTransport(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custo Estimado (Opcional)</label>
                <Input
                  type="number"
                  placeholder="Ex: 50"
                  value={dayEstimatedCost}
                  onChange={(e) => setDayEstimatedCost(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição do Dia</label>
                <textarea
                  rows={4}
                  placeholder="Resuma os objetivos deste dia, pontos principais a serem vistos e tempo de deslocamento..."
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
                {isSaving ? 'Salvando...' : editingDay ? 'Salvar Alterações' : 'Adicionar Dia'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Drawer: Create / Edit Attraction */}
      <Sheet open={attractionDrawerOpen} onOpenChange={setAttractionDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveAttraction} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {editingAttraction ? 'Editar Atração Base' : 'Adicionar Atração Base'}
              </h2>
              <p className="text-white/70 text-xs mt-1">Configure os detalhes do ponto turístico ou passeio do dia.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome da Atração *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Museu do Louvre"
                    value={attractionName}
                    onChange={(e) => setAttractionName(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoria *</label>
                  <select
                    value={attractionCategory}
                    onChange={(e) => setAttractionCategory(e.target.value as ItineraryCategory)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                  >
                    <option value="TOURIST_ATTRACTION">Atração Turística</option>
                    <option value="MUSEUM">Museu</option>
                    <option value="CAFE">Café</option>
                    <option value="BAR">Bar</option>
                    <option value="BEACH">Praia</option>
                    <option value="PARK">Parque / Natureza</option>
                    <option value="SHOPPING">Compras</option>
                    <option value="EXPERIENCE">Experiência</option>
                    <option value="TRANSPORT">Transporte</option>
                    <option value="EVENT">Evento</option>
                    <option value="NIGHTLIFE">Vida Noturna</option>
                    <option value="FREE_ACTIVITY">Atividade Gratuita</option>
                    <option value="PAID_ACTIVITY">Atividade Paga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Período</label>
                  <Input
                    type="text"
                    placeholder="Ex: Manhã, Tarde, Noite"
                    value={attractionPeriod}
                    onChange={(e) => setAttractionPeriod(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duração Estimada (minutos)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 120"
                    value={attractionDuration}
                    onChange={(e) => setAttractionDuration(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custo por Pessoa</label>
                  <Input
                    type="number"
                    placeholder="Ex: 22"
                    value={attractionCost}
                    onChange={(e) => setAttractionCost(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Moeda</label>
                  <Input
                    type="text"
                    placeholder="Ex: EUR"
                    value={attractionCurrency}
                    onChange={(e) => setAttractionCurrency(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordem no Roteiro *</label>
                  <Input
                    required
                    type="number"
                    value={attractionOrder}
                    onChange={(e) => setAttractionOrder(Number(e.target.value))}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acessibilidade</label>
                  <Input
                    type="text"
                    placeholder="Ex: Acessível para cadeiras"
                    value={attractionAccessibility}
                    onChange={(e) => setAttractionAccessibility(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attractionRequiresTicket}
                    onChange={(e) => setAttractionRequiresTicket(e.target.checked)}
                    className="rounded border-slate-300 text-[#001F5B] focus:ring-[#001F5B] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Requer Ingresso</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attractionRequiresReservation}
                    onChange={(e) => setAttractionRequiresReservation(e.target.checked)}
                    className="rounded border-slate-300 text-[#001F5B] focus:ring-[#001F5B] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Requer Reserva</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attractionGoodForKids}
                    onChange={(e) => setAttractionGoodForKids(e.target.checked)}
                    className="rounded border-slate-300 text-[#001F5B] focus:ring-[#001F5B] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Bom para Crianças</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attractionGoodForElders}
                    onChange={(e) => setAttractionGoodForElders(e.target.checked)}
                    className="rounded border-slate-300 text-[#001F5B] focus:ring-[#001F5B] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">Bom para Idosos</span>
                </label>
              </div>

              {/* Links */}
              {attractionRequiresTicket && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link de Compra do Ingresso</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={attractionTicketLink}
                    onChange={(e) => setAttractionTicketLink(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {attractionRequiresReservation && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link para Reserva</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={attractionReservationLink}
                    onChange={(e) => setAttractionReservationLink(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Addresses */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço</label>
                <Input
                  type="text"
                  placeholder="Ex: Rue de Rivoli, 75001 Paris"
                  value={attractionAddress}
                  onChange={(e) => setAttractionAddress(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link Google Maps</label>
                <Input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={attractionMapsLink}
                  onChange={(e) => setAttractionMapsLink(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Curta</label>
                <Input
                  type="text"
                  placeholder="Ex: O maior museu de arte do mundo e lar da Mona Lisa."
                  value={attractionShortDesc}
                  onChange={(e) => setAttractionShortDesc(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Completa</label>
                <textarea
                  rows={3}
                  placeholder="Recomendações detalhadas para a visita, tempo ideal de permanência, segredos escondidos..."
                  value={attractionFullDesc}
                  onChange={(e) => setAttractionFullDesc(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notas Internas</label>
                <textarea
                  rows={2}
                  placeholder="Dicas administrativas ou notas para a curadoria da equipe..."
                  value={attractionNotes}
                  onChange={(e) => setAttractionNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAttractionDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer"
              >
                {isSaving ? 'Salvando...' : 'Salvar Atração'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Drawer: Create / Edit Restaurant */}
      <Sheet open={restaurantDrawerOpen} onOpenChange={setRestaurantDrawerOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveRestaurant} className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {editingRestaurant ? 'Editar Restaurante Base' : 'Adicionar Restaurante Base'}
              </h2>
              <p className="text-white/70 text-xs mt-1">Configure os detalhes gastronômicos recomendados para este dia.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Restaurante *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Le Bouillon Chartier"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Cozinha</label>
                  <Input
                    type="text"
                    placeholder="Ex: Francesa Tradicional, Italiana"
                    value={restaurantCuisine}
                    onChange={(e) => setRestaurantCuisine(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faixa de Preço</label>
                  <Input
                    type="text"
                    placeholder="Ex: €€-€€€, Barato, Luxuoso"
                    value={restaurantPriceRange}
                    onChange={(e) => setRestaurantPriceRange(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preço (Nível 1 a 4)</label>
                  <Input
                    type="number"
                    min={1}
                    max={4}
                    placeholder="Ex: 2"
                    value={restaurantPriceLevel}
                    onChange={(e) => setRestaurantPriceLevel(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avaliação (Rating 1.0 a 5.0)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    placeholder="Ex: 4.5"
                    value={restaurantRating}
                    onChange={(e) => setRestaurantRating(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordem no Roteiro *</label>
                  <Input
                    required
                    type="number"
                    value={restaurantOrder}
                    onChange={(e) => setRestaurantOrder(Number(e.target.value))}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário de Funcionamento</label>
                <Input
                  type="text"
                  placeholder="Ex: Diariamente, das 11:30 às 00:00"
                  value={restaurantHours}
                  onChange={(e) => setRestaurantHours(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link para Reserva</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={restaurantReservationLink}
                  onChange={(e) => setRestaurantReservationLink(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço</label>
                <Input
                  type="text"
                  placeholder="Ex: 7 Rue du Faubourg Montmartre, 75009"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Link Google Maps</label>
                <Input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={restaurantMapsLink}
                  onChange={(e) => setRestaurantMapsLink(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prato Recomendado</label>
                <Input
                  type="text"
                  placeholder="Ex: Confit de Canard, Creme Caramel"
                  value={restaurantDish}
                  onChange={(e) => setRestaurantDish(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observações / Notas Internas</label>
                <textarea
                  rows={4}
                  placeholder="Segredos sobre o cardápio, melhor mesa para reservar, notas para a curadoria..."
                  value={restaurantNotes}
                  onChange={(e) => setRestaurantNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                />
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRestaurantDrawerOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer"
              >
                {isSaving ? 'Salvando...' : 'Salvar Restaurante'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
