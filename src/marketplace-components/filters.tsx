"use client"

import { useState, useEffect } from "react"
import { Package } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  listing_count?: number
}

export function Filters() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .order("name")

      if (data) {
        const withCount = await Promise.all(
          data.map(async (cat) => {
            const { count } = await supabase
              .from("listings")
              .select("*", { count: "exact", head: true })
              .eq("category_id", cat.id)
              .eq("is_active", true)
            return { ...cat, listing_count: count || 0 }
          })
        )
        setCategories(withCount)
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função para renderizar o ícone dinamicamente do Lucide
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 flex-shrink-0" />
    }
    return <Package className="w-5 h-5 flex-shrink-0" />
  }

  if (loading) {
    return (
      <section className="border-b px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-xl font-bold">Categorias</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.length) return null

  return (
    <section className="border-b px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-xl font-bold">Categorias</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            return (
              <button
                key={cat.id}
                onClick={() => router.push(`/categoria/${cat.slug}`)}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary transition-colors text-left"
              >
                {renderIcon(cat.icon)}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{cat.name}</div>
                  <div className="text-xs text-muted-foreground">{cat.listing_count}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

