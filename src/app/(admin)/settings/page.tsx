import Link from 'next/link';
import { PageHeader } from '@/components/admin/page-header';
export default function Page() { return <div className="space-y-6"><PageHeader title="Configurações" subtitle="Gerencie o acesso da equipe ao painel." /><Link className="block rounded-xl border bg-white p-6 font-semibold text-blue-950" href="/settings/administrators">Administradores →<p className="mt-2 text-sm font-normal text-slate-500">Consulte os administradores e gerencie seus acessos.</p></Link></div>; }
