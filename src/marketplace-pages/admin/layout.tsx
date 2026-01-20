"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminName, setAdminName] = useState("")
  const [loading, setLoading] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Se está na página de login, não verificar autenticação
    if (isLoginPage) {
      setLoading(false)
      return
    }

    // Verificar autenticação
    const adminData = localStorage.getItem('marketguaira_admin')
    
    if (!adminData) {
      router.push('/admin/login')
      return
    }

    try {
      const admin = JSON.parse(adminData)
      
      // Verificar se o token ainda é válido (menos de 24h)
      const loginTime = new Date(admin.loginTime).getTime()
      const now = new Date().getTime()
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60)
      
      if (hoursDiff >= 24) {
        localStorage.removeItem('marketguaira_admin')
        router.push('/admin/login')
        return
      }

      setAdminName(admin.name || admin.email)
      setLoading(false)
    } catch (err) {
      localStorage.removeItem('marketguaira_admin')
      router.push('/admin/login')
    }
  }, [router, isLoginPage])

  // Se está na página de login, renderizar sem layout
  if (isLoginPage) {
    return <>{children}</>
  }

  const handleLogout = () => {
    if (confirm("Deseja realmente sair do painel admin?")) {
      localStorage.removeItem('marketguaira_admin')
      router.push('/admin/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com info do admin */}
        <header className="border-b bg-card shadow-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {adminName}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

