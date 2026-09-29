'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

export function ItineraryAiActions({ id, kind, empty, draft = true, onSaved }: {
  id: string; kind: 'trips' | 'base-trips'; empty: boolean; draft?: boolean; onSaved: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function run(copy: boolean) {
    if (!confirm(copy ? 'Criar uma cópia independente como rascunho da empresa? Revise o conteúdo antes de publicar.' : 'Gerar os dias com IA a partir das preferências e referências publicadas? O resultado ficará disponível para revisão.')) return;
    setBusy(true); setMessage('');
    try {
      const response = await api.post(`/admin/editor/${kind}/${id}/${copy ? 'copy-to-base' : 'generate'}`, {}, { timeout: 180000 });
      const data = response.data?.data || response.data;
      if (copy) router.push(`/base-trips/${data.id}`);
      else { setMessage('Roteiro gerado. Revise as informações antes de usar ou publicar.'); onSaved(); }
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { message?: string; error?: { message?: string } } } }).response?.data;
      setMessage(detail?.message || detail?.error?.message || 'Não foi possível concluir. Atualize o roteiro para verificar o resultado antes de tentar novamente.');
    } finally { setBusy(false); }
  }
  async function publish() {
    if (!confirm('Confirma que revisou todos os dias e locais? Ao publicar, a IA poderá usar este roteiro como referência.')) return;
    setBusy(true); setMessage('');
    try { await api.patch(`/admin/base-trips/${id}`, { status: 'PUBLISHED' }); setMessage('Publicado. Este roteiro já pode orientar novas gerações da IA.'); onSaved(); }
    catch { setMessage('Não foi possível publicar. Preencha todos os dias e tente novamente.'); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    {empty && draft && <Button disabled={busy} onClick={() => run(false)}>{busy ? 'Gerando roteiro…' : 'Gerar roteiro com IA'}</Button>}
    {kind === 'base-trips' && draft && !empty && <Button disabled={busy} onClick={publish}>Publicar roteiro revisado</Button>}
    {kind === 'trips' && !empty && <Button variant="outline" disabled={busy} onClick={() => run(true)}>Copiar para Roteiros Base</Button>}
    <p className="text-sm text-slate-600">{message || (kind === 'base-trips' ? 'Rascunhos podem ser editados livremente. Só roteiros publicados entram nas referências da IA.' : 'Edite os dias e atividades abaixo. Cópias para a biblioteca não alteram a viagem original.')}</p>
    <span className="sr-only" role="status">{busy ? 'Operação em andamento' : message}</span>
  </div>;
}
