"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Share2, Heart, MapPin, Calendar, Shield, AlertTriangle, Star, Check, User, Eye, Phone, MoreVertical, Flag, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ListingCarousel } from "@/components/listing-carousel"
import { ListingCarouselDetail } from "@/components/listing-carousel-detail"
import { ImageViewerModal } from "@/components/image-viewer-modal"
import { type Listing } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate_content", label: "Conteúdo Inapropriado" },
  { value: "fake_product", label: "Produto Falso" },
  { value: "scam", label: "Golpe/Fraude" },
  { value: "offensive_behavior", label: "Comportamento Ofensivo" },
  { value: "copyright", label: "Violação de Direitos Autorais" },
  { value: "other", label: "Outro" },
]

export default function AnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [existingReport, setExistingReport] = useState<any>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [isBanned, setIsBanned] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])

  // Unwrap params usando React.use()
  const { id } = use(params)

  useEffect(() => {
    async function loadListing() {
      // Importar a função getListingById
      const { getListingById } = await import("@/lib/storage")
      const found = await getListingById(id)
      setListing(found)
      setLoading(false)

      // Registrar visualização única
      if (found) {
        await recordUniqueView(id)
      }
    }
    loadListing()
  }, [id])

  // Função para registrar visualização única
  async function recordUniqueView(listingId: string) {
    try {
      // Obter IP do usuário (para visitantes não logados)
      let viewerIp: string | null = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        viewerIp = ipData.ip
      } catch (err) {
        console.log('Não foi possível obter IP')
      }

      // Registrar visualização
      const { data, error } = await supabase.rpc('record_listing_view', {
        p_listing_id: listingId,
        p_user_id: user?.id || null,
        p_viewer_ip: viewerIp
      })

      if (error) {
        console.error('Erro ao registrar visualização:', error.message || error)
        return
      }

      // data é booleano: true = registrado, false = já visualizado
      if (data === true) {
        console.log('✅ Visualização única registrada')
      } else {
        console.log('ℹ️ Visualização já registrada anteriormente ou você é o dono')
      }
    } catch (err) {
      console.error('Erro ao registrar visualização:', err)
    }
  }

  // Carregar produtos relacionados da mesma categoria
  useEffect(() => {
    async function loadRelatedListings() {
      if (!listing) {
        console.log('❌ Listing ainda não carregado')
        return
      }

      console.log('🔍 Carregando produtos relacionados...')
      console.log('📋 Listing atual:', {
        id: listing.id,
        title: listing.title,
        category: listing.category,
        categoryId: listing.categoryId
      })

      const { getListings } = await import("@/lib/storage")
      const allListings = await getListings()
      
      console.log('📦 Total de listings:', allListings.length)
      console.log('🔍 Listings com categoryId:', allListings.filter(l => l.categoryId).length)
      
      // Filtrar por mesma categoria, excluindo o próprio anúncio
      const related = allListings
        .filter(l => {
          const match = l.categoryId === listing.categoryId && l.id !== listing.id
          if (l.categoryId === listing.categoryId) {
            console.log('✅ Match encontrado:', l.title, '| categoryId:', l.categoryId)
          }
          return match
        })
        .sort((a, b) => b.views - a.views) // Ordenar por visualizações
        .slice(0, 10) // Limitar a 10 produtos
      
      console.log('🎯 Produtos relacionados encontrados:', related.length)
      setRelatedListings(related)
    }
    loadRelatedListings()
  }, [listing])

  // Verificar se usuário já denunciou este anúncio
  useEffect(() => {
    async function checkExistingReport() {
      if (!user || !id) return

      setLoadingReport(true)
      try {
        const { data, error } = await supabase
          .rpc('get_user_report_for_listing', {
            user_uuid: user.id,
            listing_uuid: id
          })

        if (!error && data && data.length > 0) {
          setExistingReport(data[0])
        } else {
          setExistingReport(null)
        }
      } catch (err) {
        console.error("Erro ao verificar denúncia:", err)
      } finally {
        setLoadingReport(false)
      }
    }

    checkExistingReport()
  }, [user, id])

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

  // Verificar se o anúncio está salvo
  useEffect(() => {
    async function checkIfSaved() {
      if (!user || !id) {
        setIsSaved(false)
        return
      }

      try {
        const { data, error } = await supabase
          .rpc('is_listing_saved', {
            user_uuid: user.id,
            listing_uuid: id
          })

        if (!error) {
          setIsSaved(data === true)
        }
      } catch (err) {
        console.error("Erro ao verificar se anúncio está salvo:", err)
      }
    }

    checkIfSaved()
  }, [user, id])

  const handleToggleSave = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar anúncios.")
      return
    }

    setLoadingSave(true)
    try {
      if (isSaved) {
        // Remover dos salvos
        const { error } = await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id)

        if (error) {
          console.error("Erro ao remover dos salvos:", error)
          alert("Erro ao remover dos salvos.")
          return
        }

        setIsSaved(false)
      } else {
        // Adicionar aos salvos
        const { error } = await supabase
          .from("saved_listings")
          .insert({
            user_id: user.id,
            listing_id: id
          })

        if (error) {
          console.error("Erro ao salvar anúncio:", error)
          alert("Erro ao salvar anúncio.")
          return
        }

        setIsSaved(true)
      }
    } catch (err) {
      console.error("Erro:", err)
      alert("Erro ao processar solicitação.")
    } finally {
      setLoadingSave(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!existingReport) return

    if (!confirm("Tem certeza que deseja cancelar sua denúncia?")) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", existingReport.id)

      if (error) {
        console.error("Erro ao deletar denúncia:", error)
        alert("Erro ao cancelar denúncia. Você só pode cancelar denúncias feitas há menos de 24 horas.")
        return
      }

      alert("Denúncia cancelada com sucesso!")
      setExistingReport(null)
    } catch (err) {
      console.error("Erro:", err)
      alert("Erro ao cancelar denúncia.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReport = async () => {
    if (!user) {
      alert("Você precisa estar logado para denunciar.")
      return
    }

    // Verificar se está banido
    if (isBanned) {
      alert("⚠️ Você está suspenso e não pode fazer denúncias no momento.")
      return
    }

    // Verificar se já existe denúncia
    if (existingReport) {
      alert("Você já denunciou este anúncio. Não é possível fazer outra denúncia.")
      return
    }

    if (!reportReason || !reportDescription.trim()) {
      alert("Por favor, selecione um motivo e descreva o problema.")
      return
    }

    if (!listing) return

    // Verificar se o usuário não está denunciando a si mesmo
    if (user.id === listing.userId) {
      alert("Você não pode denunciar seu próprio anúncio.")
      return
    }

    setSubmitting(true)
    try {
      console.log("📝 Enviando denúncia:", {
        reporter_id: user.id,
        report_type: "listing",
        reported_user_id: listing.userId,
        reported_listing_id: id,
        reason: reportReason,
        description: reportDescription
      })

      const { data, error } = await supabase
        .from("reports")
        .insert({
          reporter_id: user.id,
          report_type: "listing",
          reported_user_id: listing.userId,
          reported_listing_id: id,
          reason: reportReason,
          description: reportDescription,
          status: "pending"
        })
        .select()

      if (error) {
        console.error("❌ Erro ao enviar denúncia:", error)
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2))

        // Verificar se é erro de denúncia duplicada
        if (error.code === '23505') {
          alert("Você já denunciou este anúncio anteriormente.")
        } else {
          alert(`Erro ao enviar denúncia: ${error.message || "Erro desconhecido"}`)
        }
        return
      }

      console.log("✅ Denúncia enviada:", data)
      alert("✅ Denúncia enviada com sucesso! Nossa equipe irá analisar.")
      setReportDialogOpen(false)
      setReportReason("")
      setReportDescription("")

      // Recarregar denúncia existente
      if (data && data.length > 0) {
        setExistingReport({
          ...data[0],
          can_delete: true // Acabou de criar, pode deletar
        })
      }
    } catch (err: any) {
      console.error("❌ Erro geral:", err)
      alert(`Erro ao enviar denúncia: ${err.message || "Erro desconhecido"}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando anúncio...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Anúncio não encontrado</h2>
          <p className="text-muted-foreground mb-6">O anúncio que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.push("/")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
        </Card>
      </div>
    )
  }

  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendente",
    reviewed: "Em Análise",
    resolved: "Resolvida",
    dismissed: "Descartada"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header com botão voltar e menu */}
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

          {/* Botão de 3 pontos */}
          {user && user.id !== listing.userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {existingReport ? (
                  <>
                    <DropdownMenuItem disabled className="flex-col items-start">
                      <span className="font-semibold text-orange-600">Denúncia Enviada</span>
                      <span className="text-xs text-muted-foreground">
                        Status: {STATUS_LABELS[existingReport.status] || existingReport.status}
                      </span>
                    </DropdownMenuItem>
                    {existingReport.can_delete && (
                      <DropdownMenuItem
                        onClick={handleDeleteReport}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar Denúncia
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => {
                      if (isBanned) {
                        alert("⚠️ Você está suspenso e não pode fazer denúncias no momento.")
                        return
                      }
                      setReportDialogOpen(true)
                    }}
                    disabled={isBanned}
                  >
                    <Flag className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-red-600">Denunciar Anúncio</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Modal de Denúncia */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar Anúncio</DialogTitle>
            <DialogDescription>
              Relate um problema com este anúncio. Nossa equipe irá analisar sua denúncia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Motivo */}
            <div className="space-y-2">
              <Label>Motivo da Denúncia *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descreva o problema com detalhes..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Info do anúncio */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">{listing.title}</p>
              <p className="text-xs text-muted-foreground">
                Por: {listing.seller.name}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReport}
              disabled={submitting || !reportReason || !reportDescription.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Enviando..." : "Enviar Denúncia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Galeria, Título e Descrição */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card da Galeria com Indicadores */}
            <Card className="overflow-hidden shadow-xl border-2 border-border p-0">
              <div 
                className="aspect-video bg-muted relative cursor-pointer"
                onClick={() => setImageViewerOpen(true)}
              >
                <ListingCarouselDetail images={listing.images} title={listing.title} onIndexChange={setImageViewerIndex} />
              </div>
            </Card>

            {/* Modal de Visualização de Imagem */}
            <ImageViewerModal
              open={imageViewerOpen}
              onOpenChange={setImageViewerOpen}
              images={listing.images}
              initialIndex={imageViewerIndex}
            />

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
              <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                <Badge variant="outline" className="text-sm">
                  {listing.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views} visualizações</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>{new Date(listing.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Produtos Recomendados - Desktop */}
            <Card className="p-6 shadow-lg border border-border hidden lg:block">
              <h3 className="text-lg font-bold text-foreground mb-4">Produtos Recomendados</h3>
              {relatedListings.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                    {relatedListings.map((relatedListing) => (
                      <Card
                        key={relatedListing.id}
                        className="flex-none w-[200px] overflow-hidden border-border hover:border-accent hover:shadow-lg transition-all duration-300 bg-card cursor-pointer group p-0 snap-start"
                        onClick={() => router.push(`/anuncio/${relatedListing.id}`)}
                      >
                        <div className="relative h-32 overflow-hidden bg-muted">
                          <ListingCarousel images={relatedListing.images} title={relatedListing.title} listingId={relatedListing.id} />
                        </div>
                        <div className="p-2.5 space-y-1">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedListing.title}
                          </h4>
                          <p className="text-base font-bold text-primary">
                            R$ {relatedListing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum produto relacionado encontrado.</p>
              )}
            </Card>
          </div>

          {/* Coluna Direita - Card de Preço/Info e Card do Vendedor */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Card de Preço e Ações */}
              <Card className="p-6 shadow-xl border-2 border-primary/20 space-y-4">
                {/* Preço */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preço</p>
                  <p className="text-4xl font-bold text-primary">
                    R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Diferenciais */}
                {listing.badges.length > 0 && (
                  <div className="py-4 border-y border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Diferenciais</h4>
                    <div className="flex flex-wrap gap-2">
                      {listing.badges.map((badge, index) => (
                        <Badge
                          key={`${badge.name}-${index}`}
                          className={`text-xs ${badge.color || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"}`}
                        >
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Localização */}
                {listing.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{listing.city}, {listing.state}</span>
                  </div>
                )}

                {/* Botão WhatsApp */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    if (isBanned) {
                      alert("⚠️ Você está suspenso e não pode entrar em contato com vendedores no momento.")
                      return
                    }
                    if (listing.seller.phone) {
                      const phoneNumber = listing.seller.phone.replace(/\D/g, '')
                      const message = `Olá! Vi seu anúncio "${listing.title}" no MarketGuaira e tenho interesse. Poderia me dar mais informações?`
                      window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                    } else {
                      alert('Vendedor não cadastrou número de telefone.')
                    }
                  }}
                  disabled={!listing.seller.phone || isBanned}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {listing.seller.phone ? 'Conversar no WhatsApp' : 'Sem WhatsApp'}
                </Button>

                {/* Botões Secundários */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    className={`bg-transparent hover:bg-accent/10 ${isSaved ? 'text-red-500 border-red-500' : ''}`}
                    onClick={handleToggleSave}
                    disabled={loadingSave}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isSaved ? 'fill-red-500' : ''}`} />
                    {loadingSave ? 'Salvando...' : isSaved ? 'Salvo' : 'Salvar'}
                  </Button>
                  <Button variant="outline" size="default" className="bg-transparent hover:bg-accent/10">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </Card>

              {/* Card do Vendedor */}
              <Card className="overflow-hidden shadow-2xl border-2 border-primary/20 p-0">
                {/* Capa do Perfil */}
                <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-accent">
                  {listing.seller.coverUrl ? (
                    <img
                      src={listing.seller.coverUrl}
                      alt="Capa do perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent" />
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="px-6 pb-6 -mt-10 relative space-y-4">
                  {/* Avatar com borda de verificado */}
                  <div className="relative mx-auto w-fit">
                    {listing.seller.avatarUrl ? (
                      <div className={`w-16 h-16 rounded-full overflow-hidden bg-background ring-4 ring-background ${listing.seller.isVerified ? 'ring-4 ring-blue-500' : ''}`}>
                        <img
                          src={listing.seller.avatarUrl}
                          alt={listing.seller.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white ring-4 ring-background ${listing.seller.isVerified ? 'ring-4 ring-blue-500' : ''}`}>
                        {listing.seller.name.charAt(0)}
                      </div>
                    )}
                    {listing.seller.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-background">
                        <Check className="h-3 w-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Informações do Vendedor */}
                  <div className="text-center space-y-2">
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        <h4 className="text-lg font-bold text-foreground">{listing.seller.name}</h4>
                        {listing.seller.isVerified && (
                          <Check className="h-4 w-4 text-blue-500 stroke-[3]" />
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-foreground">{listing.seller.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">({listing.seller.reviews} avaliações)</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão Ver Perfil */}
                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm font-semibold border-2 hover:bg-accent/10 transition-all"
                    onClick={() => {
                      if (isBanned) {
                        alert("⚠️ Você está suspenso e não pode visualizar perfis no momento.")
                        return
                      }
                      router.push(`/perfil/${listing.seller.id}`)
                    }}
                    disabled={isBanned}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Ver Perfil
                  </Button>

                  {/* Badge de Verificado */}
                  {listing.seller.isVerified && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                        ✓ Vendedor Verificado
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Produtos Recomendados - Mobile (no final) */}
        <div className="mt-8 lg:hidden">
          <Card className="p-6 shadow-lg border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Produtos Recomendados</h3>
            {relatedListings.length > 0 ? (
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {relatedListings.map((relatedListing) => (
                    <Card
                      key={relatedListing.id}
                      className="flex-none w-[200px] overflow-hidden border-border hover:border-accent hover:shadow-lg transition-all duration-300 bg-card cursor-pointer group p-0 snap-start"
                      onClick={() => router.push(`/anuncio/${relatedListing.id}`)}
                    >
                      <div className="relative h-32 overflow-hidden bg-muted">
                        <ListingCarousel images={relatedListing.images} title={relatedListing.title} listingId={relatedListing.id} />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedListing.title}
                        </h4>
                        <p className="text-base font-bold text-primary">
                          R$ {relatedListing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum produto relacionado encontrado.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
