"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Eye, Edit, Trash2, MoreVertical, Package, Clock, CheckCircle, XCircle, MapPin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PublishMarketplaceModal } from "@/components/publish-marketplace-modal"
import { supabase } from "@/lib/supabase"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  views: number
  is_active: boolean
  status: 'pending' | 'approved' | 'rejected' | null
  rejection_reason: string | null
  created_at: string
  images: string[]
  category_name: string | null
  seller_phone: string | null
  badges: { name: string; color: string }[]
  city?: string
  state?: string
  postal_code?: string
}

export default function MeusAnunciosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<{
    id: string
    title: string
    description: string
    price: number
    category: string
    images: string[]
    badges: string[]
    phone: string
    city?: string
    state?: string
    postal_code?: string
  } | null>(null)



  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadMyListings()
    }
  }, [user])

  const loadMyListings = async () => {
    try {
      setLoading(true)

      // Buscar listings do usuário
      const { data, error } = await supabase
        .from("listings_full")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar anúncios:", error)
        return
      }

      setListings(data || [])
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Erro ao deletar:", error)
        alert("Erro ao excluir anúncio")
        return
      }

      // Remover da lista
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error("Erro:", err)
      alert("Erro ao excluir anúncio")
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) {
        console.error("Erro ao atualizar:", error)
        return
      }

      // Atualizar na lista
      setListings(listings.map(l =>
        l.id === id ? { ...l, is_active: !currentStatus } : l
      ))
    } catch (err) {
      console.error("Erro:", err)
    }
  }

  // Função helper para determinar a classe do card baseado no status
  const getCardBorderClass = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'border-l-4 border-l-orange-500 bg-orange-50/30'
      case 'approved':
        return 'border-l-4 border-l-green-500 bg-green-50/30'
      case 'rejected':
        return 'border-l-4 border-l-red-500 bg-red-50/30'
      default:
        return ''
    }
  }

  const handleEdit = async (listing: Listing) => {
    // Buscar badges do anúncio
    const { data: badgesData } = await supabase
      .from("listing_badges")
      .select(`
        badges (
          name
        )
      `)
      .eq("listing_id", listing.id)

    const badges = badgesData?.map(item => (item as any).badges.name) || []

    // Preparar dados para edição
    setEditingListing({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category_name || "Outros",
      images: listing.images,
      badges: badges,
      phone: listing.seller_phone || "",
      city: listing.city,
      state: listing.state,
      postal_code: listing.postal_code
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingListing(null)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="mb-4 hover:bg-accent/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Meus Anúncios
              </h1>
              <p className="text-muted-foreground">
                Gerencie todas as suas publicações
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Anúncio
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                <p className="text-3xl font-bold text-orange-600">
                  {listings.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">
                  {listings.filter(l => l.status === 'approved').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-3xl font-bold text-red-600">
                  {listings.filter(l => l.status === 'rejected').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-primary">
                  {listings.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : listings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Nenhum anúncio ainda
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comece publicando seu primeiro anúncio!
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Anúncio
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${getCardBorderClass(listing.status)}`}
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                          {listing.title}
                        </h3>
                        {listing.category_name && (
                          <p className="text-sm text-muted-foreground">
                            {listing.category_name}
                          </p>
                        )}
                        {listing.city && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.city}, {listing.state}</span>
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`/anuncio/${listing.id}`)}
                            className="cursor-pointer focus:bg-accent"
                          >
                            <Eye className="mr-2 h-4 w-4 text-foreground" />
                            <span className="text-foreground">Ver Anúncio</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(listing)}
                            className="cursor-pointer focus:bg-accent"
                          >
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            <span className="text-blue-600">Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleActive(listing.id, listing.is_active)}
                            className="cursor-pointer focus:bg-accent"
                          >
                            <Edit className="mr-2 h-4 w-4 text-foreground" />
                            <span className="text-foreground">{listing.is_active ? "Desativar" : "Ativar"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(listing.id)}
                            className="cursor-pointer focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            <span className="text-red-600">Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {listing.description}
                    </p>

                    {/* Badges/Diferenciais */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Badge de Localização */}
                      {listing.city && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium border flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.city}, {listing.state}
                        </Badge>
                      )}

                      {/* Outros Badges */}
                      {listing.badges && listing.badges.length > 0 && (
                        <>
                          {listing.badges.map((badge, index) => (
                            <Badge
                              key={`${badge.name}-${index}`}
                              className={`${badge.color || "bg-gray-100 text-gray-800"} border-0 text-xs px-2 py-1`}
                            >
                              {badge.name}
                            </Badge>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {listing.status === 'pending' && (
                        <Badge className="bg-orange-500 text-white border-0 px-3 py-1 font-semibold shadow-sm">
                          <Clock className="mr-1 h-3 w-3" />
                          Aguardando Aprovação
                        </Badge>
                      )}
                      {listing.status === 'approved' && listing.is_active && (
                        <Badge className="bg-green-500 text-white border-0 px-3 py-1 font-semibold shadow-sm">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Aprovado e Ativo
                        </Badge>
                      )}
                      {listing.status === 'approved' && !listing.is_active && (
                        <Badge className="bg-gray-500 text-white border-0 px-3 py-1 font-semibold shadow-sm">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Aprovado (Inativo)
                        </Badge>
                      )}
                      {listing.status === 'rejected' && (
                        <Badge className="bg-red-500 text-white border-0 px-3 py-1 font-semibold shadow-sm">
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejeitado
                        </Badge>
                      )}

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{listing.views} visualizações</span>
                      </div>

                      <div className="text-sm text-muted-foreground ml-auto">
                        Publicado em {new Date(listing.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Motivo da Rejeição */}
                    {listing.status === 'rejected' && listing.rejection_reason && (
                      <div className="mt-4 p-4 rounded-lg bg-red-50 border-2 border-red-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <XCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-red-900 mb-1">
                              Motivo da Rejeição:
                            </p>
                            <p className="text-sm text-red-800 leading-relaxed">
                              {listing.rejection_reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Aviso para Pendentes */}
                    {listing.status === 'pending' && (
                      <div className="mt-4 p-4 rounded-lg bg-orange-50 border-2 border-orange-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-orange-900 mb-1">
                              Seu anúncio está em análise
                            </p>
                            <p className="text-sm text-orange-800 leading-relaxed">
                              Aguarde enquanto nossa equipe revisa seu anúncio. Você será notificado assim que for aprovado ou se houver alguma pendência.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <PublishMarketplaceModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        editingListing={editingListing}
      />
    </div>
  )
}

