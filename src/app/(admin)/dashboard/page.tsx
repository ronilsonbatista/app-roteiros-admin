'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass, Users, Calendar, DollarSign, ArrowUpRight, UserCheck, Shield } from 'lucide-react';
import { useUser } from '@/app/(admin)/layout';

export default function DashboardPage() {
  const { user } = useUser();
  
  const userName = user?.name || 'Administrador';
  const userEmail = user?.email || 'admin@roteiros.com';
  const userRole = user?.role || 'administrator';

  const stats = [
    {
      title: 'Roteiros Ativos',
      value: '18',
      description: 'Publicados no app',
      change: '+2 este mês',
      icon: Compass,
      color: 'text-[#001F5B] bg-[#001F5B]/5 border-[#001F5B]/10',
    },
    {
      title: 'Clientes Cadastrados',
      value: '1.248',
      description: 'Contas registradas',
      change: '+12% vs. mês passado',
      icon: Users,
      color: 'text-[#FF6A00] bg-[#FF6A00]/5 border-[#FF6A00]/10',
    },
    {
      title: 'Itinerários Agendados',
      value: '94',
      description: 'Para as próximas semanas',
      change: '8 em andamento hoje',
      icon: Calendar,
      color: 'text-[#5E6118] bg-[#5E6118]/5 border-[#5E6118]/10',
    },
    {
      title: 'Faturamento',
      value: 'R$ 48.250',
      description: 'Volume transacionado',
      change: '+18.4% de crescimento',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Olá, {userName}!
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium">
          Bem-vindo ao painel administrativo. Veja o resumo de atividades e roteiros abaixo.
        </p>
      </div>

      {/* Grid containing session info card and standard metrics cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Dynamic User Profile Context Card */}
        <Card className="border-slate-200 bg-white shadow-md text-slate-700 md:col-span-3 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#001F5B]" />
              Sessão Administrativa
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Detalhes do usuário logado via API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nome</span>
              <span className="text-sm font-bold text-slate-800">{userName}</span>
            </div>
            
            <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</span>
              <span className="text-sm font-bold text-slate-800 truncate">{userEmail}</span>
            </div>
            
            <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#FF6A00]" />
                Nível de Acesso (Role)
              </span>
              <span className="text-xs font-bold text-[#FF6A00] bg-[#FF6A00]/5 border border-[#FF6A00]/10 px-2 py-1 rounded w-fit capitalize mt-1">
                {userRole}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid alongside */}
        <div className="grid gap-6 sm:grid-cols-2 md:col-span-3 lg:col-span-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-slate-200 bg-white shadow-sm text-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg border ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-[#001F5B]">{stat.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-emerald-600">
                    <span>{stat.change}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Details Box placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm text-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Roteiros Populares</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Os roteiros mais procurados e acessados pelos usuários no aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Rota do Vinho e Gastronomia', views: '2.480 visualizações', category: 'Cultural' },
              { name: 'Trilha das Cachoeiras Altas', views: '1.920 visualizações', category: 'Aventura' },
              { name: 'Centro Histórico e Museus', views: '1.240 visualizações', category: 'História' },
            ].map((route, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{route.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{route.category}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600">{route.views}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm text-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Atividade Recente</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Histórico recente de interações e sincronizações do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'Sincronização de rotas com a API', time: 'há 5 min', status: 'Sucesso' },
              { action: 'Login administrativo efetuado', time: 'há 10 min', status: 'Sucesso' },
              { action: 'Backup automatizado de dados', time: 'há 2 horas', status: 'Sucesso' },
            ].map((act, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">{act.action}</p>
                  <p className="text-[10px] text-slate-400">{act.time}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                  {act.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
