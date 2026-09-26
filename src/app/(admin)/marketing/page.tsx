'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Plus, 
  Send, 
  Play, 
  Calendar, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  Trash2,
  Edit,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { 
  listCampaigns, 
  createCampaign, 
  dryRunCampaign, 
  sendTestEmail, 
  scheduleOrSendCampaign, 
  cancelCampaign, 
  Campaign, 
  listSegments, 
  listTemplates, 
  Segment, 
  EmailTemplate 
} from '@/services/marketing.service';

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // New Campaign Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPreheader, setNewPreheader] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCtaText, setNewCtaText] = useState('Ver Meu Roteiro');
  const [newCtaUrl, setNewCtaUrl] = useState('https://2goroteiros.com/roteiros');
  const [newSegmentId, setNewSegmentId] = useState('');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dry Run Modal State
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [isDryRunning, setIsDryRunning] = useState(false);

  // Send Test Modal State
  const [testCampaignId, setTestCampaignId] = useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        listCampaigns(filterStatus || undefined),
        listSegments(),
        listTemplates(),
      ]);
      setCampaigns(cRes);
      setSegments(sRes);
      setTemplates(tRes);
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim() || !newContent.trim()) {
      alert('Por favor, preencha Título, Assunto e Conteúdo da campanha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        title: newTitle.trim(),
        subject: newSubject.trim(),
        preheader: newPreheader.trim() || undefined,
        content: newContent.trim(),
        ctaText: newCtaText.trim() || undefined,
        ctaUrl: newCtaUrl.trim() || undefined,
        segmentId: newSegmentId || undefined,
        templateId: newTemplateId || undefined,
      });

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewSubject('');
      setNewPreheader('');
      setNewContent('');
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Failed to create campaign', err);
      alert(err.response?.data?.message || 'Erro ao criar campanha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDryRun = async (id: string) => {
    setIsDryRunning(true);
    setDryRunResult(null);
    try {
      const res = await dryRunCampaign(id);
      setDryRunResult(res);
    } catch (err: any) {
      console.error('Dry run failed', err);
      alert('Erro ao executar simulação de audiência.');
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCampaignId || !testEmailAddress.trim()) return;

    setIsSendingTest(true);
    try {
      await sendTestEmail(testCampaignId, testEmailAddress.trim());
      alert(`E-mail de teste enviado com sucesso para ${testEmailAddress}!`);
      setTestCampaignId(null);
      setTestEmailAddress('');
    } catch (err: any) {
      console.error('Send test email failed', err);
      alert(err.response?.data?.message || 'Erro ao enviar e-mail de teste.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTriggerSend = async (id: string) => {
    if (!confirm('Deseja iniciar o envio / agendamento desta campanha?')) return;
    try {
      await scheduleOrSendCampaign(id);
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Trigger send failed', err);
      alert(err.response?.data?.message || 'Erro ao processar disparo.');
    }
  };

  const handleCancelCampaign = async (id: string) => {
    if (!confirm('Deseja cancelar esta campanha?')) return;
    try {
      await cancelCampaign(id);
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Cancel campaign failed', err);
      alert('Erro ao cancelar campanha.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="MARKETING & REMARKETING"
        title="Campanhas de E-mail & Engajamento"
        subtitle="Ferramenta de Growth: crie campanhas, teste templates, simule audiência (Dry-Run) e acompanhe disparos"
        breadcrumbs={[
          { label: 'Marketing', href: '/marketing' },
          { label: 'Campanhas' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCampaigns}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nova Campanha
            </Button>
          </div>
        }
      />

      {/* Production Safety Banner */}
      <div className="p-3 bg-[#001F5B]/5 border border-[#001F5B]/15 rounded-xl flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#001F5B] text-white shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Trava de Segurança de Produção: </span>
            <span className="text-slate-600">
              <code className="bg-slate-200/80 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">MARKETING_EMAIL_ENABLED=false</code>.
              Nenhum e-mail de lote é disparado em produção sem liberação prévia do servidor. Use os botões de <b>Simulação (Dry-Run)</b> e <b>Envio de Teste</b> com segurança.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2">
        <Link href="/marketing" className="px-3 py-1.5 rounded-lg bg-[#001F5B] text-white text-xs font-semibold">
          Campanhas ({campaigns.length})
        </Link>
        <Link href="/marketing/templates" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 text-xs font-medium">
          Templates de E-mail ({templates.length})
        </Link>
        <Link href="/marketing/segments" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 text-xs font-medium">
          Segmentos de Audiência ({segments.length})
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar
        hasActiveFilters={Boolean(filterStatus)}
        onResetFilters={() => setFilterStatus('')}
      >
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todos os Status de Campanha</option>
          <option value="DRAFT">DRAFT (Rascunho)</option>
          <option value="SCHEDULED">SCHEDULED (Agendado)</option>
          <option value="SENDING">SENDING (Em Envio)</option>
          <option value="SENT">SENT (Enviado)</option>
          <option value="FAILED">FAILED (Falhou)</option>
        </select>
      </FilterBar>

      {/* Campaigns Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Título / Assunto</th>
                <th className="px-4 py-3">Segmento Alvo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Audiência (Alvo)</th>
                <th className="px-4 py-3 text-center">Entregues</th>
                <th className="px-4 py-3">Criada em</th>
                <th className="px-4 py-3 text-right">Ações de Operação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando módulo de marketing...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      icon={Megaphone}
                      title="Nenhuma campanha encontrada"
                      description="Crie a primeira campanha de marketing ou ajuste o filtro de status."
                      action={{ label: 'Nova Campanha', onClick: () => setIsCreateModalOpen(true) }}
                    />
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & Subject */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-500 italic">&quot;{c.subject}&quot;</div>
                    </td>

                    {/* Segment */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {c.segment?.name || 'Toda a Base LGPD'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Audience Count */}
                    <td className="px-4 py-3 text-center font-bold text-slate-900 font-sans">
                      {c.targetCount || 0}
                    </td>

                    {/* Sent Count */}
                    <td className="px-4 py-3 text-center font-bold text-emerald-700 font-sans">
                      {c.sentCount || 0}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDryRun(c.id)}
                          disabled={isDryRunning}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Simulação Dry-Run de Audiência"
                        >
                          <Play className="w-3.5 h-3.5 mr-1 text-[#FF6A00]" />
                          Dry-Run
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestCampaignId(c.id)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Enviar E-mail de Teste"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1 text-[#001F5B]" />
                          Teste
                        </Button>

                        {c.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => handleTriggerSend(c.id)}
                            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-7 px-2.5 font-semibold cursor-pointer"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Disparar
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
      </Card>

      {/* Modal: Dry Run Result */}
      {dryRunResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-[#FF6A00]" />
                Resultado da Simulação (Dry-Run)
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setDryRunResult(null)} className="h-7 text-xs">
                Fechar
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
                <p className="font-semibold text-slate-800">Total de Destinatários Elegíveis: <span className="text-lg font-bold text-[#001F5B]">{dryRunResult.eligibleUsersCount}</span></p>
                <p className="text-slate-500">Regra LGPD: Apenas usuários com consentimento ativo de marketing são computados.</p>
              </div>

              {dryRunResult.sampleUsers && dryRunResult.sampleUsers.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Amostra de E-mails Selecionados:</span>
                  <div className="max-h-40 overflow-y-auto p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-1">
                    {dryRunResult.sampleUsers.map((u: any, idx: number) => (
                      <div key={idx} className="truncate">{u.email} ({u.fullName})</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDryRunResult(null)} className="bg-[#001F5B] text-white text-xs h-8 px-4 font-semibold">
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Send Test Email */}
      {testCampaignId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSendTest} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Enviar E-mail de Teste</h3>
              <p className="text-xs text-slate-500">Dispara uma prévia real da campanha para o e-mail informado.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail de Destino do Teste *</label>
              <input
                type="email"
                placeholder="seu.email@roteiros2go.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setTestCampaignId(null)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSendingTest} className="bg-[#001F5B] text-white text-xs h-8 px-4 font-semibold">
                {isSendingTest ? 'Enviando...' : 'Enviar E-mail de Teste'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
