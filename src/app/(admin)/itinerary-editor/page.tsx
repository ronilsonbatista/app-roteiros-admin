'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseTrip, createBaseTrip, listBaseTrips } from '@/services/base-trips.service';
import { Trip, listAllTrips } from '@/services/trips.service';

export default function ItineraryEditor() {
  const router = useRouter();
  const [tab, setTab] = useState<'library' | 'travelers'>('library');
  const [bases, setBases] = useState<BaseTrip[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (tab === 'library') setBases(await listBaseTrips());
      else { const r = await listAllTrips({ page, limit: 20, destination: search || undefined }); setTrips(r.data); setPages(r.meta.totalPages); }
    } catch { setError('Não foi possível carregar os roteiros. Tente atualizar.'); }
    finally { setLoading(false); }
  }, [tab, page, search]);
  useEffect(() => { void load(); }, [load]);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await createBaseTrip({ title: String(form.get('title')).trim(), destination: String(form.get('destination')).trim(),
        numberOfDays: Number(form.get('days')), profile: String(form.get('profile')), fullDescription: String(form.get('brief')),
        currency: String(form.get('currency')).toUpperCase(), tags: String(form.get('tags')).split(',').map(x => x.trim()).filter(Boolean), status: 'DRAFT', visibility: 'PRIVATE' });
      router.push(`/base-trips/${result.id}`);
    } catch { setError('Não foi possível criar o rascunho. Confira os campos e tente novamente.'); }
    finally { setSaving(false); }
  }
  const filtered = bases.filter(t => `${t.title} ${t.destination}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-6">
    <PageHeader category="CONTEÚDO & VIAGENS" title="Editor de Roteiros" subtitle="Crie roteiros próprios, revise sugestões da IA e organize referências aprovadas para novas viagens." actions={<Button onClick={() => setCreating(!creating)}>{creating ? 'Fechar formulário' : 'Criar roteiro da empresa'}</Button>} />
    {creating && <form onSubmit={create} className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2">
      <h2 className="font-semibold md:col-span-2">Novo rascunho da empresa</h2>
      <label className="text-sm">Título<Input name="title" required maxLength={200} /></label>
      <label className="text-sm">Destino<Input name="destination" required maxLength={160} /></label>
      <label className="text-sm">Quantidade de dias<Input name="days" type="number" min={1} max={30} defaultValue={3} required /></label>
      <label className="text-sm">Perfil de viagem<Input name="profile" placeholder="Casal, família, cultural, econômico…" /></label>
      <label className="text-sm">Interesses (separados por vírgula)<Input name="tags" placeholder="história, gastronomia" /></label>
      <label className="text-sm">Moeda dos custos<Input name="currency" defaultValue="BRL" minLength={3} maxLength={3} required /></label>
      <label className="text-sm md:col-span-2">Orientações para o roteiro<textarea name="brief" className="mt-1 w-full rounded-md border p-3" rows={3} placeholder="Lugares desejados, ritmo, deslocamentos e orientações que a IA deve considerar." /></label>
      <p className="text-sm text-slate-500 md:col-span-2">Depois de criar, adicione os dias manualmente ou use “Gerar roteiro com IA”. Revise antes de publicar na biblioteca.</p>
      <Button disabled={saving} type="submit">{saving ? 'Criando…' : 'Criar e abrir editor'}</Button>
    </form>}
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de roteiro">
      <Button variant={tab === 'library' ? 'default' : 'outline'} onClick={() => { setTab('library'); setPage(1); setSearch(''); }}>Roteiros da empresa</Button>
      <Button variant={tab === 'travelers' ? 'default' : 'outline'} onClick={() => { setTab('travelers'); setPage(1); setSearch(''); }}>Roteiros dos viajantes</Button>
      <Button variant="outline" onClick={load} disabled={loading}>Atualizar</Button>
    </div>
    <p className="text-sm text-slate-500">{tab === 'library' ? 'Modelos independentes das viagens dos clientes. Publique somente conteúdo revisado para a IA consultar.' : 'Viagens criadas no aplicativo, com roteiros manuais ou gerados pela IA. Abra uma viagem para revisar dias e atividades.'}</p>
    <Input aria-label="Buscar roteiros" placeholder={tab === 'library' ? 'Buscar por título ou destino' : 'Buscar por destino'} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
    {loading ? <p role="status">Carregando roteiros…</p> : <div className="grid gap-4 md:grid-cols-2">
      {tab === 'library' ? filtered.map(t => <Link key={t.id} href={`/base-trips/${t.id}`} className="rounded-xl border bg-white p-5 hover:border-blue-400"><h2 className="font-semibold">{t.title}</h2><p className="mt-2 text-sm text-slate-500">{t.destination} · {t.numberOfDays} dias</p><p className="mt-3 text-xs font-semibold text-blue-900">{t.status === 'PUBLISHED' ? 'Publicado · referência para IA' : t.status === 'ARCHIVED' ? 'Arquivado' : 'Rascunho · revisão pendente'}</p><p className="mt-4 text-sm">Abrir editor →</p></Link>) : trips.map(t => <Link key={t.id} href={`/trips/${t.id}`} className="rounded-xl border bg-white p-5 hover:border-blue-400"><h2 className="font-semibold">{t.title}</h2><p className="mt-2 text-sm text-slate-500">{t.destination} · {t.user?.fullName || 'Viajante'}</p><p className="mt-4 text-sm">Editar dias e atividades →</p></Link>)}
      {(tab === 'library' ? !filtered.length : !trips.length) && <p className="rounded-xl border border-dashed p-8 text-slate-500">Nenhum roteiro encontrado. Crie um roteiro da empresa ou consulte as viagens do aplicativo.</p>}
    </div>}
    {tab === 'travelers' && <div className="flex items-center gap-4"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button><span>Página {page} de {Math.max(1, pages)}</span><Button variant="outline" disabled={loading || page >= pages} onClick={() => setPage(p => p + 1)}>Próxima</Button></div>}
  </div>;
}
