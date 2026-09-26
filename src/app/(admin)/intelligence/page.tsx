'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Tag, 
  Clock,
  Layers,
  FileText,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { 
  listGuidelines, 
  createGuideline, 
  deleteGuideline, 
  listKnowledgeArticles, 
  createKnowledgeArticle, 
  deleteKnowledgeArticle, 
  AIGuideline, 
  KnowledgeArticle 
} from '@/services/ai-intelligence.service';

export default function IntelligenceHubPage() {
  const [guidelines, setGuidelines] = useState<AIGuideline[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guideline Modal State
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [guidelineName, setGuidelineName] = useState('');
  const [guidelineCategory, setGuidelineCategory] = useState('TONE_OF_VOICE');
  const [guidelineContent, setGuidelineContent] = useState('');
  const [isSavingGuideline, setIsSavingGuideline] = useState(false);

  // Knowledge Article Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('DESTINATION');
  const [articleDestination, setArticleDestination] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleTags, setArticleTags] = useState('dicas, seguranca, gastronomia');
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [gRes, aRes] = await Promise.all([
        listGuidelines(),
        listKnowledgeArticles(),
      ]);
      setGuidelines(gRes);
      setArticles(aRes);
    } catch (err) {
      console.error('Failed to load intelligence hub data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guidelineName.trim() || !guidelineContent.trim()) {
      alert('Preencha nome e conteúdo da diretriz.');
      return;
    }

    setIsSavingGuideline(true);
    try {
      await createGuideline({
        name: guidelineName.trim(),
        category: guidelineCategory,
        content: guidelineContent.trim(),
      });
      setIsGuidelineModalOpen(false);
      setGuidelineName('');
      setGuidelineContent('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar diretriz.');
    } finally {
      setIsSavingGuideline(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim()) {
      alert('Preencha título e conteúdo do artigo de conhecimento.');
      return;
    }

    setIsSavingArticle(true);
    try {
      const tags = articleTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createKnowledgeArticle({
        title: articleTitle.trim(),
        category: articleCategory,
        destination: articleDestination.trim() || undefined,
        content: articleContent.trim(),
        tags,
      });

      setIsArticleModalOpen(false);
      setArticleTitle('');
      setArticleDestination('');
      setArticleContent('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar artigo.');
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    if (!confirm('Deseja excluir esta diretriz de IA?')) return;
    try {
      await deleteGuideline(id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir diretriz.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Deseja excluir este artigo da base de conhecimento?')) return;
    try {
      await deleteKnowledgeArticle(id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir artigo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="INTELIGÊNCIA ARTIFICIAL"
        title="Central de IA, Diretrizes & Conhecimento"
        subtitle="Aqui gerenciamo-nos as diretrizes de tom de voz, regras de síntese e a base de conhecimento utilizada pelo modelo OpenAI 2GO"
        breadcrumbs={[
          { label: 'Inteligência', href: '/intelligence' },
          { label: 'Central de IA' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin text-[#001F5B]' : ''}`} />
              Atualizar
            </Button>
            <Link href="/intelligence/playground">
              <Button size="sm" className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs transition-colors cursor-pointer">
                <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                Playground & Simulação
              </Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs defaultValue="guidelines" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="bg-white p-1 border border-slate-200/90 rounded-xl shadow-2xs">
            <TabsTrigger value="guidelines" className="text-xs font-semibold px-4 py-1.5">
              Diretrizes de IA ({guidelines.length})
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs font-semibold px-4 py-1.5">
              Base de Conhecimento ({articles.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsGuidelineModalOpen(true)}
              className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nova Diretriz
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsArticleModalOpen(true)}
              className="bg-white border-slate-200 text-slate-700 text-xs font-semibold h-9 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Novo Artigo de Conhecimento
            </Button>
          </div>
        </div>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200/90">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Carregando diretrizes de IA...
            </Card>
          ) : guidelines.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nenhuma diretriz cadastrada"
              description="Cadastre regras de estilo, restrições e tom de voz para o modelo 2GO."
              action={{ label: 'Nova Diretriz', onClick: () => setIsGuidelineModalOpen(true) }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {guidelines.map((g) => (
                <Card key={g.id} className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {g.category}
                      </span>
                      <StatusBadge status={g.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{g.name}</h3>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60 font-mono text-[11px]">
                      {g.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Atualizado em {new Date(g.updatedAt).toLocaleDateString('pt-BR')}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGuideline(g.id)}
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
        </TabsContent>

        {/* Knowledge Articles Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200/90">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#001F5B]" />
              Carregando base de conhecimento...
            </Card>
          ) : articles.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhum artigo de conhecimento"
              description="Cadastre informações locais de destinos para alimentar o contexto do modelo."
              action={{ label: 'Novo Artigo de Conhecimento', onClick: () => setIsArticleModalOpen(true) }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {articles.map((a) => (
                <Card key={a.id} className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                        {a.category} {a.destination ? `• ${a.destination}` : ''}
                      </span>
                      <StatusBadge status={(a as any).isActive ?? (a as any).active ?? true ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {a.content}
                    </p>
                    {a.tags && a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {a.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Criado em {new Date(a.createdAt).toLocaleDateString('pt-BR')}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArticle(a.id)}
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
        </TabsContent>
      </Tabs>

      {/* Modal: Guideline */}
      {isGuidelineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveGuideline} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Cadastrar Diretriz de IA</h3>
              <p className="text-xs text-slate-500">Defina regras de tom de voz ou estilo de roteiro.</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nome da Diretriz *</label>
              <Input
                type="text"
                placeholder="Ex: Regra de Imersão Cultural Gastronômica"
                value={guidelineName}
                onChange={(e) => setGuidelineName(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Categoria</label>
              <select
                value={guidelineCategory}
                onChange={(e) => setGuidelineCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="TONE_OF_VOICE">Tom de Voz & Estilo</option>
                <option value="SAFETY">Segurança & Restrições</option>
                <option value="STRUCTURE">Estrutura de Roteiro</option>
                <option value="CUSTOMIZATION">Personalização</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Conteúdo / Prompt da Diretriz *</label>
              <textarea
                rows={5}
                placeholder="Escreva a instrução exata para o modelo..."
                value={guidelineContent}
                onChange={(e) => setGuidelineContent(e.target.value)}
                required
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsGuidelineModalOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingGuideline} className="bg-[#001F5B] text-white text-xs h-8 px-4 font-semibold">
                {isSavingGuideline ? 'Salvando...' : 'Salvar Diretriz'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Knowledge Article */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveArticle} className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Novo Artigo de Conhecimento</h3>
              <p className="text-xs text-slate-500">Adicione fatos locais e recomendações para o RAG do modelo.</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Título do Artigo *</label>
              <Input
                type="text"
                placeholder="Ex: Segredos Gastronômicos de Roma"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                required
                className="text-xs h-9 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Categoria</label>
                <select
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="DESTINATION">Destino</option>
                  <option value="SAFETY">Segurança</option>
                  <option value="GASTRONOMY">Gastronomia</option>
                  <option value="TRANSPORT">Transporte</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destino (Opcional)</label>
                <Input
                  type="text"
                  placeholder="Ex: Roma"
                  value={articleDestination}
                  onChange={(e) => setArticleDestination(e.target.value)}
                  className="text-xs h-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Conteúdo de Conhecimento *</label>
              <textarea
                rows={5}
                placeholder="Fatos, dicas de transporte, regras de ouro do destino..."
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tags (Separadas por vírgula)</label>
              <Input
                type="text"
                value={articleTags}
                onChange={(e) => setArticleTags(e.target.value)}
                className="text-xs h-9 bg-slate-50 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsArticleModalOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSavingArticle} className="bg-[#001F5B] text-white text-xs h-8 px-4 font-semibold">
                {isSavingArticle ? 'Salvando...' : 'Salvar Artigo'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
