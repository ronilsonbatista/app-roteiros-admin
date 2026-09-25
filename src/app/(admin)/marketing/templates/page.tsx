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
  CheckCircle2, 
  RefreshCw,
  Code,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      alert('Preencha título, assunto e conteúdo HTML do template.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateTemplate(editingId, {
          title: title.trim(),
          category,
          subject: subject.trim(),
          preheader: preheader.trim() || undefined,
          htmlContent,
          plainText: plainText || undefined,
        });
      } else {
        await createTemplate({
          title: title.trim(),
          category,
          subject: subject.trim(),
          preheader: preheader.trim() || undefined,
          htmlContent,
          plainText: plainText || undefined,
          variables: ['nome', 'destino', 'ctaUrl'],
        });
      }
      setIsEditorOpen(false);
      await fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este template?')) return;
    try {
      await deleteTemplate(id);
      await fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir template.');
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
            <FileText className="w-6 h-6 text-[#001F5B]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Biblioteca de Templates de E-mail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modelos de comunicação com interpolação segura de dados e suporte a visualização responsiva.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">Todas as Categorias</option>
          <option value="ONBOARDING">Onboarding & Boas-Vindas</option>
          <option value="PLANNING_ABANDON">Abandono de Planejamento</option>
          <option value="CHECKOUT_ABANDON">Abandono de Checkout</option>
          <option value="REMARKETING">Remarketing Geral</option>
          <option value="UPCOMING_TRIP">Viagem Futura</option>
          <option value="POST_TRIP">Pós-Viagem</option>
          <option value="EDITORIAL">Editorial & Novidades</option>
        </select>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTemplates}
          disabled={isLoading}
          className="h-8 text-xs text-slate-500"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
            Carregando templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Nenhum template cadastrado nesta categoria. Clique em &quot;Novo Template&quot; para criar.
          </div>
        ) : (
          templates.map((tpl) => (
            <Card key={tpl.id} className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {tpl.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(tpl.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{tpl.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  <b>Assunto:</b> {tpl.subject}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {tpl.variables?.map((v) => (
                    <span key={v} className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                      &#123;{v}&#125;
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(tpl)}
                  className="text-xs h-7 px-2 text-slate-600 hover:text-slate-900"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Preview
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(tpl)}
                    className="text-xs h-7 px-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tpl.id)}
                    className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* TEMPLATE EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              {editingId ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Template</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria de Comunicação</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="PLANNING_ABANDON">Abandono de Planejamento</option>
                    <option value="CHECKOUT_ABANDON">Abandono de Checkout</option>
                    <option value="REMARKETING">Remarketing</option>
                    <option value="UPCOMING_TRIP">Viagem Futura</option>
                    <option value="POST_TRIP">Pós-Viagem</option>
                    <option value="EDITORIAL">Editorial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assunto Padrão</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preheader Padrão</label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Código HTML do E-mail</label>
                  <span className="text-[10px] text-slate-400">Variáveis: &#123;nome&#125;, &#123;destino&#125;, &#123;ctaUrl&#125;</span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono border border-slate-800 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Versão em Texto Puro (Fallback)</label>
                <textarea
                  rows={3}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-[#001F5B] hover:bg-[#001744] text-white"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Visualização do Template: {previewTemplate.title}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div><b>Assunto:</b> {previewTemplate.subject}</div>
              {previewTemplate.preheader && <div><b>Preheader:</b> {previewTemplate.preheader}</div>}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <iframe
                title="Preview"
                srcDoc={previewTemplate.htmlContent
                  .replace(/\{nome\}/g, 'Carlos Silva')
                  .replace(/\{destino\}/g, 'Paris')
                  .replace(/\{ctaUrl\}/g, 'https://2goroteiros.com')}
                className="w-full h-80 border-0"
              />
            </div>

            <Button
              className="w-full bg-slate-800 text-white"
              onClick={() => setPreviewTemplate(null)}
            >
              Fechar Visualização
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
