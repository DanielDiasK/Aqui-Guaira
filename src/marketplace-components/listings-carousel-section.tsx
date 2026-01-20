"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { getListings, type Listing } from "@/lib/storage"
import { ListingCarousel } from "./listing-carousel"
import { useLocation } from "@/contexts/location-context"

interface ListingsCarouselSectionProps {
  selectedCategory?: string | null
}

export function ListingsCarouselSection({ selectedCategory }: ListingsCarouselSectionProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { location, filterEnabled } = useLocation()
  const scrollContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [showLeftArrows, setShowLeftArrows] = useState<{ [key: string]: boolean }>({})
  const [showRightArrows, setShowRightArrows] = useState<{ [key: string]: boolean }>({})
  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({})
  const [startX, setStartX] = useState<{ [key: string]: number }>({})
  const [scrollLeft, setScrollLeft] = useState<{ [key: string]: number }>({})

  console.log('🎯 ListingsCarouselSection - Categoria selecionada:', selectedCategory)

  useEffect(() => {
    async function loadListings() {
      setLoading(true)
      const loaded = await getListings()
      console.log('📦 Listings carregados:', loaded.length)
      console.log('📋 Primeira listing:', loaded[0])
      setListings(loaded)
      setLoading(false)
    }
    loadListings()
  }, [])

  // Filtrar anúncios
  const filteredListings = listings.filter(listing => {
    // Filtrar por localização se ativado
    if (filterEnabled && location) {
      if (listing.city !== location.city || listing.state !== location.state) {
        return false
      }
    }
    
    // Filtrar por categoria se selecionada
    if (selectedCategory) {
      const match = listing.categoryId === selectedCategory
      console.log('🔍 Comparando:', { 
        titulo: listing.title,
        listingCategoryId: listing.categoryId,
        listingCategoryIdType: typeof listing.categoryId,
        selectedCategory,
        selectedCategoryType: typeof selectedCategory,
        match 
      })
      return match
    }
    
    return true
  })

  // Agrupar anúncios por categoria
  const groupedByCategory = filteredListings.reduce((acc, listing) => {
    const category = listing.category || 'Sem Categoria'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(listing)
    return acc
  }, {} as Record<string, Listing[]>)

  // Ordenar anúncios dentro de cada categoria por visualizações (maior primeiro)
  Object.keys(groupedByCategory).forEach(category => {
    groupedByCategory[category].sort((a, b) => b.views - a.views)
  })

  console.log('📊 Estatísticas de filtro:', {
    total: listings.length,
    filtrados: filteredListings.length,
    categoriaSelecionada: selectedCategory,
    categorias: Object.keys(groupedByCategory),
    listingsComCategoryId: listings.filter(l => l.categoryId).length,
    listingsSemCategoryId: listings.filter(l => !l.categoryId).length
  })

  // Função para verificar se as setas devem ser mostradas
  const checkScroll = (category: string) => {
    const container = scrollContainerRefs.current[category]
    if (!container) return

    const canScrollLeft = container.scrollLeft > 10
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth - 10

    setShowLeftArrows(prev => {
      if (prev[category] !== canScrollLeft) {
        return { ...prev, [category]: canScrollLeft }
      }
      return prev
    })
    
    setShowRightArrows(prev => {
      if (prev[category] !== canScrollRight) {
        return { ...prev, [category]: canScrollRight }
      }
      return prev
    })
  }

  // Função para scroll suave
  const scroll = (category: string, direction: 'left' | 'right') => {
    const container = scrollContainerRefs.current[category]
    if (!container) return

    // Largura de um card + gap (240px + 16px = 256px)
    const cardWidth = 256
    // Calcular quantos cards cabem na tela
    const visibleCards = Math.floor(container.clientWidth / cardWidth)
    // Scroll exatamente a quantidade de cards visíveis
    const scrollAmount = visibleCards * cardWidth

    let newScrollLeft: number
    
    if (direction === 'left') {
      newScrollLeft = Math.max(0, container.scrollLeft - scrollAmount)
    } else {
      const maxScroll = container.scrollWidth - container.clientWidth
      newScrollLeft = Math.min(maxScroll, container.scrollLeft + scrollAmount)
      
      // Se estiver próximo do final, vai direto até o final
      if (maxScroll - newScrollLeft < cardWidth) {
        newScrollLeft = maxScroll
      }
    }

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })

    // Atualizar setas após o scroll
    setTimeout(() => checkScroll(category), 350)
  }

  // Verificar scroll quando os listings mudarem
  useEffect(() => {
    if (!loading && filteredListings.length > 0) {
      Object.keys(groupedByCategory).forEach(category => {
        checkScroll(category)
      })
    }
  }, [loading, filteredListings])

  // Adicionar listeners de resize
  useEffect(() => {
    const handleResize = () => {
      Object.keys(groupedByCategory).forEach(category => {
        checkScroll(category)
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [groupedByCategory])

  // Funções para drag com mouse
  const handleMouseDown = (category: string, e: React.MouseEvent) => {
    const container = scrollContainerRefs.current[category]
    if (!container) return

    setIsDragging(prev => ({ ...prev, [category]: true }))
    setStartX(prev => ({ ...prev, [category]: e.pageX - container.offsetLeft }))
    setScrollLeft(prev => ({ ...prev, [category]: container.scrollLeft }))
    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }

  const handleMouseLeave = (category: string) => {
    const container = scrollContainerRefs.current[category]
    if (!container) return

    setIsDragging(prev => ({ ...prev, [category]: false }))
    container.style.cursor = 'grab'
    container.style.userSelect = 'auto'
  }

  const handleMouseUp = (category: string) => {
    const container = scrollContainerRefs.current[category]
    if (!container) return

    setIsDragging(prev => ({ ...prev, [category]: false }))
    container.style.cursor = 'grab'
    container.style.userSelect = 'auto'
  }

  const handleMouseMove = (category: string, e: React.MouseEvent) => {
    if (!isDragging[category]) return
    
    const container = scrollContainerRefs.current[category]
    if (!container) return

    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX[category]) * 1.5 // Velocidade mais suave
    container.scrollLeft = scrollLeft[category] - walk
  }

  // Skeleton Loading
  if (loading) {
    return (
      <section id="anuncios-section" className="px-4 py-16 bg-background">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Skeleton para 3 categorias */}
          {[1, 2, 3].map((categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              {/* Título da categoria - Skeleton */}
              <div className="h-8 w-80 bg-muted rounded-lg animate-pulse" />
              
              {/* Carrossel de produtos - Skeleton */}
              <div className="relative">
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((cardIndex) => (
                    <Card
                      key={cardIndex}
                      className="flex-none w-[240px] overflow-hidden border-border p-0 animate-pulse"
                    >
                      {/* Imagem skeleton */}
                      <div className="h-40 bg-muted" />
                      
                      {/* Conteúdo skeleton */}
                      <div className="p-2.5 space-y-2">
                        {/* Categoria */}
                        <div className="h-3 w-20 bg-muted rounded" />
                        {/* Título */}
                        <div className="space-y-1">
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-4 w-3/4 bg-muted rounded" />
                        </div>
                        {/* Preço */}
                        <div className="h-6 w-32 bg-muted rounded" />
                        {/* Localização */}
                        <div className="h-3 w-40 bg-muted rounded" />
                        {/* Badges */}
                        <div className="flex gap-1.5">
                          <div className="h-5 w-16 bg-muted rounded" />
                          <div className="h-5 w-16 bg-muted rounded" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
    return (
      <section id="anuncios-section" className="px-4 py-16 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Anúncios Publicados</h2>
            <p className="text-muted-foreground mb-2">
              Nenhum anúncio encontrado.
            </p>
            <p className="text-sm text-muted-foreground">
              Execute o SQL no Supabase ou publique um novo anúncio para começar!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="anuncios-section" className="px-4 py-16 bg-background">
        <div className="mx-auto max-w-7xl space-y-12">
          {filterEnabled && location && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-900 dark:text-blue-300">
                Em <strong>{location.city}, {location.state}</strong>
              </span>
            </div>
          )}

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum anúncio encontrado com os filtros selecionados.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros ou selecionar outra categoria.
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedByCategory).map(([category, categoryListings]) => (
                <div key={category} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Recomendados para você em {category}
                    </h2>
                  </div>

                  <div className="relative flex items-center gap-3">
                    {/* Seta Esquerda - com largura fixa invisível - apenas desktop */}
                    <div className="hidden md:block flex-shrink-0 w-10">
                      {showLeftArrows[category] && (
                        <button
                          onClick={() => scroll(category, 'left')}
                          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary dark:hover:border-primary transition-colors hover:scale-110 flex items-center justify-center"
                          aria-label="Anterior"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                      )}
                    </div>

                    {/* Container do Carrossel */}
                    <div 
                      ref={(el) => {
                        scrollContainerRefs.current[category] = el
                        if (el) checkScroll(category)
                      }}
                      onScroll={() => checkScroll(category)}
                      onMouseDown={(e) => handleMouseDown(category, e)}
                      onMouseLeave={() => handleMouseLeave(category)}
                      onMouseUp={() => handleMouseUp(category)}
                      onMouseMove={(e) => handleMouseMove(category, e)}
                      className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'auto' }}
                    >
                      {categoryListings.map((listing) => (
                        <Card
                          key={listing.id}
                          className="flex-none w-[240px] overflow-hidden border-border hover:border-accent hover:shadow-lg transition-all duration-300 bg-card cursor-pointer group p-0 snap-start"
                          onClick={() => router.push(`/anuncio/${listing.id}`)}
                        >
                          {/* Image Carousel */}
                          <div className="relative h-40 overflow-hidden bg-muted">
                            <ListingCarousel images={listing.images} title={listing.title} listingId={listing.id} />
                          </div>

                          {/* Content */}
                          <div className="p-2.5 space-y-1">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">{listing.category}</p>
                              <h3 className="font-semibold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {listing.title}
                              </h3>
                            </div>

                            {/* Price */}
                            <div>
                              <p className="text-lg font-bold text-primary">
                                R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>

                            {/* Location Badge */}
                            {listing.city && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{listing.city}, {listing.state}</span>
                              </div>
                            )}

                            {/* Badges/Diferenciais */}
                            {listing.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {listing.badges.slice(0, 2).map((badge, index) => (
                                  <Badge
                                    key={`${badge.name}-${index}`}
                                    className={`text-xs font-medium border ${badge.color || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"}`}
                                  >
                                    {badge.name}
                                  </Badge>
                                ))}
                                {listing.badges.length > 2 && (
                                  <Badge className="text-xs font-medium bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                    +{listing.badges.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Seta Direita - com largura fixa invisível - apenas desktop */}
                    <div className="hidden md:block flex-shrink-0 w-10">
                      {showRightArrows[category] && (
                        <button
                          onClick={() => scroll(category, 'right')}
                          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary dark:hover:border-primary transition-colors hover:scale-110 flex items-center justify-center"
                          aria-label="Próximo"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  )
}
