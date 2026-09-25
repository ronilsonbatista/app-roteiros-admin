import api from '@/lib/axios';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  relatedDestinations: string[];
  authorName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  status: 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface BlogListResponse {
  data: BlogPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listBlogPosts(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
} = {}): Promise<BlogListResponse> {
  const res = await api.get('/admin/blog/posts', { params });
  return res.data?.data || res.data;
}

export async function getBlogPost(id: string): Promise<BlogPost> {
  const res = await api.get(`/admin/blog/posts/${id}`);
  return res.data?.data || res.data;
}

export async function createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await api.post('/admin/blog/posts', data);
  return res.data?.data || res.data;
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const res = await api.put(`/admin/blog/posts/${id}`, data);
  return res.data?.data || res.data;
}

export async function publishBlogPost(id: string): Promise<BlogPost> {
  const res = await api.post(`/admin/blog/posts/${id}/publish`);
  return res.data?.data || res.data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  await api.delete(`/admin/blog/posts/${id}`);
}
