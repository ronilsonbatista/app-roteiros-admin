import api from '@/lib/axios';

export type CompanyExpenseCategory =
  | 'INFRA'
  | 'SAAS'
  | 'MARKETING'
  | 'PESSOAS'
  | 'VIAGEM'
  | 'OUTROS';

export interface CompanyExpense {
  id: string;
  title: string;
  category: CompanyExpenseCategory;
  amountCents: number;
  currency: string;
  spentAt: string;
  competenceMonth: string;
  vendor: string | null;
  notes: string | null;
  createdByAdminId: string | null;
  createdByAdmin?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  category: CompanyExpenseCategory;
  totalCents: number;
  count: number;
  percentage: number;
}

export interface CompanyExpensesSummary {
  competenceMonth: string;
  totalCents: number;
  totalCount: number;
  previousMonth: {
    competenceMonth: string;
    totalCents: number;
    differenceCents: number;
    percentageChange: number | null;
  };
  byCategory: CategorySummary[];
}

export interface CompanyExpenseFilters {
  competenceMonth?: string;
  month?: string;
  category?: CompanyExpenseCategory | string;
  search?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'spentAt' | 'amountCents' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface CreateCompanyExpenseInput {
  title: string;
  category: CompanyExpenseCategory;
  amountCents: number;
  currency?: string;
  spentAt?: string;
  competenceMonth?: string;
  vendor?: string;
  notes?: string;
}

export interface UpdateCompanyExpenseInput extends Partial<CreateCompanyExpenseInput> {}

export interface CompanyExpensesListResponse {
  data: CompanyExpense[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listCompanyExpenses(filters: CompanyExpenseFilters = {}): Promise<CompanyExpensesListResponse> {
  const params = new URLSearchParams();

  if (filters.competenceMonth) params.append('competenceMonth', filters.competenceMonth);
  if (filters.month) params.append('month', filters.month);
  if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
  if (filters.search) params.append('search', filters.search);
  if (filters.includeArchived) params.append('includeArchived', 'true');
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.orderBy) params.append('orderBy', filters.orderBy);
  if (filters.order) params.append('order', filters.order);

  const response = await api.get(`/admin/company-expenses?${params.toString()}`);
  const raw = response.data;
  const payload = raw?.data !== undefined ? raw.data : raw;

  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: { total: payload.length, page: 1, limit: payload.length, totalPages: 1 },
    };
  }

  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : [];

  const meta = payload?.meta || {
    total: list.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  return { data: list, meta };
}

export async function getCompanyExpensesSummary(competenceMonth?: string): Promise<CompanyExpensesSummary> {
  const params = new URLSearchParams();
  if (competenceMonth) params.append('competenceMonth', competenceMonth);

  const response = await api.get(`/admin/company-expenses/summary?${params.toString()}`);
  return response.data?.data !== undefined ? response.data.data : response.data;
}

export async function getCompanyExpense(id: string): Promise<CompanyExpense> {
  const response = await api.get(`/admin/company-expenses/${encodeURIComponent(id)}`);
  return response.data?.data !== undefined ? response.data.data : response.data;
}

export async function createCompanyExpense(data: CreateCompanyExpenseInput): Promise<CompanyExpense> {
  const response = await api.post('/admin/company-expenses', data);
  return response.data?.data !== undefined ? response.data.data : response.data;
}

export async function updateCompanyExpense(id: string, data: UpdateCompanyExpenseInput): Promise<CompanyExpense> {
  const response = await api.patch(`/admin/company-expenses/${encodeURIComponent(id)}`, data);
  return response.data?.data !== undefined ? response.data.data : response.data;
}

export async function deleteCompanyExpense(id: string, hard: boolean = false): Promise<void> {
  await api.delete(`/admin/company-expenses/${encodeURIComponent(id)}${hard ? '?hard=true' : ''}`);
}

export async function archiveCompanyExpense(id: string): Promise<CompanyExpense> {
  const response = await api.post(`/admin/company-expenses/${encodeURIComponent(id)}/archive`);
  return response.data?.data !== undefined ? response.data.data : response.data;
}

export async function restoreCompanyExpense(id: string): Promise<CompanyExpense> {
  const response = await api.post(`/admin/company-expenses/${encodeURIComponent(id)}/restore`);
  return response.data?.data !== undefined ? response.data.data : response.data;
}
