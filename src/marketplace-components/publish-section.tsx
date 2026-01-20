"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Upload } from "lucide-react"

interface PublishFormData {
  title: string
  description: string
  category: string
  price: string
  images: string[]
  seller: { name: string; rating: number; reviews: number }
  badges: string[]
}

const CATEGORIES = [
  "Veículos - Carros",
  "Veículos - Motos",
  "Veículos - Peças",
  "Eletrônicos",
  "Moda",
  "Casa",
  "Alimentação",
  "Atacado",
  "Esportes",
  "Sustentabilidade",
]

const AVAILABLE_BADGES = [
  "Aceita Troca",
  "Financiamento",
  "Entrega Rápida",
  "Garantia Estendida",
  "Histórico Completo",
  "Inspeção",
  "Garantia 12 Meses",
]

export function PublishSection({ onListingPublished }: { onListingPublished: () => void }) {
  const [formData, setFormData] = useState<PublishFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    images: [],
    seller: { name: "", rating: 5, reviews: 0 },
    badges: [],
  })

  const [isOpen, setIsOpen] = useState(false)

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleBadgeToggle = (badge: string) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge) ? prev.badges.filter((b) => b !== badge) : [...prev.badges, badge],
    }))
  }

  const handlePublish = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.price ||
      formData.images.length === 0
    ) {
      alert("Preencha todos os campos obrigatórios com pelo menos 1 imagem")
      return
    }

    const { addListing } = await import("@/lib/storage")

    const result = await addListing({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      images: formData.images,
      seller: formData.seller,
      badges: formData.badges.slice(0, 3),
      views: 0,
    })

    if (result) {
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        images: [],
        seller: { name: "", rating: 5, reviews: 0 },
        badges: [],
      })
      setIsOpen(false)
      onListingPublished()
      alert("Anúncio publicado com sucesso!")
    } else {
      alert("Erro ao publicar anúncio. Verifique sua conexão com o Supabase.")
    }
  }

  if (!isOpen) {
    return (
      <div className="px-4 py-12 bg-gradient-to-b from-background to-muted">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-card p-8 text-center">
            <Plus className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-xl font-bold text-foreground mb-2">Venda para toda Guaíra!</h3>
            <p className="text-muted-foreground mb-6">Anuncie grátis e alcance milhares de guairenses. Simples, rápido e seguro.</p>
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Novo Anúncio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg w-full max-w-2xl my-8">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background">
          <h2 className="text-2xl font-bold text-foreground">Publicar Anúncio</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: BMW X3 2021 Branca - Seminova"
              className="bg-muted border-border"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Categoria *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground"
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Preço (R$) *</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              className="bg-muted border-border"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Descrição *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhes sobre seu produto..."
              rows={4}
              className="bg-muted border-border"
            />
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Imagens *</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border"
                >
                  <img src={img || "/placeholder.svg"} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleImageRemove(idx)}
                    className="absolute top-1 right-1 bg-destructive/90 p-1 rounded hover:bg-destructive text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.images.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex items-center justify-center cursor-pointer transition-colors bg-muted/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input type="file" accept="image/*" onChange={handleImageAdd} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Máximo 5 imagens. Clique em uma para remover.</p>
          </div>

          {/* Seller Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Seu Nome *</label>
              <Input
                value={formData.seller.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seller: { ...prev.seller, name: e.target.value },
                  }))
                }
                placeholder="João Silva"
                className="bg-muted border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Rating (0-5)</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.seller.rating}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seller: { ...prev.seller, rating: Number.parseFloat(e.target.value) },
                  }))
                }
                className="bg-muted border-border"
              />
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Badges (máx 3)</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_BADGES.map((badge) => (
                <button
                  key={badge}
                  onClick={() => handleBadgeToggle(badge)}
                  disabled={formData.badges.length >= 3 && !formData.badges.includes(badge)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${formData.badges.includes(badge)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border bg-background">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handlePublish} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Publicar Anúncio
          </Button>
        </div>
      </div>
    </div>
  )
}
