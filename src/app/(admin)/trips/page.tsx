'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  listAllTrips,
  createTripForUser,
  updateTrip,
  deleteTrip,
  listUsersForSelection,
  Trip,
  TripStatus
} from '@/services/trips.service';
import { User } from '@/services/users.service';

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
  Crown,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  LayoutGrid
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
      setError('Não foi possível carregar as viagens planejadas.');
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

  // Handle Search Users
  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserSearchText(val);
    fetchUsers(val);
  };

  // Open Create Drawer
  const handleOpenCreate = () => {
    setFormTitle('');
    setFormDestination('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('DRAFT');
    setFormPreferences('{\n  "focus": "cultural",\n  "pace": "medium"\n}');
    setSelectedUserId('');
    setUserSearchText('');
    setIsCreateOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormTitle(trip.title);
    setFormDestination(trip.destination);
    setFormStartDate(trip.startDate ? trip.startDate.split('T')[0] : '');
    setFormEndDate(trip.endDate ? trip.endDate.split('T')[0] : '');
    setFormStatus(trip.status);
    setFormPreferences(trip.preferences ? JSON.stringify(trip.preferences, null, 2) : '{}');
    setIsEditOpen(true);
  };

  // Save Trip (Create or Edit)
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim()) {
      alert('Título e Destino são obrigatórios.');
      return;
    }

    let parsedPreferences = {};
    if (formPreferences.trim()) {
      try {
        parsedPreferences = JSON.parse(formPreferences);
      } catch (err) {
        alert('As preferências devem estar em formato JSON válido.');
        return;
      }
    }

    setIsSaving(true);
    const payload = {
      title: formTitle,
      destination: formDestination,
      startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
      endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
      status: formStatus,
      preferences: parsedPreferences
    };

    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, payload);
        alert('Viagem atualizada com sucesso.');
        setIsEditOpen(false);
      } else {
        if (!selectedUserId) {
          alert('Por favor, selecione um viajante.');
          setIsSaving(false);
          return;
        }
        await createTripForUser(selectedUserId, payload);
        alert('Viagem criada com sucesso.');
        setIsCreateOpen(false);
      }
      fetchTrips();
    } catch (err) {
      console.error('Error saving trip:', err);
      alert('Erro ao salvar a viagem. Verifique as datas e os campos informados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (trip: Trip) => {
    if (!window.confirm(`Deseja realmente remover a viagem "${trip.title}"? Todos os dias, cronogramas e itens de itinerário associados serão removidos permanentemente.`)) {
      return;
    }

    try {
      await deleteTrip(trip.id);
      alert('Viagem removida com sucesso.');
      fetchTrips();
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Erro ao excluir a viagem.');
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Editor de Viagens Operacionais
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie, atualize e opere roteiros e diários reais criados pelos usuários e viajantes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchTrips}
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
            Nova Viagem
          </Button>
        </div>
      </div>

      {/* Filter panel card */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search query */}
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destino</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por destino ou local..."
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  className="pl-9 h-10 border-slate-200 focus-visible:ring-[#001F5B] rounded-xl text-slate-800 text-xs"
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
                <option value="ACTIVE">Ativos (Active)</option>
                <option value="COMPLETED">Concluídos (Completed)</option>
              </select>
            </div>

            {/* Premium Filter */}
            <div className="w-full md:w-48 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acesso</label>
              <select
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B] cursor-pointer"
              >
                <option value="ALL">Todos os Planos</option>
                <option value="PREMIUM">Premium</option>
                <option value="BASIC">Gratuito / Básico</option>
              </select>
            </div>
            
            {/* Clear Filters */}
            {(destinationQuery || statusFilter !== 'ALL' || premiumFilter !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDestinationQuery('');
                  setStatusFilter('ALL');
                  setPremiumFilter('ALL');
                  setCurrentPage(1);
                }}
                className="hover:bg-slate-100 text-slate-500 rounded-xl h-10 px-4 cursor-pointer text-xs w-full md:w-auto"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content table */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[40vh] text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Falha de Conexão</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">{error}</p>
          <Button 
            onClick={fetchTrips}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white flex items-center gap-2 cursor-pointer rounded-xl h-11 px-6 shadow"
          >
            <RotateCw className="w-4 h-4" />
            Recarregar
          </Button>
        </div>
      ) : isLoading ? (
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
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Compass className="w-7 h-7 animate-pulse text-[#001F5B]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Nenhuma Viagem Encontrada</h3>
          <p className="text-slate-500 text-xs max-w-sm mb-6">
            Nenhuma viagem foi cadastrada ou corresponde aos filtros ativos.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-xl h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Criar Viagem
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200">
                  <TableHead className="font-bold text-slate-700 px-6 h-12">Roteiro / Título</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Viajante (Dono)</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Destino</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Período</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Dias</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Status / Acesso</TableHead>
                  <TableHead className="font-bold text-slate-700 px-6 h-12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                    {/* Title */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-center font-bold text-orange-600 text-xs shrink-0">
                          <Compass className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[180px]">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {trip.title || 'Viagem Sem Título'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                            {trip.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Owner/User */}
                    <TableCell className="px-4 py-4">
                      {trip.user ? (
                        <div className="flex flex-col min-w-0 max-w-[150px]">
                          <span className="font-bold text-slate-800 text-xs truncate">{trip.user.fullName}</span>
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {trip.user.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sem Viajante</span>
                      )}
                    </TableCell>

                    {/* Destination */}
                    <TableCell className="px-4 py-4">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {trip.destination}
                      </span>
                    </TableCell>

                    {/* Dates */}
                    <TableCell className="px-4 py-4 text-slate-500 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span>{trip.startDate ? formatDate(trip.startDate) : 'S/D'}</span>
                        {trip.endDate && <span className="text-[10px] text-slate-400">até {formatDate(trip.endDate)}</span>}
                      </div>
                    </TableCell>

                    {/* Days count */}
                    <TableCell className="px-4 py-4 text-xs font-bold text-slate-700">
                      {trip._count?.days || trip.days?.length || 0} dias
                    </TableCell>

                    {/* Status & Access */}
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 w-fit">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit ${
                          trip.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : trip.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {trip.status === 'ACTIVE' ? 'Ativo' : trip.status === 'COMPLETED' ? 'Concluído' : 'Rascunho'}
                        </span>
                        
                        {trip.premiumUnlockedAt ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 w-fit">
                            <Crown className="w-2.5 h-2.5 shrink-0" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100 w-fit">
                            Básico
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/trips/${trip.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-[#001F5B]/5 text-[#001F5B] hover:text-[#001F5B] cursor-pointer rounded-lg h-9 w-9"
                            title="Operar Roteiro (Painel de Controle)"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(trip)}
                          className="text-slate-500 hover:text-[#FF6A00] hover:bg-orange-50 cursor-pointer rounded-lg h-9 w-9"
                          title="Editar Viagem"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTrip(trip)}
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-lg h-9 w-9"
                          title="Excluir Viagem"
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

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-xs text-slate-400 font-medium">
                Página {meta.page} de {meta.totalPages} (Total de {meta.total} roteiros)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                  className="h-8.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawer: Create / Edit User Trip */}
      <Sheet open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setEditingTrip(null);
        }
      }}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          <form onSubmit={handleSaveTrip} className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
              <h2 className="font-extrabold text-base text-white">
                {isEditOpen ? 'Editar Viagem Administrativa' : 'Criar Viagem para Usuário'}
              </h2>
              <p className="text-white/70 text-xs mt-1">
                {isEditOpen ? 'Altere as especificações gerais do cronograma do viajante.' : 'Defina os dados gerais e associe a viagem a um viajante cadastrado.'}
              </p>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* User Selection (For creation only) */}
              {isCreateOpen && (
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selecionar Viajante (Dono) *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Buscar viajante por nome/email..."
                      value={userSearchText}
                      onChange={handleUserSearchChange}
                      className="pl-9 h-9 border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="mt-2">
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                    >
                      {usersList.length === 0 ? (
                        <option value="" disabled>Nenhum viajante encontrado</option>
                      ) : (
                        usersList.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email})
                          </option>
                        ))
                      )}
                    </select>
                    {isSearchingUsers && <span className="text-[10px] text-slate-400 italic block mt-1">Buscando na lista...</span>}
                  </div>
                </div>
              )}

              {/* Title & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Viagem *</label>
                  <Input
                    required
                    type="text"
                    placeholder="Ex: Minha Lua de Mel"
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
                    placeholder="Ex: Barcelona, Espanha"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Início</label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Término</label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TripStatus)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="DRAFT">Rascunho (Draft)</option>
                  <option value="ACTIVE">Ativo (Active)</option>
                  <option value="COMPLETED">Concluído (Completed)</option>
                </select>
              </div>

              {/* Preferences JSON */}
              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Preferências (JSON)
                </label>
                <textarea
                  rows={6}
                  placeholder='Ex: { "focus": "cultural", "pace": "medium" }'
                  value={formPreferences}
                  onChange={(e) => setFormPreferences(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-slate-200 font-mono text-xs border border-slate-800 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setEditingTrip(null);
                }}
                className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white font-semibold rounded-lg px-5 h-10 text-xs cursor-pointer transition-colors duration-200"
              >
                {isSaving ? 'Salvando...' : 'Salvar Viagem'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
