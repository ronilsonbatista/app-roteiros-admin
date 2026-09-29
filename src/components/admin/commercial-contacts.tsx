'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/admin/status-badge';

type Contact = { id: string; fullName: string; email: string; phone: string | null; status: 'CONTACT' | 'QUALIFIED' | 'INACTIVE'; notes: string | null };
const empty = { fullName: '', email: '', phone: '', status: 'CONTACT' as Contact['status'], notes: '' };
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white p-2 text-sm';
export function CommercialContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/customers/contacts', { params: { page, limit: 15, search: search || undefined, status: status || undefined } });
      const result = response.data.data || response.data;
      setContacts(result.data);
      setMeta(result.meta);
    } catch { setError('Não foi possível carregar os contatos.'); }
    finally { setLoading(false); }
  }, [page, search, status]);
  useEffect(() => { void fetchContacts(); }, [fetchContacts]);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) await api.patch(`/admin/customers/contacts/${editing}`, form);
      else await api.post('/admin/customers/contacts', form);
      setEditing(undefined); await fetchContacts();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: unknown; error?: { message?: unknown } } } }).response?.data;
      const detail = message?.message || message?.error?.message;
      setError(typeof detail === 'string' ? detail : 'Não foi possível salvar. Confira os campos e se o e-mail já está cadastrado.');
    } finally { setSaving(false); }
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Contatos comerciais</h1><p className="text-sm text-slate-500">Base própria do CRM. Cadastrar um contato não cria uma conta no aplicativo.</p></div>
      <Button onClick={() => { setEditing(null); setForm(empty); }}>Novo contato</Button>
    </div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {editing !== undefined && <Card className="p-5">
      <form onSubmit={save} className="space-y-4">
        <h2 className="font-semibold">{editing ? 'Editar contato comercial' : 'Novo contato comercial'}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Nome<input className={inputClass} required minLength={2} maxLength={160} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></label>
          <label className="text-sm">E-mail<input className={inputClass} type="email" required maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-sm">Telefone<input className={inputClass} maxLength={40} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="text-sm">Status<select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Contact['status'] })}><option value="CONTACT">Contato comercial</option><option value="QUALIFIED">Qualificado</option><option value="INACTIVE">Inativo</option></select></label>
        </div>
        <label className="block text-sm">Observações<textarea className={inputClass} maxLength={4000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        <div className="flex gap-2"><Button disabled={saving} type="submit">{saving ? 'Salvando...' : 'Salvar contato'}</Button><Button type="button" variant="outline" disabled={saving} onClick={() => setEditing(undefined)}>Cancelar</Button></div>
      </form>
    </Card>}
    <div className="flex flex-wrap gap-3">
      <input aria-label="Buscar contatos comerciais" placeholder="Buscar nome, e-mail ou telefone" className={`${inputClass} max-w-sm`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      <select aria-label="Status dos contatos comerciais" className={`${inputClass} max-w-xs`} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Todos os status</option><option value="CONTACT">Contato comercial</option><option value="QUALIFIED">Qualificado</option><option value="INACTIVE">Inativo</option></select>
      <Button variant="outline" onClick={fetchContacts} disabled={loading}>Atualizar</Button>
    </div>
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Nome / Contato', 'Fonte', 'Status', 'Ação'].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
        <tbody>{loading ? <tr><td colSpan={4} className="p-8 text-center">Carregando contatos...</td></tr> : contacts.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum contato comercial encontrado.</td></tr> : contacts.map(c => <tr key={c.id} className="border-t border-slate-100"><td className="p-4"><strong>{c.fullName}</strong><p>{c.email}</p><p className="text-slate-500">{c.phone}</p></td><td className="p-4">CRM · Cadastro manual</td><td className="p-4"><StatusBadge status={c.status} /></td><td className="p-4"><Button variant="outline" onClick={() => { setEditing(c.id); setForm({ fullName: c.fullName, email: c.email, phone: c.phone || '', status: c.status, notes: c.notes || '' }); }}>Editar</Button></td></tr>)}</tbody>
      </table>
    </Card>
    <div className="flex items-center justify-between text-sm"><span>{meta.total} contatos comerciais</span><div className="flex items-center gap-3"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button><span>Página {page} de {Math.max(1, meta.totalPages)}</span><Button variant="outline" disabled={loading || page >= meta.totalPages} onClick={() => setPage(page + 1)}>Próxima</Button></div></div>
  </div>;
}
