'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listBaseTrips,
  createBaseTrip,
  updateBaseTrip,
  deleteBaseTrip,
  BaseTrip,
  BaseTripStatus,
  BaseTripVisibility
} from '@/services/base-trips.service';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import {
  Search,
  RotateCw,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Globe,
  Coins,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function BaseTripsListPage() {
  const [baseTrips, setBaseTrips] = useState<BaseTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<BaseTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');

  // Form Drawer state
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<BaseTrip | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields state
  const [formTitle, setFormTitle] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formNumberOfDays, setFormNumberOfDays] = useState(1);
  const [formProfile, setFormProfile] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formBestTime, setFormBestTime] = useState('');
  const [formClimate, setFormClimate] = useState('');
  const [formAverageBudget, setFormAverageBudget] = useState('');
  const [formCurrency, setFormCurrency] = useState('BRL');
  const [formLanguage, setFormLanguage] = useState('Português');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<BaseTripStatus>('DRAFT');
  const [formVisibility, setFormVisibility] = useState<BaseTripVisibility>('PRIVATE');

  // Fetch all base trips
  const fetchBaseTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBaseTrips();
      setBaseTrips(data);
    } catch (err: any) {
      console.error('Error fetching base trips:', err);
      setError('Não foi possível carregar os roteiros base da plataforma.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseTrips();
  }, [fetchBaseTrips]);

  // Apply filters locally (fast and responsive)
  useEffect(() => {
    let result = [...baseTrips];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.destination.toLowerCase().includes(query) ||
          (t.country && t.country.toLowerCase().includes(query)) ||
          (t.city && t.city.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (visibilityFilter !== 'ALL') {
      result = result.filter((t) => t.visibility === visibilityFilter);
    }

    setFilteredTrips(result);
  }, [baseTrips, searchQuery, statusFilter, visibilityFilter]);

  // Reset form fields
  const resetForm = () => {
    setEditingTrip(null);
    setFormTitle('');
    setFormDestination('');
    setFormCountry('');
    setFormCity('');
    setFormRegion('');
    setFormNumberOfDays(1);
    setFormProfile('');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormBestTime('');
    setFormClimate('');
    setFormAverageBudget('');
    setFormCurrency('BRL');
    setFormLanguage('Português');
    setFormTags('');
    setFormStatus('DRAFT');
    setFormVisibility('PRIVATE');
  };

  // Open drawer for creating a new base trip
  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  // Open drawer for editing a base trip
  const handleOpenEdit = (trip: BaseTrip) => {
    setEditingTrip(trip);
    setFormTitle(trip.title);
    setFormDestination(trip.destination);
    setFormCountry(trip.country || '');
    setFormCity(trip.city || '');
    setFormRegion(trip.region || '');
    setFormNumberOfDays(trip.numberOfDays);
    setFormProfile(trip.profile || '');
    setFormShortDesc(trip.shortDescription || '');
    setFormFullDesc(trip.fullDescription || '');
    setFormBestTime(trip.bestTime || '');
    setFormClimate(trip.climate || '');
    setFormAverageBudget(trip.averageBudget ? trip.averageBudget.toString() : '');
    setFormCurrency(trip.currency || 'BRL');
    setFormLanguage(trip.language || 'Português');
    setFormTags(trip.tags ? trip.tags.join(', ') : '');
    setFormStatus(trip.status);
    setFormVisibility(trip.visibility);
    setIsOpen(true);
  };

  // Save base trip (create or update)
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim()) {
      alert('Título e Destino são obrigatórios.');
      return;
    }

    setIsSaving(true);
    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: formTitle,
      destination: formDestination,
      country: formCountry.trim() || undefined,
      city: formCity.trim() || undefined,
      region: formRegion.trim() || undefined,
      numberOfDays: Number(formNumberOfDays),
      profile: formProfile.trim() || undefined,
      shortDescription: formShortDesc.trim() || undefined,
      fullDescription: formFullDesc.trim() || undefined,
      bestTime: formBestTime.trim() || undefined,
      climate: formClimate.trim() || undefined,
      averageBudget: formAverageBudget.trim() ? Number(formAverageBudget) : undefined,
      currency: formCurrency || undefined,
      language: formLanguage || undefined,
      tags: tagsArray,
      status: formStatus,
      visibility: formVisibility
    };

    try {
      if (editingTrip) {
        await updateBaseTrip(editingTrip.id, payload);
        alert('Roteiro base atualizado com sucesso.');
      } else {
        await createBaseTrip(payload);
        alert('Roteiro base criado com sucesso.');
      }
      setIsOpen(false);
      fetchBaseTrips();
    } catch (err: any) {
      console.error('Error saving base trip:', err);
      alert('Não foi possível salvar o roteiro base. Verifique os dados inseridos.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete base trip
  const handleDeleteTrip = async (trip: BaseTrip) => {
    if (!window.confirm(`Deseja realmente excluir o roteiro base "${trip.title}"? Todos os dias, atrações e restaurantes associados serão excluídos permanentemente.`)) {
      return;
    }

    try {
      await deleteBaseTrip(trip.id);
      alert('Roteiro base excluído com sucesso.');
      fetchBaseTrips();
    } catch (err: any) {
      console.error('Error deleting base trip:', err);
      alert('Não foi possível excluir o roteiro base.');
    }
  };

  // Date format helper
  const formatDate = (dateStr: string) => {
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

  // Currency format helper
  const formatCurrency = (amount?: number | null, currency = 'BRL') => {
    if (amount === undefined || amount === null) return 'N/D';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Roteiros Base (Templates)
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie os modelos mestre de roteiros turísticos, curadorias e biblioteca de templates da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchBaseTrips}
            disabled={isLoading}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-11 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            Atualizar
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-11 px-5 shadow-md flex items-center gap-2 cursor-pointer transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Criar Roteiro Base
          </Button>
        </div>
      </div>

      {/* Filter panel card */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search query */}
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buscar Roteiros</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filtrar por título, destino, país ou cidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-slate-200 focus-visible:ring-[#001F5B] rounded-xl text-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B] cursor-pointer"
              >
                <option value="ALL">Todos os Status</option>
                <option value="DRAFT">Rascunhos (Draft)</option>
                <option value="PUBLISHED">Publicados (Published)</option>
                <option value="ARCHIVED">Arquivados (Archived)</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="w-full md:w-48 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visibilidade</label>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B] cursor-pointer"
              >
                <option value="ALL">Todas</option>
                <option value="PUBLIC">Pública (Public)</option>
                <option value="PRIVATE">Privada (Private)</option>
                <option value="INTERNAL">Interna (Internal)</option>
              </select>
            </div>
            
            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'ALL' || visibilityFilter !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setVisibilityFilter('ALL');
                }}
                className="hover:bg-slate-100 text-slate-500 rounded-xl h-10 px-4 cursor-pointer text-xs w-full md:w-auto"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content grid / table */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[40vh] text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4 animate-bounce duration-[3s]">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Falha na Comunicação</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">{error}</p>
          <Button 
            onClick={fetchBaseTrips}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white flex items-center gap-2 cursor-pointer rounded-xl h-11 px-6 shadow"
          >
            <RotateCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      ) : isLoading ? (
        // Loading skeletons
        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-100 border-b border-slate-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-6">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Nenhum Roteiro Base Encontrado</h3>
          <p className="text-slate-500 text-xs max-w-sm mb-6">
            Não há roteiros base correspondentes aos filtros selecionados ou cadastrados na plataforma.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Roteiro
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/75">
              <TableRow className="border-slate-200">
                <TableHead className="font-bold text-slate-700 px-6 h-12">Roteiro / Destino</TableHead>
                <TableHead className="font-bold text-slate-700 px-4 h-12">País / Cidade</TableHead>
                <TableHead className="font-bold text-slate-700 px-4 h-12">Dias</TableHead>
                <TableHead className="font-bold text-slate-700 px-4 h-12">Orçamento Médio</TableHead>
                <TableHead className="font-bold text-slate-700 px-4 h-12">Status / Visibilidade</TableHead>
                <TableHead className="font-bold text-slate-700 px-6 h-12 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                  {/* Title & destination details */}
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#001F5B]/5 border border-[#001F5B]/10 flex items-center justify-center font-bold text-[#001F5B] shrink-0">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[220px]">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {trip.title}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {trip.destination}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Country/city/region */}
                  <TableCell className="px-4 py-4 text-xs text-slate-600">
                    <div className="flex flex-col gap-0.5 max-w-[150px] truncate">
                      <span className="font-semibold text-slate-800">{trip.country || 'S/D'}</span>
                      <span className="text-[10px] text-slate-400">{trip.city || trip.region || 'Sem detalhe'}</span>
                    </div>
                  </TableCell>

                  {/* Days count */}
                  <TableCell className="px-4 py-4 text-xs font-bold text-slate-700">
                    {trip.numberOfDays} {trip.numberOfDays === 1 ? 'Dia' : 'Dias'}
                  </TableCell>

                  {/* Budget */}
                  <TableCell className="px-4 py-4 text-xs font-semibold text-slate-700">
                    {formatCurrency(trip.averageBudget, trip.currency || 'BRL')}
                  </TableCell>

                  {/* Status / Visibility badges */}
                  <TableCell className="px-4 py-4">
                    <div className="flex flex-col gap-1.5 w-fit">
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit ${
                        trip.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : trip.status === 'ARCHIVED'
                          ? 'bg-slate-50 text-slate-400 border border-slate-100'
                          : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {trip.status}
                      </span>
                      
                      {/* Visibility badge */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit ${
                        trip.visibility === 'PUBLIC'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : trip.visibility === 'INTERNAL'
                          ? 'bg-[#5E6118]/5 text-[#5E6118] border border-[#5E6118]/10'
                          : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                        {trip.visibility}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action buttons list */}
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/base-trips/${trip.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-[#001F5B]/5 text-[#001F5B] hover:text-[#001F5B] cursor-pointer rounded-lg h-9 w-9"
                          title="Gerenciar Dias e Roteiro"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(trip)}
                        className="text-slate-500 hover:text-[#FF6A00] hover:bg-orange-50 cursor-pointer rounded-lg h-9 w-9"
                        title="Editar Informações Base"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTrip(trip)}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-lg h-9 w-9"
                        title="Excluir Roteiro Base"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Side-over form drawer for Create / Edit Roteiro Base */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveTrip} className="flex flex-col h-full">
            {/* Form Header */}
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <div className="flex items-start justify-between mt-2">
                <div>
                  <h2 className="font-extrabold text-base text-white">
                    {editingTrip ? 'Editar Roteiro Base' : 'Criar Roteiro Base'}
                  </h2>
                  <p className="text-white/70 text-xs mt-1">
                    {editingTrip ? 'Atualize as configurações e descrições do modelo' : 'Cadastre um novo modelo de roteiro para a biblioteca'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Title & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Mochilão pela Europa"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destino *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Paris, Londres, Roma"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Geographic Locations */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">País</label>
                  <Input
                    type="text"
                    placeholder="Ex: França"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cidade</label>
                  <Input
                    type="text"
                    placeholder="Ex: Paris"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Região</label>
                  <Input
                    type="text"
                    placeholder="Ex: Europa Central"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Number of Days & Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número de Dias *</label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={formNumberOfDays}
                    onChange={(e) => setFormNumberOfDays(Math.max(1, Number(e.target.value)))}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Perfil Recomendado</label>
                  <Input
                    type="text"
                    placeholder="Ex: Mochileiro, Casais, Aventura"
                    value={formProfile}
                    onChange={(e) => setFormProfile(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Status & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BaseTripStatus)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  >
                    <option value="DRAFT">Rascunho (Draft)</option>
                    <option value="PUBLISHED">Publicado (Published)</option>
                    <option value="ARCHIVED">Arquivado (Archived)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visibilidade</label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as BaseTripVisibility)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  >
                    <option value="PRIVATE">Privada (Private)</option>
                    <option value="PUBLIC">Pública (Public)</option>
                    <option value="INTERNAL">Interna (Internal)</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Curta</label>
                <Input
                  type="text"
                  placeholder="Ex: Roteiro completo de 5 dias explorando as luzes de Paris."
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="h-10 border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Completa</label>
                <textarea
                  rows={4}
                  placeholder="Insira detalhes completos sobre o que o roteiro cobre, sugestão de transporte, locais a visitar..."
                  value={formFullDesc}
                  onChange={(e) => setFormFullDesc(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>

              {/* Travel Conditions (Best time, Climate, averageBudget, currency, language) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Melhor Época</label>
                  <Input
                    type="text"
                    placeholder="Ex: Primavera / Verão"
                    value={formBestTime}
                    onChange={(e) => setFormBestTime(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clima Esperado</label>
                  <Input
                    type="text"
                    placeholder="Ex: Temperado, 15°C a 25°C"
                    value={formClimate}
                    onChange={(e) => setFormClimate(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orçamento Médio</label>
                  <Input
                    type="number"
                    placeholder="Ex: 5000"
                    value={formAverageBudget}
                    onChange={(e) => setFormAverageBudget(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Moeda</label>
                  <Input
                    type="text"
                    placeholder="Ex: EUR, BRL, USD"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Idioma Oficial</label>
                  <Input
                    type="text"
                    placeholder="Ex: Francês, Inglês"
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tags (separadas por vírgula)</label>
                  <Input
                    type="text"
                    placeholder="Ex: romântico, museu, gastronomia"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Form Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer transition-colors duration-200"
              >
                {isSaving ? 'Salvando...' : 'Salvar Roteiro'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
