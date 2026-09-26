'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  ArrowLeft, 
  RefreshCw,
  MailCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { 
  listTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  EmailTemplate 
} from '@/services/marketing.service';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('REMARKETING');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listTemplates(selectedCategory || undefined);
      setTemplates(res);
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('REMARKETING');
    setSubject('');
    setPreheader('');
    setHtmlContent(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>2GO Roteiros</title></head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <h1 style="color: #001F5B; font-size: 20px;">Olá, {nome}!</h1>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      Identificamos seu interesse no destino <strong>{destino}</strong>. Seu itinerário inteligente está aguardando você.
    </p>
    <div style="margin-top: 24px; text-align: center;">
      <a href="{ctaUrl}" style="background-color: #FF6A00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
        Acessar Meu Roteiro
      </a>
    </div>
  </div>
</body>
</html>`);
    setPlainText('Olá {nome}! Seu itinerário para {destino} está pronto. Acesse: {ctaUrl}');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (t: EmailTemplate) => {
    setEditingId(t.id);
    setTitle(t.title);
    setCategory(t.category);
    setSubject(t.subject);
    setPreheader(t.preheader || '');
    setHtmlContent(t.htmlContent);
    setPlainText(t.plainText || '');
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !htmlContent.trim()) {
      alert('Preencha Título, Assunto e HTML do modelo.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        subject: subject.trim(),
        preheader: preheader.trim() || undefined,
        htmlContent: htmlContent.trim(),
        plainText: plainText.trim() || undefined,
      };

      if (editingId) {
        await updateTemplate(editingId, payload);
      } else {
        await createTemplate(payload);
      }

      setIsEditorOpen(false);
      await fetchTemplates();
    } catch (err: any) {
      console.error('Failed to save template', err);
      alert(err.response?.data?.message || 'Erro ao salvar template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este template de e-mail?')) return;
    try {
      await deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template', err);
      alert('Erro ao excluir template.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="MARKETING & REMARKETING"
        title="Templates de E-mail Provedor 2GO"
        subtitle="Modelos HTML transacionais e promocionais pré-formatados com suporte a variáveis dinâmicas"
        breadcrumbs={[
          { label: 'Marketing', href: '/marketing' },
          { label: 'Templates' }
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
              onClick={handleOpenCreate}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Template
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        hasActiveFilters={Boolean(selectedCategory)}
        onResetFilters={() => setSelectedCategory('')}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todas as Categorias</option>
          <option value="REMARKETING">Remarketing</option>
          <option value="ONBOARDING">Boas-vindas / Onboarding</option>
          <option value="PROMOTIONAL">Promocional</option>
          <option value="TRANSACTIONAL">Transacional / Checkout</option>
        </select>
      </FilterBar>

      {/* Grid */}
      {isLoading ? (
        <Card className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200/90">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
          Carregando templates de e-mail...
        </Card>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={MailCheck}
          title="Nenhum template cadastrado"
          description="Crie o primeiro modelo HTML de e-mail para utilizar nas campanhas."
          action={{ label: 'Novo Template', onClick: handleOpenCreate }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id} className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3 flex flex-col justify-between hover:shadow-xs transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#001F5B] bg-[#001F5B]/10 px-2 py-0.5 rounded font-mono">
                    {t.category}
                  </span>
                  <StatusBadge status={t.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-500 italic truncate">&quot;{t.subject}&quot;</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(t)}
                  className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Eye className="w-3.5 h-3.5 mr-1 text-[#FF6A00]" />
                  Preview
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(t)}
                    className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                    className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)} className="h-7 text-xs">
                Fechar
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Título Interno *</label>
                <Input
                  type="text"
                  placeholder="Ex: Remarketing de Carrinho Abandonado"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="REMARKETING">Remarketing</option>
                    <option value="ONBOARDING">Boas-vindas / Onboarding</option>
                    <option value="PROMOTIONAL">Promocional</option>
                    <option value="TRANSACTIONAL">Transacional / Checkout</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assunto do E-mail (Subject) *</label>
                  <Input
                    type="text"
                    placeholder="Ex: Seu roteiro para {destino} está pronto!"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="text-xs h-9 bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Conteúdo HTML (Inlined CSS) *</label>
                <textarea
                  rows={12}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  required
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)} className="text-xs h-9">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-5 font-semibold cursor-pointer">
                  {isSaving ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Prévia do Template: {previewTemplate.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Assunto: {previewTemplate.subject}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)} className="h-7 text-xs">
                Fechar
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
