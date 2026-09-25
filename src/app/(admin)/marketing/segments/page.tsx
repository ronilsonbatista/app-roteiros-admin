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
      alert(err.response?.data?.message || 'Erro ao criar segmento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este segmento?')) return;
    try {
      await deleteSegment(id);
      await fetchSegments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir segmento.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/marketing" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Layers className="w-6 h-6 text-[#FF6A00]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Segmentos de Clientes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filtros reutilizáveis de audiência para remarketing, análise de cohort e proteção LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setPreviewResult(null);
              setIsModalOpen(true);
            }}
            className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Segmento
          </Button>
        </div>
      </div>

      {/* Segments Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Nome do Segmento</th>
                <th className="px-4 py-3">Critérios de Filtro</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FF6A00]" />
                    Carregando segmentos...
                  </td>
                </tr>
              ) : segments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    Nenhum segmento salvo. Crie segmentos dinâmicos como &quot;Abandono de Checkout&quot; ou &quot;Clientes Pagos&quot;.
                  </td>
                </tr>
              ) : (
                segments.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{seg.name}</div>
                      {seg.description && <div className="text-[11px] text-slate-500">{seg.description}</div>}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-[10px] bg-slate-100 p-1.5 rounded max-w-sm overflow-x-auto text-slate-600">
                        {JSON.stringify(seg.filterCriteria)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {seg.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(seg.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(seg.id)}
                        className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE SEGMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Construir Segmento Dinâmico
            </h2>

            <form onSubmit={handleSaveSegment} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome do Segmento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clientes que Geraram Preview mas Não Compraram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Finalidade operacional deste segmento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Critérios de Segmentação:</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Estágio do Cliente</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700"
                    >
                      <option value="">Qualquer Estágio</option>
                      <option value="PROSPECT">Prospect (Chegou ao Preview)</option>
                      <option value="CUSTOMER_UNPAID">Cadastrado Sem Compra</option>
                      <option value="CUSTOMER_PAID">Cliente Pago</option>
                      <option value="LEAD">Lead Inicial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Compras Realizadas</label>
                    <select
                      value={hasPurchases}
                      onChange={(e) => setHasPurchases(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700"
                    >
                      <option value="all">Indiferente</option>
                      <option value="false">Sem Nenhuma Compra</option>
                      <option value="true">Com Pelo Menos 1 Compra</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Viagens Criadas</label>
                    <select
                      value={hasTrips}
                      onChange={(e) => setHasTrips(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700"
                    >
                      <option value="all">Indiferente</option>
                      <option value="true">Com Viagem Criada</option>
                      <option value="false">Sem Viagem</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Destino de Interesse</label>
                    <input
                      type="text"
                      placeholder="Ex: Paris, Roma, Tóquio..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    disabled={isPreviewing}
                    className="text-xs h-8 border-[#FF6A00]/40 text-[#FF6A00] hover:bg-[#FF6A00]/5 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isPreviewing ? 'Calculando...' : 'Calcular Audiência Prévia'}
                  </Button>
                </div>
              </div>

              {/* Preview Result Banner */}
              {previewResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Resultado do Pré-Cálculo:</span>
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> LGPD Aplicado
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <div className="text-[10px] text-slate-400">Total Filtrado</div>
                      <div className="font-bold text-slate-800 text-sm">{previewResult.totalAudience}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <div className="text-[10px] text-red-500">Sem Consentimento</div>
                      <div className="font-bold text-red-600 text-sm">{previewResult.excludedNoConsent}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-100">
                      <div className="text-[10px] text-emerald-600">Audiência Entregável</div>
                      <div className="font-bold text-emerald-700 text-sm">{previewResult.deliverableAudience}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-[#001F5B] hover:bg-[#001744] text-white"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Segmento'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
