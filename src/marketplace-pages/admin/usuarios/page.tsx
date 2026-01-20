"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    User,
    Mail,
    Phone,
    Calendar,
    Search,
    CheckCircle,
    XCircle,
    Shield,
    Star,
    Ban,
    Trash2,
    Clock
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAlert } from "@/components/alert-system"
import { useConfirm } from "@/components/confirm-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Seller {
    id: string
    name: string
    email: string | null
    phone: string | null
    avatar_url: string | null
    rating: number
    total_reviews: number
    is_verified: boolean
    is_banned: boolean
    ban_reason: string | null
    ban_until: string | null
    created_at: string
    updated_at: string
    user_id: string | null
    total_listings: number
}

export default function AdminUsuarios() {
    const alert = useAlert()
    const { confirm } = useConfirm()
    const [sellers, setSellers] = useState<Seller[]>([])
    const [filteredSellers, setFilteredSellers] = useState<Seller[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [processing, setProcessing] = useState(false)
    
    // Estados para modal de banimento
    const [banModalOpen, setBanModalOpen] = useState(false)
    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
    const [banReason, setBanReason] = useState("")
    const [banDuration, setBanDuration] = useState<string>("permanent")
    const [customDays, setCustomDays] = useState("")

    useEffect(() => {
        loadSellers()
    }, [])

    useEffect(() => {
        filterSellers()
    }, [searchQuery, sellers])

    const loadSellers = async () => {
        try {
            console.log("📊 Carregando vendedores...")

            // Buscar todos os sellers
            const { data: sellersData, error: sellersError } = await supabase
                .from("sellers")
                .select("*")
                .order("created_at", { ascending: false })

            if (sellersError) {
                console.error("❌ Erro ao carregar sellers:", sellersError)
                return
            }

            // Para cada seller, contar quantos anúncios ele tem
            const sellersWithListings = await Promise.all(
                (sellersData || []).map(async (seller) => {
                    const { count } = await supabase
                        .from("listings")
                        .select("*", { count: "exact", head: true })
                        .eq("seller_id", seller.id)

                    return {
                        ...seller,
                        total_listings: count || 0,
                        is_verified: seller.is_verified || false,
                        is_banned: seller.is_banned || false,
                        ban_reason: seller.ban_reason || null,
                        ban_until: seller.ban_until || null
                    }
                })
            )

            console.log(`✅ ${sellersWithListings.length} vendedores carregados`)
            setSellers(sellersWithListings)
            setFilteredSellers(sellersWithListings)
        } catch (err) {
            console.error("❌ Erro:", err)
        } finally {
            setLoading(false)
        }
    }

    const filterSellers = () => {
        if (!searchQuery) {
            setFilteredSellers(sellers)
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = sellers.filter(seller =>
            seller.name.toLowerCase().includes(query) ||
            seller.email?.toLowerCase().includes(query) ||
            seller.phone?.toLowerCase().includes(query)
        )
        setFilteredSellers(filtered)
    }

    const toggleVerification = async (sellerId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus
        const action = newStatus ? "verificar" : "remover verificação de"

        if (!confirm(`Tem certeza que deseja ${action} este vendedor?`)) {
            return
        }

        setProcessing(true)
        try {
            const { error } = await supabase
                .from("sellers")
                .update({ is_verified: newStatus })
                .eq("id", sellerId)

            if (error) {
                console.error("Erro ao atualizar:", error)
                alert.error("Erro ao atualizar status de verificação")
                return
            }

            alert.success(newStatus ? "Vendedor verificado com sucesso!" : "Verificação removida!")
            loadSellers()
        } catch (err) {
            console.error("Erro:", err)
            alert.error("Erro ao atualizar status de verificação")
        } finally {
            setProcessing(false)
        }
    }

    const openBanModal = (seller: Seller) => {
        setSelectedSeller(seller)
        setBanReason("")
        setBanDuration("permanent")
        setCustomDays("")
        setBanModalOpen(true)
    }

    const handleBan = async () => {
        if (!selectedSeller) return
        
        if (!banReason.trim()) {
            alert.warning("Por favor, informe o motivo do banimento")
            return
        }

        if (banDuration === 'custom' && (!customDays || parseInt(customDays) < 1)) {
            alert.warning("Por favor, informe um número válido de dias")
            return
        }

        setProcessing(true)
        try {
            let banUntil: string | null = null
            
            if (banDuration !== "permanent") {
                const days = banDuration === "custom" ? parseInt(customDays) : parseInt(banDuration)
                const date = new Date()
                date.setDate(date.getDate() + days)
                banUntil = date.toISOString()
            }

            const { error } = await supabase
                .from("sellers")
                .update({
                    is_banned: true,
                    ban_reason: banReason,
                    ban_until: banUntil,
                    banned_at: new Date().toISOString()
                })
                .eq("id", selectedSeller.id)

            if (error) {
                console.error("Erro ao banir:", error)
                alert.error("Erro ao banir usuário")
                return
            }

            const banType = banDuration === "permanent" ? "permanentemente" : `por ${banDuration === "custom" ? customDays : banDuration} dias`
            alert.success(`Usuário banido ${banType === 'permanently' ? 'permanentemente' : 'temporariamente'}!`, "Banimento aplicado")
            setBanModalOpen(false)
            loadSellers()
        } catch (err) {
            console.error("Erro ao banir:", err)
            alert.error("Erro ao banir usuário")
        } finally {
            setProcessing(false)
        }
    }

    const handleUnban = async (sellerId: string) => {
        if (!confirm("Tem certeza que deseja desbanir este usuário?")) {
            return
        }

        setProcessing(true)
        try {
            const { error } = await supabase
                .from("sellers")
                .update({
                    is_banned: false,
                    ban_reason: null,
                    ban_until: null,
                    banned_at: null,
                    banned_by: null
                })
                .eq("id", sellerId)

            if (error) {
                console.error("Erro ao desbanir:", error)
                alert.error("Erro ao desbanir usuário")
                return
            }

            alert.success("Usuário desbanido com sucesso!", "Banimento removido")
            loadSellers()
        } catch (err) {
            console.error("Erro:", err)
            alert.error("Erro ao desbanir usuário")
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async (seller: Seller) => {
        const confirmText = `DELETAR ${seller.name.toUpperCase()}`
        
        confirm(
            `⚠️ ATENÇÃO! Esta ação é IRREVERSÍVEL!\n\nVocê está prestes a EXCLUIR PERMANENTEMENTE:\n\n• Usuário: ${seller.name}\n• ${seller.total_listings} anúncio(s)\n• Todas as avaliações e dados relacionados`,
            async () => {
                setProcessing(true)
                try {
                    // Tentar usar a função delete_user_complete
                    const { data, error } = await supabase.rpc('delete_user_complete', {
                        p_user_id: seller.id
                    })

                    if (error) {
                        console.error("Erro RPC completo:", JSON.stringify(error, null, 2))
                        console.error("Error code:", error.code)
                        console.error("Error message:", error.message)
                        console.error("Error details:", error.details)
                        
                        // Se a função não existe, fazer delete manual
                        if (error.code === 'PGRST202' || error.code === '42883' || error.message?.toLowerCase().includes('function') || error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('does not exist')) {
                            alert.info("Função SQL não encontrada. Executando exclusão manual...", "Aguarde")
                            
                            // Delete manual dos dados relacionados
                            const { data: listings } = await supabase
                                .from("listings")
                                .select("id")
                                .eq("seller_id", seller.id)

                            if (listings && listings.length > 0) {
                                const listingIds = listings.map(l => l.id)
                                await supabase.from("listing_images").delete().in("listing_id", listingIds)
                                await supabase.from("listing_badges").delete().in("listing_id", listingIds)
                                await supabase.from("saved_listings").delete().in("listing_id", listingIds)
                                await supabase.from("reports").delete().in("listing_id", listingIds)
                            }

                            await supabase.from("listings").delete().eq("seller_id", seller.id)
                            
                            const { error: sellerError } = await supabase
                                .from("sellers")
                                .delete()
                                .eq("id", seller.id)

                            if (sellerError) {
                                console.error("Erro ao deletar seller:", sellerError)
                                throw sellerError
                            }
                            
                            await supabase.from("user_profiles").delete().eq("id", seller.id)
                            
                            alert.success("Usuário excluído permanentemente!", "Exclusão concluída")
                            alert.info("Execute o SQL supabase-delete-user-function.sql para melhor performance", "Dica")
                        } else {
                            throw error
                        }
                    } else {
                        alert.success("Usuário excluído permanentemente!", "Exclusão concluída")
                    }

                    loadSellers()
                } catch (err: any) {
                    console.error("Erro ao excluir completo:", err)
                    console.error("Tipo do erro:", typeof err)
                    console.error("Erro stringified:", JSON.stringify(err, null, 2))
                    alert.error(err.message || err.msg || "Erro ao excluir usuário", "Erro na exclusão")
                } finally {
                    setProcessing(false)
                }
            },
            {
                title: "Excluir Usuário",
                requireInput: confirmText,
                confirmText: "Excluir Permanentemente",
                type: "danger"
            }
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Gerenciar Usuários
                </h1>
                <p className="text-muted-foreground">
                    {filteredSellers.length} vendedor(es) encontrado(s) de {sellers.length} total
                </p>
            </div>

            {/* Search */}
            <Card className="p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email ou telefone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            {/* Modal de Banimento */}
            <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ban className="w-5 h-5 text-red-600" />
                            Banir Usuário
                        </DialogTitle>
                        <DialogDescription>
                            Bani temporariamente ou permanentemente: <strong>{selectedSeller?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Duração do Banimento */}
                        <div className="space-y-2">
                            <Label>Duração do Banimento</Label>
                            <Select value={banDuration} onValueChange={setBanDuration}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 dia</SelectItem>
                                    <SelectItem value="3">3 dias</SelectItem>
                                    <SelectItem value="7">7 dias</SelectItem>
                                    <SelectItem value="15">15 dias</SelectItem>
                                    <SelectItem value="30">30 dias</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                    <SelectItem value="permanent">Permanente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dias Personalizados */}
                        {banDuration === "custom" && (
                            <div className="space-y-2">
                                <Label>Número de Dias</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={customDays}
                                    onChange={(e) => setCustomDays(e.target.value)}
                                    placeholder="Ex: 45"
                                />
                            </div>
                        )}

                        {/* Motivo */}
                        <div className="space-y-2">
                            <Label>Motivo do Banimento *</Label>
                            <Textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Descreva o motivo que será exibido ao usuário..."
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Este motivo será exibido ao usuário quando ele tentar realizar ações na plataforma.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBanModalOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleBan}
                            disabled={processing || !banReason.trim()}
                        >
                            {processing ? "Banindo..." : "Confirmar Banimento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sellers Grid */}
            {filteredSellers.length === 0 ? (
                <Card className="p-12 text-center">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        Nenhum vendedor encontrado
                    </h3>
                    <p className="text-muted-foreground">
                        Tente ajustar seu termo de busca.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSellers.map((seller) => (
                        <Card key={seller.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                {/* Avatar e Nome */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                        {seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-foreground truncate">
                                                {seller.name}
                                            </h3>
                                            {seller.is_verified && (
                                                <Shield className="w-5 h-5 text-blue-600 fill-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>{seller.rating.toFixed(1)}</span>
                                            <span>({seller.total_reviews} avaliações)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Informações */}
                                <div className="space-y-2 mb-4">
                                    {seller.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{seller.email}</span>
                                        </div>
                                    )}
                                    {seller.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            <span>{seller.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Desde {new Date(seller.created_at).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-2 mb-4">
                                    <Badge variant="outline" className="flex-1 justify-center">
                                        {seller.total_listings} anúncio(s)
                                    </Badge>
                                    {seller.is_verified ? (
                                        <Badge className="flex-1 justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            Verificado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="flex-1 justify-center">
                                            Não verificado
                                        </Badge>
                                    )}
                                </div>

                                {/* Status de Banimento */}
                                {seller.is_banned && (
                                    <div className="mb-4 bg-muted border-2 border-border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Ban className="w-4 h-4 text-foreground" />
                                            <span className="font-semibold text-foreground text-sm">
                                                {seller.ban_until ? "⚠️ Banido Temporariamente" : "🚫 Banido Permanentemente"}
                                            </span>
                                        </div>
                                        {seller.ban_reason && (
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{seller.ban_reason}</p>
                                        )}
                                        {seller.ban_until && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                Até: {new Date(seller.ban_until).toLocaleString("pt-BR", {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ações */}
                                <div className="space-y-2">
                                    {/* Verificação */}
                                    <Button
                                        className="w-full"
                                        variant={seller.is_verified ? "outline" : "default"}
                                        onClick={() => toggleVerification(seller.id, seller.is_verified)}
                                        disabled={processing}
                                    >
                                        {seller.is_verified ? (
                                            <>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Remover Verificação
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Verificar Vendedor
                                            </>
                                        )}
                                    </Button>

                                    {/* Banimento */}
                                    {seller.is_banned ? (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => handleUnban(seller.id)}
                                            disabled={processing}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Remover Banimento
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => openBanModal(seller)}
                                            disabled={processing}
                                        >
                                            <Ban className="mr-2 h-4 w-4" />
                                            Banir Usuário
                                        </Button>
                                    )}

                                    {/* Exclusão */}
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleDelete(seller)}
                                        disabled={processing}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir Permanentemente
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
