import React from 'react';
import { cn } from '@/lib/utils';
import { 
  UserRound,
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  ShieldCheck,
  Send,
  FileText
} from 'lucide-react';

export type StatusType = 
  | 'PAID' | 'PENDING' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' | 'CHARGEBACK'
  | 'CUSTOMER_PAID' | 'PROSPECT' | 'QUALIFIED' | 'ENGAGED' | 'DISQUALIFIED' | 'NEW_LEAD'
  | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'COMPLETED' | 'PREMIUM_UNLOCKED'
  | 'OPERATIONAL' | 'ATTENTION' | 'UNAVAILABLE' | 'NOT_CONFIGURED' | 'HEALTHY' | 'UP' | 'DOWN'
  | 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  | 'SENT' | 'SENDING' | 'SCHEDULED' | 'FAILED'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, className, size = 'sm' }: StatusBadgeProps) {
  const normalized = String(status || '').toUpperCase().trim();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let icon: React.ReactNode = <HelpCircle className="w-3 h-3 shrink-0" />;
  let displayLabel = label || status;

  switch (normalized) {
    // Financial & Payments
    case 'PAID':
    case 'PAGO':
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      displayLabel = label || 'Pago';
      break;

    case 'PENDING':
    case 'PENDENTE':
    case 'AGUARDANDO':
      styles = "bg-amber-50 text-amber-700 border-amber-200/60";
      icon = <Clock className="w-3 h-3 text-amber-600 shrink-0" />;
      displayLabel = label || 'Pendente';
      break;

    case 'CANCELLED':
    case 'CANCELADO':
    case 'EXPIRED':
    case 'EXPIRADO':
      styles = "bg-rose-50 text-rose-700 border-rose-200/60";
      icon = <XCircle className="w-3 h-3 text-rose-600 shrink-0" />;
      displayLabel = label || (normalized.includes('EXPIRE') ? 'Expirado' : 'Cancelado');
      break;

    case 'REFUNDED':
    case 'REEMBOLSADO':
    case 'CHARGEBACK':
      styles = "bg-purple-50 text-purple-700 border-purple-200/60";
      icon = <AlertTriangle className="w-3 h-3 text-purple-600 shrink-0" />;
      displayLabel = label || (normalized === 'CHARGEBACK' ? 'Chargeback' : 'Reembolsado');
      break;

    case 'CONTACT':
      displayLabel = label || 'Contato comercial';
      icon = <UserRound className="w-3 h-3 shrink-0" />;
      break;
    case 'CUSTOMER_UNPAID':
      displayLabel = label || 'Sem compra aprovada';
      icon = <Clock className="w-3 h-3 shrink-0" />;
      break;
    // CRM / Stages
    case 'CUSTOMER_PAID':
    case 'CLIENTE_PAGO':
      styles = "bg-emerald-50 text-emerald-800 border-emerald-200";
      icon = <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />;
      displayLabel = label || 'Compra aprovada';
      break;

    case 'PROSPECT':
    case 'QUALIFIED':
    case 'ENGAGED':
      styles = "bg-blue-50 text-blue-700 border-blue-200/60";
      icon = <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />;
      displayLabel = label || (normalized === 'PROSPECT' ? 'Prospect' : normalized === 'QUALIFIED' ? 'Qualificado' : 'Engajado');
      break;

    case 'NEW_LEAD':
    case 'NOVO_LEAD':
      styles = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      icon = <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />;
      displayLabel = label || 'Novo Lead';
      break;

    case 'DISQUALIFIED':
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      icon = <XCircle className="w-3 h-3 text-slate-500 shrink-0" />;
      displayLabel = label || 'Desqualificado';
      break;

    // Trip & Content status
    case 'PUBLISHED':
    case 'PUBLICADO':
    case 'ACTIVE':
    case 'ATIVO':
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      displayLabel = label || (normalized.includes('PUBLISH') ? 'Publicado' : 'Ativo');
      break;

    case 'DRAFT':
    case 'RASCUNHO':
      styles = "bg-slate-100 text-slate-700 border-slate-200";
      icon = <FileText className="w-3 h-3 text-slate-500 shrink-0" />;
      displayLabel = label || 'Rascunho';
      break;

    case 'PREMIUM_UNLOCKED':
    case 'PREMIUM':
      styles = "bg-amber-50 text-amber-800 border-amber-200";
      icon = <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />;
      displayLabel = label || 'Premium';
      break;

    // System / Infrastructure Health
    case 'OPERATIONAL':
    case 'HEALTHY':
    case 'UP':
    case 'OK':
    case 'CONFIGURED':
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      displayLabel = label || 'Operacional';
      break;

    case 'ATTENTION':
    case 'ATENÇÃO':
    case 'WARN':
      styles = "bg-amber-50 text-amber-700 border-amber-200/60";
      icon = <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />;
      displayLabel = label || 'Atenção';
      break;

    case 'UNAVAILABLE':
    case 'DOWN':
    case 'INDISPONÍVEL':
    case 'ERROR':
    case 'FAILED':
      styles = "bg-rose-50 text-rose-700 border-rose-200/60";
      icon = <XCircle className="w-3 h-3 text-rose-600 shrink-0" />;
      displayLabel = label || 'Indisponível';
      break;

    case 'NOT_CONFIGURED':
    case 'NÃO_CONFIGURADO':
      styles = "bg-slate-100 text-slate-500 border-slate-200";
      icon = <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />;
      displayLabel = label || 'Não configurado';
      break;

    case 'BLOCKED':
    case 'BLOQUEADO':
    case 'INACTIVE':
      styles = "bg-rose-50 text-rose-700 border-rose-200/60";
      icon = <XCircle className="w-3 h-3 text-rose-500 shrink-0" />;
      displayLabel = label || (normalized === 'BLOCKED' ? 'Bloqueado' : 'Inativo');
      break;

    // Marketing Campaigns
    case 'SENT':
    case 'ENVIADO':
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      icon = <Send className="w-3 h-3 text-emerald-600 shrink-0" />;
      displayLabel = label || 'Enviado';
      break;

    case 'SENDING':
    case 'ENVIANDO':
      styles = "bg-blue-50 text-blue-700 border-blue-200/60";
      icon = <Clock className="w-3 h-3 text-blue-600 animate-spin shrink-0" />;
      displayLabel = label || 'Enviando';
      break;

    case 'SCHEDULED':
    case 'AGENDADO':
      styles = "bg-purple-50 text-purple-700 border-purple-200/60";
      icon = <Clock className="w-3 h-3 text-purple-600 shrink-0" />;
      displayLabel = label || 'Agendado';
      break;
  }

  const padding = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-tight shrink-0 select-none",
        styles,
        padding,
        className
      )}
    >
      {icon}
      <span>{displayLabel}</span>
    </span>
  );
}
