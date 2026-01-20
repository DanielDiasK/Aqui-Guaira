"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  BarChart,
  FolderTree,
  Flag,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Anúncios",
    icon: Clock,
    href: "/admin/pendentes",
  },
  {
    title: "Diferenciais",
    icon: CheckCircle,
    href: "/admin/diferenciais",
  },
  {
    title: "Categorias",
    icon: FolderTree,
    href: "/admin/categorias",
  },
  {
    title: "Denúncias",
    icon: Flag,
    href: "/admin/denuncias",
  },
  {
    title: "Usuários",
    icon: Users,
    href: "/admin/usuarios",
  },
  {
    title: "Administradores",
    icon: Shield,
    href: "/admin/admins",
  },
  {
    title: "Estatísticas",
    icon: BarChart,
    href: "/admin/estatisticas",
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/admin/configuracoes",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const getUserInitial = () => {
    if (!user?.email) return "A"
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-card border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold ring-2 ring-border">
            MG
          </div>
          <div>
            <h2 className="font-bold text-foreground">MarketGuaira</h2>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm ring-2 ring-border">
            {getUserInitial()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Admin
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            signOut()
            router.push("/")
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

