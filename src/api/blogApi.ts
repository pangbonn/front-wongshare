// Thin client for the lab-services NestJS blog API — replaces direct
// supabase-js access for content reads (articles/categories/tags) and the
// new-article email subscription (no login, double opt-in).
// Reader auth, favorites, notifications, and payment subscriptions
// still use the old Supabase project (../../supabase/config) — that split
// is deliberate, see lab-services/docs/info-blog.md.

const BASE_URL = import.meta.env.VITE_BLOG_API_URL || 'http://localhost:3000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Blog API request failed: ${res.status}`)
  }
  return res.json()
}

export interface BlogCategory {
  name: string
  slug: string
  icon: string | null
  color: string | null
}

export interface BlogTag {
  name: string
  slug: string
  icon: string | null
  color: string | null
}

export interface BlogAuthor {
  name: string
  avatarThumbUrl: string | null
  bio?: string | null
  specialization?: string | null
}

export interface BlogArticleListItem {
  slug: string
  title: string
  excerpt: string
  coverThumbUrl: string | null
  likeCount: number
  viewCount: number
  publishedAt: string | null
  category: BlogCategory | null
  tags: BlogTag[]
  author: BlogAuthor | null
}

export interface BlogArticleDetail {
  id: string
  slug: string
  title: string
  contentHtml: string
  coverThumbUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  likeCount: number
  viewCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category: BlogCategory | null
  tags: BlogTag[]
  author: BlogAuthor | null
}

export function fetchArticleList(
  params: { page?: number; pageSize?: number; tag?: string; category?: string } = {},
) {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  if (params.tag) search.set('tag', params.tag)
  if (params.category) search.set('category', params.category)
  const qs = search.toString()
  return request<BlogArticleListItem[]>(`/blog/articles${qs ? `?${qs}` : ''}`)
}

export function fetchArticleBySlug(slug: string) {
  return request<BlogArticleDetail>(`/blog/articles/${encodeURIComponent(slug)}`)
}

export function fetchCategoryList() {
  return request<BlogCategory[]>('/blog/categories')
}

export function fetchTagList() {
  return request<(BlogTag & { usageCount: number })[]>('/blog/tags')
}

// Always resolves { ok: true } for a valid email — the API doesn't reveal
// whether the address was already subscribed. A confirmation email follows.
export function subscribeEmail(email: string) {
  return request<{ ok: true }>('/blog/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

export function confirmSubscription(token: string) {
  return request<{ confirmed: true }>(`/blog/subscribe/confirm/${encodeURIComponent(token)}`)
}

export function unsubscribeEmail(token: string) {
  return request<{ unsubscribed: true }>(`/blog/unsubscribe/${encodeURIComponent(token)}`)
}
