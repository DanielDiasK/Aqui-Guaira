"use client"

import { X, Star, Shield, Share2, Heart, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListingCarousel } from "./listing-carousel"
import type { Listing } from "@/lib/storage"

interface ListingDetailModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
}

export function ListingDetailModal({ listing, isOpen, onClose }: ListingDetailModalProps) {
  if (!isOpen) return null

  const badgeColors: Record<string, string> = {
    Verificado: "bg-blue-100 text-blue-800 border-blue-200",
    "Aceita Troca": "bg-green-100 text-green-800 border-green-200",
    Financiamento: "bg-purple-100 text-purple-800 border-purple-200",
    "Entrega Rápida": "bg-orange-100 text-orange-800 border-orange-200",
    "Garantia Estendida": "bg-red-100 text-red-800 border-red-200",
    "Histórico Completo": "bg-cyan-100 text-cyan-800 border-cyan-200",
    Inspeção: "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Garantia 12 Meses": "bg-amber-100 text-amber-800 border-amber-200",
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background z-10">
          <h2 className="text-2xl font-bold text-foreground line-clamp-1">{listing.title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Gallery */}
          <ListingCarousel images={listing.images} title={listing.title} />

          {/* Main Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Price & Category */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-muted-foreground">{listing.category}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {listing.badges.map((badge) => (
                  <Badge
                    key={badge}
                    className={`border ${badgeColors[badge] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            </div>

            {/* Seller Card */}
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4 bg-card space-y-4">
                <div>
                  <h4 className="font-bold text-foreground mb-1">{listing.seller.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">{listing.seller.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({listing.seller.reviews} avaliações)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views} visualizações</span>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                  Entrar em Contato
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Heart className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>

                <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span>Publicado em {new Date(listing.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p>Compre com segurança no MarketGuaira</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
