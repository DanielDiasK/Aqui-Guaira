"use client"

import { useState, createContext, useContext, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogData {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  requireInput?: string
  inputPlaceholder?: string
  type?: "danger" | "warning" | "info"
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmDialogContextType {
  isOpen: boolean
  data: ConfirmDialogData | null
  showConfirm: (data: ConfirmDialogData) => void
  closeConfirm: () => void
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ConfirmDialogData | null>(null)

  const showConfirm = (confirmData: ConfirmDialogData) => {
    setData(confirmData)
    setIsOpen(true)
  }

  const closeConfirm = () => {
    setIsOpen(false)
    setData(null)
  }

  return (
    <ConfirmDialogContext.Provider value={{ isOpen, data, showConfirm, closeConfirm }}>
      {children}
    </ConfirmDialogContext.Provider>
  )
}

// Hook facilitador
export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider")
  }

  return {
    confirm: (
      message: string,
      onConfirm: () => void,
      options?: {
        title?: string
        confirmText?: string
        cancelText?: string
        requireInput?: string
        type?: "danger" | "warning" | "info"
      }
    ) => {
      context.showConfirm({
        title: options?.title || "Confirmar ação",
        message,
        confirmText: options?.confirmText || "Confirmar",
        cancelText: options?.cancelText || "Cancelar",
        requireInput: options?.requireInput,
        type: options?.type || "warning",
        onConfirm,
      })
    },
  }
}

// Componente de exibição
export function ConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) return null

  const { isOpen, data, closeConfirm } = context
  const [inputValue, setInputValue] = useState("")

  const handleConfirm = () => {
    if (data?.requireInput && inputValue !== data.requireInput) {
      return
    }
    data?.onConfirm()
    closeConfirm()
    setInputValue("")
  }

  const handleCancel = () => {
    data?.onCancel?.()
    closeConfirm()
    setInputValue("")
  }

  if (!data) return null

  const getButtonVariant = () => {
    if (data.type === "danger") return "destructive"
    return "default"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {data.type === "danger" && (
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
            {data.type === "warning" && (
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl">{data.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base mt-4">
            {data.message}
          </DialogDescription>
        </DialogHeader>

        {data.requireInput && (
          <div className="space-y-2 my-4">
            <Label htmlFor="confirm-input">
              Digite <span className="font-mono font-bold">{data.requireInput}</span> para confirmar:
            </Label>
            <Input
              id="confirm-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={data.inputPlaceholder || data.requireInput}
              className="font-mono"
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            {data.cancelText || "Cancelar"}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={data.requireInput ? inputValue !== data.requireInput : false}
          >
            {data.confirmText || "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
