"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { enhanceImagesQuality } from "@/lib/image-utils"
import { isListingSaved, saveListing, unsaveListing } from "@/lib/storage"

interface ListingCarouselProps {
  images: string[]
  title: string
  listingId: string
}

export function ListingCarousel({ images, title, listingId }: ListingCarouselProps) {
  const enhancedImages = enhanceImagesQuality(images)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar se está favoritado ao carregar
  useEffect(() => {
    const checkFavorite = async () => {
      const saved = await isListingSaved(listingId)
      setIsFavorited(saved)
    }
    checkFavorite()
  }, [listingId])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFavorited) {
        const success = await unsaveListing(listingId)
        if (success) {
          setIsFavorited(false)
        }
      } else {
        const success = await saveListing(listingId)
        if (success) {
          setIsFavorited(true)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!images.length) return null

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden select-none">
      {/* Single Image - Fixed Cover */}
      <img
        src={enhancedImages[0]}
        alt={title}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 transition-all hover:scale-110 shadow-lg z-20"
      >
        <Heart 
          className={`h-4 w-4 transition-all ${
            isFavorited 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-700 dark:text-white'
          }`}
        />
      </button>
    </div>
  )
}
