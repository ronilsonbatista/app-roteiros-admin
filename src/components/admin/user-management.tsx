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
  UserTravelProfile
} from '@/services/users.service';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';

import {
  UserCheck,
  UserX,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Users
} from 'lucide-react';

export default function UserManagement({ role = 'USER' }: { role?: 'USER' | 'ADMIN' }) {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  
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

  const fetchUsersList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listUsers(page, limit, searchInput.trim() || undefined, role);
      setUsers(response.data);
      setTotalUsers(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError('Não foi possível carregar os usuários.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchInput, role]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  const handleOpenDetails = async (userToView: User) => {
    setSelectedUser(userToView);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    setSelectedUserTrips([]);
    setSelectedUserTravelProfile(null);

    try {
      const [tripsData, profileData] = await Promise.all([
        getUserTrips(userToView.id).catch(() => []),
        getUserTravelProfile(userToView.id).catch(() => null)
      ]);
      setSelectedUserTrips(tripsData);
      setSelectedUserTravelProfile(profileData);
    } catch (err) {
      console.error('Failed to load user detail sub-data:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Deseja realmente bloquear o acesso deste usuário?')) return;
    setIsActionLoading(userId);
    try {
      await blockUser(userId);
      await fetchUsersList();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, blockedAt: new Date().toISOString() } : null);
      }
    } catch (err: any) {
      alert('Erro ao bloquear usuário.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setIsActionLoading(userId);
    try {
      await unblockUser(userId);
      await fetchUsersList();
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, blockedAt: null } : null);
      }
    } catch (err: any) {
      alert('Erro ao desbloquear usuário.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    if (!confirm('Deseja encerrar todas as sessões ativas deste usuário?')) return;
    setIsActionLoading(userId);
    try {
      await revokeUserSessions(userId);
      alert('Sessões encerradas com sucesso.');
    } catch (err: any) {
      alert('Erro ao revogar sessões.');
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category={role === 'ADMIN' ? 'CONFIGURAÇÕES' : 'CLIENTES & CRM'}
        title={role === 'ADMIN' ? 'Administradores' : 'Viajantes'}
        subtitle={role === 'ADMIN' ? 'Equipe com acesso ao painel de gestão e controles de acesso.' : 'Todos os viajantes cadastrados na plataforma, seus perfis e viagens.'}
        breadcrumbs={[
          { label: role === 'ADMIN' ? 'Configurações' : 'Clientes & CRM' },
          { label: role === 'ADMIN' ? 'Administradores' : 'Viajantes' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsersList}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por nome ou e-mail..."
        hasActiveFilters={Boolean(searchInput.trim())}
        onResetFilters={() => setSearchInput('')}
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Nome / Usuário</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel (RBAC)</th>
                <th className="px-4 py-3">Status da Conta</th>
                <th className="px-4 py-3">Data de Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando usuários do sistema...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      icon={Users}
                      title="Nenhum usuário encontrado"
                      description="Não foram encontrados usuários para a pesquisa realizada."
                    />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.fullName || 'Sem Nome'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#001F5B]/10 text-[#001F5B]">
                        {u.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={(u.blockedAt || (u as any).isBlocked) ? 'BLOCKED' : 'ACTIVE'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(u)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver Perfil
                        </Button>

                        {(u.blockedAt || (u as any).isBlocked) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading === u.id}
                            onClick={() => handleUnblockUser(u.id)}
                            className="text-xs h-7 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Desbloquear
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isActionLoading === u.id || u.email === currentUser?.email}
                            onClick={() => handleBlockUser(u.id)}
                            className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Bloquear
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/40 text-xs text-slate-600">
          <div>
            Mostrando <b>{users.length}</b> de <b>{totalUsers}</b> registros (Página {page} de {totalPages || 1})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white border-l border-slate-200 p-6 space-y-4 overflow-y-auto text-xs">
          <SheetHeader className="border-b border-slate-100 pb-3">
            <SheetTitle className="text-base font-bold text-slate-900">
              {selectedUser?.role === 'ADMIN' ? 'Perfil do Administrador' : 'Perfil do Viajante'}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              {selectedUser?.role === 'ADMIN'
                ? 'Informações da conta administrativa e status de acesso ao painel.'
                : 'Informações de acesso, viagens e preferências.'}
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{selectedUser.fullName || 'Sem Nome'}</span>
                  <StatusBadge status={(selectedUser.blockedAt || (selectedUser as any).isBlocked) ? 'BLOCKED' : 'ACTIVE'} />
                </div>
                <p className="text-slate-500">{selectedUser.email}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedUser.id}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSessions(selectedUser.id)}
                    className="text-[11px] h-7 text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Encerrar Sessões
                  </Button>
                </div>
              </div>

              {selectedUser.role === 'ADMIN' ? (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-900">Acesso Administrativo</p>
                  <p className="text-xs text-slate-500">
                    Este usuário é um administrador do sistema. Contas administrativas possuem acesso completo ao painel de gestão e não gerenciam viagens de lazer pessoais como viajante do app.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="trips" className="space-y-3">
                  <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="trips" className="text-xs font-semibold px-3 py-1">
                      Viagens ({selectedUserTrips.length})
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="text-xs font-semibold px-3 py-1">
                      Perfil de Viagem
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="trips">
                    {selectedUserTrips.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">Nenhuma viagem criada por este usuário.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedUserTrips.map((t) => (
                          <div key={t.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{t.destination}</p>
                              <p className="text-[11px] text-slate-500">{t.title || 'Roteiro'}</p>
                            </div>
                            <StatusBadge status={t.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="profile">
                    {selectedUserTravelProfile ? (
                      <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] whitespace-pre-wrap">
                        {JSON.stringify(selectedUserTravelProfile, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-400 py-4 text-center">Nenhum perfil de viagem preenchido.</p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
