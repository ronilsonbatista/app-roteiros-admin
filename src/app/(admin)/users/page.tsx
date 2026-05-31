'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/(admin)/layout';
import {
  listUsers,
  blockUser,
  unblockUser,
  revokeUserSessions,
  getUserTrips,
  getUserTravelProfile,
  User,
  UserTrip,
  UserTravelProfile,
  TravelStyle,
  BudgetLevel,
  TripStatus
} from '@/services/users.service';

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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import {
  Search,
  RotateCw,
  UserCheck,
  UserX,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plane,
  MapPin,
  UserPlus,
  Eye,
  Crown,
  Sparkles,
  Globe,
  Coins,
  Check,
  X,
  Clock,
  Compass,
  Smile,
  AlertTriangle,
  Mail,
  User as UserIcon,
  Tag
} from 'lucide-react';

export default function UsersAdminPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Detail sheet state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserTrips, setSelectedUserTrips] = useState<UserTrip[]>([]);
  const [selectedUserTravelProfile, setSelectedUserTravelProfile] = useState<UserTravelProfile | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listUsers(page, limit, searchQuery);
      setUsers(response.data || []);
      setTotalUsers(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Não foi possível carregar a lista de usuários. Verifique se o servidor está ativo.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search triggers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  // Open details sheet for a user
  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    setSelectedUserTrips([]);
    setSelectedUserTravelProfile(null);
    
    try {
      const [trips, profile] = await Promise.all([
        getUserTrips(user.id),
        getUserTravelProfile(user.id)
      ]);
      setSelectedUserTrips(trips);
      setSelectedUserTravelProfile(profile);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  // Toggle User block status
  const handleToggleBlock = async (user: User) => {
    if (currentUser && currentUser.email === user.email) {
      alert('Não é possível bloquear a sua própria conta administrativa.');
      return;
    }

    const isBlocked = !!user.blockedAt;
    const confirmMessage = isBlocked
      ? `Deseja realmente desbloquear o usuário ${user.fullName || user.email}?`
      : `Deseja realmente bloquear o usuário ${user.fullName || user.email}? Ele não conseguirá mais acessar a plataforma.`;

    if (!window.confirm(confirmMessage)) return;

    setIsActionLoading(user.id);
    try {
      if (isBlocked) {
        await unblockUser(user.id);
      } else {
        await blockUser(user.id);
      }
      
      // Update local state instead of reloading
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === user.id) {
            return {
              ...u,
              blockedAt: isBlocked ? null : new Date().toISOString()
            };
          }
          return u;
        })
      );
      
      // Update selected details user if it is the one open
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser((prev) => prev ? { ...prev, blockedAt: isBlocked ? null : new Date().toISOString() } : null);
      }
    } catch (err: any) {
      console.error('Error toggling block status:', err);
      alert('Ocorreu um erro ao atualizar o status do usuário.');
    } finally {
      setIsActionLoading(null);
    }
  };

  // Revoke all user sessions
  const handleRevokeSessions = async (user: User) => {
    const confirmMessage = `Deseja desconectar todas as sessões ativas do usuário ${user.fullName || user.email}? Isso obrigará o usuário a fazer login novamente em todos os dispositivos.`;

    if (!window.confirm(confirmMessage)) return;

    setIsActionLoading(user.id);
    try {
      await revokeUserSessions(user.id);
      alert('Todas as sessões ativas foram revogadas com sucesso.');
    } catch (err: any) {
      console.error('Error revoking sessions:', err);
      alert('Ocorreu um erro ao revogar as sessões do usuário.');
    } finally {
      setIsActionLoading(null);
    }
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

  // Translation helpers
  const translateTravelStyle = (style: TravelStyle): string => {
    const map: Record<TravelStyle, string> = {
      ECONOMIC: 'Econômico',
      COMFORT: 'Confortável',
      LUXURY: 'Luxo',
      ADVENTURE: 'Aventura',
      FAMILY: 'Família',
      ROMANTIC: 'Romântico',
      PARTY: 'Balada',
      CULTURAL: 'Cultural'
    };
    return map[style] || style;
  };

  const translateBudgetLevel = (budget: BudgetLevel): string => {
    const map: Record<BudgetLevel, string> = {
      LOW: 'Baixo',
      MEDIUM: 'Médio',
      HIGH: 'Alto',
      PREMIUM: 'Premium'
    };
    return map[budget] || budget;
  };

  const translateTripStatus = (status: TripStatus): string => {
    const map: Record<TripStatus, string> = {
      DRAFT: 'Rascunho',
      ACTIVE: 'Ativa',
      COMPLETED: 'Concluída'
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header section with page actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Gestão de Usuários
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie contas de usuários, bloqueie acessos suspensos, revogue sessões e analise perfis de viagem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-11 px-4 shadow-sm flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
            Atualizar
          </Button>

          {/* 
            [DISABLED ACTION] "Criar Usuário" 
            Code Comment: O backend não disponibiliza endpoint para criação administrativa de usuário.
            Apenas usuários podem se cadastrar pelo aplicativo ou fluxo público.
          */}
          <Button
            disabled
            className="bg-slate-200 text-slate-400 cursor-not-allowed rounded-xl h-11 px-5 shadow-sm flex items-center gap-2"
            title="O backend não disponibiliza endpoint para criação administrativa de usuário"
          >
            <UserPlus className="w-4 h-4" />
            Criar Usuário
          </Button>
        </div>
      </div>

      {/* Search and Filters panel */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar usuário por nome ou e-mail..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-11 border-slate-200 focus-visible:ring-[#001F5B] rounded-xl text-slate-800"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-[#001F5B] hover:bg-[#001F5B]/90 text-white font-semibold rounded-xl h-11 px-6 shadow-sm cursor-pointer"
              >
                Buscar
              </Button>
              
              {(searchQuery || searchInput) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="hover:bg-slate-100 text-slate-500 rounded-xl h-11 px-4 cursor-pointer"
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main content view */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[40vh] text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4 animate-bounce duration-[3s]">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Falha na Comunicação</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">{error}</p>
          <Button 
            onClick={fetchUsers}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white flex items-center gap-2 cursor-pointer rounded-xl h-11 px-6 shadow"
          >
            <RotateCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </div>
      ) : isLoading ? (
        // Table Loading skeleton
        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-100 border-b border-slate-200" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-6">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <UserIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum Usuário Encontrado</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-6">
            {searchQuery 
              ? `Não encontramos resultados para a busca "${searchQuery}". Tente outros termos.`
              : 'Não há usuários cadastrados na plataforma até o momento.'}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer rounded-xl h-10 px-5 shadow-sm"
            >
              Limpar Filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200">
                  <TableHead className="font-bold text-slate-700 px-6 h-12">Usuário</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Perfil</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Status</TableHead>
                  <TableHead className="font-bold text-slate-700 px-4 h-12">Cadastrado em</TableHead>
                  <TableHead className="font-bold text-slate-700 px-6 h-12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                    {/* User profile card item */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#001F5B]/5 border border-[#001F5B]/10 flex items-center justify-center font-bold text-[#001F5B] uppercase text-sm">
                          {user.fullName ? user.fullName.substring(0, 2) : user.email.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {user.fullName || 'Usuário Sem Nome'}
                          </span>
                          <span className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role badge */}
                    <TableCell className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN'
                          ? 'bg-[#FF6A00]/5 text-[#FF6A00] border border-[#FF6A00]/10'
                          : 'bg-[#001F5B]/5 text-[#001F5B] border border-[#001F5B]/10'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell className="px-4 py-4">
                      {user.blockedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                          <UserX className="w-3 h-3 shrink-0" />
                          Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <UserCheck className="w-3 h-3 shrink-0" />
                          Ativo
                        </span>
                      )}
                    </TableCell>

                    {/* Creation date */}
                    <TableCell className="px-4 py-4 text-slate-500 text-sm">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Action buttons inside the row */}
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(user)}
                          className="hover:bg-[#001F5B]/5 text-[#001F5B] hover:text-[#001F5B] cursor-pointer rounded-lg h-9 w-9"
                          title="Ver Detalhes do Usuário"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isActionLoading === user.id}
                          onClick={() => handleToggleBlock(user)}
                          className={`cursor-pointer rounded-lg h-9 w-9 ${
                            user.blockedAt 
                              ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' 
                              : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={user.blockedAt ? "Desbloquear Usuário" : "Bloquear Usuário"}
                        >
                          {user.blockedAt ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isActionLoading === user.id}
                          onClick={() => handleRevokeSessions(user)}
                          className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer rounded-lg h-9 w-9"
                          title="Desconectar todas as sessões (Logout)"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-slate-500 text-sm font-medium">
              Mostrando <strong className="text-slate-900">{(page - 1) * limit + 1}</strong> a{' '}
              <strong className="text-slate-900">
                {Math.min(page * limit, totalUsers)}
              </strong>{' '}
              de <strong className="text-slate-900">{totalUsers}</strong> usuários
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || isLoading}
                className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer h-9 w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center text-sm font-semibold text-slate-700 px-2 select-none">
                Página {page} de {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || isLoading}
                className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer h-9 w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Sheet for User Details */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full shadow-2xl z-50">
          {selectedUser && (
            <>
              {/* Sheet Header */}
              <div className="p-6 border-b border-slate-100 bg-[#001F5B] text-white shrink-0">
                <div className="flex items-start justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white uppercase text-base shrink-0 shadow-sm">
                      {selectedUser.fullName ? selectedUser.fullName.substring(0, 2) : selectedUser.email.substring(0, 2)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h2 className="font-extrabold text-lg text-white leading-tight truncate">
                        {selectedUser.fullName || 'Usuário Sem Nome'}
                      </h2>
                      <span className="text-white/70 text-xs truncate mt-1">
                        {selectedUser.email}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                    selectedUser.role === 'ADMIN'
                      ? 'bg-[#FF6A00] text-white shadow-sm shadow-[#FF6A00]/25'
                      : 'bg-white/20 text-white'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Sheet Body Scroll Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Administrative Quick Action Alerts inside drawer */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status da Conta</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {selectedUser.blockedAt ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-bold text-red-600">Bloqueado</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600">Ativa e Regular</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membro Desde</span>
                    <span className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>
                </div>

                {isDetailsLoading ? (
                  // Detail Tabs Loading skeleton
                  <div className="space-y-4 animate-pulse pt-2">
                    <div className="h-8 bg-slate-100 rounded-lg w-full" />
                    <div className="h-40 bg-slate-100 rounded-xl" />
                    <div className="h-24 bg-slate-100 rounded-xl" />
                  </div>
                ) : (
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid grid-cols-2 bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 mb-5">
                      <TabsTrigger 
                        value="profile" 
                        className="py-2 text-xs font-bold rounded-lg data-active:bg-white data-active:text-[#001F5B] data-active:shadow-sm"
                      >
                        Perfil de Viagem
                      </TabsTrigger>
                      <TabsTrigger 
                        value="trips" 
                        className="py-2 text-xs font-bold rounded-lg data-active:bg-white data-active:text-[#001F5B] data-active:shadow-sm"
                      >
                        Viagens ({selectedUserTrips.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Traveler Profile Tab */}
                    <TabsContent value="profile" className="space-y-5">
                      {selectedUserTravelProfile ? (
                        <div className="space-y-5 text-slate-800">
                          {/* Bio */}
                          {selectedUserTravelProfile.bio && (
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Biografia
                              </span>
                              <p className="text-xs text-slate-600 italic">
                                "{selectedUserTravelProfile.bio}"
                              </p>
                            </div>
                          )}

                          {/* Basic settings */}
                          <div className="grid grid-cols-2 gap-4">
                            {selectedUserTravelProfile.budgetLevel && (
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                                  <Coins className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Orçamento</span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {translateBudgetLevel(selectedUserTravelProfile.budgetLevel)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {selectedUserTravelProfile.averageTripDuration && (
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#5E6118]/10 text-[#5E6118] border border-[#5E6118]/10">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duração Média</span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {selectedUserTravelProfile.averageTripDuration} dias
                                  </span>
                                </div>
                              </div>
                            )}

                            {selectedUserTravelProfile.passportCountry && (
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#001F5B]/10 text-[#001F5B] border border-[#001F5B]/10">
                                  <Globe className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passaporte</span>
                                  <span className="text-xs font-bold text-slate-700">
                                    {selectedUserTravelProfile.passportCountry}
                                  </span>
                                </div>
                              </div>
                            )}

                            {selectedUserTravelProfile.instagramHandle && (
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 border border-pink-500/10">
                                  <Globe className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Instagram</span>
                                  <a
                                    href={`https://instagram.com/${selectedUserTravelProfile.instagramHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-pink-600 hover:underline truncate"
                                  >
                                    @{selectedUserTravelProfile.instagramHandle}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Estilos de Viagem */}
                          {selectedUserTravelProfile.preferredStyles && selectedUserTravelProfile.preferredStyles.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Estilos de Viagem Preferidos
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedUserTravelProfile.preferredStyles.map((style) => (
                                  <span
                                    key={style}
                                    className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100"
                                  >
                                    {translateTravelStyle(style)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interesses de Viagem */}
                          {selectedUserTravelProfile.travelInterests && selectedUserTravelProfile.travelInterests.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Interesses de Viagem
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedUserTravelProfile.travelInterests.map((interest) => (
                                  <span
                                    key={interest}
                                    className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#001F5B] border border-blue-100/50"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Destinos e Companhias */}
                          <div className="space-y-3.5 border-t border-slate-100 pt-4">
                            {selectedUserTravelProfile.favoriteCountries && selectedUserTravelProfile.favoriteCountries.length > 0 && (
                              <div className="flex items-start gap-2 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-slate-700 block">Países Favoritos</strong>
                                  <span className="text-slate-500 mt-0.5 block">{selectedUserTravelProfile.favoriteCountries.join(', ')}</span>
                                </div>
                              </div>
                            )}

                            {selectedUserTravelProfile.favoriteCities && selectedUserTravelProfile.favoriteCities.length > 0 && (
                              <div className="flex items-start gap-2 text-xs">
                                <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-slate-700 block">Cidades Favoritas</strong>
                                  <span className="text-slate-500 mt-0.5 block">{selectedUserTravelProfile.favoriteCities.join(', ')}</span>
                                </div>
                              </div>
                            )}

                            {selectedUserTravelProfile.preferredLanguages && selectedUserTravelProfile.preferredLanguages.length > 0 && (
                              <div className="flex items-start gap-2 text-xs">
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-slate-700 block">Idiomas Preferidos</strong>
                                  <span className="text-slate-500 mt-0.5 block">{selectedUserTravelProfile.preferredLanguages.join(', ')}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Booleans Switch Preferences List */}
                          <div className="border-t border-slate-100 pt-4 space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Preferências de Atividades
                            </span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { name: 'Vida Noturna', val: selectedUserTravelProfile.prefersNightlife },
                                { name: 'Natureza / Outdoor', val: selectedUserTravelProfile.prefersNature },
                                { name: 'Gastronomia', val: selectedUserTravelProfile.prefersGastronomy },
                                { name: 'Museus e História', val: selectedUserTravelProfile.prefersMuseums },
                                { name: 'Compras', val: selectedUserTravelProfile.prefersShopping },
                                { name: 'Relaxamento / SPA', val: selectedUserTravelProfile.prefersRelaxing }
                              ].map((pref) => (
                                <div key={pref.name} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                                  {pref.val ? (
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <X className="w-4 h-4 text-slate-300 shrink-0" />
                                  )}
                                  <span className={`text-xs font-semibold ${pref.val ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {pref.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                          <Smile className="w-9 h-9 text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-700">Sem Perfil de Viajante</p>
                          <p className="text-slate-400 text-[11px] max-w-[240px] mt-1">
                            Este usuário ainda não respondeu ao questionário de estilo e perfil de viagem no app.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab 2: Trips List Tab */}
                    <TabsContent value="trips" className="space-y-3">
                      {selectedUserTrips.length > 0 ? (
                        selectedUserTrips.map((trip) => (
                          <div
                            key={trip.id}
                            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors flex items-start gap-3.5 relative overflow-hidden"
                          >
                            {/* Star badge for Premium Trip */}
                            {trip.premiumUnlockedAt && (
                              <div className="absolute right-0 top-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl flex items-center gap-1 shadow-sm">
                                <Crown className="w-2.5 h-2.5" />
                                Premium
                              </div>
                            )}

                            <div className="p-2 rounded-lg bg-[#001F5B]/5 border border-[#001F5B]/10 text-[#001F5B] shrink-0 mt-0.5">
                              <Plane className="w-4.5 h-4.5" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1 pr-14">
                              <h4 className="font-bold text-slate-900 text-xs leading-tight truncate">
                                {trip.title}
                              </h4>
                              
                              <span className="text-slate-400 text-[11px] flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                                {trip.destination}
                              </span>

                              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-300" />
                                  {trip.startDate ? formatDate(trip.startDate) : 'S/D'} a{' '}
                                  {trip.endDate ? formatDate(trip.endDate) : 'S/D'}
                                </span>
                                
                                <span className={`font-bold uppercase tracking-wider ${
                                  trip.status === 'ACTIVE'
                                    ? 'text-emerald-600'
                                    : trip.status === 'COMPLETED'
                                    ? 'text-blue-500'
                                    : 'text-slate-400'
                                }`}>
                                  {translateTripStatus(trip.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                          <Plane className="w-9 h-9 text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-700">Sem Viagens Cadastradas</p>
                          <p className="text-slate-400 text-[11px] max-w-[240px] mt-1">
                            Este usuário ainda não criou nenhum roteiro ou roteiro planejado na plataforma.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={isActionLoading === selectedUser.id}
                    onClick={() => handleToggleBlock(selectedUser)}
                    className={`cursor-pointer rounded-lg px-4 h-10 text-xs font-semibold ${
                      selectedUser.blockedAt
                        ? 'border-emerald-200 hover:bg-emerald-50 text-emerald-700'
                        : 'border-red-200 hover:bg-red-50 text-red-600'
                    }`}
                  >
                    {selectedUser.blockedAt ? 'Desbloquear Conta' : 'Bloquear Acesso'}
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
