"use client"

import { Menu, Search, User, Heart, Package, LogOut, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { PublishMarketplaceModal } from "./publish-marketplace-modal"
import { UserMenu } from "./user-menu"
import { useAuth } from "@/contexts/auth-context"
import { AuthDialog } from "./auth-dialog"
import { SearchDropdown } from "./search-dropdown"
import { SearchModalMobile } from "./search-modal-mobile"
import { LocationCard } from "./location-card"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/contexts/theme-context"

interface CategoryFilter {
  id: string
  name: string
  icon: string
}

interface HeaderProps {
  selectedCategory?: CategoryFilter | null
  onClearCategory?: () => void
  onSelectCategory?: (category: CategoryFilter) => void
}

export function Header({ selectedCategory, onClearCategory, onSelectCategory }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Carregar dados do perfil do usuário
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

  const getUserInitial = () => {
    if (userName) return userName.charAt(0).toUpperCase()
    if (!user?.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  const handlePublishClick = () => {
    if (!user) {
      setAuthDialogOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-white dark:bg-background">
        <div className="mx-auto max-w-full px-2 sm:px-4 lg:px-8">
          <div className="flex h-16 items-center justify-center gap-2 sm:gap-4">
            {/* Grupo centralizado com todos os elementos principais */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 max-w-[1400px] w-full justify-center">
              {/* Logo */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm sm:text-lg">
                  MG
                </div>
                <span className="hidden font-bold text-base sm:text-lg text-foreground sm:inline">MarketGuaira</span>
              </div>

              {/* Search Button Mobile - Entre logo e location */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="md:hidden flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-input border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-accent active:bg-gray-100 transition-colors min-w-0 h-10"
              >
                <Search className="h-3.5 w-3.5 text-gray-600 dark:text-foreground flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-muted-foreground truncate">Buscar...</span>
              </button>

              {/* Location Card Mobile */}
              <div className="md:hidden flex-shrink-0">
                <LocationCard />
              </div>

              {/* Search Area Desktop */}
              <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 max-w-[1000px]">
                <SearchDropdown selectedCategory={selectedCategory} onClearCategory={onClearCategory} onSelectCategory={onSelectCategory} />
                <div className="flex-shrink-0">
                  <LocationCard />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Button 
                  className="hidden sm:flex !bg-black !text-white hover:!bg-black/90 dark:!bg-white dark:!text-black dark:hover:!bg-white/90" 
                  onClick={handlePublishClick}
                >
                  Fazer Anúncio
                </Button>
                <div className="hidden sm:flex">
                  <UserMenu />
                </div>
                <Button variant="ghost" size="icon" className="md:hidden border-2 border-foreground dark:border-border rounded-lg hover:bg-gray-100 dark:hover:bg-accent" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="border-t border-border py-4 md:hidden">
              <div className="flex flex-col gap-3">
                {/* Avatar e Nome do Usuário */}
                {user && (
                  <div className="flex items-center gap-3 px-2 py-3 bg-muted/50 rounded-lg">
                    {avatarUrl ? (
                      <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary flex-shrink-0">
                        <img
                          src={avatarUrl}
                          alt={userName || "Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                        {getUserInitial()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {userName || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botões de Navegação quando logado */}
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11"
                      onClick={() => {
                        router.push("/perfil")
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className="h-4 w-4" />
                      <span>Meu Perfil</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11"
                      onClick={() => {
                        router.push("/salvos")
                        setIsMenuOpen(false)
                      }}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Salvos</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11"
                      onClick={() => {
                        router.push("/meus-anuncios")
                        setIsMenuOpen(false)
                      }}
                    >
                      <Package className="h-4 w-4" />
                      <span>Minhas Postagens</span>
                    </Button>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 h-11"
                      onClick={() => {
                        handlePublishClick()
                        setIsMenuOpen(false)
                      }}
                    >
                      Fazer Anúncio
                    </Button>

                    <div className="border-t border-border my-2"></div>

                    {/* Botão de Trocar Tema */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11"
                      onClick={() => {
                        if (theme === 'light') {
                          setTheme('dark')
                        } else if (theme === 'dark') {
                          setTheme('system')
                        } else {
                          setTheme('light')
                        }
                      }}
                    >
                      {theme === 'dark' ? (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Modo Escuro</span>
                        </>
                      ) : theme === 'light' ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Modo Claro</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Modo Automático</span>
                        </>
                      )}
                    </Button>

                    <div className="border-t border-border my-2"></div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 h-11"
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 h-11"
                      onClick={() => {
                        setAuthDialogOpen(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      Entrar
                    </Button>

                    <div className="border-t border-border my-2"></div>

                    {/* Botão de Trocar Tema */}
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 h-11"
                      onClick={() => {
                        if (theme === 'light') {
                          setTheme('dark')
                        } else if (theme === 'dark') {
                          setTheme('system')
                        } else {
                          setTheme('light')
                        }
                      }}
                    >
                      {theme === 'dark' ? (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Modo Escuro</span>
                        </>
                      ) : theme === 'light' ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Modo Claro</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Modo Automático</span>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <PublishMarketplaceModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <SearchModalMobile 
        open={searchModalOpen} 
        onOpenChange={setSearchModalOpen}
        selectedCategory={selectedCategory}
        onClearCategory={onClearCategory}
        onSelectCategory={onSelectCategory}
      />
    </>
  )
}
