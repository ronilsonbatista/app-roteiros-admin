'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  Search,
  Globe,
  Tag,
  Wand2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  listBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  publishBlogPost, 
  deleteBlogPost, 
  BlogPost 
} from '@/services/blog.service';
import { requestEditorialAssist } from '@/services/ai-intelligence.service';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Post Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Dicas de Viagem');
  const [tagsInput, setTagsInput] = useState('');
  const [destinationsInput, setDestinationsInput] = useState('');
  const [authorName, setAuthorName] = useState('Equipe 2GO');
  const [coverImage, setCoverImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [isSaving, setIsSaving] = useState(false);

  // AI Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAction, setAiAction] = useState<'GENERATE_DRAFT' | 'SUGGEST_TITLES' | 'SEO_META' | 'SUMMARIZE' | 'IMPROVE_TEXT'>('GENERATE_DRAFT');
  const [aiTopic, setAiTopic] = useState('');
  const [aiDestination, setAiDestination] = useState('');
  const [aiAudience, setAiAudience] = useState('Viajantes exigentes que buscam sofisticação e praticidade');
  const [aiContext, setAiContext] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const fetchPosts = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const res = await listBlogPosts({
        page: pageToLoad,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setPosts(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load blog posts', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setContent('');
    setCategory('Dicas de Viagem');
    setTagsInput('roteiro, dicas, turismo');
    setDestinationsInput('');
    setAuthorName('Equipe 2GO');
    setCoverImage('');
    setSeoTitle('');
    setSeoDescription('');
    setStatus('DRAFT');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setSummary(p.summary || '');
    setContent(p.content);
    setCategory(p.category);
    setTagsInput(p.tags?.join(', ') || '');
    setDestinationsInput(p.relatedDestinations?.join(', ') || '');
    setAuthorName(p.authorName);
    setCoverImage(p.coverImage || '');
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setStatus(p.status);
    setIsEditorOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Informe o título e o conteúdo do post.');
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const relatedDestinations = destinationsInput
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const payload: Partial<BlogPost> = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim() || undefined,
        content,
        category,
        tags,
        relatedDestinations,
        authorName: authorName.trim() || 'Equipe 2GO',
        coverImage: coverImage.trim() || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        status,
      };

      if (editingId) {
        await updateBlogPost(editingId, payload);
      } else {
        await createBlogPost(payload);
      }

      setIsEditorOpen(false);
      await fetchPosts(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar artigo de blog.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Deseja publicar este artigo? Ele ficará visível publicamente no Blog do 2GO.')) return;
    try {
      await publishBlogPost(id);
      await fetchPosts(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao publicar artigo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    try {
      await deleteBlogPost(id);
      await fetchPosts(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir artigo.');
    }
  };

  // AI Assistant Trigger
  const handleRunAiAssist = async () => {
    setIsAiGenerating(true);
    setAiOutput('');
    try {
      const res = await requestEditorialAssist({
        action: aiAction,
        topic: aiTopic || title || 'Dicas de Viagem',
        destination: aiDestination || undefined,
        targetAudience: aiAudience,
        existingContent: content || summary || undefined,
        context: aiContext,
      });

      setAiOutput(res.output);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao executar assistente de IA.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiOutput = () => {
    if (!aiOutput) return;

    if (aiAction === 'GENERATE_DRAFT') {
      setContent(aiOutput);
      setStatus('DRAFT');
    } else if (aiAction === 'SUGGEST_TITLES') {
      const firstLine = aiOutput.split('\n')[0]?.replace(/^\d+\.\s*/, '') || aiOutput;
      setTitle(firstLine);
    } else if (aiAction === 'SUMMARIZE') {
      setSummary(aiOutput);
    } else if (aiAction === 'SEO_META') {
      setSeoDescription(aiOutput);
    } else if (aiAction === 'IMPROVE_TEXT') {
      setContent(aiOutput);
    }

    setIsAiModalOpen(false);
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PUBLISHED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Publicado</span>;
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Rascunho</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Em Revisão</span>;
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Agendado</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">Arquivado</span>;
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
            <FileText className="w-6 h-6 text-[#001F5B]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Blog & CMS de Conteúdo</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão editorial com suporte de IA para redação de rascunhos, SEO e publicação no site público 2GO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Novo Artigo
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou resumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">Todos os Status</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="REVIEW">Em Revisão</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">Todas as Categorias</option>
          <option value="Dicas de Viagem">Dicas de Viagem</option>
          <option value="Roteiros Exclusivos">Roteiros Exclusivos</option>
          <option value="Gastronomia">Gastronomia</option>
          <option value="Cultura & História">Cultura & História</option>
        </select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchPosts(1)}
          disabled={isLoading}
          className="h-8 text-xs text-slate-500"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Posts Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Artigo / Slug</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Publicado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando artigos do Core...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Nenhum artigo encontrado. Crie um novo artigo com apoio da IA.
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">/{p.slug}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {p.authorName}
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(p.status)}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('pt-BR') : '-'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(p.id)}
                            className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="h-7 text-[11px] px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                          className="h-7 text-[11px] px-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ARTICLE EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? 'Editar Artigo de Blog' : 'Novo Artigo de Blog'}
              </h2>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setAiTopic(title);
                  setIsAiModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Assistente Editorial IA
              </Button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Título do Artigo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5 Experiências Gastronômicas Inesquecíveis em Roma"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="Dicas de Viagem">Dicas de Viagem</option>
                    <option value="Roteiros Exclusivos">Roteiros Exclusivos</option>
                    <option value="Gastronomia">Gastronomia</option>
                    <option value="Cultura & História">Cultura & História</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Slug (URL amigável)</label>
                  <input
                    type="text"
                    placeholder="ex: experiencias-gastronomicas-roma (opcional)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Autor</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resumo Executivo / Sinopse</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="Breve introdução que aparecerá nos cards do blog..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Conteúdo Completo (Markdown)</label>
                  <span className="text-[10px] text-slate-400">Suporta formatação Markdown (H2, H3, listas, links)</span>
                </div>
                <textarea
                  rows={14}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono leading-relaxed"
                  placeholder="## Introdução&#10;&#10;Escreva o conteúdo completo do artigo aqui..."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Otimização SEO & Metadados</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">SEO Title (Google)</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Título otimizado para buscadores"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">SEO Description (Meta Tag)</label>
                    <input
                      type="text"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Descrição sucinta para snippets do Google"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Tags (separadas por vírgula)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 text-[11px]">Destinos Relacionados (separados por vírgula)</label>
                    <input
                      type="text"
                      value={destinationsInput}
                      onChange={(e) => setDestinationsInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-xs">Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  >
                    <option value="DRAFT">DRAFT (Rascunho)</option>
                    <option value="REVIEW">REVIEW (Em Revisão)</option>
                    <option value="PUBLISHED">PUBLISHED (Publicado)</option>
                    <option value="ARCHIVED">ARCHIVED (Arquivado)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
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
                    {isSaving ? 'Salvando...' : 'Salvar Artigo'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI EDITORIAL ASSISTANT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" />
                Assistente de Conteúdo com IA
              </h3>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ação Desejada</label>
                <select
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="GENERATE_DRAFT">Gerar Rascunho Completo de Artigo</option>
                  <option value="SUGGEST_TITLES">Sugerir 5 Títulos Magnéticos & SEO</option>
                  <option value="SEO_META">Gerar Meta Descrição & SEO Title</option>
                  <option value="SUMMARIZE">Resumir Conteúdo em Sinopse</option>
                  <option value="IMPROVE_TEXT">Aprimorar Elegância & Fluidez Editorial</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tema / Tópico</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: O Melhor da Gastronomia em Roma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destino (Opcional)</label>
                <input
                  type="text"
                  value={aiDestination}
                  onChange={(e) => setAiDestination(e.target.value)}
                  placeholder="Ex: Roma, Itália"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <Button
                type="button"
                onClick={handleRunAiAssist}
                disabled={isAiGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAiGenerating ? 'Gerando com IA...' : 'Processar com IA'}
              </Button>

              {aiOutput && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800 block">Resultado Gerado (Requer Revisão Humana):</label>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-slate-700 text-[11px]">
                    {aiOutput}
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyAiOutput}
                    className="w-full bg-[#001F5B] hover:bg-[#001744] text-white"
                  >
                    Inserir no Formulário do Artigo (DRAFT)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
