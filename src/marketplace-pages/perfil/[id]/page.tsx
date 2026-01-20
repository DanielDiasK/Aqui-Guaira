"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Star, Phone, MapPin, Calendar, User, MessageCircle, Share2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { enhanceImageQuality } from "@/lib/image-utils"

interface SellerProfile {
    id: string
    name: string
    email: string
    phone: string | null
    bio: string | null
    avatar_url: string | null
    cover_url?: string | null
    rating: number
    total_reviews: number
    is_verified: boolean
    created_at: string
}

interface Listing {
    id: string
    title: string
    price: number
    images: string[]
    category_name: string
    created_at: string
    status: string
    is_active: boolean
}

export default function PublicProfilePage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const sellerId = params.id as string

    const [profile, setProfile] = useState<SellerProfile | null>(null)
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [isBanned, setIsBanned] = useState(false)

    useEffect(() => {
        if (sellerId) {
            loadProfile()
        }
    }, [sellerId])

    // Verificar se usuário está banido
    useEffect(() => {
        async function checkBanStatus() {
            if (!user) return

            try {
                const { data, error } = await supabase
                    .rpc('is_user_banned', { user_uuid: user.id })

                if (error) {
                    console.error("Erro ao verificar banimento:", error)
                    return
                }

                if (data && data.length > 0) {
                    const ban = data[0]
                    setIsBanned(ban.is_banned === true)
                }
            } catch (err) {
                console.error("Erro:", err)
            }
        }

        checkBanStatus()
    }, [user])

    const loadProfile = async () => {
        try {
            setLoading(true)

            // 1. Buscar perfil do vendedor
            const { data: seller, error: sellerError } = await supabase
                .from("sellers")
                .select("*")
                .eq("id", sellerId)
                .single()

            if (sellerError) {
                console.error("Erro ao carregar perfil:", sellerError)
                return
            }

            if (seller) {
                setProfile(seller)

                // 2. Buscar anúncios do vendedor
                const { data: userListings, error: listingsError } = await supabase
                    .from("listings_full")
                    .select("*")
                    .eq("seller_id", seller.id)
                    .eq("status", "approved")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })

                if (!listingsError) {
                    setListings(userListings || [])
                }
            }
        } catch (err) {
            console.error("Erro:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatPhone = (phone: string) => {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    const formatBioWithLinks = (text: string) => {
        if (!text) return null

        const parts: React.ReactNode[] = []
        let lastIndex = 0
        
        const combinedRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|@\w+)/g
        
        let match
        while ((match = combinedRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {text.substring(lastIndex, match.index)}
                    </span>
                )
            }
            
            const matchedText = match[0]
            
            if (matchedText.startsWith('http') || matchedText.startsWith('www')) {
                const url = matchedText.startsWith('www') ? `https://${matchedText}` : matchedText
                parts.push(
                    <a
                        key={`link-${match.index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {matchedText}
                    </a>
                )
            }
            else if (matchedText.startsWith('@')) {
                parts.push(
                    <span
                        key={`mention-${match.index}`}
                        className="text-primary font-semibold cursor-pointer hover:underline"
                    >
                        {matchedText}
                    </span>
                )
            }
            
            lastIndex = match.index + matchedText.length
        }
        
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {text.substring(lastIndex)}
                </span>
            )
        }
        
        return parts.length > 0 ? <>{parts}</> : text
    }

    const handleShareProfile = async () => {
        if (!profile) return
        
        const profileUrl = window.location.href
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Perfil de ${profile.name} - MarketGuaira`,
                    text: `Confira o perfil de ${profile.name} no MarketGuaira!`,
                    url: profileUrl
                })
            } catch (err) {
                console.log('Compartilhamento cancelado')
            }
        } else {
            try {
                await navigator.clipboard.writeText(profileUrl)
                alert('Link do perfil copiado! 📋')
            } catch (err) {
                alert('Não foi possível copiar o link')
            }
        }
    }

    const handleWhatsAppClick = () => {
        if (isBanned) {
            alert("⚠️ Você está suspenso e não pode entrar em contato com vendedores no momento.")
            return
        }
        if (profile?.phone) {
            const phoneNumber = profile.phone.replace(/\D/g, '')
            const message = `Olá! Vi seu perfil no MarketGuaira e gostaria de conversar.`
            window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 hover:bg-accent/10"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda - Perfil */}
                    <div className="lg:col-span-1">
                        <Card className="overflow-hidden sticky top-24 p-0">
                            {loading ? (
                                <div className="space-y-4 animate-pulse p-6">
                                    <div className="h-24 w-24 rounded-full bg-muted mx-auto" />
                                    <div className="h-6 w-3/4 bg-muted mx-auto" />
                                    <div className="h-4 w-1/2 bg-muted mx-auto" />
                                </div>
                            ) : profile ? (
                                <div className="relative">
                                    {/* Capa de Perfil */}
                                    <div className="relative h-40 bg-gradient-to-br from-primary via-primary/80 to-accent">
                                        {profile.cover_url ? (
                                            <img
                                                src={profile.cover_url}
                                                alt="Capa do perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
                                        )}
                                    </div>

                                    {/* Conteúdo do Perfil */}
                                    <div className="px-6 pb-6 -mt-12 relative">
                                        {/* Avatar */}
                                        <div className="relative mx-auto w-fit mb-4">
                                            {profile.avatar_url ? (
                                                <div className={`w-24 h-24 rounded-full overflow-hidden bg-background ring-4 ring-background ${profile.is_verified ? 'ring-4 ring-blue-500' : ''}`}>
                                                    <img
                                                        src={profile.avatar_url}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white ring-4 ring-background ${profile.is_verified ? 'ring-4 ring-blue-500' : ''}`}>
                                                    {profile.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Básica */}
                                        <div className="space-y-2 text-center">
                                            <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                                                {profile.name}
                                                {profile.is_verified && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                        Verificado
                                                    </Badge>
                                                )}
                                            </h2>

                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 py-4">
                                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                                                        <Star className="w-5 h-5 text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-2xl text-yellow-700 mb-1">
                                                        {profile.rating.toFixed(1)}
                                                    </div>
                                                    <p className="text-xs font-medium text-yellow-600">
                                                        {profile.total_reviews} {profile.total_reviews === 1 ? 'avaliação' : 'avaliações'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-4 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-2xl text-primary mb-1">
                                                        {listings.length}
                                                    </div>
                                                    <p className="text-xs font-medium text-primary/80">
                                                        {listings.length === 1 ? 'Anúncio Ativo' : 'Anúncios Ativos'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contato e Bio */}
                                        {profile.is_verified && (
                                            <div className="space-y-4 text-left">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                        <User className="w-4 h-4" /> Biografia
                                                    </label>
                                                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                            {profile.bio ? formatBioWithLinks(profile.bio) : "Nenhuma biografia informada."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Botões de Ação */}
                                        <div className="pt-4 space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full border-2 hover:bg-primary/5 hover:border-primary"
                                                onClick={handleShareProfile}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Compartilhar Perfil
                                            </Button>
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                onClick={handleWhatsAppClick}
                                                disabled={!profile.phone || isBanned}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                {profile.phone ? "Conversar no WhatsApp" : "Sem WhatsApp"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Perfil não encontrado.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Coluna da Direita - Anúncios */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold text-foreground">Anúncios de {profile?.name}</h3>

                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {listings.map((listing) => (
                                    <Card
                                        key={listing.id}
                                        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                                        onClick={() => router.push(`/anuncio/${listing.id}`)}
                                    >
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            {listing.images && listing.images[0] ? (
                                                <img
                                                    src={enhanceImageQuality(listing.images[0])}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    Sem imagem
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-primary text-primary-foreground">
                                                    {listing.category_name}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-lg mb-2 truncate">{listing.title}</h4>
                                            <p className="text-2xl font-bold text-primary">
                                                R$ {listing.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center bg-muted/50 border-dashed">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Nenhum anúncio ativo</h3>
                                        <p className="text-muted-foreground">
                                            Este vendedor não possui anúncios ativos no momento.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
