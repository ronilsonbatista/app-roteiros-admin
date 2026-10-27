'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listAllTrips,
  createTripForUser,
  updateTrip,
  deleteTrip,
  listUsersForSelection,
  getTripDaysCount,
  formatTripDestinationTitle,
  Trip,
  TripStatus
} from '@/services/trips.service';
import { User } from '@/services/users.service';

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
  Search,
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';

export default function TripsAdminPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [destinationQuery, setDestinationQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [premiumFilter, setPremiumFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer (Sheet) States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<TripStatus>('DRAFT');
  const [formPreferences, setFormPreferences] = useState('{\n  "focus": "cultural",\n  "pace": "medium"\n}');
  
  // Selection fields (for creation)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Multi-destination form state
  const [isMultiDestination, setIsMultiDestination] = useState(false);
  const [destinationLegs, setDestinationLegs] = useState<
    Array<{ name: string; daysCount: number; arrivalDate?: string; departureDate?: string }>
  >([
    { name: '', daysCount: 3 },
    { name: '', daysCount: 3 },
  ]);

  // Load Trips
  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: any = {
        page: currentPage,
        limit: 10
      };

      if (destinationQuery.trim()) {
        filters.destination = destinationQuery.trim();
      }

      if (statusFilter !== 'ALL') {
        filters.status = statusFilter as TripStatus;
      }

      if (premiumFilter !== 'ALL') {
        filters.premium = premiumFilter === 'PREMIUM';
      }

      const response = await listAllTrips(filters);
      setTrips(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError('Não foi possível carregar as viagens.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, destinationQuery, statusFilter, premiumFilter]);

  // Load Users for Selector
  const fetchUsers = useCallback(async (query = '') => {
    setIsSearchingUsers(true);
    try {
      const data = await listUsersForSelection(query);
      setUsersList(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch (err) {
      console.error('Error listing users:', err);
    } finally {
      setIsSearchingUsers(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (isCreateOpen) {
      fetchUsers();
    }
  }, [isCreateOpen, fetchUsers]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Selecione um cliente / usuário da lista.');
      return;
    }

    let finalDestination = formDestination.trim();
    let finalLegs: Array<{ name: string; daysCount: number; arrivalDate?: string; departureDate?: string }> = [];

    if (isMultiDestination) {
      finalLegs = destinationLegs
        .map((l) => ({ ...l, name: l.name.trim() }))
        .filter((l) => l.name.length > 0);

      if (finalLegs.length === 0) {
        alert('Informe ao menos uma cidade com dias para a viagem multi-destino.');
        return;
      }

      finalDestination = finalLegs.map((l) => l.name).join(', ');
    }

    if (!finalDestination) {
      alert('Informe o destino da viagem.');
      return;
    }

    setIsSaving(true);
    try {
      let parsedPrefs: any = {};
      try {
        parsedPrefs = JSON.parse(formPreferences || '{}');
      } catch (err) {
        // Fallback if raw string
        parsedPrefs = { raw: formPreferences };
      }

      if (isMultiDestination && finalLegs.length > 0) {
        parsedPrefs.destinations = finalLegs.map((l) => ({
          name: l.name,
          city: l.name,
          daysCount: Number(l.daysCount) || 1,
          numberOfDays: Number(l.daysCount) || 1,
          days: Number(l.daysCount) || 1,
          arrivalDate: l.arrivalDate || undefined,
          departureDate: l.departureDate || undefined,
        }));
      }

      const safeStartDate = formStartDate ? `${formStartDate}T00:00:00.000Z` : undefined;
      let safeEndDate = formEndDate ? `${formEndDate}T00:00:00.000Z` : undefined;

      // Auto-compute safeEndDate if multi-destination and startDate provided without endDate
      if (safeStartDate && !safeEndDate && isMultiDestination) {
        const totalDays = finalLegs.reduce((acc, l) => acc + (Number(l.daysCount) || 1), 0);
        if (totalDays > 0) {
          const s = new Date(safeStartDate);
          const e = new Date(s.getTime() + (totalDays - 1) * 86400000);
          safeEndDate = e.toISOString();
        }
      }

      await createTripForUser(selectedUserId, {
        destination: finalDestination,
        title: formTitle.trim() || finalDestination || 'Roteiro de Viagem',
        startDate: safeStartDate,
        endDate: safeEndDate,
        preferences: parsedPrefs,
      });

      setIsCreateOpen(false);
      resetForm();
      fetchTrips();
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      const msg = err.response?.data?.message || err.message || 'Erro ao criar viagem para o usuário.';
      alert(`Erro ao criar viagem: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormTitle(trip.title || '');
    setFormDestination(trip.destination || '');
    setFormStartDate(trip.startDate ? trip.startDate.split('T')[0] : '');
    setFormEndDate(trip.endDate ? trip.endDate.split('T')[0] : '');
    setFormStatus(trip.status);
    setFormPreferences(
      typeof trip.preferences === 'object'
        ? JSON.stringify(trip.preferences, null, 2)
        : trip.preferences || ''
    );
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    setIsSaving(true);
    try {
      let parsedPrefs = {};
      if (formPreferences) {
        try {
          parsedPrefs = JSON.parse(formPreferences);
        } catch (err) {
          parsedPrefs = { raw: formPreferences };
        }
      }

      await updateTrip(editingTrip.id, {
        title: formTitle,
        destination: formDestination,
        startDate: formStartDate || undefined,
        endDate: formEndDate || undefined,
        status: formStatus,
        preferences: parsedPrefs
      });

      setIsEditOpen(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (err: any) {
      console.error('Failed to update trip:', err);
      alert('Erro ao atualizar dados da viagem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;
    try {
      await deleteTrip(id);
      fetchTrips();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert('Erro ao deletar viagem.');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDestination('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('DRAFT');
    setFormPreferences('{\n  "focus": "cultural",\n  "pace": "medium"\n}');
    setIsMultiDestination(false);
    setDestinationLegs([
      { name: '', daysCount: 3 },
      { name: '', daysCount: 3 },
    ]);
  };

  const hasActiveFilters = Boolean(destinationQuery.trim() || statusFilter !== 'ALL' || premiumFilter !== 'ALL');

  const resetFilters = () => {
    setDestinationQuery('');
    setStatusFilter('ALL');
    setPremiumFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="VIAGENS & ROTEIROS"
        title="Gestão de Viagens Geradas"
        subtitle="Monitoramento de roteiros criados no app, planos Premium liberados e personalizações por IA"
        breadcrumbs={[
          { label: 'Viagens', href: '/trips' },
          { label: 'Viagens no App' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrips}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Viagem para Usuário
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={destinationQuery}
        onSearchChange={setDestinationQuery}
        searchPlaceholder="Buscar por destino..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Todos os Status</option>
          <option value="DRAFT">Rascunho (Draft)</option>
          <option value="PUBLISHED">Publicada (Published)</option>
          <option value="ARCHIVED">Arquivada (Archived)</option>
        </select>

        <select
          value={premiumFilter}
          onChange={(e) => {
            setPremiumFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="ALL">Acesso: Todos</option>
          <option value="PREMIUM">Apenas Premium</option>
          <option value="FREE">Apenas Gratuito</option>
        </select>
      </FilterBar>

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchTrips} className="text-rose-700 text-xs h-7">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Trips Table Card */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Destino / Título</th>
                <th className="px-4 py-3">Cliente / Usuário</th>
                <th className="px-4 py-3 text-center">Dias</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Plano Access</th>
                <th className="px-4 py-3">Data da Viagem</th>
                <th className="px-4 py-3">Criada em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando viagens do 2GO Core...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      icon={Globe}
                      title="Nenhuma viagem encontrada"
                      description="Não foram encontradas viagens para os filtros selecionados."
                      action={hasActiveFilters ? { label: 'Limpar Filtros', onClick: resetFilters } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Destination & Title */}
                    <td className="px-4 py-3">
                      {(() => {
                        const { formattedDestination, customTitle, isMulti } = formatTripDestinationTitle(trip);
                        return (
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[280px]" title={formattedDestination}>
                                {formattedDestination}
                              </span>
                              {isMulti && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                                  Multi
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[280px]" title={customTitle}>
                              {customTitle}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      {trip.user ? (
                        <div>
                          <div className="font-semibold text-slate-900">{trip.user.fullName}</div>
                          <div className="text-[11px] text-slate-500">{trip.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Usuário não identificado</span>
                      )}
                    </td>

                    {/* Days Count */}
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">
                      {(() => {
                        const count = getTripDaysCount(trip);
                        return count !== null ? `${count} ${count === 1 ? 'dia' : 'dias'}` : '- dias';
                      })()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} />
                    </td>

                    {/* Premium Flag */}
                    <td className="px-4 py-3 text-center">
                      {(trip.premiumUnlockedAt || (trip as any).isPremium || (trip as any).premiumUnlocked) ? (
                        <StatusBadge status="PREMIUM" label="Full Access" />
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] text-slate-500 bg-slate-100 border border-slate-200">
                          Preview Gratuito
                        </span>
                      )}
                    </td>

                    {/* Trip Dates */}
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {trip.startDate ? (
                        <span>
                          {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                          {trip.endDate && ` → ${new Date(trip.endDate).toLocaleDateString('pt-BR')}`}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Sem data definida</span>
                      )}
                    </td>

                    {/* Creation Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(trip.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/trips/${trip.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(trip)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTrip(trip.id)}
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

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/40 text-xs text-slate-600">
          <div>
            Mostrando <b>{trips.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= meta.totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Sheet: Create Trip */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 space-y-4">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Criar Roteiro de Viagem</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Vincule um novo roteiro direto para um usuário cadastrado no 2GO Core.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateTrip} className="space-y-4 pt-2">
            {/* User Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Selecione o Cliente / Usuário *</label>
              <input
                type="text"
                placeholder="Filtrar usuário por nome ou email..."
                value={userSearchText}
                onChange={(e) => {
                  setUserSearchText(e.target.value);
                  fetchUsers(e.target.value);
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-1 focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-800"
              >
                <option value="" disabled>
                  {isSearchingUsers ? 'Buscando usuários...' : 'Selecione um cliente / usuário...'}
                </option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Multi-destinos toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
              <div className="space-y-0.5">
                <label htmlFor="multi-dest-toggle" className="text-xs font-bold text-[#001F5B] cursor-pointer">
                  Viagem com múltiplos destinos / cidades
                </label>
                <p className="text-[10px] text-slate-500">
                  Permite dividir o roteiro em cidades diferentes com divisão de dias
                </p>
              </div>
              <input
                type="checkbox"
                id="multi-dest-toggle"
                checked={isMultiDestination}
                onChange={(e) => setIsMultiDestination(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#001F5B] focus:ring-[#001F5B] cursor-pointer"
              />
            </div>

            {/* Destination inputs: single or multi */}
            {!isMultiDestination ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Destino da Viagem *</label>
                <Input
                  type="text"
                  placeholder="Ex: Paris, França ou Fernando de Noronha"
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#001F5B]" />
                    Cidades & Divisão de Dias
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Total: {destinationLegs.reduce((acc, l) => acc + (Number(l.daysCount) || 1), 0)} dias
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {destinationLegs.map((leg, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <div className="w-5 text-center text-[10px] font-bold text-slate-400">#{idx + 1}</div>
                      <Input
                        type="text"
                        placeholder="Nome da Cidade (ex: Roma)"
                        value={leg.name}
                        onChange={(e) => {
                          const updated = [...destinationLegs];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setDestinationLegs(updated);
                        }}
                        className="text-xs h-8 flex-1"
                        required
                      />
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          placeholder="Dias"
                          value={leg.daysCount}
                          onChange={(e) => {
                            const updated = [...destinationLegs];
                            updated[idx] = { ...updated[idx], daysCount: Math.max(1, parseInt(e.target.value, 10) || 1) };
                            setDestinationLegs(updated);
                          }}
                          className="text-xs h-8 text-center"
                          required
                        />
                        <span className="text-[10px] text-slate-400">dias</span>
                      </div>
                      {destinationLegs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDestinationLegs(destinationLegs.filter((_, i) => i !== idx))}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDestinationLegs([...destinationLegs, { name: '', daysCount: 3 }])}
                  className="w-full text-xs h-8 border-dashed border-slate-300 text-[#001F5B] hover:bg-white cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar outra cidade
                </Button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Título Personalizado</label>
              <Input
                type="text"
                placeholder="Ex: Roteiro Romântico de 7 Dias"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Data de Início</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Data de Fim</label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            {/* Preferences JSON */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Preferências do Roteiro (JSON)</label>
              <textarea
                rows={4}
                value={formPreferences}
                onChange={(e) => setFormPreferences(e.target.value)}
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              />
            </div>

            <SheetFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold shadow-2xs cursor-pointer"
              >
                {isSaving ? 'Gerando Viagem...' : 'Criar Viagem'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet: Edit Trip */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white border-l border-slate-200 p-6 space-y-4">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">Editar Detalhes da Viagem</SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Altere os parâmetros do roteiro cadastrado.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            {/* Destination */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Destino</label>
              <Input
                type="text"
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Título</label>
              <Input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Status do Roteiro</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as TripStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-800"
              >
                <option value="DRAFT">DRAFT (Rascunho)</option>
                <option value="PUBLISHED">PUBLISHED (Publicada)</option>
                <option value="ARCHIVED">ARCHIVED (Arquivada)</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Data de Início</label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Data de Fim</label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            {/* Preferences JSON */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Preferências (JSON)</label>
              <textarea
                rows={5}
                value={formPreferences}
                onChange={(e) => setFormPreferences(e.target.value)}
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              />
            </div>

            <SheetFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold shadow-2xs cursor-pointer"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
