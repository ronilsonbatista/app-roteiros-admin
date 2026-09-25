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
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { runPlaygroundSimulation, PlaygroundSimulateResult } from '@/services/ai-intelligence.service';

export default function AiPlaygroundPage() {
  const [destination, setDestination] = useState('Tóquio');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [travelStyle, setTravelStyle] = useState('Cultura & Gastronomia');
  const [budgetLevel, setBudgetLevel] = useState('HIGH');
  const [interestsInput, setInterestsInput] = useState('Gastronomia tradicional, Templos históricos, Bairros modernos');
  const [additionalPrompt, setAdditionalPrompt] = useState('Priorize experiências que evitem filas excessivas e ofereçam imersão cultural autêntica.');

  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<PlaygroundSimulateResult | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert('Informe o destino para a simulação.');
      return;
    }

    setIsLoading(true);
    try {
      const interests = interestsInput
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await runPlaygroundSimulation({
        destination: destination.trim(),
        numberOfDays: Number(numberOfDays),
        travelStyle,
        budgetLevel,
        interests,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/intelligence" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <FlaskConical className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Playground & Simulação da IA</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ambiente seguro para testar o comportamento da IA e qualidade dos roteiros gerados sem poluir o banco de dados.
          </p>
        </div>
      </div>

      {/* Safety Isolation Notice */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <div>
          <b>Ambiente Isolado em Memória:</b> Esta simulação roda com isolamento total. Nenhuma viagem real, usuário falso, compra ou entitlement é persistido no banco de dados.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (Left Column) */}
        <div className="lg:col-span-4">
          <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6A00]" />
              Parâmetros de Simulação
            </h2>

            <form onSubmit={handleSimulate} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destino</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Paris, Roma, Tóquio, Santiago..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duração (Dias)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Orçamento</label>
                  <select
                    value={budgetLevel}
                    onChange={(e) => setBudgetLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <option value="LOW">Econômico</option>
                    <option value="MEDIUM">Moderado</option>
                    <option value="HIGH">Sofisticado / Alto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estilo de Viagem</label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <option value="Cultura & Gastronomia">Cultura & Gastronomia</option>
                  <option value="Conforto & Lazer">Conforto & Lazer</option>
                  <option value="Aventura & Natureza">Aventura & Natureza</option>
                  <option value="Romântico / Casal">Romântico / Casal</option>
                  <option value="Família com Crianças">Família com Crianças</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interesses Específicos</label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="Separados por vírgula"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prompt / Contexto Adicional</label>
                <textarea
                  rows={3}
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="Instruções adicionais de teste..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 h-9 text-xs"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Simulando no Core...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Executar Simulação Segura
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results Area (Right Column) */}
        <div className="lg:col-span-8">
          {simulationResult ? (
            <div className="space-y-4">
              {/* Telemetry Header Card */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Modelo: <b>{simulationResult.metrics.model}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Duração: <b>{simulationResult.metrics.durationMs}ms</b></span>
                </div>
                <div>
                  Tokens: <b>{simulationResult.metrics.tokensUsed || 'N/A'}</b>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simulationResult.metrics.isRealProvider ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {simulationResult.metrics.isRealProvider ? 'OpenAI Real' : 'Deterministic Mock'}
                </span>
              </div>

              {/* Itinerary Preview Tabs */}
              <Tabs defaultValue="visual" className="space-y-3">
                <TabsList className="bg-slate-100 p-1 border border-slate-200">
                  <TabsTrigger value="visual" className="text-xs">
                    Roteiro Estruturado
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="text-xs">
                    <Code className="w-3.5 h-3.5 mr-1" />
                    JSON Bruto
                  </TabsTrigger>
                </TabsList>

                {/* Visual Cards */}
                <TabsContent value="visual" className="space-y-4">
                  {simulationResult.simulationData.days?.map((d) => (
                    <Card key={d.dayNumber} className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 text-sm">{d.title}</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                          Dia {d.dayNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{d.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                        {d.items?.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold uppercase text-slate-400">{item.period}</span>
                              <span className="text-[9px] bg-slate-200/60 px-1.5 py-0.2 rounded text-slate-600">
                                {item.category}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-900 text-xs">{item.title}</div>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* Raw JSON */}
                <TabsContent value="raw">
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px]">
                    <pre>{JSON.stringify(simulationResult, null, 2)}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="p-12 bg-white border-slate-200 shadow-xs text-center text-slate-400 space-y-2">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Nenhuma simulação executada ainda.</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Preencha os parâmetros no painel lateral e clique em &quot;Executar Simulação Segura&quot; para testar as respostas da IA.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
