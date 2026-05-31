'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { listUsersForSelection, listUserTrips } from '@/services/trips.service';
import { User, UserTrip, TripStatus } from '@/services/users.service';

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
  Plane,
  MapPin,
  Calendar,
  Crown,
  Eye,
  Trash2,
  Edit,
  Plus,
  Compass,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';

export default function TripsAdminPage() {
  // State for user list
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  
  // Selected user and their trips
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<UserTrip[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState(false);
  
  // Details Sheet state
  const [selectedTrip, setSelectedTrip] = useState<UserTrip | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch users for selector sidebar
  const fetchUsers = useCallback(async (searchQuery = '') => {
    setIsUsersLoading(true);
    setError(null);
    try {
      const data = await listUsersForSelection(searchQuery);
      setUsers(data);
      
      // Auto-select first user if none selected
      if (data.length > 0 && !selectedUser) {
        setSelectedUser(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Não foi possível carregar a lista de usuários.');
    } finally {
      setIsUsersLoading(false);
    }
  }, [selectedUser]);

  // Load trips for selected user
  const fetchTrips = useCallback(async (userId: string) => {
    setIsTripsLoading(true);
    try {
      const data = await listUserTrips(userId);
      setTrips(data);
    } catch (err) {
      console.error('Error fetching user trips:', err);
      setTrips([]);
    } finally {
      setIsTripsLoading(false);
    }
  }, []);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch trips when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchTrips(selectedUser.id);
    } else {
      setTrips([]);
    }
  }, [selectedUser, fetchTrips]);

  // Handle user search submit
  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(userSearch);
  };

  // Open details sheet for a trip
  const handleViewTripDetails = (trip: UserTrip) => {
    setSelectedTrip(trip);
    setIsDetailsOpen(true);
  };

  // Format date helper
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

  // Trip translation helper
  const translateTripStatus = (status: TripStatus): string => {
    const map: Record<TripStatus, string> = {
      DRAFT: 'Rascunho',
      ACTIVE: 'Ativa',
      COMPLETED: 'Concluída'
    };
    return map[status] || status;
  };

  // Calculate metrics for selected user
  const totalTrips = trips.length;
  const premiumTrips = trips.filter(t => !!t.premiumUnlockedAt).length;
  const activeTrips = trips.filter(t => t.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Gestão de Viagens
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie os roteiros e viagens criados pelos viajantes da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              fetchUsers(userSearch);
              if (selectedUser) fetchTrips(selectedUser.id);
            }}
            disabled={isUsersLoading || isTripsLoading}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-11 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${(isUsersLoading || isTripsLoading) ? 'animate-spin text-[#001F5B]' : ''}`} />
            Atualizar
          </Button>

          {/* 
            [DISABLED ACTION] "Criar Viagem"
            Code Comment: A criação de viagens exige dados pessoais do usuário ativo. 
            O backend não disponibiliza criação administrativa direta em lote ou para terceiros.
          */}
          <Button
            disabled
            className="bg-slate-200 text-slate-400 cursor-not-allowed rounded-xl h-11 px-5 shadow-sm flex items-center gap-2"
            title="A criação de viagens está disponível apenas no aplicativo do viajante"
          >
            <Plus className="w-4 h-4" />
            Criar Viagem
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Split-screen layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: User Selection (4 cols on medium+) */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#001F5B]" />
                Selecionar Viajante
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Escolha um usuário para listar suas viagens
              </p>
            </div>
            
            <CardContent className="p-4 space-y-3">
              {/* Search User Form */}
              <form onSubmit={handleUserSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-10 border-slate-200 rounded-lg text-xs"
                />
              </form>

              {/* Scrollable User Selector List */}
              <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                {isUsersLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 animate-pulse bg-slate-50/50">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : users.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-xs italic">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#001F5B] text-white border-[#001F5B] shadow-md shadow-[#001F5B]/15'
                            : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50/75 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-[#001F5B]/5 text-[#001F5B] border border-[#001F5B]/10'
                          }`}>
                            {u.fullName ? u.fullName.substring(0, 2) : u.email.substring(0, 2)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs truncate leading-tight">
                              {u.fullName || 'Usuário Sem Nome'}
                            </span>
                            <span className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                              {u.email}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: User Trips Dashboard & Table (8 cols on medium+) */}
        <div className="md:col-span-8 space-y-6">
          {selectedUser ? (
            <>
              {/* Selected User Header Card */}
              <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#001F5B]/5 border border-[#001F5B]/10 flex items-center justify-center font-bold text-[#001F5B] uppercase text-sm shrink-0">
                      {selectedUser.fullName ? selectedUser.fullName.substring(0, 2) : selectedUser.email.substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                        Viagens de {selectedUser.fullName || 'Usuário Sem Nome'}
                      </h2>
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedUser.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#001F5B] bg-[#001F5B]/5 border border-[#001F5B]/10 px-2 py-0.5 rounded capitalize w-fit">
                    Viajante {selectedUser.role.toLowerCase()}
                  </span>
                </div>

                {/* Sub-Metrics Row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Total Criadas
                    </span>
                    <strong className="text-lg font-extrabold text-slate-900 block mt-1">
                      {isTripsLoading ? '-' : totalTrips}
                    </strong>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Versão Premium
                    </span>
                    <strong className="text-lg font-extrabold text-amber-500 block mt-1 flex items-center justify-center gap-1">
                      {isTripsLoading ? '-' : (
                        <>
                          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                          {premiumTrips}
                        </>
                      )}
                    </strong>
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Viagens Ativas
                    </span>
                    <strong className="text-lg font-extrabold text-emerald-600 block mt-1">
                      {isTripsLoading ? '-' : activeTrips}
                    </strong>
                  </div>
                </div>
              </Card>

              {/* Trips Table Card */}
              {isTripsLoading ? (
                <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="h-12 bg-slate-100 border-b border-slate-200" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-6">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/6" />
                      <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <Plane className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Nenhuma Viagem Cadastrada</h3>
                  <p className="text-slate-500 text-xs max-w-xs">
                    Este viajante ainda não possui nenhum roteiro ou viagem planejada em sua conta.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/75">
                      <TableRow className="border-slate-200">
                        <TableHead className="font-bold text-slate-700 px-6 h-12">Roteiro / Título</TableHead>
                        <TableHead className="font-bold text-slate-700 px-4 h-12">Destino</TableHead>
                        <TableHead className="font-bold text-slate-700 px-4 h-12">Período</TableHead>
                        <TableHead className="font-bold text-slate-700 px-4 h-12">Status / Acesso</TableHead>
                        <TableHead className="font-bold text-slate-700 px-6 h-12 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                          {/* Title / Cover info */}
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/5 border border-orange-500/10 flex items-center justify-center font-bold text-orange-600 text-xs shrink-0">
                                <Plane className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0 max-w-[200px]">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {trip.title || 'Viagem Sem Título'}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  ID: {trip.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>
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
                              <span>De: {trip.startDate ? formatDate(trip.startDate) : 'S/D'}</span>
                              <span>Até: {trip.endDate ? formatDate(trip.endDate) : 'S/D'}</span>
                            </div>
                          </TableCell>

                          {/* Status and Premium access tags */}
                          <TableCell className="px-4 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit ${
                                trip.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : trip.status === 'COMPLETED'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-slate-50 text-slate-400 border border-slate-100'
                              }`}>
                                {translateTripStatus(trip.status)}
                              </span>
                              
                              {trip.premiumUnlockedAt ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 w-fit">
                                  <Crown className="w-2.5 h-2.5 shrink-0" />
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100 w-fit">
                                  Gratuito
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Individual list actions */}
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTripDetails(trip)}
                                className="hover:bg-[#001F5B]/5 text-[#001F5B] hover:text-[#001F5B] cursor-pointer rounded-lg h-9 w-9"
                                title="Ver Detalhes do Roteiro"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              {/* 
                                [DISABLED ACTION] "Editar Viagem"
                                Code Comment: Ação restrita por falta de endpoint de escrita para admins.
                              */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="text-slate-300 cursor-not-allowed rounded-lg h-9 w-9"
                                title="Editar Viagem (Ação restrita ao viajante no app)"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              {/* 
                                [DISABLED ACTION] "Deletar Viagem"
                                Code Comment: Ação restrita por falta de endpoint de remoção para admins.
                              */}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="text-slate-300 cursor-not-allowed rounded-lg h-9 w-9"
                                title="Excluir Viagem (Ação restrita ao viajante no app)"
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl min-h-[450px]">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
                <Compass className="w-8 h-8 animate-pulse text-[#001F5B]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Selecione um Viajante</h3>
              <p className="text-slate-400 text-xs max-w-sm">
                Use o painel lateral para escolher um viajante cadastrado e gerenciar seus roteiros.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Details Sheet for User Trip */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          {selectedTrip && (
            <>
              {/* Sheet Header */}
              <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
                <div className="flex items-start justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Plane className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h2 className="font-extrabold text-base text-white leading-tight truncate">
                        {selectedTrip.title || 'Roteiro Sem Título'}
                      </h2>
                      <span className="text-white/70 text-xs truncate mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedTrip.destination}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                    selectedTrip.status === 'ACTIVE'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : selectedTrip.status === 'COMPLETED'
                      ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-white/20 text-white'
                  }`}>
                    {translateTripStatus(selectedTrip.status)}
                  </span>
                </div>
              </div>

              {/* Sheet Scroll Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* General Metadata section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Info className="w-4 h-4 text-[#FF6A00]" />
                    Informações Gerais
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID da Viagem</span>
                      <span className="text-xs font-mono font-bold text-slate-700 mt-1 block truncate">
                        {selectedTrip.id}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proprietário (ID)</span>
                      <span className="text-xs font-mono font-bold text-slate-700 mt-1 block truncate">
                        {selectedTrip.userId}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Início</span>
                      <span className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {selectedTrip.startDate ? formatDate(selectedTrip.startDate) : 'Não definida'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Fim</span>
                      <span className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {selectedTrip.endDate ? formatDate(selectedTrip.endDate) : 'Não definida'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acesso Premium</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {selectedTrip.premiumUnlockedAt ? (
                          <>
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600">Desbloqueado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-400">Gratuito / Básico</span>
                          </>
                        )}
                      </div>
                    </div>

                    {selectedTrip.premiumUnlockedAt && (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Desbloqueado em</span>
                        <span className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {formatDate(selectedTrip.premiumUnlockedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences JSON viewer */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <LayoutGrid className="w-4 h-4 text-[#001F5B]" />
                    Preferências do Roteiro
                  </h3>

                  {selectedTrip.preferences ? (
                    <div className="p-4 bg-slate-950 text-slate-200 border border-slate-900 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[250px] shadow-inner">
                      <pre>{JSON.stringify(selectedTrip.preferences, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Nenhuma preferência específica foi cadastrada para esta viagem.
                    </p>
                  )}
                </div>

                {/* Restricted Administrative API notice cards */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex gap-3 text-xs text-amber-700">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Dias do Roteiro e Itinerário</strong>
                      <span className="mt-1 block text-amber-600/90 leading-normal">
                        O detalhamento completo das atividades diárias e pontos turísticos do roteiro é restrito e gerenciado individualmente por dia/itens pelo proprietário. A API administrativa não retorna dias ou itens aninhados neste escopo.
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex gap-3 text-xs text-amber-700">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Participantes da Viagem</strong>
                      <span className="mt-1 block text-amber-600/90 leading-normal">
                        A lista de e-mails convidados e participantes ativos para cooperação nesta viagem exige autorização de leitura específica do proprietário no aplicativo.
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sheet Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  className="border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer rounded-lg px-4 h-10 text-xs"
                >
                  Fechar Painel
                </Button>

                <div className="flex gap-2">
                  {/* Visual stubs for write operations in detail footer */}
                  <Button
                    disabled
                    className="bg-slate-200 text-slate-400 cursor-not-allowed rounded-lg px-4 h-10 text-xs font-semibold"
                    title="Ação administrativa restrita pelo backend"
                  >
                    Editar Roteiro
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
