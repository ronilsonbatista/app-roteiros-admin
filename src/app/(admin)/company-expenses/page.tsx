'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  listCompanyExpenses,
  getCompanyExpensesSummary,
  createCompanyExpense,
  updateCompanyExpense,
  deleteCompanyExpense,
  CompanyExpense,
  CompanyExpenseCategory,
  CompanyExpensesSummary,
  CreateCompanyExpenseInput,
} from '@/services/company-expenses.service';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { EmptyState } from '@/components/admin/empty-state';

import {
  Receipt,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Layers,
  Megaphone,
  Users,
  Plane,
  MoreHorizontal,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  CompanyExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  INFRA: {
    label: 'Infra & Cloud',
    icon: Server,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  SAAS: {
    label: 'Softwares & SaaS',
    icon: Layers,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  MARKETING: {
    label: 'Marketing & Ads',
    icon: Megaphone,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  PESSOAS: {
    label: 'Equipe & Pessoas',
    icon: Users,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  VIAGEM: {
    label: 'Viagens & Deslocamentos',
    icon: Plane,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  OUTROS: {
    label: 'Outros Gastos',
    icon: Tag,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

function getInitialMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(competenceMonth: string): string {
  const [yearStr, monthStr] = competenceMonth.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function addMonths(competenceMonth: string, delta: number): string {
  const [yearStr, monthStr] = competenceMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + delta;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function CompanyExpensesPage() {
  const currentRealMonth = useMemo(() => getInitialMonth(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentRealMonth);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [summary, setSummary] = useState<CompanyExpensesSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form Drawer states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<CompanyExpense | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<CompanyExpenseCategory>('INFRA');
  const [formAmountStr, setFormAmountStr] = useState<string>('');
  const [formSpentAt, setFormSpentAt] = useState<string>('');
  const [formCompetenceMonth, setFormCompetenceMonth] = useState<string>('');
  const [formVendor, setFormVendor] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete modal state
  const [deletingExpense, setDeletingExpense] = useState<CompanyExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await getCompanyExpensesSummary(selectedMonth);
      setSummary(data);
    } catch (err: any) {
      console.error('Falha ao carregar resumo de despesas:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [selectedMonth]);

  // Fetch list
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listCompanyExpenses({
        competenceMonth: selectedMonth,
        category: categoryFilter,
        search: searchQuery.trim() || undefined,
        limit: 100,
        orderBy: 'spentAt',
        order: 'desc',
      });
      setExpenses(response.data || []);
    } catch (err: any) {
      console.error('Falha ao carregar lista de despesas:', err);
      setError('Não foi possível carregar os gastos do período. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchSummary();
    fetchExpenses();
  }, [fetchSummary, fetchExpenses]);

  // Open Form for creating
  const handleOpenCreate = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setEditingExpense(null);
    setFormTitle('');
    setFormCategory('INFRA');
    setFormAmountStr('');
    setFormSpentAt(todayIso);
    setFormCompetenceMonth(selectedMonth);
    setFormVendor('');
    setFormNotes('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form for editing
  const handleOpenEdit = (expense: CompanyExpense) => {
    setEditingExpense(expense);
    setFormTitle(expense.title);
    setFormCategory(expense.category);
    setFormAmountStr((expense.amountCents / 100).toFixed(2).replace('.', ','));
    setFormSpentAt(expense.spentAt ? expense.spentAt.slice(0, 10) : '');
    setFormCompetenceMonth(expense.competenceMonth || selectedMonth);
    setFormVendor(expense.vendor || '');
    setFormNotes(expense.notes || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Save (Create or Update)
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Informe um título ou descrição para o gasto.');
      return;
    }

    const cleanAmount = formAmountStr.replace(/\./g, '').replace(',', '.');
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Informe um valor monetário válido maior que zero.');
      return;
    }

    const amountCents = Math.round(parsedAmount * 100);

    setIsSaving(true);
    try {
      const payload: CreateCompanyExpenseInput = {
        title: formTitle.trim(),
        category: formCategory,
        amountCents,
        currency: 'BRL',
        spentAt: formSpentAt ? new Date(formSpentAt).toISOString() : new Date().toISOString(),
        competenceMonth: formCompetenceMonth || selectedMonth,
        vendor: formVendor.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      if (editingExpense) {
        await updateCompanyExpense(editingExpense.id, payload);
      } else {
        await createCompanyExpense(payload);
      }

      setIsFormOpen(false);
      await Promise.all([fetchSummary(), fetchExpenses()]);
    } catch (err: any) {
      console.error('Erro ao salvar gasto:', err);
      const msg = err.response?.data?.message || err.message || 'Falha ao salvar gasto.';
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await deleteCompanyExpense(deletingExpense.id);
      setDeletingExpense(null);
      await Promise.all([fetchSummary(), fetchExpenses()]);
    } catch (err: any) {
      console.error('Falha ao excluir gasto:', err);
      alert('Não foi possível excluir o gasto. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Total calculated from currently displayed list
  const listSumCents = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amountCents, 0);
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header com Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Gastos da Empresa
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#001F5B]/10 text-[#001F5B] font-semibold border border-[#001F5B]/20">
              OPEX INTERNO
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Controle financeiro de custos mensais, despesas operacionais e ferramentas internas da 2GO
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSummary();
              fetchExpenses();
            }}
            className="text-xs h-9 border-slate-200 hover:bg-slate-100/70"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Atualizar
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs h-9 px-4 font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Gasto
          </Button>
        </div>
      </div>

      {/* Seletor de Competência (Mês / Ano) */}
      <Card className="p-3.5 bg-white border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#001F5B]" />
            <span className="text-xs font-semibold text-slate-700">Competência:</span>
            <span className="text-sm font-bold text-slate-900 capitalize">
              {formatMonthLabel(selectedMonth)}
            </span>
            {selectedMonth === currentRealMonth && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                Mês Atual
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
              className="h-8 px-2.5 text-xs border-slate-200"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Anterior
            </Button>

            {selectedMonth !== currentRealMonth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonth(currentRealMonth)}
                className="h-8 px-2.5 text-xs text-[#001F5B] hover:bg-[#001F5B]/5 font-semibold"
              >
                Mês Atual
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              className="h-8 px-2.5 text-xs border-slate-200"
              title="Próximo Mês"
            >
              Próximo
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
              className="h-8 px-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
            />
          </div>
        </div>
      </Card>

      {/* Resumo Financeiro (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total do Mês */}
        <Card className="p-4 bg-white border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Total do Mês
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#001F5B]/10 text-[#001F5B] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isSummaryLoading ? (
              <div className="h-7 w-32 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(summary?.totalCents || 0)}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{summary?.totalCount || 0} lançamentos registrados</span>
            {summary?.previousMonth?.percentageChange !== null &&
              summary?.previousMonth?.percentageChange !== undefined && (
                <span
                  className={`inline-flex items-center font-medium ${
                    summary.previousMonth.percentageChange > 0
                      ? 'text-rose-600'
                      : summary.previousMonth.percentageChange < 0
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {summary.previousMonth.percentageChange > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(summary.previousMonth.percentageChange)}% vs mês ant.
                </span>
              )}
          </div>
        </Card>

        {/* Categoria com Maior Impacto */}
        <Card className="p-4 bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Maior Categoria
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            {isSummaryLoading ? (
              <div className="h-7 w-32 bg-slate-100 animate-pulse rounded" />
            ) : (
              (() => {
                const topCategory = summary?.byCategory?.filter((c) => c.totalCents > 0).sort((a, b) => b.totalCents - a.totalCents)[0];
                if (!topCategory) {
                  return <div className="text-sm font-medium text-slate-400">Sem gastos no período</div>;
                }
                const conf = CATEGORY_CONFIG[topCategory.category];
                return (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900 truncate">
                      {conf?.label || topCategory.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({topCategory.percentage}% do total)
                    </span>
                  </div>
                );
              })()
            )}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {(() => {
              const topCategory = summary?.byCategory?.filter((c) => c.totalCents > 0).sort((a, b) => b.totalCents - a.totalCents)[0];
              return topCategory ? `${formatCurrency(topCategory.totalCents)} em ${topCategory.count} lançamentos` : 'Aguardando lançamentos';
            })()}
          </div>
        </Card>

        {/* Consistência & Validação */}
        <Card className="p-4 bg-white border-slate-200/90 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Conferência da Lista
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(listSumCents)}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {summary && Math.abs(listSumCents - summary.totalCents) === 0 ? (
              <span className="text-emerald-700 font-medium inline-flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Soma da lista confere 100% com o resumo financeiro
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Filtros ativos alterando exibição da listagem
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Distribuição por Categoria (Barras de progresso / Badges) */}
      {summary && summary.byCategory && summary.byCategory.some((c) => c.totalCents > 0) && (
        <Card className="p-4 bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Distribuição do Orçamento no Mês
            </span>
            <span className="text-xs text-slate-400 font-medium">
              100% = {formatCurrency(summary.totalCents)}
            </span>
          </div>

          {/* Barra de distribuição proporcional */}
          <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5 mb-3">
            {summary.byCategory
              .filter((c) => c.totalCents > 0)
              .map((c) => {
                const conf = CATEGORY_CONFIG[c.category];
                return (
                  <div
                    key={c.category}
                    style={{ width: `${Math.max(c.percentage, 2)}%` }}
                    className={`h-full rounded-xs transition-all ${
                      c.category === 'INFRA'
                        ? 'bg-sky-500'
                        : c.category === 'SAAS'
                        ? 'bg-indigo-500'
                        : c.category === 'MARKETING'
                        ? 'bg-amber-500'
                        : c.category === 'PESSOAS'
                        ? 'bg-emerald-500'
                        : c.category === 'VIAGEM'
                        ? 'bg-purple-500'
                        : 'bg-slate-400'
                    }`}
                    title={`${conf.label}: ${formatCurrency(c.totalCents)} (${c.percentage}%)`}
                  />
                );
              })}
          </div>

          {/* Badges de categoria */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {summary.byCategory.map((c) => {
              const conf = CATEGORY_CONFIG[c.category];
              const Icon = conf.icon;
              return (
                <div
                  key={c.category}
                  className={`p-2 rounded-lg border ${conf.border} ${conf.bg} flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <Icon className={`w-3.5 h-3.5 ${conf.text}`} />
                    <span className="truncate">{conf.label}</span>
                  </div>
                  <div className="mt-1.5">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(c.totalCents)}</p>
                    <p className="text-[10px] text-slate-500">
                      {c.count} {c.count === 1 ? 'item' : 'itens'} ({c.percentage}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Barra de Filtros */}
      <Card className="p-3.5 bg-white border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou fornecedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#001F5B]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#001F5B]"
            >
              <option value="ALL">Todas as Categorias</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                <option key={key} value={key}>
                  {conf.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 self-end md:self-auto font-mono">
            Exibindo {expenses.length} {expenses.length === 1 ? 'despesa' : 'despesas'}
          </div>
        </div>
      </Card>

      {/* Lista de Despesas (Tabela no Desktop, Cards no Mobile) */}
      {isLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white">
          <Loader2 className="w-6 h-6 animate-spin text-[#001F5B]" />
          <span className="text-xs font-medium">Carregando despesas da empresa...</span>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center bg-rose-50 border-rose-200 text-rose-700">
          <p className="text-sm font-semibold">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExpenses}
            className="mt-3 text-xs bg-white text-rose-700 border-rose-200"
          >
            Tentar novamente
          </Button>
        </Card>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhum gasto neste mês"
          description={`Nenhuma despesa operacional foi registrada para a competência de ${formatMonthLabel(
            selectedMonth
          )}.`}
          action={{
            label: 'Adicionar Primeiro Gasto',
            icon: Plus,
            onClick: handleOpenCreate,
          }}
        />
      ) : (
        <>
          {/* Tabela Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Data</th>
                  <th className="py-3 px-4 font-semibold">Título / Descrição</th>
                  <th className="py-3 px-4 font-semibold">Categoria</th>
                  <th className="py-3 px-4 font-semibold">Fornecedor</th>
                  <th className="py-3 px-4 font-semibold text-right">Valor</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((expense) => {
                  const conf = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OUTROS;
                  const CategoryIcon = conf.icon;
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(expense.spentAt)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {expense.title}
                        </div>
                        {expense.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {expense.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${conf.border} ${conf.bg} ${conf.text}`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {conf.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {expense.vendor ? (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {expense.vendor}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap text-sm font-mono">
                        {formatCurrency(expense.amountCents)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(expense)}
                            className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Editar despesa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingExpense(expense)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden space-y-3">
            {expenses.map((expense) => {
              const conf = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OUTROS;
              const CategoryIcon = conf.icon;
              return (
                <Card key={expense.id} className="p-3.5 bg-white border-slate-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{expense.title}</h4>
                      <p className="text-[11px] text-slate-500">{formatDate(expense.spentAt)}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {formatCurrency(expense.amountCents)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${conf.border} ${conf.bg} ${conf.text}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {conf.label}
                    </span>

                    {expense.vendor && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                        {expense.vendor}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(expense)}
                        className="h-7 px-2 text-xs text-slate-600"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingExpense(expense)}
                        className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Drawer / Sheet para Criar ou Editar Gasto */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#001F5B]" />
              {editingExpense ? 'Editar Gasto Operacional' : 'Novo Gasto Operacional'}
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Lançamento interno para controle de custos e despesas da empresa
            </SheetDescription>
          </SheetHeader>

          {formError && (
            <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título / Descrição *
              </label>
              <Input
                type="text"
                placeholder="Ex: Fatura AWS Produção"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as CompanyExpenseCategory)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                  <option key={key} value={key}>
                    {conf.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor (R$) *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 154,20"
                  value={formAmountStr}
                  onChange={(e) => setFormAmountStr(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do Gasto *
                </label>
                <Input
                  type="date"
                  value={formSpentAt}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormSpentAt(val);
                    if (val && !editingExpense) {
                      setFormCompetenceMonth(val.slice(0, 7));
                    }
                  }}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mês Competência
                </label>
                <Input
                  type="month"
                  value={formCompetenceMonth}
                  onChange={(e) => setFormCompetenceMonth(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fornecedor
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Amazon AWS"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações / Detalhes
              </label>
              <textarea
                rows={3}
                placeholder="Notas de contexto, número de nota fiscal ou detalhes da renovação..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#001F5B]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#001F5B] hover:bg-[#FF6A00] text-white text-xs font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Salvando...
                  </>
                ) : editingExpense ? (
                  'Salvar Alterações'
                ) : (
                  'Cadastrar Gasto'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Modal de Confirmação de Exclusão */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="max-w-sm w-full p-5 bg-white space-y-4 shadow-xl animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Excluir Gasto</h3>
                <p className="text-xs text-slate-500">Esta ação arquivará este lançamento financeiro.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <p className="font-semibold text-slate-800">{deletingExpense.title}</p>
              <p className="text-slate-500 mt-0.5">
                {formatCurrency(deletingExpense.amountCents)} • {formatDate(deletingExpense.spentAt)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingExpense(null)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteExpense}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
