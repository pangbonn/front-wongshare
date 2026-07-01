import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL และ Anon Key ยังไม่ได้ตั้งค่า กรุณาตั้งค่าในไฟล์ .env')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  is_author: boolean
  author_bio: string | null
  author_specialization: string | null
  author_social_links: Record<string, any> | null
  author_verified: boolean
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  author_id: string | null
  category_id: string | null
  published: boolean
  published_at: string | null
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  enabled: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  article_id: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  subscription_type: 'free' | 'premium' | 'pro'
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  start_date: string
  end_date: string | null
  auto_renew: boolean
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'article_published' | 'comment' | 'like' | 'subscription' | 'system' | 'reminder'
  title: string
  message: string
  link: string | null
  read: boolean
  read_at: string | null
  created_at: string
}

export interface UserFavoriteView {
  id: string
  user_id: string
  article_id: string
  favorited_at: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  views_count: number
  likes_count: number
}

export interface EmailSubscription {
  id: string
  user_id: string
  email: string
  subscription_updates: boolean
  new_articles: boolean
  weekly_digest: boolean
  marketing_emails: boolean
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface EmailLog {
  id: string
  user_id: string | null
  email: string
  email_type: 'subscription_update' | 'new_article' | 'weekly_digest' | 'marketing'
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  error_message: string | null
  metadata: Record<string, any> | null
  sent_at: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  enabled: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface ArticleTag {
  id: string
  article_id: string
  tag_id: string
  created_at: string
}

export interface Author {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  email: string | null
  specialization: string | null
  social_links: Record<string, any> | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ArticleWithTags extends Article {
  tags?: Tag[]
  category?: Category | null
  author?: {
    id: string
    name: string
    avatar_url: string | null
    bio: string | null
    specialization: string | null
  } | null
}

