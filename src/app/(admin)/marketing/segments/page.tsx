'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Users, 
  Eye, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { 
  listSegments, 
  createSegment, 
  deleteSegment, 
  previewAudience, 
  Segment, 
  AudiencePreviewResult 
} from '@/services/marketing.service';

export default function MarketingSegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Segment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('');
  const [hasPurchases, setHasPurchases] = useState<string>('all');
  const [hasTrips, setHasTrips] = useState<string>('all');
  const [destination, setDestination] = useState('');
  const [daysInactive, setDaysInactive] = useState<string>('');

  // Audience Preview State
  const [previewResult, setPreviewResult] = useState<AudiencePreviewResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSegments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listSegments();
      setSegments(res);
    } catch (err) {
      console.error('Failed to load segments', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const buildCriteria = () => {
    const criteria: Record<string, any> = {};
    if (stage) criteria.stage = stage;
    if (hasPurchases === 'true') criteria.hasPurchases = true;
    if (hasPurchases === 'false') criteria.hasPurchases = false;
    if (hasTrips === 'true') criteria.hasTrips = true;
    if (hasTrips === 'false') criteria.hasTrips = false;
    if (destination.trim()) criteria.destination = destination.trim();
    if (daysInactive) criteria.daysInactive = parseInt(daysInactive, 10);
    return criteria;
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const criteria = buildCriteria();
      const res = await previewAudience(criteria);
      setPreviewResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao calcular audiência.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSaveSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do segmento.');
      return;
    }

    setIsSaving(true);
    try {
      const criteria = buildCriteria();
      await createSegment({
        name: name.trim(),
        description: description.trim() || undefined,
        filterCriteria: criteria,
      });

      setIsModalOpen(false);
      setName('');
      setDescription('');
      setPreviewResult(null);
      await fetchSegments();
    } catch (err: any) {
      console.error('Failed to create segment', err);
      alert(err.response?.data?.message || 'Erro ao salvar segmento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!confirm('Deseja excluir este segmento de audiência?')) return;
    try {
      await deleteSegment(id);
      await fetchSegments();
    } catch (err) {
      console.error('Failed to delete segment', err);
      alert('Erro ao excluir segmento.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="MARKETING & REMARKETING"
        title="Segmentos de Audiência (LGPD Safe)"
        subtitle="Regras de agrupamento de usuários baseadas em estágio do funil, histórico de compras e consentimento"
        breadcrumbs={[
          { label: 'Marketing', href: '/marketing' },
          { label: 'Segmentos' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/marketing">
              <Button variant="outline" size="sm" className="text-xs h-9 bg-white border-slate-200 text-slate-700">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Voltar para Campanhas
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setPreviewResult(null);
                setIsModalOpen(true);
              }}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Segmento
            </Button>
          </div>
        }
      />

      {/* Grid */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200/90">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
          Carregando segmentos de audiência...
        </Card>
      ) : segments.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum segmento de audiência"
          description="Crie regras dinâmicas de segmentação para enviar campanhas altamente direcionadas."
          action={{ label: 'Novo Segmento', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s) => (
            <Card key={s.id} className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3 flex flex-col justify-between hover:shadow-xs transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Segmento LGPD Safe
                  </span>
                  <StatusBadge status="ACTIVE" label="Ativo" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                {s.description && <p className="text-xs text-slate-500">{s.description}</p>}

                {/* Criteria Breakdown */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 font-mono text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-700 text-[10px] uppercase">Critérios Registrados:</div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(s.filterCriteria || (s as any).criteria || {}, null, 2)}</pre>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-mono">
                  {(s as any).userCount !== undefined ? `${(s as any).userCount} usuários` : 'Audiência Dinâmica'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSegment(s.id)}
                  className="text-xs h-7 text-rose-600 hover:bg-rose-50 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Segment */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveSegment} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in text-xs max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Novo Segmento de Audiência</h3>
              <p className="text-xs text-slate-500">Combine filtros comportamentais para calcular o número de destinatários.</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nome do Segmento *</label>
              <Input
                type="text"
                placeholder="Ex: Prospects com Carrinho Abandonado em Paris"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Descrição Comercial</label>
              <Input
                type="text"
                placeholder="Objetivo estratégico da audiência..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] font-mono block">Filtros de Segmentação</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Estágio do Funil</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="CUSTOMER_PAID">Cliente Pago</option>
                    <option value="PROSPECT">Prospect (Preview)</option>
                    <option value="CUSTOMER_UNPAID">Cadastrado Sem Compra</option>
                    <option value="LEAD">Lead Inicial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Filtro de Compras</label>
                  <select
                    value={hasPurchases}
                    onChange={(e) => setHasPurchases(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="all">Todas</option>
                    <option value="true">Com Compra</option>
                    <option value="false">Sem Compra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Filtro de Viagens</label>
                  <select
                    value={hasTrips}
                    onChange={(e) => setHasTrips(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="all">Todas</option>
                    <option value="true">Com Viagem</option>
                    <option value="false">Sem Viagem</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Destino Específico</label>
                  <Input
                    type="text"
                    placeholder="Ex: Paris"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-xs h-8 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Calculate Audience Button */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={isPreviewing}
                className="text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {isPreviewing ? 'Calculando...' : 'Calcular Tamanho da Audiência'}
              </Button>

              {previewResult && (
                <span className="font-mono text-xs font-bold text-[#001F5B]">
                  {previewResult.deliverableAudience ?? (previewResult as any).eligibleCount ?? 0} usuários elegíveis LGPD
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold cursor-pointer">
                {isSaving ? 'Salvando...' : 'Criar Segmento'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
