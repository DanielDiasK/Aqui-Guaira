"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoriesSection } from "@/components/categories-section"
import { ListingsCarouselSection } from "@/components/listings-carousel-section"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

interface CategoryFilter {
  id: string
  name: string
  icon: string
}

export default function Home() {
  const [refreshListings, setRefreshListings] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter | null>(null)

  // Quando uma categoria é selecionada, carrega seus detalhes para o filtro
  useEffect(() => {
    if (selectedCategory) {
      loadCategoryDetails(selectedCategory)
    } else {
      setCategoryFilter(null)
    }
  }, [selectedCategory])

  const loadCategoryDetails = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .eq('id', categoryId)
        .single()
      
      if (error) throw error
      if (data) {
        setCategoryFilter(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categoria:', error)
      setCategoryFilter(null)
    }
  }

  const handleClearCategory = () => {
    setSelectedCategory(null)
    setCategoryFilter(null)
  }

  const handleSelectCategory = (category: CategoryFilter) => {
    setSelectedCategory(category.id)
    setCategoryFilter(category)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={categoryFilter} 
        onClearCategory={handleClearCategory}
        onSelectCategory={handleSelectCategory}
      />
      <CategoriesSection 
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      <Hero />
      <ListingsCarouselSection 
        key={selectedCategory || (refreshListings ? "refreshed" : "initial")}
        selectedCategory={selectedCategory}
      />
      <Footer />
    </div>
  )
}
