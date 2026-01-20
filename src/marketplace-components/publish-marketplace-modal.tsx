"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Plus, Loader2, Edit, Send, CheckCircle, Camera, Phone, MapPin, Star, AlertTriangle, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAlert } from "@/components/alert-system"
import { supabase } from "@/lib/supabase"
import { ImageUploadZone } from "@/components/image-upload-zone"

interface PublishMarketplaceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingListing?: {
        id: string
        title: string
        description: string
        price: number
        category: string
        images: string[]
        badges: string[]
        phone?: string
        city?: string
        state?: string
        postal_code?: string
    } | null
}

interface BadgeOption {
    id: string
    name: string
    color: string
}

interface CategoryOption {
    id: string
    name: string
    slug: string
    icon?: string
}

interface LocationResult {
    city: string
    state: string
    postalCode: string
}

export function PublishMarketplaceModal({ open, onOpenChange, editingListing = null }: PublishMarketplaceModalProps) {
    const { user } = useAuth()
    const alert = useAlert()
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        whatsapp: "",
        selectedBadges: [] as string[],
        city: "Guaíra",
        state: "SP",
        postalCode: "14790-000"
    })
    const [images, setImages] = useState<string[]>([])
    const [availableBadges, setAvailableBadges] = useState<BadgeOption[]>([])
    const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [locationSearchResults, setLocationSearchResults] = useState<LocationResult[]>([])
    const [error, setError] = useState("")
    const [isBanned, setIsBanned] = useState(false)
    const [banInfo, setBanInfo] = useState<{
        ban_reason: string | null
        ban_until: string | null
        is_permanent: boolean
    } | null>(null)
    const isEditing = !!editingListing

    // Carregar badges do banco de dados
    useEffect(() => {
        const fetchBadges = async () => {
            const { data, error } = await supabase
                .from("badges")
                .select("*")
                .order("name")

            if (!error && data) {
                setAvailableBadges(data)
            }
        }
        fetchBadges()
    }, [])

    // Verificar se usuário está banido
    useEffect(() => {
        const checkBanStatus = async () => {
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
                    if (ban.is_banned) {
                        setIsBanned(true)
                        setBanInfo({
                            ban_reason: ban.ban_reason,
                            ban_until: ban.ban_until,
                            is_permanent: ban.is_permanent
                        })
                    } else {
                        setIsBanned(false)
                        setBanInfo(null)
                    }
                }
            } catch (err) {
                console.error("Erro:", err)
            }
        }

        if (open) {
            checkBanStatus()
        }
    }, [user, open])

    // Carregar categorias do banco de dados
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name")

            if (!error && data) {
                setAvailableCategories(data)
                // Se não tiver categoria selecionada e tiver categorias, seleciona a primeira
                if (!formData.category && data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0].id }))
                }
            }
        }
        fetchCategories()
    }, [])

    // Atualizar estados quando editingListing mudar
    useEffect(() => {
        if (editingListing) {
            let formattedPhone = editingListing.phone || ""
            if (formattedPhone && formattedPhone.length === 11) {
                formattedPhone = formattedPhone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            }

            // Se editingListing.category for um nome, buscar o ID
            const loadCategoryId = async () => {
                if (editingListing.category) {
                    // Se já é um UUID (tem hífens), usar direto
                    if (editingListing.category.includes('-')) {
                        setFormData(prev => ({ ...prev, category: editingListing.category }))
                    } else {
                        // Se é um nome, buscar o ID
                        const { data } = await supabase
                            .from('categories')
                            .select('id')
                            .eq('name', editingListing.category)
                            .single()
                        
                        if (data) {
                            setFormData(prev => ({ ...prev, category: data.id }))
                        }
                    }
                }
            }

            setFormData({
                name: editingListing.title,
                description: editingListing.description,
                category: editingListing.category, // Será atualizado pelo loadCategoryId
                price: editingListing.price.toString(),
                whatsapp: formattedPhone,
                selectedBadges: editingListing.badges,
                city: editingListing.city || "Guaíra",
                state: editingListing.state || "SP",
                postalCode: editingListing.postal_code || "14790-000"
            })
            setImages(editingListing.images)
            loadCategoryId()
        } else {
            setFormData({
                name: "",
                description: "",
                category: "",
                price: "",
                whatsapp: "",
                selectedBadges: [],
                city: "Guaíra",
                state: "SP",
                postalCode: "14790-000"
            })
            setImages([])
        }
        setError("")
    }, [editingListing])

    const handleLocationSearch = async (query: string) => {
        if (query.length < 3) {
            setLocationSearchResults([])
            return
        }

        setLoadingLocation(true)

        // Verificar se é CEP
        const isCEP = /^[0-9]{5}-?[0-9]{0,3}$/.test(query)
        const cleanCEP = query.replace(/\D/g, '')

        if (isCEP && cleanCEP.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
                const data = await response.json()

                if (!data.erro) {
                    const result = {
                        city: data.localidade,
                        state: data.uf,
                        postalCode: data.cep
                    }
                    setLocationSearchResults([result])
                    // Auto-select se for CEP exato
                    setFormData(prev => ({
                        ...prev,
                        city: data.localidade,
                        state: data.uf,
                        postalCode: data.cep
                    }))
                    setLocationSearchResults([]) // Limpar resultados pois já selecionou
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error)
            }
        } else if (!isCEP) {
            // Busca por nome (Nominatim via API Route)
            try {
                const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`)
                if (!response.ok) throw new Error('Falha na busca')
                const data = await response.json()

                const results: LocationResult[] = data.map((item: any) => ({
                    city: item.address.city || item.address.town || item.address.village || item.address.municipality || item.display_name.split(',')[0],
                    state: item.address.state_code || (item.address.state ? item.address.state.substring(0, 2).toUpperCase() : "BR"),
                    postalCode: item.address.postcode || ""
                })).filter((item: LocationResult, index: number, self: LocationResult[]) =>
                    index === self.findIndex((t) => t.city === item.city && t.state === item.state)
                )

                setLocationSearchResults(results)
            } catch (err) {
                console.error("Erro na busca por nome:", err)
                setLocationSearchResults([])
            }
        }
        setLoadingLocation(false)
    }

    const handleSelectLocation = (result: LocationResult) => {
        setFormData(prev => ({
            ...prev,
            city: result.city,
            state: result.state,
            postalCode: result.postalCode || prev.postalCode // Mantém o CEP se o resultado não tiver
        }))
        setLocationSearchResults([])
    }

    const toggleBadge = (badgeName: string) => {
        setFormData((prev) => {
            const isSelected = prev.selectedBadges.includes(badgeName)
            if (isSelected) {
                return {
                    ...prev,
                    selectedBadges: prev.selectedBadges.filter((b) => b !== badgeName)
                }
            } else {
                if (prev.selectedBadges.length >= 5) {
                    // Usar setTimeout para evitar setState durante render
                    setTimeout(() => {
                        alert.warning("Você pode selecionar no máximo 5 diferenciais")
                    }, 0)
                    return prev
                }
                return {
                    ...prev,
                    selectedBadges: [...prev.selectedBadges, badgeName]
                }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            setError("Você precisa estar logado para publicar")
            return
        }

        if (!formData.name.trim()) {
            setError("Por favor, preencha o nome do anúncio")
            return
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError("Por favor, informe um preço válido")
            return
        }

        setLoading(true)
        setError("")

        try {
            if (isEditing && editingListing) {
                await handleEditSubmit()
            } else {
                await handleCreateSubmit()
            }
        } catch (err: any) {
            console.error("Erro ao publicar:", err)
            setError(err.message || "Erro ao publicar anúncio. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSubmit = async () => {
        try {
            if (!user) {
                setError("Você precisa estar logado para criar um anúncio.")
                return
            }

            let sellerId = null
            const { data: existingSeller, error: sellerFetchError } = await supabase
                .from("sellers")
                .select("id")
                .eq("user_id", user.id)
                .single()

            if (sellerFetchError && sellerFetchError.code !== 'PGRST116') {
                console.error("Erro ao buscar seller:", sellerFetchError)
            }

            if (existingSeller) {
                sellerId = existingSeller.id
                await supabase
                    .from("sellers")
                    .update({ phone: formData.whatsapp.replace(/\D/g, '') })
                    .eq("id", sellerId)
            } else {
                const { data: newSeller, error: sellerCreateError } = await supabase
                    .from("sellers")
                    .insert({
                        user_id: user.id,
                        name: user.email?.split("@")[0] || "Vendedor",
                        email: user.email,
                        phone: formData.whatsapp.replace(/\D/g, ''),
                        rating: 0,
                        total_reviews: 0,
                    })
                    .select()
                    .single()

                if (sellerCreateError) {
                    throw new Error(`Erro ao criar perfil de vendedor: ${sellerCreateError.message}`)
                }
                sellerId = newSeller?.id
            }

            // Agora formData.category já é o ID da categoria
            const category_id = formData.category || null

            const listingData = {
                user_id: user.id,
                seller_id: sellerId,
                title: formData.name,
                description: formData.description || "Sem descrição",
                price: parseFloat(formData.price),
                category_id: category_id,
                is_active: false,
                is_featured: false,
                status: 'pending' as const,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode.replace(/\D/g, '')
            }

            console.log("📍 Salvando localização:", { city: formData.city, state: formData.state, postal_code: formData.postalCode })

            const { data: listing, error: listingError } = await supabase
                .from("listings")
                .insert(listingData)
                .select()
                .single()

            if (listingError) {
                console.error("Erro ao criar listing:", listingError)
                throw new Error(`Erro ao criar anúncio: ${listingError.message}`)
            }

            console.log("✅ Listing criado com localização:", listing)

            if (images.length > 0) {
                const imageInserts = images.map((imageUrl, index) => ({
                    listing_id: listing.id,
                    image_url: imageUrl,
                    display_order: index,
                }))
                await supabase.from("listing_images").insert(imageInserts)
            }

            if (formData.selectedBadges.length > 0) {
                const { data: badges } = await supabase
                    .from("badges")
                    .select("id, name")
                    .in("name", formData.selectedBadges)

                if (badges && badges.length > 0) {
                    const badgeInserts = badges.map((badge) => ({
                        listing_id: listing.id,
                        badge_id: badge.id,
                    }))
                    await supabase.from("listing_badges").insert(badgeInserts)
                }
            }

            alert.success("Seu anúncio está aguardando aprovação", "Anúncio enviado!")
            onOpenChange(false)
            setFormData({ name: "", description: "", category: "", price: "", whatsapp: "", selectedBadges: [], city: "Guaíra", state: "SP", postalCode: "14790-000" })
            setImages([])
            window.location.reload()
        } catch (err: any) {
            throw err
        }
    }

    const handleEditSubmit = async () => {
        try {
            if (user) {
                const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single()
                if (seller) {
                    await supabase.from("sellers").update({ phone: formData.whatsapp.replace(/\D/g, '') }).eq("id", seller.id)
                }
            }

            // Agora formData.category já é o ID da categoria
            const category_id = formData.category || null

            const { error: updateError } = await supabase
                .from("listings")
                .update({
                    title: formData.name,
                    description: formData.description || "Sem descrição",
                    price: parseFloat(formData.price),
                    category_id: category_id,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postalCode.replace(/\D/g, '')
                })
                .eq("id", editingListing!.id)

            if (updateError) {
                throw new Error(`Erro ao atualizar anúncio: ${updateError.message}`)
            }

            await supabase.from("listing_images").delete().eq("listing_id", editingListing!.id)
            if (images.length > 0) {
                const imageInserts = images.map((imageUrl, index) => ({
                    listing_id: editingListing!.id,
                    image_url: imageUrl,
                    display_order: index,
                }))
                await supabase.from("listing_images").insert(imageInserts)
            }

            await supabase.from("listing_badges").delete().eq("listing_id", editingListing!.id)
            if (formData.selectedBadges.length > 0) {
                const { data: badges } = await supabase.from("badges").select("id, name").in("name", formData.selectedBadges)
                if (badges && badges.length > 0) {
                    const badgeInserts = badges.map((badge) => ({
                        listing_id: editingListing!.id,
                        badge_id: badge.id,
                    }))
                    await supabase.from("listing_badges").insert(badgeInserts)
                }
            }

            alert.success("Suas alterações foram salvas", "Anúncio atualizado!")
            onOpenChange(false)
            window.location.reload()
        } catch (err: any) {
            throw err
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[1400px] w-[95vw] max-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
                {isBanned ? (
                    // Tela de Bloqueio para Usuários Banidos
                    <>
                        <DialogHeader className="border-b pb-4 mb-0 flex-shrink-0">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                    <X className="w-12 h-12 text-red-600" />
                                </div>
                            </div>
                            <DialogTitle className="text-center text-2xl text-red-600">
                                Conta {banInfo?.is_permanent ? 'Suspensa' : 'Temporariamente Suspensa'}
                            </DialogTitle>
                            <DialogDescription className="text-center text-base mt-2">
                                Você não pode publicar anúncios enquanto estiver {banInfo?.is_permanent ? 'banido' : 'suspenso'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                            {/* Motivo do Banimento */}
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2 text-lg">
                                    <AlertTriangle className="w-5 h-5" />
                                    Motivo da Suspensão:
                                </h4>
                                <p className="text-red-800 leading-relaxed">
                                    {banInfo?.ban_reason || "Nenhum motivo especificado."}
                                </p>
                            </div>

                            {/* Data de Expiração (se temporário) */}
                            {!banInfo?.is_permanent && banInfo?.ban_until && (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2 text-lg">
                                        <Calendar className="w-5 h-5" />
                                        Suspensão válida até:
                                    </h4>
                                    <p className="text-amber-800 text-2xl font-bold mb-2">
                                        {new Date(banInfo.ban_until).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-amber-700 text-sm">
                                        Após esta data, você poderá publicar anúncios normalmente.
                                    </p>
                                </div>
                            )}

                            {/* Ações Bloqueadas */}
                            <div className="bg-muted border-2 border-border rounded-xl p-6">
                                <h4 className="font-semibold text-foreground mb-3 text-lg">
                                    Ações Bloqueadas Durante a Suspensão:
                                </h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <X className="w-4 h-4 text-red-500" />
                                        Publicar novos anúncios
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <X className="w-4 h-4 text-red-500" />
                                        Editar anúncios existentes
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Você ainda pode navegar e favoritar anúncios
                                    </li>
                                </ul>
                            </div>

                            {/* Informações de Contato */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 text-center">
                                <p className="text-sm text-blue-900 mb-2 font-medium">
                                    Acredita que isso é um erro?
                                </p>
                                <p className="text-blue-800">
                                    Entre em contato: <span className="font-bold">suporte@marketguaira.com</span>
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4 px-6 pb-6 flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="min-w-[200px]"
                            >
                                Fechar
                            </Button>
                        </div>
                    </>
                ) : (
                    // Formulário Normal
                    <>
                        <DialogHeader className="border-b pb-4 mb-0 flex-shrink-0">
                            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Edit className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                                            Editar Anúncio
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Send className="w-7 h-7 text-primary" />
                                        </div>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                            Publique Seu Anúncio
                                        </span>
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-base mt-2">
                                {isEditing ? "Atualize as informações do seu anúncio e alcance mais pessoas" : "Crie um anúncio profissional e alcance milhares de pessoas"}
                            </DialogDescription>
                        </DialogHeader>

                <form id="publish-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-1 space-y-8 py-6">
                    {/* Grid de 2 colunas */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Coluna Esquerda - Informações Básicas */}
                        <div className="space-y-6">
                            {/* Card de Informações */}
                            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Send className="w-4 h-4 text-primary" />
                                    </div>
                                    Informações Básicas
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <div className="w-1 h-4 bg-primary rounded-full" />
                                            Título do Anúncio
                                        </label>
                                        <Input
                                            placeholder="Ex: iPhone 15 Pro Max 256GB Azul..."
                                            value={formData.name}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="border-2 border-border focus:border-primary transition-colors h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <div className="w-1 h-4 bg-primary rounded-full" />
                                            Descrição Detalhada
                                        </label>
                                        <Textarea
                                            placeholder="Descreva seu produto com detalhes: estado, características, motivo da venda..."
                                            value={formData.description}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                            rows={5}
                                            className="border-2 border-border focus:border-primary transition-colors resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Quanto mais detalhes, mais chances de venda!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card de Preço e Categoria */}
                            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-sm">R$</span>
                                    </div>
                                    Preço e Categoria
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <div className="w-1 h-4 bg-green-500 rounded-full" />
                                            Preço (R$)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                                                R$
                                            </span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0,00"
                                                value={formData.price}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                                required
                                                className="border-2 border-border focus:border-green-500 transition-colors h-11 pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <div className="w-1 h-4 bg-foreground rounded-full" />
                                            Categoria
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 h-11 border-2 border-border focus:border-primary rounded-md bg-background text-foreground transition-colors"
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {availableCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Card de Contato */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-white" />
                                    </div>
                                    WhatsApp para Contato
                                </h3>
                                
                                <div className="space-y-2">
                                    <Input
                                        type="tel"
                                        placeholder="(44) 99999-9999"
                                        value={formData.whatsapp}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '')
                                            if (value.length > 11) value = value.slice(0, 11)
                                            if (value.length > 10) {
                                                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
                                            } else if (value.length > 6) {
                                                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
                                            } else if (value.length > 2) {
                                                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
                                            } else if (value.length > 0) {
                                                value = value.replace(/^(\d*)/, '($1')
                                            }
                                            setFormData((prev) => ({ ...prev, whatsapp: value }))
                                        }}
                                        required
                                        className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-600 transition-colors h-11 bg-white dark:bg-gray-900"
                                    />
                                    <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1 mt-1">
                                        <Phone className="w-3 h-3" />
                                        Clientes entrarão em contato por este WhatsApp
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna Direita - Imagens e Complementos */}
                        <div className="space-y-6">
                            {/* Card de Imagens */}
                            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Camera className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Fotos do Produto
                                </h3>
                                
                                <ImageUploadZone images={images} onImagesChange={setImages} />
                                
                                {images.length > 0 && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-medium">{images.length} foto{images.length !== 1 ? 's' : ''} adicionada{images.length !== 1 ? 's' : ''}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Card de Localização */}
                            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                    </div>
                                    Localização
                                </h3>

                                <div className="relative space-y-2">
                                    <label className="text-sm font-medium mb-1.5 block">Buscar Cidade ou CEP</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Digite o nome da cidade ou CEP..."
                                            value={formData.postalCode && formData.city ? `${formData.city} - ${formData.state} (${formData.postalCode})` : formData.postalCode}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                setFormData(prev => ({ ...prev, postalCode: value, city: "", state: "" }))
                                                handleLocationSearch(value)
                                            }}
                                            className="pl-10 border-2 border-border focus:border-orange-500 transition-colors h-11"
                                        />
                                        {loadingLocation && (
                                            <div className="absolute right-3 top-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropdown de Resultados */}
                                    {locationSearchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-orange-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                            {locationSearchResults.map((result, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSelectLocation(result)}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 text-sm flex items-center gap-2 transition-colors border-b border-gray-100 last:border-0"
                                                >
                                                    <MapPin className="h-4 w-4 text-orange-500" />
                                                    <div>
                                                        <span className="font-medium">{result.city} - {result.state}</span>
                                                        {result.postalCode && <span className="text-gray-500 text-xs ml-2">({result.postalCode})</span>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {formData.city && (
                                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-sm text-orange-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                <span><strong>{formData.city} - {formData.state}</strong></span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card de Diferenciais */}
                            <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-black dark:bg-gray-900 rounded-lg flex items-center justify-center">
                                        <Star className="w-4 h-4 text-white fill-white" />
                                    </div>
                                    Diferenciais do Produto
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecione características que destacam seu produto
                                </p>
                                
                                {availableBadges.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {availableBadges.map((badge) => (
                                            <button
                                                key={badge.id}
                                                type="button"
                                                onClick={() => toggleBadge(badge.name)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                    formData.selectedBadges.includes(badge.name)
                                                        ? `${badge.color} ring-2 ring-offset-2 ring-primary shadow-md`
                                                        : "bg-white border-2 border-border text-gray-700 hover:border-primary"
                                                }`}
                                            >
                                                {formData.selectedBadges.includes(badge.name) && (
                                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                                )}
                                                {badge.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Nenhum diferencial disponível</p>
                                )}
                                
                                {formData.selectedBadges.length > 0 && (
                                    <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
                                        <p className="text-sm text-foreground font-medium">
                                            {formData.selectedBadges.length} diferencial{formData.selectedBadges.length !== 1 ? 'is' : ''} selecionado{formData.selectedBadges.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <X className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold">Erro ao publicar</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}
                </form>

                {/* Botões de Ação - Fixos no bottom */}
                <div className="flex gap-4 pt-4 border-t-2 flex-shrink-0 bg-background">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 text-base border-2 hover:bg-muted"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="publish-form"
                        className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                        disabled={!formData.name.trim() || !formData.price || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {isEditing ? "Atualizando..." : "Publicando..."}
                            </>
                        ) : isEditing ? (
                            <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Atualizar Anúncio
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                Publicar Anúncio
                            </>
                        )}
                    </Button>
                </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
                                      