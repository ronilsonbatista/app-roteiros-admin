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

  const handleDryRun = async (campaignId: string) => {
    setIsDryRunning(true);
    setDryRunResult(null);
    try {
      const res = await dryRunCampaign(campaignId);
      setDryRunResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao executar Dry-Run da campanha.');
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleSendTest = async () => {
    if (!testCampaignId || !testEmailAddress.trim()) {
      alert('Informe um e-mail válido para envio de teste.');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await sendTestEmail(testCampaignId, testEmailAddress.trim());
      alert(`E-mail de teste enviado com sucesso para ${testEmailAddress}!`);
      setTestCampaignId(null);
      setTestEmailAddress('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar e-mail de teste.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleScheduleOrSend = async (campaignId: string) => {
    if (!confirm('Deseja realmente iniciar o envio/agendamento desta campanha? O Core aplicará filtros estritos de consentimento LGPD.')) {
      return;
    }

    try {
      const res = await scheduleOrSendCampaign(campaignId);
      alert(res.message || 'Campanha disparada/agendada com sucesso.');
      await fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao disparar campanha.');
    }
  };

  const handleCancel = async (campaignId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta campanha?')) return;
    try {
      await cancelCampaign(campaignId);
      await fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar campanha.');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">Rascunho</span>;
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Agendada</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 animate-pulse">Enviando...</span>;
      case 'SENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Enviada</span>;
      case 'PARTIALLY_SENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">Parcial</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">Falha</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">Cancelada</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#FF6A00]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Marketing & Campanhas de E-mail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão segura de campanhas com proteção fail-closed, validação prévia de audiência (Dry-Run) e conformidade LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/marketing/segments">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Segmentos
            </Button>
          </Link>
          <Link href="/marketing/templates">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Templates
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <div>
          <b>Arquitetura Fail-Closed Ativa:</b> Nenhum e-mail de marketing é enviado sem consentimento expresso (LGPD). Em ambiente Production com provider pendente, a execução real em massa permanece bloqueada no Core.
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">Todos os Status</option>
            <option value="DRAFT">Rascunhos</option>
            <option value="SCHEDULED">Agendadas</option>
            <option value="SENT">Enviadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCampaigns}
            disabled={isLoading}
            className="h-8 text-xs text-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total de Campanhas: <b>{campaigns.length}</b>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Campanha / Assunto</th>
                <th className="px-4 py-3">Segmento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Audiência</th>
                <th className="px-4 py-3 text-center">Enviados</th>
                <th className="px-4 py-3 text-center">Entregues</th>
                <th className="px-4 py-3 text-center">Abertos</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Ações Seguras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#FF6A00]" />
                    Carregando campanhas do Core...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Nenhuma campanha encontrada. Crie sua primeira campanha para iniciar.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.subject}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.segment?.name || 'Todos com Consentimento'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(c.status)}
                    </td>

                    <td className="px-4 py-3 text-center font-semibold text-slate-900">
                      {c.targetCount}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-600">
                      {c.sentCount}
                    </td>

                    <td className="px-4 py-3 text-center text-emerald-700 font-semibold">
                      {c.deliveredCount}
                    </td>

                    <td className="px-4 py-3 text-center text-purple-700 font-semibold">
                      {c.openedCount}
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Dry Run Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDryRun(c.id)}
                          className="h-7 text-[11px] px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          title="Simular audiência e exclusões LGPD"
                        >
                          Dry-Run
                        </Button>

                        {/* Send Test Email */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTestCampaignId(c.id);
                            setTestEmailAddress('');
                          }}
                          className="h-7 text-[11px] px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Enviar e-mail de teste único"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Teste
                        </Button>

                        {/* Schedule / Send */}
                        {c.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => handleScheduleOrSend(c.id)}
                            className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Disparar
                          </Button>
                        )}

                        {/* Cancel */}
                        {c.status === 'SCHEDULED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(c.id)}
                            className="h-7 text-[11px] px-2 text-red-600 hover:bg-red-50"
                          >
                            Cancelar
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

      {/* CREATE CAMPAIGN MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Criar Nova Campanha de E-mail
            </h2>

            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título Interno da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Remarketing - Abandono de Checkout Semana 38"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Segmento Alvo</label>
                  <select
                    value={newSegmentId}
                    onChange={(e) => setNewSegmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="">Todos com Consentimento Marketing</option>
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Template Base (Opcional)</label>
                  <select
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="">Sem Template (Conteúdo Livre)</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assunto do E-mail</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seu roteiro exclusivo para Roma está pronto para você"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preheader (Texto de Apoio)</label>
                <input
                  type="text"
                  placeholder="Ex: Descubra cada detalhe da sua próxima experiência inesquecível..."
                  value={newPreheader}
                  onChange={(e) => setNewPreheader(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conteúdo da Mensagem</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Olá {nome}, preparamos um roteiro inteligente para você aproveitar ao máximo cada momento..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Variáveis seguras aceitas: &#123;nome&#125;, &#123;destino&#125;, &#123;ctaUrl&#125;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Texto do Botão (CTA)</label>
                  <input
                    type="text"
                    value={newCtaText}
                    onChange={(e) => setNewCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Link do Botão (URL)</label>
                  <input
                    type="url"
                    value={newCtaUrl}
                    onChange={(e) => setNewCtaUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#FF6A00] hover:bg-[#E55F00] text-white"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Campanha'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRY RUN RESULT MODAL */}
      {dryRunResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Relatório de Auditoria Dry-Run
              </h3>
              <button
                onClick={() => setDryRunResult(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-slate-900">{dryRunResult.title}</p>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Identificado</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{dryRunResult.totalAudienceIdentified}</div>
                </div>
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-200 text-center">
                  <div className="text-[10px] text-red-600 uppercase font-semibold">Sem Consentimento</div>
                  <div className="text-base font-bold text-red-700 mt-0.5">{dryRunResult.excludedNoMarketingConsent}</div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
                  <div className="text-[10px] text-emerald-600 uppercase font-semibold">Destinatários Válidos</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">{dryRunResult.validDeliverableRecipients}</div>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                <b>Proteção Certificada:</b> Usuários sem consentimento LGPD foram excluídos da fila de envio antes de qualquer contato com o provider.
              </div>

              {dryRunResult.sampleRecipients && dryRunResult.sampleRecipients.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Amostra de Destinatários Válidos:</span>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 max-h-32 overflow-y-auto space-y-1">
                    {dryRunResult.sampleRecipients.map((r: any) => (
                      <div key={r.id} className="text-[11px] text-slate-600">
                        <b>{r.fullName}</b> ({r.email})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full bg-[#001F5B] hover:bg-[#001744] text-white"
              onClick={() => setDryRunResult(null)}
            >
              Fechar Auditoria
            </Button>
          </div>
        </div>
      )}

      {/* SEND TEST MODAL */}
      {testCampaignId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Enviar E-mail de Teste</h3>
            <p className="text-slate-500">
              Dispara uma mensagem de teste real para validar assunto, preheader, formatação e layout mobile/desktop.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">E-mail do Destinatário de Teste</label>
              <input
                type="email"
                required
                placeholder="seu-email@dominio.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestCampaignId(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isSendingTest}
                onClick={handleSendTest}
                className="bg-[#001F5B] hover:bg-[#001744] text-white"
              >
                {isSendingTest ? 'Enviando...' : 'Enviar Teste'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
