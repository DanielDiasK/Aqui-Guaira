import { Building2, Home, FileText, Settings, BarChart3, Heart, Image, Info, ChevronDown, User, LogOut, Shield, ClipboardList, Menu, X, Search, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LoginDialog } from "@/components/LoginDialog";
import { getUsuarioLogado, logout, supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Header = () => {
  const location = useLocation();
  const [active, setActive] = useState<string>("Início");
  const manualOverride = useRef(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(getUsuarioLogado());

  const mainNavItems = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Info, label: "Sobre Guaíra", href: "/#sobre-guaira" },
    { icon: Image, label: "Mural", href: "/mural" },
    { icon: Building2, label: "Empresas", href: "/empresas" },
    { icon: Heart, label: "Meus Locais", href: "/meus-locais" },
    { icon: FileText, label: "Sua Empresa", href: "/sua-empresa" },
  ];

  const ferramentasItems = [
    { icon: Search, label: "Busca CEP", href: "https://busca-cep-raval.vercel.app/" },
    { icon: FileText, label: "Gerador de Currículo", href: "https://cria-curriculo-raval.vercel.app/" },
  ];

  // Atualiza active baseado em pathname/hash
  useEffect(() => {
    const { pathname, hash } = location;
    if (pathname === "/mural") {
      setActive("Mural");
      return;
    }
    if (pathname === "/empresas") {
      setActive("Empresas");
      return;
    }
    if (pathname === "/meus-locais") {
      setActive("Meus Locais");
      return;
    }
    if (hash === "#sobre-guaira") {
      setActive("Sobre Guaíra");
      return;
    }
    if (pathname === "/sua-empresa") {
      setActive("Sua Empresa");
      return;
    }
    if (pathname === "/") {
      // Scroll listener para alternar entre Início e Sobre Guaíra
      const onScroll = () => {
        // Se usuário acabou de clicar em Sobre, evita troca imediata para Início enquanto rola
        if (manualOverride.current) {
          // Cancela override quando passa da região ou se está no topo novamente
          if (window.scrollY < 60) {
            manualOverride.current = false;
          }
        }
        const sobreEl = document.getElementById("sobre-guaira");
        if (sobreEl) {
          const rect = sobreEl.getBoundingClientRect();
          // Quando topo do card entra um pouco na viewport, ativa Sobre (se não está em override para Início)
          if (rect.top <= 140 && rect.bottom > 180) {
            if (!manualOverride.current) {
              setActive("Sobre Guaíra");
            }
            return;
          }
        }
        // Caso contrário, se perto do topo, ativa Início
        if (window.scrollY < 140 && !manualOverride.current) {
          setActive("Início");
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }
    // Fallback
    setActive("Início");
  }, [location]);

  const handleLogout = () => {
    logout();
    setUser(null);
    toast.success('Logout realizado');
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setUser(getUsuarioLogado());
  };

  // Obter inicial do email
  const getInitial = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-[1000] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aqui Guaíra</h1>
              <p className="text-xs text-muted-foreground">Portal da Cidade</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* User Avatar Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-border bg-background hover:border-primary transition-colors">
                  {user ? (
                    <span className="font-semibold text-xs">{getInitial()}</span>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-[1001]">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user.nome || 'Usuário'}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/mural/meus-posts" className="flex items-center cursor-pointer">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Meus Posts
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => setShowLogin(true)} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.label;
                    const isSuaEmpresa = item.label === "Sua Empresa";
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive 
                            ? isSuaEmpresa 
                              ? 'bg-green-600 text-white' 
                              : 'bg-primary text-primary-foreground'
                            : isSuaEmpresa
                              ? 'hover:bg-green-50 text-green-600 border border-green-200'
                              : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSuaEmpresa && !isActive ? 'text-green-600' : ''}`} />
                        <span className={`font-medium ${isSuaEmpresa ? 'font-semibold' : ''}`}>{item.label}</span>
                      </a>
                    );
                  })}
                  
                  <div className="my-2 border-t border-border" />
                  
                  <a
                    href="/marketplace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors shadow-md"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-semibold">Marketplace</span>
                  </a>
                  
                  <div className="my-2 border-t border-border" />
                  
                  {ferramentasItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label;
              const isSuaEmpresa = item.label === "Sua Empresa";
              const baseVariant = isActive ? "animated" : "ghost";
              // Se for Sua Empresa ativa, força fundo verde sólido com texto branco.
              const suaEmpresaActiveClasses = isSuaEmpresa && isActive
                ? "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white"
                : isSuaEmpresa
                  ? "empresa-btn border border-green-500 text-green-600 hover:text-green-600 hover:bg-transparent focus-visible:text-green-600"
                  : "";
              return (
                <Button
                  key={item.label}
                  variant={isSuaEmpresa && isActive ? "ghost" : baseVariant}
                  size="sm"
                  className={"gap-2 " + suaEmpresaActiveClasses}
                  asChild
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.label === "Início" && window.location.pathname === "/") {
                        e.preventDefault();
                        manualOverride.current = true;
                        setActive("Início");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setTimeout(() => { manualOverride.current = false; }, 600);
                      } else if (item.label === "Sobre Guaíra" && window.location.pathname === "/") {
                        e.preventDefault();
                        const el = document.getElementById("sobre-guaira");
                        if (el) {
                          manualOverride.current = true;
                          const target = el.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top: target, behavior: "smooth" });
                          setActive("Sobre Guaíra");
                          setTimeout(() => { manualOverride.current = false; }, 1100);
                        }
                      }
                    }}
                  >
                    <Icon className={"h-4 w-4 " + (isSuaEmpresa && isActive ? "text-white" : isActive ? "animate-soft-glow" : isSuaEmpresa ? "text-green-600" : "")} />
                    <span className={"text-sm " + (isSuaEmpresa ? "font-semibold" : "")}>{item.label}</span>
                  </a>
                </Button>
              );
            })}

            {/* Ferramentas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 empresa-btn border border-green-500 text-green-600 hover:text-green-600 hover:bg-transparent focus-visible:text-green-600">
                  <span className="text-sm font-semibold">Ferramentas</span>
                  <ChevronDown className="h-4 w-4 text-green-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border z-[1001]">
                {ferramentasItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.label} asChild>
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 cursor-pointer">
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{item.label}</span>
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:text-white border-0 shadow-md"
              asChild
            >
              <a href="/marketplace">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-semibold">Marketplace</span>
              </a>
            </Button>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-border bg-background hover:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  {user ? (
                    <span className="font-semibold text-sm">{getInitial()}</span>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-[1001]">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user.nome || 'Usuário'}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/mural/meus-posts" className="flex items-center cursor-pointer">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Meus Posts
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => setShowLogin(true)} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Entrar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      {/* Dialog de Login */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;
