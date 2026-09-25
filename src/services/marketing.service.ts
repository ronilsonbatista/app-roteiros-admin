import api from '@/lib/axios';

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  filterCriteria: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudiencePreviewResult {
  totalAudience: number;
  excludedNoConsent: number;
  deliverableAudience: number;
  sampleRecipients: Array<{
    id: string;
    email: string;
    fullName: string;
    stage?: string;
  }>;
}

export interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  preheader: string | null;
  htmlContent: string;
  plainText: string | null;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  preheader: string | null;
  content: string;
  ctaText: string | null;
  ctaUrl: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'PARTIALLY_SENT' | 'FAILED' | 'CANCELLED';
  segmentId: string | null;
  templateId: string | null;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  failedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  completedAt: string | null;
  segment?: Segment | null;
  template?: EmailTemplate | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SEGMENTS API
// ==========================================

export async function listSegments(): Promise<Segment[]> {
  const res = await api.get('/admin/marketing/segments');
  return res.data?.data || res.data;
}

export async function createSegment(data: {
  name: string;
  description?: string;
  filterCriteria: Record<string, any>;
}): Promise<Segment> {
  const res = await api.post('/admin/marketing/segments', data);
  return res.data?.data || res.data;
}

export async function updateSegment(
  id: string,
  data: { name?: string; description?: string; filterCriteria?: Record<string, any>; isActive?: boolean },
): Promise<Segment> {
  const res = await api.put(`/admin/marketing/segments/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteSegment(id: string): Promise<void> {
  await api.delete(`/admin/marketing/segments/${id}`);
}

export async function previewAudience(filterCriteria: Record<string, any>): Promise<AudiencePreviewResult> {
  const res = await api.post('/admin/marketing/segments/preview-audience', { filterCriteria });
  return res.data?.data || res.data;
}

// ==========================================
// TEMPLATES API
// ==========================================

export async function listTemplates(category?: string): Promise<EmailTemplate[]> {
  const params: any = {};
  if (category) params.category = category;
  const res = await api.get('/admin/marketing/templates', { params });
  return res.data?.data || res.data;
}

export async function getTemplate(id: string): Promise<EmailTemplate> {
  const res = await api.get(`/admin/marketing/templates/${id}`);
  return res.data?.data || res.data;
}

export async function createTemplate(data: {
  title: string;
  category: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  plainText?: string;
  variables?: string[];
}): Promise<EmailTemplate> {
  const res = await api.post('/admin/marketing/templates', data);
  return res.data?.data || res.data;
}

export async function updateTemplate(
  id: string,
  data: Partial<EmailTemplate>,
): Promise<EmailTemplate> {
  const res = await api.put(`/admin/marketing/templates/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/admin/marketing/templates/${id}`);
}

// ==========================================
// CAMPAIGNS API
// ==========================================

export async function listCampaigns(status?: string): Promise<Campaign[]> {
  const params: any = {};
  if (status) params.status = status;
  const res = await api.get('/admin/marketing/campaigns', { params });
  return res.data?.data || res.data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await api.get(`/admin/marketing/campaigns/${id}`);
  return res.data?.data || res.data;
}

export async function createCampaign(data: {
  title: string;
  subject: string;
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  segmentId?: string;
  templateId?: string;
  scheduledAt?: string;
}): Promise<Campaign> {
  const res = await api.post('/admin/marketing/campaigns', data);
  return res.data?.data || res.data;
}

export async function updateCampaign(
  id: string,
  data: Partial<Campaign>,
): Promise<Campaign> {
  const res = await api.put(`/admin/marketing/campaigns/${id}`, data);
  return res.data?.data || res.data;
}

export async function dryRunCampaign(id: string): Promise<{
  campaignId: string;
  title: string;
  status: string;
  segmentApplied: string;
  totalAudienceIdentified: number;
  excludedNoMarketingConsent: number;
  validDeliverableRecipients: number;
  sampleRecipients: Array<{ id: string; email: string; fullName: string }>;
  protectionVerified: boolean;
}> {
  const res = await api.post(`/admin/marketing/campaigns/${id}/dry-run`);
  return res.data?.data || res.data;
}

export async function sendTestEmail(id: string, targetEmail: string) {
  const res = await api.post(`/admin/marketing/campaigns/${id}/send-test`, { targetEmail });
  return res.data?.data || res.data;
}

export async function scheduleOrSendCampaign(id: string) {
  const res = await api.post(`/admin/marketing/campaigns/${id}/schedule`);
  return res.data?.data || res.data;
}

export async function cancelCampaign(id: string) {
  const res = await api.post(`/admin/marketing/campaigns/${id}/cancel`);
  return res.data?.data || res.data;
}
