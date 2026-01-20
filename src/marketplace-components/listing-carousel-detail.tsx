"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { enhanceImagesQuality } from "@/lib/image-utils"

interface ListingCarouselDetailProps {
  images: string[]
  title: string
  onIndexChange?: (index: number) => void
}

export function ListingCarouselDetail({ images, title, onIndexChange }: ListingCarouselDetailProps) {
  const enhancedImages = enhanceImagesQuality(images)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    onIndexChange?.(newIndex)
  }

  const handleSetIndex = (index: number) => {
    setCurrentIndex(index)
    onIndexChange?.(index)
  }

  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return

    const timer = setInterval(goToNext, 5000)
    return () => clearInterval(timer)
  }, [images.length, isAutoPlay, currentIndex])

  if (!images.length) return null

  return (
    <div
      className="relative w-full h-full bg-muted overflow-hidden select-none"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Images */}
      <div className="relative w-full h-full">
        {enhancedImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - ${index + 1}`}
            className={`absolute w-full h-full object-contain transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            draggable={false}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsAutoPlay(false)
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsAutoPlay(false)
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all hover:scale-110 shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicators (Bolinhas) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/30 px-4 py-2.5 rounded-full backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAutoPlay(false)
                  handleSetIndex(index)
                }}
                className={`h-2.5 rounded-full transition-all hover:scale-110 ${
                  index === currentIndex ? "bg-white w-8" : "bg-white/60 w-2.5 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
