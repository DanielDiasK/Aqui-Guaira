    "use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Phone, MapPin, Calendar, Edit, Save, User, Camera, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
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

export default function PerfilPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<SellerProfile | null>(null)
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    // Estado do formulário de edição
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bio: "",
        avatar_url: "",
        cover_url: ""
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            loadProfile()
        }
    }, [user])

    const loadProfile = async () => {
        try {
            setLoading(true)

            // 1. Buscar perfil do vendedor
            let { data: seller, error: sellerError } = await supabase
                .from("sellers")
                .select("*")
                .eq("user_id", user?.id)
                .single()

            // Se não encontrou o perfil (novo usuário), criar um
            if (sellerError && sellerError.code === 'PGRST116') {
                const { data: newSeller, error: createError } = await supabase
                    .from("sellers")
                    .insert({
                        user_id: user?.id,
                        name: user?.email?.split('@')[0] || "Usuário",
                        email: user?.email || "",
                        phone: null,
                        bio: null,
                        avatar_url: null,
                        cover_url: null,
                        rating: 5.0,
                        total_reviews: 0,
                        is_verified: false
                    })
                    .select()
                    .single()

                if (createError) {
                    console.error("Erro ao criar perfil:", createError)
                    return
                }

                seller = newSeller
            } else if (sellerError) {
                console.error("Erro ao carregar perfil:", sellerError)
                return
            }

            if (seller) {
                setProfile(seller)
                setFormData({
                    name: seller.name || "",
                    phone: seller.phone || "",
                    bio: seller.bio || "",
                    avatar_url: seller.avatar_url || "",
                    cover_url: seller.cover_url || ""
                })

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

    const handleSaveProfile = async () => {
        try {
            if (!profile) return

            // Preparar dados de atualização - só incluir bio e cover_url se for verificado
            const updateData: any = {
                name: formData.name,
                phone: formData.phone.replace(/\D/g, ''),
                avatar_url: formData.avatar_url
            }

            // Apenas usuários verificados podem atualizar bio e cover
            if (profile.is_verified) {
                updateData.bio = formData.bio
                updateData.cover_url = formData.cover_url
            }

            const { error } = await supabase
                .from("sellers")
                .update(updateData)
                .eq("id", profile.id)

            if (error) throw error

            setProfile({
                ...profile,
                ...updateData,
                phone: updateData.phone
            })
            setIsEditing(false)
            alert("Perfil atualizado com sucesso! ✅")
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err)
            alert("Erro ao atualizar perfil")
        }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida!')
            return
        }

        // Validar tamanho (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB!')
            return
        }

        try {
            setUploadingAvatar(true)

            // Converter para base64
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64Image = event.target.result as string
                    setFormData({ ...formData, avatar_url: base64Image })
                }
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error("Erro ao processar imagem:", err)
            alert("Erro ao processar imagem")
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida!')
            return
        }

        // Validar tamanho (3MB)
        if (file.size > 3 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 3MB!')
            return
        }

        try {
            setUploadingCover(true)

            // Converter para base64
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64Image = event.target.result as string
                    setFormData({ ...formData, cover_url: base64Image })
                }
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error("Erro ao processar imagem:", err)
            alert("Erro ao processar imagem")
        } finally {
            setUploadingCover(false)
        }
    }

    const handleShareProfile = async () => {
        if (!profile) return
        
        const profileUrl = `${window.location.origin}/perfil/${profile.id}`
        
        // Se o navegador suporta Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Perfil de ${profile.name} - MarketGuaira`,
                    text: `Confira o perfil de ${profile.name} no MarketGuaira!`,
                    url: profileUrl
                })
            } catch (err) {
                // Usuário cancelou ou erro
                console.log('Compartilhamento cancelado')
            }
        } else {
            // Fallback: copiar para clipboard
            try {
                await navigator.clipboard.writeText(profileUrl)
                alert('Link do perfil copiado! 📋')
            } catch (err) {
                alert('Não foi possível copiar o link')
            }
        }
    }

    const formatPhone = (phone: string) => {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }

    const formatBioWithLinks = (text: string) => {
        if (!text) return null

        const parts: React.ReactNode[] = []
        let lastIndex = 0
        
        // Regex para detectar URLs e @menções
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
        const mentionRegex = /@(\w+)/g
        
        // Combinar ambos os padrões
        const combinedRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|@\w+)/g
        
        let match
        while ((match = combinedRegex.exec(text)) !== null) {
            // Adicionar texto antes do match
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {text.substring(lastIndex, match.index)}
                    </span>
                )
            }
            
            const matchedText = match[0]
            
            // Verificar se é uma URL
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
            // Verificar se é uma @menção
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
        
        // Adicionar texto restante
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {text.substring(lastIndex)}
                </span>
            )
        }
        
        return parts.length > 0 ? <>{parts}</> : text
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="mb-6 hover:bg-accent/10"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Início
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
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleCoverChange}
                                            className="hidden"
                                        />
                                        
                                        {formData.cover_url ? (
                                            <img
                                                src={formData.cover_url}
                                                alt="Capa do perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
                                        )}
                                        
                                        {isEditing && profile.is_verified && (
                                            <button
                                                type="button"
                                                onClick={() => coverInputRef.current?.click()}
                                                disabled={uploadingCover}
                                                className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                                            >
                                                {uploadingCover ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                ) : (
                                                    <Camera className="w-4 h-4 text-white" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Conteúdo do Perfil */}
                                    <div className="px-6 pb-6 -mt-12 relative">
                                        {/* Avatar */}
                                        <div className="relative mx-auto w-fit mb-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                            
                                            {formData.avatar_url ? (
                                                <div className={`w-24 h-24 rounded-full overflow-hidden bg-background ring-4 ring-background ${profile.is_verified ? 'ring-4 ring-blue-500' : ''}`}>
                                                    <img
                                                        src={formData.avatar_url}
                                                        alt={profile.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white ring-4 ring-background ${profile.is_verified ? 'ring-4 ring-blue-500' : ''}`}>
                                                    {profile.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingAvatar}
                                                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-lg transition-all border-2 border-background disabled:opacity-50"
                                                >
                                                    {uploadingAvatar ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        <Camera className="w-4 h-4 text-white" />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Info Básica */}
                                        <div className="space-y-2 text-center">
                                            {isEditing ? (
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="text-center font-bold text-lg"
                                                    placeholder="Seu Nome"
                                                />
                                            ) : (
                                                <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                                                    {profile.name}
                                                    {profile.is_verified && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                            Verificado
                                                        </Badge>
                                                    )}
                                                </h2>
                                            )}

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
                                        <div className="space-y-4 text-left">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Phone className="w-4 h-4" /> WhatsApp
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/\D/g, '')
                                                        if (val.length > 11) val = val.slice(0, 11)
                                                        if (val.length > 10) val = val.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                                                        setFormData({ ...formData, phone: val })
                                                    }}
                                                    placeholder="(00) 00000-0000"
                                                />
                                            ) : (
                                                <p className="text-foreground font-medium">
                                                    {profile.phone ? formatPhone(profile.phone) : "Não informado"}
                                                </p>
                                            )}
                                        </div>

                                        {profile.is_verified && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Biografia
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-1">
                                                        <Textarea
                                                            value={formData.bio}
                                                            onChange={(e) => {
                                                                const text = e.target.value
                                                                if (text.length <= 200) {
                                                                    setFormData({ ...formData, bio: text })
                                                                }
                                                            }}
                                                            placeholder="Conte um pouco sobre você e seus produtos..."
                                                            rows={4}
                                                            maxLength={200}
                                                            className="resize-none"
                                                        />
                                                        <p className="text-xs text-muted-foreground text-right">
                                                            {formData.bio.length}/200 caracteres
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                                                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                            {profile.bio ? formatBioWithLinks(profile.bio) : "Nenhuma biografia informada."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Aviso para usuários não verificados */}
                                        {!profile.is_verified && (
                                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                                                <p className="text-sm font-semibold text-blue-900">
                                                    ✨ Recursos Premium
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Verifique seu perfil para adicionar biografia e capa personalizada!
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="pt-4 space-y-2">
                                        {!isEditing && (
                                            <Button
                                                variant="outline"
                                                className="w-full border-2 hover:bg-primary/5 hover:border-primary"
                                                onClick={handleShareProfile}
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Compartilhar Perfil
                                            </Button>
                                        )}
                                        
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-primary hover:bg-primary/90"
                                                    onClick={handleSaveProfile}
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Salvar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar Perfil
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            ) : (
                                <div className="text-center py-8 p-6">
                                    <p className="text-muted-foreground">Perfil não encontrado.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Coluna da Direita - Anúncios */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-2xl font-bold text-foreground">Meus Anúncios Ativos</h3>

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
                                            Seus anúncios aprovados aparecerão aqui.
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
