'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FlaskConical, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Cpu, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  RotateCw,
  Code,
  CheckCircle2,
  Terminal,
  Zap,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { runPlaygroundSimulation, PlaygroundSimulateResult } from '@/services/ai-intelligence.service';

export default function AiPlaygroundPage() {
  const [destination, setDestination] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [travelStyle, setTravelStyle] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<PlaygroundSimulateResult | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert('Informe o destino para a simulação.');
      return;
    }

    setSimulationResult(null);
    setIsLoading(true);
    try {
      const interests = interestsInput
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await runPlaygroundSimulation({
        destination: destination.trim(),
        numberOfDays: Number(numberOfDays),
        travelStyle: travelStyle || undefined,
        budgetLevel: budgetLevel || undefined,
        interests: interests.length > 0 ? interests : undefined,
        additionalPrompt: additionalPrompt.trim() || undefined,
      });

      setSimulationResult(res);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao executar simulação de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="INTELIGÊNCIA ARTIFICIAL"
        title="AI Evaluation Playground & Simulação"
        subtitle="Ambiente de testes efêmeros e avaliação em memória. As simulações do Playground NÃO alteram nem representam o catálogo oficial de Roteiros Base (BaseTrip) publicados."
        breadcrumbs={[
          { label: 'Inteligência', href: '/intelligence' },
          { label: 'Playground IA' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/intelligence">
              <Button variant="outline" size="sm" className="text-xs h-9 bg-white border-slate-200 text-slate-700">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Voltar para Central de IA
              </Button>
            </Link>
          </div>
        }
      />

      {/* Safety Isolation Notice */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-600 text-white shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">Simulação Efêmera em Memória: </span>
            <span className="text-emerald-800">
              Nenhuma viagem real, usuário, compra ou Roteiro Base é persistido no banco de dados. Os resultados são efêmeros e servem exclusivamente para avaliar custos e prompts.
            </span>
          </div>
        </div>
        <StatusBadge status="OPERATIONAL" label="Sandbox Ativo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenario Input Form (Left Column: 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6A00]" />
                Parâmetros do Cenário de Teste
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure as variáveis de entrada da síntese.</p>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destino Alvo *</label>
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Paris, Tóquio, Roma..."
                  required
                  className="text-xs h-9 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duração (Dias)</label>
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Number(e.target.value))}
                    className="text-xs h-9 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nível Orçamentário</label>
                  <select
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="">Selecione (opcional)...</option>
                    <option value="LOW">Econômico (LOW)</option>
                    <option value="MEDIUM">Moderado (MEDIUM)</option>
                    <option value="HIGH">Luxo / Exclusivo (HIGH)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Estilo de Viagem</label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="">Selecione (opcional)...</option>
                  <option value="Cultura & Gastronomia">Cultura & Gastronomia</option>
                  <option value="Aventura & Natureza">Aventura & Natureza</option>
                  <option value="Romântico & Relax">Romântico & Relax</option>
                  <option value="Família com Crianças">Família com Crianças</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Interesses (Separados por vírgula)</label>
                <Input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="Ex: gastronomia, templos, arte, compras..."
                  className="text-xs h-9 bg-slate-50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Prompt / Instrução Adicional</label>
                <textarea
                  rows={3}
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="Instruções ou restrições opcionais..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-10 font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Sintetizando Roteiro...' : 'Executar Avaliação IA'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results & Metadata Panel (Right Column: 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult ? (
            <div className="space-y-4 animate-fade-in">
              {/* Execution Metadata Bar */}
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  title="MODELO UTILIZADO"
                  value={(simulationResult as any).metrics?.model || (simulationResult as any).metadata?.model || 'gpt-4o-mini'}
                  subtitle="OpenAI Engine"
                  icon={Cpu}
                />
                <MetricCard
                  title="TOKENS UTILIZADOS"
                  value={(simulationResult as any).metrics?.tokensUsed || (simulationResult as any).metadata?.tokensUsed || 0}
                  subtitle="Prompt + Completion"
                  icon={Coins}
                />
                <MetricCard
                  title="TEMPO DE RESPOSTA"
                  value={`${((((simulationResult as any).metrics?.durationMs || (simulationResult as any).metadata?.durationMs || 0)) / 1000).toFixed(2)}s`}
                  subtitle="Latência da síntese"
                  icon={Clock}
                />
              </div>

              {/* Tabs for Result Inspection */}
              <Card className="p-5 bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-4">
                <Tabs defaultValue="itinerary" className="space-y-4">
                  <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="itinerary" className="text-xs font-semibold px-3 py-1">Roteiro Gerado</TabsTrigger>
                    <TabsTrigger value="raw" className="text-xs font-semibold px-3 py-1">JSON Estruturado</TabsTrigger>
                    <TabsTrigger value="applied" className="text-xs font-semibold px-3 py-1">Sobre este teste</TabsTrigger>
                  </TabsList>

                  {/* Tab: Itinerary View */}
                  <TabsContent value="itinerary" className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-base font-bold text-slate-900">{(simulationResult as any).result?.title || (simulationResult as any).simulationData?.destination || destination}</h3>
                      <p className="text-xs text-slate-500">{(simulationResult as any).result?.summary || (simulationResult as any).simulationData?.travelStyle}</p>
                    </div>

                    <div className="space-y-4">
                      {((simulationResult as any).result?.days || (simulationResult as any).simulationData?.days)?.map((day: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-xs font-bold text-[#001F5B] font-mono">Dia {day.dayNumber}: {day.title}</span>
                          </div>
                          {day.description && <p className="text-xs text-slate-600">{day.description}</p>}
                          <div className="space-y-2">
                            {day.items?.map((item: any, iIdx: number) => (
                              <div key={iIdx} className="p-2.5 bg-white rounded-lg border border-slate-200/60 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{item.title}</span>
                                  <StatusBadge status={item.category || 'TOURIST_ATTRACTION'} />
                                </div>
                                {item.description && <p className="text-slate-600 text-[11px]">{item.description}</p>}
                                {item.location && <p className="text-[10px] text-slate-400 font-mono">📍 {item.location}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Tab: Raw JSON */}
                  <TabsContent value="raw">
                    <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono max-h-96 overflow-y-auto">
                      {JSON.stringify(simulationResult, null, 2)}
                    </pre>
                  </TabsContent>

                  {/* Tab: Applied Guidelines */}
                  <TabsContent value="applied" className="space-y-2 text-xs">
                    <p className="font-semibold text-slate-700">Este teste usa os parâmetros preenchidos no formulário.</p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1 font-mono text-[11px]">
                      {(simulationResult as any).appliedGuidelines?.map((g: any, i: number) => (
                        <div key={i}>• {g.name} ({g.category})</div>
                      )) || <div>A biblioteca de roteiros e as diretrizes cadastradas não são consultadas por este Playground.</div>}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center bg-white border border-slate-200/90 shadow-2xs rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Terminal className="w-6 h-6 text-[#001F5B]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Aguardando Execução</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Preencha os parâmetros à esquerda e clique em &quot;Executar Avaliação IA&quot; para disparar a síntese.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
