"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2, Filter } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useLocation } from "@/contexts/location-context"
import Image from "next/image"
import { enhanceImageQuality } from "@/lib/image-utils"

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

interface SearchModalMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory?: CategoryFilter | null
  onClearCategory?: () => void
  onSelectCategory?: (category: CategoryFilter) => void
}

export function SearchModalMobile({ open, onOpenChange, selectedCategory, onClearCategory, onSelectCategory }: SearchModalMobileProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categories, setCategories] = useState<CategoryFilter[]>([])
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
    const searchListings = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)

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
    onOpenChange(false)
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
      onOpenChange(false)
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

  const renderIcon = (iconName: string, className: string = "h-4 w-4") => {
    const IconComponent = (LucideIcons as any)[iconName]
    if (IconComponent) {
      return <IconComponent className={className} />
    }
    return <LucideIcons.Package className={className} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full h-full m-0 p-0 border-0 rounded-none max-h-screen">
        <DialogTitle className="sr-only">Buscar anúncios</DialogTitle>
        <div className="flex flex-col h-full bg-white">
          {/* Header do Modal */}
          <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex-1 relative">
              {/* Badge de categoria */}
              {selectedCategory ? (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1.5 rounded-lg text-xs font-medium max-w-[100px]">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {renderIcon(selectedCategory.icon, "h-3 w-3")}
                      </div>
                      <span className="truncate font-semibold">{selectedCategory.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onClearCategory?.()
                      }}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                      title="Remover filtro"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                </div>
              ) : (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10" ref={categoryDropdownRef}>
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Filtrar por categoria"
                  >
                    <Filter className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Dropdown de Categorias Mobile */}
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black/20 rounded-lg shadow-2xl z-50 w-56 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                          Filtrar por categoria
                        </div>
                        <div className="space-y-0.5">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                onSelectCategory?.(category)
                                setShowCategoryDropdown(false)
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left group"
                            >
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                {renderIcon(category.icon, "h-4 w-4 text-primary")}
                              </div>
                              <span className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
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
                placeholder={`O que você procura em ${location?.city || 'Guaíra'}?`}
                className={`${selectedCategory ? 'pl-[115px]' : 'pl-10'} pr-10 h-11 text-sm bg-white text-black border-2 border-black focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500`}
                autoFocus
              />
              
              {searchQuery && !isLoading && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setResults([])
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
                  title="Limpar busca"
                >
                  <X className="h-3 w-3 text-gray-600" />
                </button>
              )}
              
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 animate-spin" />
              )}
            </div>
          </div>

          {/* Conteúdo - Resultados */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && searchQuery.length >= 2 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.id)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      {result.image_url ? (
                        <img
                          src={enhanceImageQuality(result.image_url)}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black text-sm truncate">
                        {result.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(result.price)}
                        </span>
                        {result.category_name && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {result.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {searchQuery.trim() && (
                  <button
                    onClick={handleSearch}
                    className="w-full mt-2 p-3 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                  >
                    Ver todos os resultados{selectedCategory ? ` em ${selectedCategory.name}` : ''} para "{searchQuery}"
                  </button>
                )}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 text-center">
                  Nenhum anúncio encontrado para "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-center text-sm">
                  Digite para buscar anúncios
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
