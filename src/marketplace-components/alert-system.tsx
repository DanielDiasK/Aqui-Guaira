"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

export type AlertType = "success" | "error" | "warning" | "info"

interface Alert {
  id: string
  type: AlertType
  title?: string
  message: string
  duration?: number
}

interface AlertContextType {
  alerts: Alert[]
  showAlert: (type: AlertType, message: string, title?: string, duration?: number) => void
  removeAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const showAlert = (type: AlertType, message: string, title?: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    setAlerts((prev) => [...prev, { id, type, message, title, duration }])
    
    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      }, duration)
    }
  }

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

// Hook facilitador
export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider")
  }

  return {
    success: (message: string, title = "Sucesso!") => context.showAlert("success", message, title),
    error: (message: string, title = "Erro!") => context.showAlert("error", message, title),
    warning: (message: string, title = "Atenção!") => context.showAlert("warning", message, title),
    info: (message: string, title = "Informação") => context.showAlert("info", message, title),
  }
}

// Componente de exibição
export function AlertContainer() {
  const context = useContext(AlertContext)
  if (!context) return null

  const { alerts, removeAlert } = context

  const getBgColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    }
  }

  const getTextColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "text-green-900 dark:text-green-100"
      case "error":
        return "text-red-900 dark:text-red-100"
      case "warning":
        return "text-orange-900 dark:text-orange-100"
      case "info":
        return "text-blue-900 dark:text-blue-100"
    }
  }

  const getIconColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "error":
        return "text-red-600 dark:text-red-400"
      case "warning":
        return "text-orange-600 dark:text-orange-400"
      case "info":
        return "text-blue-600 dark:text-blue-400"
    }
  }

  const getIcon = (type: AlertType) => {
    const iconClass = `h-5 w-5 ${getIconColor(type)}`
    switch (type) {
      case "success":
        return <CheckCircle className={iconClass} />
      case "error":
        return <XCircle className={iconClass} />
      case "warning":
        return <AlertCircle className={iconClass} />
      case "info":
        return <Info className={iconClass} />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getBgColor(
            alert.type
          )} border-2 rounded-lg p-4 shadow-lg animate-in slide-in-from-right fade-in duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{getIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              {alert.title && (
                <h4 className={`font-semibold mb-1 ${getTextColor(alert.type)}`}>
                  {alert.title}
                </h4>
              )}
              <p className={`text-sm ${getTextColor(alert.type)}`}>{alert.message}</p>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className={`flex-shrink-0 ${getTextColor(alert.type)} opacity-50 hover:opacity-100 transition-opacity`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
