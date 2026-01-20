"use client"

import { useState, useEffect } from "react"
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  initialIndex?: number
}

export function ImageViewerModal({ open, onOpenChange, images, initialIndex = 0 }: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [initialIndex, open])

  useEffect(() => {
    // Reset zoom e position ao trocar de imagem
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1)
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          onOpenChange(false)
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-full sm:max-w-[90vw] sm:max-h-[90vh] m-0 sm:m-auto p-0 border-0 sm:border rounded-none sm:rounded-2xl max-h-screen bg-black/95 overflow-hidden">
        <DialogTitle className="sr-only">Visualizar imagens</DialogTitle>
        
        {/* Header com controles */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-white text-base sm:text-lg font-semibold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
                title="Diminuir zoom (-)"
              >
                <ZoomOut className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <span className="text-white text-base sm:text-lg font-semibold min-w-[70px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/20 h-10 w-10 sm:h-12 sm:w-12"
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>

            {/* Botão Fechar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-red-500/80 bg-black/40 h-12 w-12 sm:h-14 sm:w-14 rounded-full backdrop-blur-sm transition-all"
              title="Fechar (ESC)"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
          </div>
        </div>

        {/* Área da Imagem */}
        <div 
          className={`w-full h-full flex items-center justify-center overflow-hidden ${zoom > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
            className="relative max-w-full max-h-full"
          >
            <img
              src={images[currentIndex]}
              alt={`Imagem ${currentIndex + 1}`}
              className="max-w-[95vw] max-h-[85vh] sm:w-full sm:h-full sm:max-w-none sm:max-h-none object-contain sm:object-cover select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Navegação - Setas */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 bg-black/40 backdrop-blur-sm h-14 w-14 sm:h-16 sm:w-16 rounded-full z-50 transition-all hover:scale-110"
              title="Anterior (←)"
            >
              <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 bg-black/40 backdrop-blur-sm h-14 w-14 sm:h-16 sm:w-16 rounded-full z-50 transition-all hover:scale-110"
              title="Próxima (→)"
            >
              <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
            </Button>
          </>
        )}

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent max-w-5xl mx-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-3 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110 shadow-xl shadow-white/20'
                      : 'border-white/30 hover:border-white/70 hover:scale-105'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
