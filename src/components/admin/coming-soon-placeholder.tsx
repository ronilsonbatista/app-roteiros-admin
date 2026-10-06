'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from './page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  Megaphone,
  BarChart3,
  Layers,
  MailCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ComingSoonPlaceholderProps {
  moduleName: string;
  moduleDescription: string;
  iconName?: 'Megaphone' | 'BarChart3' | 'Layers' | 'MailCheck';
  breadcrumbs?: Array<{ label: string; href?: string }>;
  features?: string[];
}

export default function ComingSoonPlaceholder({
  moduleName,
  moduleDescription,
  iconName = 'Megaphone',
  breadcrumbs,
  features,
}: ComingSoonPlaceholderProps) {
  const getIcon = () => {
    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 className="w-10 h-10 text-[#001F5B]" />;
      case 'Layers':
        return <Layers className="w-10 h-10 text-[#001F5B]" />;
      case 'MailCheck':
        return <MailCheck className="w-10 h-10 text-[#001F5B]" />;
      case 'Megaphone':
      default:
        return <Megaphone className="w-10 h-10 text-[#001F5B]" />;
    }
  };

  const defaultFeatures =
    iconName === 'BarChart3'
      ? [
          'Monitoramento em tempo real do funil de conversão',
          'Taxa de conclusão do questionário e geração de roteiros',
          'Métricas consolidadas de engajamento e retenção',
          'Relatórios executivos e exportação de dados',
        ]
      : [
          'Disparos automatizados e réguas de relacionamento',
          'Templates dinâmicos de e-mail e push notification',
          'Segmentação inteligente por perfil e destino de viagem',
          'Testes A/B e relatórios de abertura e engajamento',
        ];

  const displayFeatures = features || defaultFeatures;

  return (
    <div className="space-y-6">
      <PageHeader
        category="PAINEL DE GESTÃO 2GO"
        title={moduleName}
        subtitle={moduleDescription}
        breadcrumbs={breadcrumbs || [{ label: 'Painel', href: '/dashboard' }, { label: 'Em breve' }]}
        actions={
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Voltar ao Dashboard
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main notice card */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
              <div className="w-20 h-20 rounded-2xl bg-[#001F5B]/5 border border-[#001F5B]/10 flex items-center justify-center shrink-0">
                {getIcon()}
              </div>

              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                  Módulo em Breve
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {moduleName} em Homologação
                </h2>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Esta funcionalidade está em fase final de homologação interna pela equipe de produto da 2GO.
                  O acesso operacional aos fluxos de envio, mutação e métricas está temporariamente reservado.
                </p>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Recursos em Preparação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-xs text-slate-600">
                    O código do módulo permanece arquivado e protegido no repositório. Nenhuma rota ou serviço foi excluído.
                  </p>
                </div>
                <Link href="/dashboard" className="shrink-0">
                  <Button
                    size="sm"
                    className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-8 shadow-xs cursor-pointer transition-colors"
                  >
                    Painel Principal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side info card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden p-6 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#001F5B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6A00]" />
              Status de Liberação
            </h4>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Por diretriz da governança de produto 2GO, novos módulos passam por testes de estresse e homologação
                antes de serem expostos operacionalmente aos administradores.
              </p>
              <div className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 text-[11px] text-orange-800">
                <strong>Previsão de Ativação:</strong> Disponível nas próximas versões do Painel de Gestão.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
