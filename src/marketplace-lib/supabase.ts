import { createClient } from '@supabase/supabase-js'

// Credenciais do Supabase (hardcoded para desenvolvimento)
const supabaseUrl = 'https://bcnxigussmnyrozgbmmk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbnhpZ3Vzc21ueXJvemdibW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgzOTYsImV4cCI6MjA3ODM3NDM5Nn0.v4XqZLhxYhgheN8BL28kKXfGV0cwknU0q7efgvKFB_k'

// Criar cliente do Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Função helper para verificar se está configurado
export function isSupabaseConfigured() {
  return true
}

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          rating: number
          total_reviews: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          category_id: string | null
          title: string
          description: string
          price: number
          views: number
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id?: string | null
          title: string
          description: string
          price: number
          views?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string | null
          title?: string
          description?: string
          price?: number
          views?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          image_url: string
          display_order?: number
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          icon: string | null
          created_at: string
        }
      }
      listing_badges: {
        Row: {
          listing_id: string
          badge_id: string
          created_at: string
        }
      }
    }
    Views: {
      listings_full: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          views: number
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
          seller_id: string
          seller_name: string
          seller_email: string | null
          seller_phone: string | null
          seller_avatar: string | null
          seller_rating: number
          seller_reviews: number
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          images: any // JSON array
          badges: any // JSON array
        }
      }
    }
  }
}

