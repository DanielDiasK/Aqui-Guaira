"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Tag,
  DollarSign,
  Search,
  Filter,
  Edit,
  Trash2,
  MapPin
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
  is_active: boolean
  user_id: string
  user_email: string
  user_name: string
  category_name: string
  images: string[]
  rejection_reason: string | null
  city?: string
  state?: string
}

export default function AdminPendentes() {
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    selectedBadges: [] as string[]
  })
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])
  const [allBadges, setAllBadges] = useState<Array<{ id: string, name: string }>>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadAllListings()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

      setCategories(data || [])
    } catch (err) {
      console.error("Erro ao carregar categorias:", err)
    }
  }

  useEffect(() => {
    filterListings()
  }, [searchQuery, statusFilter, allListings])

  const loadAllListings = async () => {
    try {
      console.log("📊 Carregando todos os anúncios...")

      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          user_profiles!listings_user_id_fkey (
            email,
            full_name
          ),
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Erro ao carregar anúncios:", error)
        return
      }

      console.log(`📦 ${data?.length || 0} anúncios encontrados`)
      console.log("Status dos anúncios:", data?.map(l => ({ title: l.title, status: l.status, is_active: l.is_active })))

      // Buscar imagens para cada listing
      const listingsWithImages = await Promise.all(
        (data || []).map(async (listing) => {
          const { data: images } = await supabase
            .from("listing_images")
            .select("image_url")
            .eq("listing_id", listing.id)
            .order("display_order")

          return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            created_at: listing.created_at,
            status: listing.status || 'approved',
            is_active: listing.is_active,
            user_id: listing.user_id,
            user_email: listing.user_profiles?.email || "Sem email",
            user_name: listing.user_profiles?.full_name || "Sem nome",
            category_name: listing.categories?.name || "Sem categoria",
            images: images?.map(img => img.image_url) || [],
            rejection_reason: listing.rejection_reason,
            city: listing.city,
            state: listing.state
          }
        })
      )

      console.log("✅ Anúncios processados:", listingsWithImages.length)
      setAllListings(listingsWithImages)
      setFilteredListings(listingsWithImages)
    } catch (err) {
      console.error("❌ Erro:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterListings = () => {
    let filtered = [...allListings]

    // Filtro de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.user_email.toLowerCase().includes(query) ||
        listing.user_name.toLowerCase().includes(query)
      )
    }

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(listing => listing.status === statusFilter)
    }

    setFilteredListings(filtered)
  }

  const handleApprove = async (listingId: string) => {
    if (!confirm("Aprovar este anúncio?")) return

    setProcessing(true)
    try {
      console.log("🟢 Aprovando anúncio:", listingId)

      const { error } = await supabase
        .rpc('approve_listing', { listing_id: listingId })

      if (error) {
        console.error("❌ Erro ao aprovar:", error)
        alert("Erro ao aprovar anúncio: " + error.message)
        return
      }

      console.log("✅ Anúncio aprovado! Recarregando lista...")
      alert("Anúncio aprovado com sucesso! ✅")
      await loadAllListings()
      console.log("✅ Lista recarregada!")
    } catch (err: any) {
      console.error("❌ Erro:", err)
      alert("Erro ao aprovar anúncio: " + (err.message || "Erro desconhecido"))
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectClick = (listing: Listing) => {
    setSelectedListing(listing)
    setRejectDialogOpen(true)
    setRejectReason("")
  }

  const handleReject = async () => {
    if (!selectedListing) return
    if (!rejectReason.trim()) {
      alert("Por favor, informe o motivo da rejeição")
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .rpc('reject_listing', {
          listing_id: selectedListing.id,
          reason: rejectReason
        })

      if (error) {
        console.error("Erro ao rejeitar:", error)
        alert("Erro ao rejeitar anúncio")
        return
      }

      alert("Anúncio rejeitado!")
      setRejectDialogOpen(false)
      setSelectedListing(null)
      loadAllListings()
    } catch (err) {
      console.error("Erro:", err)
      alert("Erro ao rejeitar anúncio")
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente o anúncio:\n\n"${title}"?\n\nEsta ação não pode ser desfeita!`)) {
      return
    }

    setProcessing(true)
    try {
      // Primeiro deletar as imagens associadas
      await supabase
        .from("listing_images")
        .delete()
        .eq("listing_id", listingId)

      // Depois deletar os badges associados
      await supabase
        .from("listing_badges")
        .delete()
        .eq("listing_id", listingId)

      // Por fim, deletar o listing
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId)

      if (error) {
        console.error("Erro ao excluir:", error)
        alert("Erro ao excluir anúncio: " + error.message)
        return
      }

      alert("Anúncio excluído com sucesso! 🗑️")
      loadAllListings()
    } catch (err: any) {
      console.error("Erro:", err)
      alert("Erro ao excluir anúncio: " + (err.message || "Erro desconhecido"))
    } finally {
      setProcessing(false)
    }
  }

  const handleEditClick = async (listing: Listing) => {
    setEditingId(listing.id)

    // Buscar categoria_id atual
    const { data: listingData } = await supabase
      .from("listings")
      .select("category_id")
      .eq("id", listing.id)
      .single()

    setEditFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      category_id: listingData?.category_id || ""
    })
    setEditDialogOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingId) return

    if (!editFormData.title.trim()) {
      alert("Por favor, preencha o título")
      return
    }

    if (!editFormData.price || parseFloat(editFormData.price) <= 0) {
      alert("Por favor, informe um preço válido")
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: editFormData.title,
          description: editFormData.description,
          price: parseFloat(editFormData.price),
          category_id: editFormData.category_id || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingId)

      if (error) {
        console.error("Erro ao atualizar:", error)
        alert("Erro ao salvar alterações")
        return
      }

      alert("Anúncio atualizado com sucesso! ✅")
      setEditDialogOpen(false)
      setEditingId(null)
      loadAllListings()
    } catch (err) {
      console.error("Erro:", err)
      alert("Erro ao salvar alterações")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pendente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
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
          Gerenciar Anúncios
        </h1>
        <p className="text-muted-foreground">
          {filteredListings.length} anúncio(s) encontrado(s) de {allListings.length} total
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição, email ou nome do usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </Card>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Nenhum anúncio encontrado
          </h3>
          <p className="text-muted-foreground">
            Tente ajustar seus filtros ou termo de busca.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Image */}
                <div className="w-full md:w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground line-clamp-1">
                          {listing.title}
                        </h3>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {listing.category_name || "Sem categoria"}
                        </Badge>
                        <Badge variant="outline" className="gap-1 bg-blue-50">
                          <User className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600">
                            {listing.user_name || listing.user_email}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(listing.created_at).toLocaleDateString("pt-BR")}
                        </Badge>
                        {listing.city && listing.state && (
                          <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                            <MapPin className="h-3 w-3" />
                            {listing.city}, {listing.state}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                      <DollarSign className="h-6 w-6" />
                      R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/anuncio/${listing.id}`, '_blank')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>

                      {/* Botões de status - só mostrar se não for o status atual */}
                      {listing.status !== 'approved' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(listing.id)}
                          disabled={processing}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                      )}

                      {listing.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRejectClick(listing)}
                          disabled={processing}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      )}

                      {/* Botão Editar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(listing)}
                        disabled={processing}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>

                      {/* Botão Excluir */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(listing.id, listing.title)}
                        disabled={processing}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Anúncio</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no anúncio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Título *
              </label>
              <Input
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Ex: iPhone 15 Pro 256GB"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descrição
              </label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Preço (R$) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                placeholder="Ex: 1500.00"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Categoria
              </label>
              <Select
                value={editFormData.category_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={processing || !editFormData.title.trim() || !editFormData.price}
            >
              {processing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O usuário receberá esta mensagem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedListing && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium text-foreground">{selectedListing.title}</p>
                <p className="text-sm text-muted-foreground">
                  por {selectedListing.user_name || selectedListing.user_email}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Motivo da Rejeição *
              </label>
              <Textarea
                placeholder="Ex: Imagens inadequadas, preço fora do padrão, descrição incompleta..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectReason.trim()}
            >
              {processing ? "Rejeitando..." : "Rejeitar Anúncio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

