"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Package, Heart, Monitor, Sun, Moon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { AuthDialog } from "./auth-dialog"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function UserMenu() {
  const { user, signOut, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const router = useRouter()

  // Buscar dados do perfil quando user mudar
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("sellers")
        .select("avatar_url, name")
        .eq("user_id", user?.id)
        .single()

      if (!error && data) {
        setAvatarUrl(data.avatar_url)
        setUserName(data.name || "")
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err)
    }
  }

  // Pega a primeira letra do nome ou email
  const getUserInitial = () => {
    if (userName) return userName.charAt(0).toUpperCase()
    if (!user?.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    )
  }

  // Se não estiver logado
  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 bg-muted hover:bg-accent"
          onClick={() => setAuthDialogOpen(true)}
        >
          <User className="h-5 w-5" />
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    )
  }

  // Se estiver logado
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {avatarUrl ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 p-0 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-300 hover:shadow-lg overflow-hidden ring-2 ring-foreground"
          >
            <img
              src={avatarUrl}
              alt={userName || "Avatar"}
              className="w-full h-full object-cover"
            />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 bg-gradient-to-br from-primary to-accent text-white font-bold text-lg hover:text-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-300 hover:shadow-lg"
          >
            {getUserInitial()}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">Minha Conta</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => router.push("/perfil")}
        >
          <User className="mr-2 h-4 w-4 text-foreground" />
          <span className="text-foreground">Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => router.push("/salvos")}
        >
          <Heart className="mr-2 h-4 w-4 text-foreground" />
          <span className="text-foreground">Salvos</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => router.push("/meus-anuncios")}
        >
          <Package className="mr-2 h-4 w-4 text-foreground" />
          <span className="text-foreground">Minhas Postagens</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => {
            const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
            const currentIndex = themes.indexOf(theme)
            const nextTheme = themes[(currentIndex + 1) % themes.length]
            setTheme(nextTheme)
          }}
        >
          {theme === "light" && (
            <>
              <Sun className="mr-2 h-4 w-4 text-foreground" />
              <span className="text-foreground">Tema: Claro</span>
            </>
          )}
          {theme === "dark" && (
            <>
              <Moon className="mr-2 h-4 w-4 text-foreground" />
              <span className="text-foreground">Tema: Escuro</span>
            </>
          )}
          {theme === "system" && (
            <>
              <Monitor className="mr-2 h-4 w-4 text-foreground" />
              <span className="text-foreground">Tema: Automático</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4 text-red-600" />
          <span className="text-red-600">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
