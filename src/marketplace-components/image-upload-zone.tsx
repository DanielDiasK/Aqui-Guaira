"use client"

import { useState, useRef, DragEvent } from "react"
import { Upload, X, Plus, Image as ImageIcon, Move, Camera, Ruler, CheckCircle, AlertTriangle, Pin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadZoneProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUploadZone({ images, onImagesChange, maxImages = 6 }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingAddMore, setIsDraggingAddMore] = useState(false)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addMoreInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(Array.from(files))
    }
    // Limpar input para permitir re-upload
    e.target.value = ""
  }

  const processFiles = (files: File[]) => {
    const remainingSlots = maxImages - images.length

    if (remainingSlots <= 0) {
      alert(`Você já atingiu o limite de ${maxImages} imagens!`)
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      alert(`Você pode adicionar apenas mais ${remainingSlots} imagem(ns). Limite: ${maxImages} imagens no total.`)
    }

    const newImages: string[] = []
    let processedCount = 0

    filesToProcess.forEach((file) => {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} não é uma imagem válida!`)
        processedCount++
        if (processedCount === filesToProcess.length && newImages.length > 0) {
          onImagesChange([...images, ...newImages])
        }
        return
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande! Máximo: 5MB`)
        processedCount++
        if (processedCount === filesToProcess.length && newImages.length > 0) {
          onImagesChange([...images, ...newImages])
        }
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string)
        }
        processedCount++
        
        // Quando todos os arquivos forem processados, adicionar todas as imagens de uma vez
        if (processedCount === filesToProcess.length) {
          onImagesChange([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openAddMoreDialog = () => {
    addMoreInputRef.current?.click()
  }

  // =================== REORDENAR IMAGENS ===================
  const handleImageDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleImageDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()

    if (draggedImageIndex === null) return

    const newImages = [...images]
    const draggedImage = newImages[draggedImageIndex]

    // Remove da posição antiga
    newImages.splice(draggedImageIndex, 1)

    // Insere na nova posição
    newImages.splice(dropIndex, 0, draggedImage)

    onImagesChange(newImages)
    setDraggedImageIndex(null)
    setDragOverIndex(null)
  }

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null)
    setDragOverIndex(null)
  }

  // =================== DRAG & DROP "ADICIONAR MAIS" ===================
  const handleAddMoreDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingAddMore(true)
  }

  const handleAddMoreDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingAddMore(false)
  }

  const handleAddMoreDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingAddMore(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area - Só aparece quando NÃO tem imagens */}
      {images.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className={`w-8 h-8 text-primary ${isDragging ? 'animate-bounce' : ''}`} />
              </div>
              {isDragging && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </div>

            <div className="text-center">
              <p className="text-base font-semibold text-foreground mb-1 flex items-center justify-center gap-2">
                {isDragging ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Solte as imagens aqui!
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Clique ou arraste imagens
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Máximo {maxImages} imagens • JPG, PNG, GIF até 5MB
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Resolução recomendada: 1200x800px
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>
        </div>
      )}

      {/* Info Badges - Só aparecem quando TEM imagens */}
      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md border border-primary/20">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {images.length}/{maxImages} imagens
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-md border border-blue-200">
            <Ruler className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Recomendado: 1200x800px
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              JPG, PNG, GIF até 5MB
            </span>
          </div>

          {images.length >= maxImages && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-md border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                Limite atingido
              </span>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragLeave={handleImageDragLeave}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
              className={`
                relative group aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 bg-muted cursor-move
                ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}
                ${dragOverIndex === index ? 'border-primary border-4 scale-105' : 'border-border hover:border-primary'}
              `}
            >
              {/* Badge de Número */}
              <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                <Move className="w-3 h-3" />
                #{index + 1}
              </div>

              {/* Imagem */}
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Overlay com botão remover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge "Capa" na primeira imagem */}
              {index === 0 && (
                <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  Capa
                </div>
              )}

              {/* Indicador de Drag Over */}
              {dragOverIndex === index && draggedImageIndex !== index && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary animate-pulse pointer-events-none" />
              )}
            </div>
          ))}

          {/* Card "Adicionar Mais" - COM DRAG & DROP */}
          {images.length < maxImages && (
            <>
              <input
                ref={addMoreInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={openAddMoreDialog}
                onDragOver={handleAddMoreDragOver}
                onDragLeave={handleAddMoreDragLeave}
                onDrop={handleAddMoreDrop}
                className={`
                  aspect-video rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group
                  ${isDraggingAddMore
                    ? 'border-primary bg-primary/10 scale-105'
                    : 'border-border hover:border-primary hover:bg-primary/5'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isDraggingAddMore
                    ? 'bg-primary/30 scale-110'
                    : 'bg-primary/10 group-hover:bg-primary/20'
                  }
                `}>
                  {isDraggingAddMore ? (
                    <Upload className="w-6 h-6 text-primary animate-bounce" />
                  ) : (
                    <Plus className="w-6 h-6 text-primary" />
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  {isDraggingAddMore ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Solte aqui
                    </>
                  ) : (
                    'Adicionar mais'
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}

