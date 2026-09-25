'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  Plus, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  RefreshCw, 
  MapPin, 
  Tag, 
  Clock,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Central de Inteligência Artificial</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Governança de diretrizes, tom de voz, base de conhecimento e simulação segura da IA do 2GO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/intelligence/playground">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Playground & Simulação
            </Button>
          </Link>
          <Link href="/ai">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              Telemetria & Tokens
            </Button>
          </Link>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
        <div>
          <b>Governança de Instruções do Produto:</b> A equipe operacional controla diretrizes editoriais e conhecimento sobre destinos sem riscos de quebrar o System Prompt de produção.
        </div>
      </div>

      {/* Tabs: Diretrizes vs Base de Conhecimento */}
      <Tabs defaultValue="guidelines" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="guidelines" className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Diretrizes de Tom & Regras ({guidelines.length})
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Base de Conhecimento ({articles.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. GUIDELINES TAB */}
        <TabsContent value="guidelines">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Regras de estilo, tom de voz e palavras restritas injetadas na síntese dos roteiros.
              </span>
              <Button
                size="sm"
                onClick={() => setIsGuidelineModalOpen(true)}
                className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Diretriz
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                  Carregando diretrizes...
                </div>
              ) : guidelines.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  Nenhuma diretriz cadastrada ainda.
                </div>
              ) : (
                guidelines.map((g) => (
                  <Card key={g.id} className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                          {g.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">v{g.version}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{g.name}</h3>
                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap font-sans bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {g.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{new Date(g.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGuideline(g.id)}
                        className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* 2. KNOWLEDGE BASE TAB */}
        <TabsContent value="knowledge">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Artigos e fatos específicos sobre destinos, FAQs e logística utilizados para enriquecer o contexto dos roteiros.
              </span>
              <Button
                size="sm"
                onClick={() => setIsArticleModalOpen(true)}
                className="bg-[#001F5B] hover:bg-[#001744] text-white text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Artigo de Conhecimento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                  Carregando base de conhecimento...
                </div>
              ) : articles.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  Nenhum artigo de conhecimento cadastrado.
                </div>
              ) : (
                articles.map((art) => (
                  <Card key={art.id} className="p-4 bg-white border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {art.category}
                        </span>
                        {art.destination && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <MapPin className="w-3 h-3" />
                            {art.destination}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-2">{art.title}</h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {art.content}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {art.tags?.map((t) => (
                          <span key={t} className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Atualizado em {new Date(art.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(art.id)}
                        className="text-xs h-7 px-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* GUIDELINE MODAL */}
      {isGuidelineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Nova Diretriz para IA
            </h2>

            <form onSubmit={handleSaveGuideline} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome da Diretriz</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tom Sofisticado e Prático"
                  value={guidelineName}
                  onChange={(e) => setGuidelineName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                <select
                  value={guidelineCategory}
                  onChange={(e) => setGuidelineCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <option value="TONE_OF_VOICE">Tom de Voz & Estilo</option>
                  <option value="EDITORIAL_RULE">Regra Editorial de Conteúdo</option>
                  <option value="RESTRICTED_WORDS">Palavras e Expressões a Evitar</option>
                  <option value="BRAND_GUIDELINE">Diretriz Institucional da Marca</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instrução / Conteúdo</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Descreva exatamente a diretriz que deve orientar a geração de roteiros e textos..."
                  value={guidelineContent}
                  onChange={(e) => setGuidelineContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGuidelineModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingGuideline}
                  className="bg-[#001F5B] hover:bg-[#001744] text-white"
                >
                  {isSavingGuideline ? 'Salvando...' : 'Salvar Diretriz'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Novo Artigo da Base de Conhecimento
            </h2>

            <form onSubmit={handleSaveArticle} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título do Artigo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Segredos do Trastevere em Roma"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="DESTINATION">Destino Específico</option>
                    <option value="FAQ">FAQ / Dúvidas Frequentes</option>
                    <option value="LOGISTICS">Logística & Deslocamento</option>
                    <option value="DINING">Gastronomia & Restaurantes</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Destino Relacionado</label>
                  <input
                    type="text"
                    placeholder="Ex: Roma"
                    value={articleDestination}
                    onChange={(e) => setArticleDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={articleTags}
                  onChange={(e) => setArticleTags(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conteúdo & Fatos</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Informações factuais, dicas de segurança, horários recomendados..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsArticleModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingArticle}
                  className="bg-[#001F5B] hover:bg-[#001744] text-white"
                >
                  {isSavingArticle ? 'Salvando...' : 'Salvar Artigo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
