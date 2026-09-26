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
  Globe,
  Tag,
  Wand2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
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
    setStatus(p.status as any);
    setIsEditorOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Preencha pelo menos Título e Conteúdo do artigo.');
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const destinations = destinationsInput.split(',').map((d) => d.trim()).filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim() || undefined,
        content: content.trim(),
        category,
        tags,
        relatedDestinations: destinations,
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
      console.error('Failed to save post', err);
      alert(err.response?.data?.message || 'Erro ao salvar artigo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Deseja publicar este artigo no Blog 2GO?')) return;
    try {
      await publishBlogPost(id);
      await fetchPosts(meta.page);
    } catch (err) {
      console.error('Failed to publish post', err);
      alert('Erro ao publicar artigo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    try {
      await deleteBlogPost(id);
      await fetchPosts(meta.page);
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Erro ao excluir artigo.');
    }
  };

  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) {
      alert('Por favor, informe o tema principal para a IA.');
      return;
    }
    setIsAiGenerating(true);
    setAiOutput('');
    try {
      const res = await requestEditorialAssist({
        action: aiAction,
        topic: aiTopic.trim(),
        destination: aiDestination.trim() || undefined,
        targetAudience: aiAudience.trim() || undefined,
        context: aiContext.trim() || undefined,
      });

      setAiOutput(res.output || (res as any).suggestion || '');
      if ((res as any).suggestedSeoTitle && !seoTitle) setSeoTitle((res as any).suggestedSeoTitle);
      if ((res as any).suggestedSeoDescription && !seoDescription) setSeoDescription((res as any).suggestedSeoDescription);
    } catch (err: any) {
      console.error('AI generation failed', err);
      alert('Erro ao consultar a IA Editorial.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyAiOutput = () => {
    if (!aiOutput) return;
    if (aiAction === 'GENERATE_DRAFT') {
      setContent((prev) => prev ? `${prev}\n\n${aiOutput}` : aiOutput);
    } else if (aiAction === 'SUMMARIZE') {
      setSummary(aiOutput);
    } else if (aiAction === 'SEO_META') {
      setSeoDescription(aiOutput);
    } else {
      setContent((prev) => prev ? `${prev}\n\n${aiOutput}` : aiOutput);
    }
    setIsAiModalOpen(false);
  };

  const hasActiveFilters = Boolean(search.trim() || statusFilter || categoryFilter);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="CONTEÚDO & CMS"
        title="Gestão do Blog & Editorial"
        subtitle="Gerencie artigos, tutoriais de viagem, SEO e utilize a Inteligência Editorial 2GO"
        breadcrumbs={[
          { label: 'Conteúdo', href: '/blog' },
          { label: 'Blog & CMS' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(meta.page)}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Artigo
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título ou resumo..."
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todos os Status</option>
          <option value="DRAFT">Rascunho (Draft)</option>
          <option value="REVIEW">Em Revisão</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-700"
        >
          <option value="">Todas as Categorias</option>
          <option value="Dicas de Viagem">Dicas de Viagem</option>
          <option value="Roteiros Exclusivos">Roteiros Exclusivos</option>
          <option value="Gastronomia">Gastronomia</option>
          <option value="Cultura e Arte">Cultura e Arte</option>
          <option value="Guias de Destino">Guias de Destino</option>
        </select>
      </FilterBar>

      {/* Blog Posts Table */}
      <Card className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Título do Artigo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Publicação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
                    Carregando artigos do Blog 2GO...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      icon={FileText}
                      title="Nenhum artigo encontrado"
                      description="Crie o primeiro artigo para o blog ou ajuste os filtros."
                      action={{ label: 'Novo Artigo', onClick: handleOpenCreate }}
                    />
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">/{p.slug}</div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {p.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 font-medium text-slate-700">{p.authorName}</td>

                    {/* Published Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('pt-BR') : 'Não publicado'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'PUBLISHED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublish(p.id)}
                            className="text-xs h-7 px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            title="Publicar Artigo"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                          title="Editar Artigo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id)}
                          className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50"
                          title="Excluir Artigo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
            Mostrando <b>{posts.length}</b> de <b>{meta.total}</b> registros (Página {meta.page} de {meta.totalPages || 1})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isLoading}
              onClick={() => fetchPosts(meta.page - 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isLoading}
              onClick={() => fetchPosts(meta.page + 1)}
              className="h-7 text-xs px-2.5 bg-white border-slate-200 text-slate-700"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar Artigo' : 'Novo Artigo no Blog 2GO'}
                </h2>
                <p className="text-xs text-slate-500">Editor de conteúdo e dados SEO do artigo.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  Assistente IA
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)} className="text-xs h-8">
                  Fechar
                </Button>
              </div>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Título do Artigo *</label>
                <Input
                  type="text"
                  placeholder="Ex: O Guia Definitivo de 7 Dias em Paris"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Slug da URL</label>
                  <Input
                    type="text"
                    placeholder="guia-definitivo-paris"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="text-xs h-9 bg-slate-50 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B] text-slate-800"
                  >
                    <option value="Dicas de Viagem">Dicas de Viagem</option>
                    <option value="Roteiros Exclusivos">Roteiros Exclusivos</option>
                    <option value="Gastronomia">Gastronomia</option>
                    <option value="Cultura e Arte">Cultura e Arte</option>
                    <option value="Guias de Destino">Guias de Destino</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resumo / Subtítulo</label>
                <textarea
                  rows={2}
                  placeholder="Breve introdução que aparece na listagem..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Conteúdo Completo (Markdown / HTML) *</label>
                <textarea
                  rows={12}
                  placeholder="Escreva o artigo completo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
                />
              </div>

              {/* SEO Meta */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] font-mono block">Otimização SEO</span>
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Título SEO (Meta Title)</label>
                  <Input
                    type="text"
                    placeholder="Título otimizado para buscadores (Google)"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="text-xs h-8 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Descrição SEO (Meta Description)</label>
                  <textarea
                    rows={2}
                    placeholder="Resumo otimizado para o Google (máx 160 caracteres)..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status do Artigo</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="DRAFT">Rascunho</option>
                    <option value="REVIEW">Em Revisão</option>
                    <option value="SCHEDULED">Agendado</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Autor</label>
                  <Input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="text-xs h-9 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)} className="text-xs h-9">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-5 font-semibold cursor-pointer">
                  {isSaving ? 'Salvando...' : 'Salvar Artigo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Assistente IA Editorial 2GO
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsAiModalOpen(false)} className="h-7 text-xs">
                Fechar
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tipo de Assistência IA</label>
                <select
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="GENERATE_DRAFT">Gerar Rascunho Completo de Artigo</option>
                  <option value="SUGGEST_TITLES">Sugerir Títulos Atrativos</option>
                  <option value="SEO_META">Gerar Título & Descrição SEO</option>
                  <option value="SUMMARIZE">Resumir Artigo Existente</option>
                  <option value="IMPROVE_TEXT">Melhorar Tom de Voz & Estilo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tema do Artigo / Tópico *</label>
                <Input
                  type="text"
                  placeholder="Ex: Principais passeios em Fernando de Noronha"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Destino Relacionado</label>
                  <Input
                    type="text"
                    placeholder="Ex: Fernando de Noronha"
                    value={aiDestination}
                    onChange={(e) => setAiDestination(e.target.value)}
                    className="text-xs h-8 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Público-Alvo</label>
                  <Input
                    type="text"
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value)}
                    className="text-xs h-8 bg-slate-50"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGenerateAi}
                disabled={isAiGenerating}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs h-9 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                {isAiGenerating ? 'Gerando Conteúdo com IA...' : 'Executar Inteligência Editorial'}
              </Button>

              {aiOutput && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-800">Resultado Gerado:</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto text-xs whitespace-pre-wrap font-sans text-slate-700">
                    {aiOutput}
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyAiOutput}
                    className="w-full bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-8 font-semibold cursor-pointer"
                  >
                    Aplicar no Editor do Artigo
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
