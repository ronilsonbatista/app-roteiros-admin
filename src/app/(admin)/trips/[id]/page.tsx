'use client';

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
  Trip,
  TripDay,
  ItineraryItem,
  ItineraryCategory,
  TripParticipant,
  PlaceSearchResult
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
  Navigation
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

  const formatDatePT = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const formatPrice = (amount?: number | null, currency = 'BRL') => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/trips">
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
              Painel de Operações: {trip?.title || 'Carregando...'}
            </h1>
            <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Destino do Usuário: {trip?.destination || 'N/D'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Premium switch toggle */}
          {trip && (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-1.5 px-3.5 rounded-xl shadow-xs">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${trip.premiumUnlockedAt ? 'text-amber-600' : 'text-slate-400'}`}>
                Premium
              </span>
              <button
                type="button"
                onClick={handleTogglePremium}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  trip.premiumUnlockedAt ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    trip.premiumUnlockedAt ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={fetchTripDetails}
            disabled={isLoading}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-11 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            Atualizar Painel
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
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl max-h-48 overflow-y-auto text-[10px] text-slate-300 font-mono shadow-inner leading-relaxed">
                    <pre>{JSON.stringify(trip.preferences, null, 2)}</pre>
                  </div>
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
                            {day.date ? formatDatePT(day.date) : 'Data não definida'}
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
                                    </div>

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
                                        Google Place Vinculado
                                      </div>
                                    )}

                                    {/* Extra quick metadata info */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {item.duration && (
                                        <span className="text-[9px] text-slate-400 font-semibold">
                                          Duração: {item.duration} minutos
                                        </span>
                                      )}
                                      {item.cost !== undefined && item.cost !== null && (
                                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                                          Custo: {formatPrice(item.cost, item.currency || 'BRL')}
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
                                    <div className="flex gap-1 shrink-0 mt-auto">
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
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteItem(item.id, item.title)}
                                        className="text-slate-400 hover:text-red-600 cursor-pointer h-7 w-7 rounded-md"
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
    </div>
  );
}
