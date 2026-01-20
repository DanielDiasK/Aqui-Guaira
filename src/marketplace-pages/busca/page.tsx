"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ListingCarousel } from "@/components/listing-carousel"
import Link from "next/link"
import { Search, Filter, Loader2, MapPin, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  listing_images: { image_url: string }[]
  created_at: string
  categories: { name: string } | null
  city: string
  state: string
  listing_badges: { badges: { name: string; color: string } }[]
}

interface Seller {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
  is_verified: boolean
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const categoria = searchParams.get("categoria") || ""
  
  const [listings, setListings] = useState<Listing[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(query)

  useEffect(() => {
    fetchResults()
  }, [query, categoria])

  const fetchResults = async () => {
    setIsLoading(true)
    try {
      // Buscar produtos
      let queryBuilder = supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          price,
          created_at,
          city,
          state,
          categories (name),
          listing_images (image_url),
          listing_badges (
            badges (name, color)
          )
        `)
        .eq("is_active", true)

      if (query) {
        queryBuilder = queryBuilder.ilike("title", `%${query}%`)
      }

      if (categoria) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .ilike("name", `%${categoria}%`)
          .single()

        if (categoryData) {
          queryBuilder = queryBuilder.eq("category_id", categoryData.id)
        }
      }

      const { data: listingsData, error: listingsError } = await queryBuilder
        .order("created_at", { ascending: false })
        .limit(50)

      if (listingsError) throw listingsError
      setListings(listingsData as any || [])

      // Se houver uma query de busca (independente de ter produtos ou não), buscar vendedores verificados
      if (query && !categoria) {
        const { data: sellersData, error: sellersError } = await supabase
          .from("sellers")
          .select("id, name, bio, avatar_url, phone, city, state, created_at, is_verified")
          .ilike("name", `%${query}%`)
          .eq("is_verified", true)
          .limit(20)

        if (sellersError) throw sellersError
        setSellers(sellersData || [])
      } else {
        setSellers([])
      }
    } catch (error) {
      console.error("Erro ao buscar resultados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b bg-secondary/30 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold mb-3">
            {categoria ? categoria : "Busca"}
          </h1>
          
          <div className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Refinar..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button onClick={handleSearch} size="sm">Buscar</Button>
          </div>

          {query && (
            <p className="mt-2 text-xs text-muted-foreground">
              "{query}"
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : listings.length === 0 && sellers.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-bold mb-1">Nenhum resultado encontrado</h2>
            <p className="text-sm text-muted-foreground mb-4">Tente buscar por outros termos</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/">Voltar</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Resultados de Produtos */}
            {listings.length > 0 && (
              <>
                <p className="mb-4 text-xs text-muted-foreground">
                  {listings.length} {listings.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {listings.map((listing) => {
                    const images = listing.listing_images?.map(img => img.image_url) || []
                    const categoryName = Array.isArray(listing.categories) 
                      ? listing.categories[0]?.name 
                      : listing.categories?.name
                    const badges = listing.listing_badges?.map(lb => Array.isArray(lb.badges) ? lb.badges[0] : lb.badges).filter(Boolean) || []

                    return (
                      <Link
                        key={listing.id}
                        href={`/anuncio/${listing.id}`}
                        className="group"
                      >
                        <div className="bg-card rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg h-full flex flex-col">
                          {/* Imagem com Carousel */}
                          <div className="relative h-[240px] bg-muted flex-shrink-0">
                            <ListingCarousel
                              images={images}
                              title={listing.title}
                              listingId={listing.id}
                            />
                          </div>

                          {/* Conteúdo */}
                          <div className="p-4 space-y-2 flex-1 flex flex-col">
                            {/* Categoria */}
                            {categoryName && (
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {categoryName}
                              </div>
                            )}

                            {/* Título */}
                            <h3 className="font-semibold text-base line-clamp-2 h-[3rem] group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>

                            {/* Preço */}
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(listing.price)}
                            </div>

                            {/* Localização */}
                            {listing.city && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{listing.city} - {listing.state}</span>
                              </div>
                            )}

                            {/* Badges */}
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                                {badges.slice(0, 2).map((badge, index) => (
                                  <Badge 
                                    key={index}
                                    className={`${badge.color} text-xs px-2 py-0.5`}
                                  >
                                    {badge.name}
                                  </Badge>
                                ))}
                                {badges.length > 2 && (
                                  <Badge className="bg-muted text-muted-foreground text-xs px-2 py-0.5">
                                    +{badges.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            {/* Resultados de Vendedores */}
            {sellers.length > 0 && (
              <div className={listings.length > 0 ? "mt-8" : ""}>
                <h2 className="text-xl font-bold mb-4">Lojas Verificadas</h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  {sellers.length} {sellers.length === 1 ? "loja encontrada" : "lojas encontradas"}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {sellers.map((seller) => (
                    <Link
                      key={seller.id}
                      href={`/perfil/${seller.id}`}
                      className="group"
                    >
                      <div className="bg-card rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg h-full flex flex-col">
                        {/* Avatar como "imagem do produto" */}
                        <div className="relative h-[240px] bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 flex items-center justify-center">
                          {seller.avatar_url ? (
                            <img
                              src={seller.avatar_url}
                              alt={seller.name}
                              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
                              <User className="w-16 h-16 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Badge de Loja Verificada */}
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Loja
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4 space-y-2 flex-1 flex flex-col">
                          {/* Categoria/Tipo */}
                          <div className="text-xs font-medium text-primary uppercase tracking-wide">
                            PERFIL VERIFICADO
                          </div>

                          {/* Nome da Loja */}
                          <h3 className="font-semibold text-base line-clamp-2 h-[3rem] group-hover:text-primary transition-colors">
                            {seller.name}
                          </h3>

                          {/* Bio como "preço" */}
                          {seller.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {seller.bio}
                            </p>
                          )}

                          {/* Localização */}
                          {seller.city && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{seller.city} - {seller.state}</span>
                            </div>
                          )}

                          {/* WhatsApp Badge */}
                          {seller.phone && (
                            <div className="flex items-center gap-1.5 pt-2">
                              <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                WhatsApp
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
