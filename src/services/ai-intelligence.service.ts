import api from '@/lib/axios';

export interface AIGuideline {
  id: string;
  name: string;
  category: string;
  content: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  destination: string | null;
  content: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface EditorialAssistResult {
  action: string;
  output: string;
  model: string;
  tokensUsed: number;
  provider: string;
}

export interface PlaygroundSimulateResult {
  success: boolean;
  simulationData: {
    destination: string;
    numberOfDays: number;
    travelStyle: string;
    budgetLevel: string;
    days: Array<{
      dayNumber: number;
      title: string;
      description: string;
      items: Array<{
        period: string;
        title: string;
        category: string;
        description: string;
      }>;
    }>;
  };
  metrics: {
    model: string;
    tokensUsed: number;
    durationMs: number;
    isRealProvider: boolean;
  };
  timestamp: string;
}

// ==========================================
// GUIDELINES
// ==========================================

export async function listGuidelines(): Promise<AIGuideline[]> {
  const res = await api.get('/admin/ai-intelligence/guidelines');
  return res.data?.data || res.data;
}

export async function createGuideline(data: {
  name: string;
  category: string;
  content: string;
}): Promise<AIGuideline> {
  const res = await api.post('/admin/ai-intelligence/guidelines', data);
  return res.data?.data || res.data;
}

export async function updateGuideline(
  id: string,
  data: Partial<AIGuideline>,
): Promise<AIGuideline> {
  const res = await api.put(`/admin/ai-intelligence/guidelines/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteGuideline(id: string): Promise<void> {
  await api.delete(`/admin/ai-intelligence/guidelines/${id}`);
}

// ==========================================
// KNOWLEDGE BASE
// ==========================================

export async function listKnowledgeArticles(params: {
  category?: string;
  destination?: string;
} = {}): Promise<KnowledgeArticle[]> {
  const res = await api.get('/admin/ai-intelligence/knowledge', { params });
  return res.data?.data || res.data;
}

export async function getKnowledgeArticle(id: string): Promise<KnowledgeArticle> {
  const res = await api.get(`/admin/ai-intelligence/knowledge/${id}`);
  return res.data?.data || res.data;
}

export async function createKnowledgeArticle(data: {
  title: string;
  category: string;
  destination?: string;
  content: string;
  tags?: string[];
}): Promise<KnowledgeArticle> {
  const res = await api.post('/admin/ai-intelligence/knowledge', data);
  return res.data?.data || res.data;
}

export async function updateKnowledgeArticle(
  id: string,
  data: Partial<KnowledgeArticle>,
): Promise<KnowledgeArticle> {
  const res = await api.put(`/admin/ai-intelligence/knowledge/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteKnowledgeArticle(id: string): Promise<void> {
  await api.delete(`/admin/ai-intelligence/knowledge/${id}`);
}

// ==========================================
// EDITORIAL ASSIST & PLAYGROUND
// ==========================================

export async function requestEditorialAssist(data: {
  action: 'GENERATE_DRAFT' | 'SUGGEST_TITLES' | 'SEO_META' | 'SUMMARIZE' | 'IMPROVE_TEXT';
  topic?: string;
  destination?: string;
  targetAudience?: string;
  existingContent?: string;
  context?: string;
}): Promise<EditorialAssistResult> {
  const res = await api.post('/admin/ai-intelligence/editorial-assist', data);
  return res.data?.data || res.data;
}

export async function runPlaygroundSimulation(data: {
  destination: string;
  numberOfDays: number;
  travelStyle?: string;
  budgetLevel?: string;
  interests?: string[];
  additionalPrompt?: string;
}): Promise<PlaygroundSimulateResult> {
  const res = await api.post('/admin/ai-intelligence/playground/simulate', data);
  return res.data?.data || res.data;
}
