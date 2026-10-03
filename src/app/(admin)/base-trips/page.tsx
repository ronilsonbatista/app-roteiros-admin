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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';

import {
  Plus,
  Compass,
  MapPin,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Globe
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
      setError('Não foi possível carregar os roteiros base.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseTrips();
  }, [fetchBaseTrips]);

  // Filter client-side
  useEffect(() => {
    let result = [...baseTrips];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          (t.city && t.city.toLowerCase().includes(q)) ||
          (t.country && t.country.toLowerCase().includes(q))
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

  const handleOpenCreate = () => {
    setEditingTrip(null);
    setFormTitle('');
    setFormDestination('');
    setFormCountry('');
    setFormCity('');
    setFormRegion('');
    setFormNumberOfDays(3);
    setFormProfile('CASAL');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormBestTime('Ano todo');
    setFormClimate('Temperado');
    setFormAverageBudget('1500');
    setFormCurrency('BRL');
    setFormLanguage('Português');
    setFormTags('gastronomia, cultura, passeio');
    setFormStatus('DRAFT');
    setFormVisibility('PRIVATE');
    setIsOpen(true);
  };

  const handleOpenEdit = (trip: BaseTrip) => {
    setEditingTrip(trip);
    setFormTitle(trip.title);
    setFormDestination(trip.destination);
    setFormCountry(trip.country || '');
    setFormCity(trip.city || '');
    setFormRegion(trip.region || '');
    setFormNumberOfDays(trip.numberOfDays);
    setFormProfile(trip.profile || (trip as any).recommendedProfile || '');
    setFormShortDesc(trip.shortDescription || '');
    setFormFullDesc(trip.fullDescription || '');
    setFormBestTime(trip.bestTime || (trip as any).bestTimeToVisit || '');
    setFormClimate(trip.climate || '');
    setFormAverageBudget(trip.averageBudget ? trip.averageBudget.toString() : '');
    setFormCurrency(trip.currency || 'BRL');
    setFormLanguage(trip.language || 'Português');
    setFormTags(trip.tags ? trip.tags.join(', ') : '');
    setFormStatus(trip.status);
    setFormVisibility(trip.visibility);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim()) {
      alert('Por favor, preencha o Título e o Destino.');
      return;
    }

    if (formStatus === 'PUBLISHED') {
      const daysCount = editingTrip?.days?.length ?? editingTrip?._count?.days ?? 0;
      if (daysCount === 0) {
        alert('Não é possível publicar um Roteiro Base sem nenhum dia cadastrado. Adicione os dias e atrações antes de publicar.');
        return;
      }
      if (!window.confirm('Deseja realmente definir este Roteiro Base como PUBLICADO? Ele ficará visível e elegível para alimentar gerações de roteiro.')) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const tagsArray = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formTitle.trim(),
        destination: formDestination.trim(),
        country: formCountry.trim() || undefined,
        city: formCity.trim() || undefined,
        region: formRegion.trim() || undefined,
        numberOfDays: Number(formNumberOfDays),
        profile: formProfile.trim() || undefined,
        recommendedProfile: formProfile.trim() || undefined,
        shortDescription: formShortDesc.trim() || undefined,
        fullDescription: formFullDesc.trim() || undefined,
        bestTime: formBestTime.trim() || undefined,
        bestTimeToVisit: formBestTime.trim() || undefined,
        climate: formClimate.trim() || undefined,
        averageBudget: formAverageBudget ? Number(formAverageBudget) : undefined,
        currency: formCurrency,
        language: formLanguage,
        tags: tagsArray,
        status: formStatus,
        visibility: formVisibility,
      };

      if (editingTrip) {
        await updateBaseTrip(editingTrip.id, payload);
      } else {
        await createBaseTrip(payload);
      }

      setIsOpen(false);
      fetchBaseTrips();
    } catch (err: any) {
      console.error('Failed to save base trip:', err);
      alert('Erro ao salvar o roteiro base.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o Roteiro Base "${title}"?`)) return;
    try {
      await deleteBaseTrip(id);
      fetchBaseTrips();
    } catch (err) {
      console.error('Failed to delete base trip:', err);
      alert('Erro ao excluir roteiro base.');
    }
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'ALL' || visibilityFilter !== 'ALL');

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setVisibilityFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="VIAGENS & ROTEIROS"
        title="Biblioteca de Destinos & Curadoria"
        subtitle="Destinos pré-curados, sessão escrita e biblioteca oficial de atrações e restaurantes para a IA 2GO"
        breadcrumbs={[
          { label: 'Viagens', href: '/trips' },
          { label: 'Biblioteca de Destinos' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBaseTrips}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Destino
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por título, destino, cidade ou país..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Todos os Status</option>
          <option value="DRAFT">DRAFT (Rascunho)</option>
          <option value="PUBLISHED">PUBLISHED (Publicado)</option>
          <option value="ARCHIVED">ARCHIVED (Arquivado)</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Todas as Visibilidades</option>
          <option value="PUBLIC">PUBLIC (Público)</option>
          <option value="PRIVATE">PRIVATE (Privado)</option>
        </select>
      </FilterBar>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Table Card */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Roteiro Base / Destino</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3 text-center">Dias</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Visibilidade</th>
                <th className="px-4 py-3 text-[#001F5B]">Perfil Recomendado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando catálogo de roteiros base...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={Compass}
                      title="Nenhum roteiro base encontrado"
                      description="Não foram encontrados modelos de roteiro para os filtros selecionados."
                      action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
                        {trip.title}
                      </div>
                      <div className="text-[11px] text-slate-500">{trip.destination}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {trip.city ? `${trip.city}, ` : ''}{trip.country || 'N/D'}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {trip.numberOfDays} dias
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.visibility === 'PUBLIC' ? 'ACTIVE' : 'INACTIVE'} label={trip.visibility} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {trip.profile || (trip as any).recommendedProfile || 'Geral'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/base-trips/${trip.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                            title="Ver / Editar Itinerário Diário"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(trip)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Editar Informações"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(trip.id, trip.title)}
                          className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drawer: Form Base Trip */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white border-l border-slate-200 p-6 space-y-4 overflow-y-auto">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">
              {editingTrip ? 'Editar Roteiro Base' : 'Novo Roteiro Base'}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Cadastre as informações gerais do template de destino.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Título do Roteiro *</label>
              <Input
                type="text"
                placeholder="Ex: Paris Clássica & Gastronômica"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Destino Principal *</label>
              <Input
                type="text"
                placeholder="Ex: Paris"
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">País</label>
                <Input
                  type="text"
                  placeholder="França"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Cidade</label>
                <Input
                  type="text"
                  placeholder="Paris"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Duração (Dias)</label>
                <Input
                  type="number"
                  min={1}
                  value={formNumberOfDays}
                  onChange={(e) => setFormNumberOfDays(Number(e.target.value))}
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Perfil Recomendado</label>
                <Input
                  type="text"
                  placeholder="Ex: Casal, Família, Solo"
                  value={formProfile}
                  onChange={(e) => setFormProfile(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as BaseTripStatus)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Visibilidade</label>
                <select
                  value={formVisibility}
                  onChange={(e) => setFormVisibility(e.target.value as BaseTripVisibility)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="PRIVATE">PRIVATE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Resumo Curto</label>
              <textarea
                rows={2}
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tags (Separadas por vírgula)</label>
              <Input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                className="text-xs h-9 bg-slate-50 font-mono"
              />
            </div>

            <SheetFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold cursor-pointer">
                {isSaving ? 'Salvando...' : 'Salvar Roteiro Base'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
