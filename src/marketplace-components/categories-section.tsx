'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface CategoriesSectionProps {
  onCategorySelect?: (categoryId: string | null) => void
  selectedCategory?: string | null
}

export function CategoriesSection({ onCategorySelect, selectedCategory }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    )
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 300
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  // Função para renderizar o ícone dinamicamente (igual ao admin)
  const renderIcon = (iconName: string, className: string = "h-8 w-8") => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className={className} />
    }
    return <LucideIcons.Package className={className} />
  }

  const handleCategoryClick = (categoryId: string) => {
    const newSelection = selectedCategory === categoryId ? null : categoryId
    onCategorySelect?.(newSelection)
    
    if (newSelection) {
      setTimeout(() => {
        const section = document.getElementById('anuncios-section')
        if (section) {
          const yOffset = -100 // Offset de 100px acima do título
          const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    }
  }

  if (categories.length === 0) return null

  return (
    <section className="py-3 bg-background dark:bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center">
          {/* Seta Esquerda - apenas desktop */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex flex-shrink-0 p-2 rounded-full bg-background dark:bg-card border-2 border-border shadow-lg hover:bg-accent transition-all mr-3"
              style={{ zIndex: 20 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Container de Categorias */}
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide"
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                      : 'bg-card dark:bg-card hover:bg-accent dark:hover:bg-accent border border-border'
                  }`}
                >
                  <div className={`transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
                    {renderIcon(category.icon, "w-4 h-4")}
                  </div>
                  <span className="font-medium text-sm whitespace-nowrap">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Seta Direita - apenas desktop */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex flex-shrink-0 p-2 rounded-full bg-background dark:bg-card border-2 border-border shadow-lg hover:bg-accent transition-all ml-3"
              style={{ zIndex: 20 }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
