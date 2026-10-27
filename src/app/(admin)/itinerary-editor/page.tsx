'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseTrip, createBaseTrip, listBaseTrips } from '@/services/base-trips.service';
import { Trip, listAllTrips, getTripDaysCount } from '@/services/trips.service';
import { Plus, BookOpen, Users, Compass, ExternalLink } from 'lucide-react';

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
    setLoading(true);
    setError('');
    try {
      if (tab === 'library') {
        setBases(await listBaseTrips());
      } else {
        const r = await listAllTrips({ page, limit: 20, destination: search || undefined });
        setTrips(r.data);
        setPages(r.meta.totalPages);
      }
    } catch {
      setError('Não foi possível carregar os roteiros. Tente atualizar.');
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await createBaseTrip({
        title: String(form.get('title')).trim(),
        destination: String(form.get('destination')).trim(),
        numberOfDays: Number(form.get('days')),
        profile: String(form.get('profile')),
        fullDescription: String(form.get('brief')),
        currency: String(form.get('currency')).toUpperCase(),
        tags: String(form.get('tags')).split(',').map(x => x.trim()).filter(Boolean),
        status: 'DRAFT',
        visibility: 'PRIVATE',
      });
      router.push(`/base-trips/${result.id}`);
    } catch {
      setError('Não foi possível criar o rascunho. Confira os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = bases.filter(t =>
    `${t.title} ${t.destination}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        category="CONTEÚDO & VIAGENS"
        title="Editor de Roteiros"
        subtitle="Crie roteiros próprios, revise sugestões da IA e organize referências aprovadas para novas viagens."
        actions={
          <div className="flex items-center gap-2">
            {tab === 'library' ? (
              <Button
                onClick={() => setCreating(!creating)}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Fechar formulário' : 'Novo Roteiro da Empresa'}
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/trips')}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold h-9 shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Nova Viagem para Viajante
              </Button>
            )}
          </div>
        }
      />

      {creating && tab === 'library' && (
        <form onSubmit={create} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2">
          <h2 className="font-bold text-slate-800 text-sm md:col-span-2">Novo Rascunho da Empresa</h2>
          <label className="text-xs font-semibold text-slate-700">
            Título
            <Input name="title" required maxLength={200} className="mt-1" placeholder="Ex: Paris Completo e Romântico" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Destino
            <Input name="destination" required maxLength={160} className="mt-1" placeholder="Ex: Paris, França" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Quantidade de dias
            <Input name="days" type="number" min={1} max={30} defaultValue={3} required className="mt-1" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Perfil de viagem
            <Input name="profile" placeholder="Casal, família, cultural, econômico…" className="mt-1" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Interesses (separados por vírgula)
            <Input name="tags" placeholder="história, gastronomia, arte" className="mt-1" />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Moeda dos custos
            <Input name="currency" defaultValue="BRL" minLength={3} maxLength={3} required className="mt-1" />
          </label>
          <label className="text-xs font-semibold text-slate-700 md:col-span-2">
            Orientações para o roteiro
            <textarea
              name="brief"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#001F5B]"
              rows={3}
              placeholder="Lugares desejados, ritmo, deslocamentos e orientações que a IA deve considerar."
            />
          </label>
          <p className="text-xs text-slate-500 md:col-span-2">
            Depois de criar, adicione os dias manualmente ou use “Gerar roteiro com IA”. Revise antes de publicar na biblioteca.
          </p>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)} className="text-xs h-9">
              Cancelar
            </Button>
            <Button disabled={saving} type="submit" className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9">
              {saving ? 'Criando…' : 'Criar e abrir editor mestre'}
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Tipo de roteiro">
        <Button
          variant={tab === 'library' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('library');
            setPage(1);
            setSearch('');
          }}
          className={`text-xs cursor-pointer flex items-center gap-1.5 ${
            tab === 'library' ? 'bg-[#001F5B] text-white font-bold' : 'border-slate-200 text-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Roteiros da Empresa (Biblioteca)
        </Button>
        <Button
          variant={tab === 'travelers' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('travelers');
            setPage(1);
            setSearch('');
          }}
          className={`text-xs cursor-pointer flex items-center gap-1.5 ${
            tab === 'travelers' ? 'bg-[#001F5B] text-white font-bold' : 'border-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Viagens de Viajantes (App)
        </Button>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="text-xs h-8 border-slate-200">
          Atualizar
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        {tab === 'library'
          ? 'Modelos mestres da empresa, independentes dos usuários. Publique para a IA usar como curadoria de referência.'
          : 'Viagens reais dos viajantes geradas no aplicativo. Abra uma viagem para gerenciar dias, hospedagens e atividades.'}
      </p>

      <Input
        aria-label="Buscar roteiros"
        placeholder={tab === 'library' ? 'Buscar modelo por título ou destino...' : 'Buscar viagem por destino...'}
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="h-9 text-xs bg-white"
      />

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 border border-red-100">{error}</p>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tab === 'library'
            ? filtered.map(t => (
                <Link
                  key={t.id}
                  href={`/base-trips/${t.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#001F5B] hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        Roteiro Mestre da Empresa
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {t.numberOfDays} {t.numberOfDays === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t.destination}</p>
                    <p className="mt-2 text-[11px] font-semibold text-blue-900">
                      {t.status === 'PUBLISHED'
                        ? '✓ Publicado · Referência para IA'
                        : t.status === 'ARCHIVED'
                        ? 'Arquivado'
                        : '• Rascunho · Revisão pendente'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#001F5B]">
                    <span>Abrir editor mestre</span>
                    <span className="text-slate-400">→</span>
                  </div>
                </Link>
              ))
            : trips.map(t => (
                <Link
                  key={t.id}
                  href={`/trips/${t.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#FF6A00] hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Viagem de Viajante
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {getTripDaysCount(t)} {getTripDaysCount(t) === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm leading-snug">{t.title}</h2>
                    <p className="mt-1 text-xs text-slate-600 font-medium">{t.destination}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Viajante: <span className="font-semibold text-slate-700">{t.user?.fullName || 'Usuário'}</span> ({t.user?.email || 'N/D'})
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF6A00]">
                    <span>Abrir viagem do viajante</span>
                    <span className="text-slate-400">→</span>
                  </div>
                </Link>
              ))}

          {(tab === 'library' ? !filtered.length : !trips.length) && (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              Nenhum roteiro encontrado. {tab === 'library' ? 'Crie um roteiro da empresa no botão acima.' : 'Nenhuma viagem de viajante cadastrada.'}
            </div>
          )}
        </div>
      )}

      {tab === 'travelers' && (
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)} className="text-xs">
            Anterior
          </Button>
          <span className="text-xs text-slate-500">
            Página {page} de {Math.max(1, pages)}
          </span>
          <Button variant="outline" size="sm" disabled={loading || page >= pages} onClick={() => setPage(p => p + 1)} className="text-xs">
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
