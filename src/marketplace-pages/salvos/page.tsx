"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface SavedListing {
    id: string
    title: string
    description: string
    price: number
    category: string
    images: string[]
    created_at: string
    status: string
    views: number
    user_id: string
    seller_name: string
    seller_email: string
    seller_phone: string
    seller_rating: number
    seller_reviews: number
    seller_verified: boolean
    badges: Array<{ name: string; color: string }>
    saved_at: string
}

export default function SalvosPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [savedListings, setSavedListings] = useState<SavedListing[]>([])
    const [loading, setLoading] = useState(true)
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/")
            return
        }

        if (user) {
            loadSavedListings()
        }
    }, [user, authLoading, router])

    const loadSavedListings = async () => {
        if (!user) return

        setLoading(true)
        try {
            // Query direta ao invés de RPC para melhor compatibilidade
            const { data: savedData, error: savedError } = await supabase
                .from("saved_listings")
                .select(`
          listing_id,
          created_at
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (savedError) {
                console.error("Erro ao carregar salvos:", savedError)
                return
            }

            if (!savedData || savedData.length === 0) {
                setSavedListings([])
                setLoading(false)
                return
            }

            // Buscar detalhes dos anúncios
            const listingIds = savedData.map(s => s.listing_id)

            const { data: listingsData, error: listingsError } = await supabase
                .from("listings_full")
                .select("*")
                .in("id", listingIds)
                .eq("status", "approved")

            if (listingsError) {
                console.error("Erro ao carregar detalhes:", listingsError)
                return
            }

            // Combinar dados de salvos com detalhes dos anúncios
            const combined = listingsData?.map(listing => {
                const saved = savedData.find(s => s.listing_id === listing.id)
                return {
                    ...listing,
                    seller_name: listing.seller?.name || "Desconhecido",
                    seller_email: listing.seller?.email || "",
                    seller_phone: listing.seller?.phone || "",
                    seller_rating: listing.seller?.rating || 0,
                    seller_reviews: listing.seller?.reviews || 0,
                    seller_verified: listing.seller?.verified || false,
                    saved_at: saved?.created_at || new Date().toISOString()
                }
            }) || []

            setSavedListings(combined)
        } catch (err) {
            console.error("Erro:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveSaved = async (listingId: string) => {
        if (!user) return

        if (!confirm("Deseja remover este anúncio dos salvos?")) return

        setRemovingId(listingId)
        try {
            const { error } = await supabase
                .from("saved_listings")
                .delete()
                .eq("user_id", user.id)
                .eq("listing_id", listingId)

            if (error) {
                console.error("Erro ao remover:", error)
                alert("Erro ao remover dos salvos.")
                return
            }

            // Atualizar lista local
            setSavedListings(prev => prev.filter(listing => listing.id !== listingId))
        } catch (err) {
            console.error("Erro:", err)
            alert("Erro ao processar solicitação.")
        } finally {
            setRemovingId(null)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando salvos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="hover:bg-accent/10 font-semibold"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Voltar
                    </Button>
                    <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <h1 className="text-2xl font-bold text-foreground">Meus Salvos</h1>
                    </div>
                    <div className="w-24"></div> {/* Spacer para centralizar o título */}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="mx-auto max-w-7xl px-4 py-8">
                {savedListings.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Nenhum anúncio salvo
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Você ainda não salvou nenhum anúncio. Explore e salve seus favoritos!
                        </p>
                        <Button onClick={() => router.push("/")} className="mx-auto">
                            Explorar Anúncios
                        </Button>
                    </Card>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-6">
                            {savedListings.length} {savedListings.length === 1 ? 'anúncio salvo' : 'anúncios salvos'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedListings.map((listing) => (
                                <Card
                                    key={listing.id}
                                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-primary/50 group cursor-pointer"
                                >
                                    {/* Imagem */}
                                    <div
                                        className="relative aspect-video bg-muted overflow-hidden"
                                        onClick={() => router.push(`/anuncio/${listing.id}`)}
                                    >
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <p className="text-muted-foreground">Sem imagem</p>
                                            </div>
                                        )}
                                        {/* Botão Remover - SEMPRE VISÍVEL */}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemoveSaved(listing.id)
                                            }}
                                            disabled={removingId === listing.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Conteúdo */}
                                    <div
                                        className="p-4 space-y-3"
                                        onClick={() => router.push(`/anuncio/${listing.id}`)}
                                    >
                                        {/* Categoria */}
                                        <Badge variant="outline" className="text-xs">
                                            {listing.category}
                                        </Badge>

                                        {/* Título */}
                                        <h3 className="font-bold text-lg text-foreground line-clamp-2">
                                            {listing.title}
                                        </h3>

                                        {/* Preço */}
                                        <p className="text-2xl font-bold text-primary">
                                            R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>

                                        {/* Badges */}
                                        {listing.badges && listing.badges.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {listing.badges.slice(0, 3).map((badge, index) => (
                                                    <Badge
                                                        key={`${badge.name}-${index}`}
                                                        className={`text-xs ${badge.color || "bg-gray-100 text-gray-800"}`}
                                                    >
                                                        {badge.name}
                                                    </Badge>
                                                ))}
                                                {listing.badges.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{listing.badges.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Vendedor */}
                                        <div className="pt-3 border-t border-border">
                                            <p className="text-sm text-muted-foreground">
                                                Por: <span className="font-semibold text-foreground">{listing.seller_name}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Salvo em {new Date(listing.saved_at).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
