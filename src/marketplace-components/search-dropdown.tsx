"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Filter, X } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useLocation } from "@/contexts/location-context"
import Image from "next/image"

interface SearchResult {
  id: string
  title: string
  description: string
  price: number
  image_url: string | null
  category_name: string | null
}

interface CategoryFilter {
  id: string
  name: string
  icon: string
}

interface SearchDropdownProps {
  selectedCategory?: CategoryFilter | null
  onClearCategory?: () => void
  onSelectCategory?: (category: CategoryFilter) => void
}

export function SearchDropdown({ selectedCategory, onClearCategory, onSelectCategory }: SearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categories, setCategories] = useState<CategoryFilter[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { location } = useLocation()

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon')
          .order('name')
        
        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchListings = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setIsLoading(true)
      setShowDropdown(true)

      try {
        let query = supabase
          .from("listings")
          .select(`
            id,
            title,
            description,
            price,
            category_id,
            categories (name),
            listing_images (image_url)
          `)
          .eq("is_active", true)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        
        // Se tiver categoria selecionada, filtra por ela
        if (selectedCategory) {
          query = query.eq("category_id", selectedCategory.id)
        }
        
        const { data, error } = await query
          .limit(8)
          .order("created_at", { ascending: false })

        if (error) throw error

        const formattedResults: SearchResult[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          image_url: item.listing_images?.[0]?.image_url || null,
          category_name: item.categories?.name || null,
        }))

        setResults(formattedResults)
      } catch (error) {
        console.error("Erro ao buscar anúncios:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchListings, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedCategory])

  const handleResultClick = (id: string) => {
    router.push(`/anuncio/${id}`)
    setShowDropdown(false)
    setSearchQuery("")
  }

  const handleSearch = () => {
    if (searchQuery.trim() || selectedCategory) {
      const params = new URLSearchParams()
      if (searchQuery.trim()) {
        params.set("q", searchQuery)
      }
      if (selectedCategory) {
        params.set("category", selectedCategory.id)
      }
      router.push(`/busca?${params.toString()}`)
      setShowDropdown(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Função para renderizar o ícone dinamicamente
  const renderIcon = (iconName: string, className: string = "h-4 w-4") => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className={className} />
    }
    return <LucideIcons.Package className={className} />
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative w-full">
        {/* Ícone de filtro ou badge de categoria */}
        {selectedCategory ? (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {renderIcon(selectedCategory.icon, "h-4 w-4")}
                </div>
                <span className="truncate font-semibold">{selectedCategory.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClearCategory?.()
                }}
                className="hover:bg-primary-foreground/20 rounded-full p-1 transition-colors flex-shrink-0"
                title="Remover filtro"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-border"></div>
          </div>
        ) : (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10" ref={categoryDropdownRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-accent rounded-lg transition-colors"
              title="Filtrar por categoria"
            >
              <Filter className="h-4 w-4 text-gray-600 dark:text-foreground" />
            </button>
            
            {/* Dropdown de Categorias */}
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-lg shadow-2xl z-50 w-64 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase">
                    Filtrar por categoria
                  </div>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          onSelectCategory?.(category)
                          setShowCategoryDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 dark:hover:bg-accent transition-colors text-left group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 dark:bg-muted rounded-lg group-hover:bg-primary/20 dark:group-hover:bg-accent transition-colors flex-shrink-0">
                          {renderIcon(category.icon, "h-5 w-5 text-primary dark:text-foreground")}
                        </div>
                        <span className="font-medium text-sm text-gray-900 dark:text-foreground group-hover:text-primary dark:group-hover:text-foreground transition-colors">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          placeholder={`O que você procura hoje em ${location?.city || 'Guáira'}?`}
          className={`${selectedCategory ? 'pl-[145px] sm:pl-[180px] md:pl-[220px]' : 'pl-10'} pr-10 h-12 text-sm bg-white dark:bg-input text-foreground border-2 border-gray-300 dark:border-border focus:border-gray-400 dark:focus:border-ring focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-muted-foreground`}
        />
        {searchQuery && !isLoading && (
          <button
            onClick={() => {
              setSearchQuery("")
              setResults([])
              setShowDropdown(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-muted hover:bg-gray-300 dark:hover:bg-accent transition-colors z-10 group"
            title="Limpar busca"
          >
            <X className="h-3 w-3 text-gray-600 dark:text-foreground group-hover:text-gray-800 dark:group-hover:text-foreground" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown de Resultados */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-lg shadow-2xl z-50 max-h-[500px] overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-accent transition-colors text-left"
              >
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 dark:bg-muted rounded-lg overflow-hidden">
                  {result.image_url ? (
                    <Image
                      src={result.image_url}
                      alt={result.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-muted-foreground">
                      <Search className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black dark:text-foreground text-sm truncate">
                    {result.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-muted-foreground line-clamp-2 mt-0.5">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatPrice(result.price)}
                    </span>
                    {result.category_name && (
                      <span className="text-xs text-gray-500 dark:text-muted-foreground bg-gray-100 dark:bg-muted px-2 py-0.5 rounded-full">
                        {result.category_name}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 bg-gray-50 dark:bg-muted">
            <button
              onClick={handleSearch}
              className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2"
            >
              Ver todos os resultados{selectedCategory ? ` em ${selectedCategory.name}` : ''} para "{searchQuery}"
            </button>
          </div>
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {showDropdown && !isLoading && searchQuery.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-lg shadow-2xl z-50 p-6 text-center">
          <p className="text-gray-600 dark:text-muted-foreground">Nenhum anúncio encontrado para "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}
