import {
  Building2, Home, FileText, Settings, BarChart3, Heart,
  Image, Info, ChevronDown, User, LogOut, Shield,
  ClipboardList, Menu, X, Search, ShoppingBag,
  Map, PawPrint, Pill, Stethoscope, AlertTriangle, GraduationCap,
  ChevronLeft, ChevronRight, Sun, Moon, Monitor, Laptop
} from "lucide-react";
import { useTheme } from "next-themes";
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
  const [active, setActive] = useState<string>("");
  const manualOverride = useRef(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(getUsuarioLogado());
  const { theme, setTheme } = useTheme();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const mainNavItems = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Info, label: "Sobre Guaíra", href: "/#sobre-guaira" },
    { icon: Image, label: "Mural", href: "/mural" },
    { icon: Building2, label: "Empresas", href: "/empresas" },
    { icon: Heart, label: "Meus Locais", href: "/meus-locais" },
    { icon: FileText, label: "Sua Empresa", href: "/sua-empresa" },
  ];

  const quickLinks = [
    { label: "Painel da Cidade", sub: "Acesse", icon: Building2, path: "/painel-cidade", textColor: "text-blue-600" },
    { label: "Serviços por Bairro", sub: "Veja", icon: Map, path: "/servicos-por-bairro", textColor: "text-purple-600" },
    { label: "Achados e Perdidos", sub: "Consulte", icon: Search, path: "/achados-perdidos", textColor: "text-orange-600" },
    { label: "Pets e Adoção", sub: "Ajude", icon: PawPrint, path: "/pets-perdidos", textColor: "text-pink-600" },
    { label: "Farmácia Plantão", sub: "Veja", icon: Pill, path: "/farmacia-plantao", textColor: "text-red-600" },
    { label: "Saúde na Prática", sub: "Acesse", icon: Stethoscope, path: "/saude-na-pratica", textColor: "text-emerald-600" },
    { label: "Ocorrências", sub: "Registre", icon: AlertTriangle, path: "#", textColor: "text-amber-600" },
    { label: "Escolas e Creches", sub: "Encontre", icon: GraduationCap, path: "/escolas-creches", textColor: "text-cyan-600" },
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
      const onScroll = () => {
        if (manualOverride.current) {
          if (window.scrollY < 60) {
            manualOverride.current = false;
          }
        }
        const sobreEl = document.getElementById("sobre-guaira");
        if (sobreEl) {
          const rect = sobreEl.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom > 180) {
            if (!manualOverride.current) {
              setActive("Sobre Guaíra");
            }
            return;
          }
        }
        if (window.scrollY < 140 && !manualOverride.current) {
          setActive("Início");
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }
    setActive("");
  }, [location]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
      setTimeout(checkScroll, 100);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    toast.success('Logout realizado');
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setUser(getUsuarioLogado());
  };

  const getInitial = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-[1000] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aqui Guaíra</h1>
              <p className="text-xs text-muted-foreground">Portal da Cidade</p>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-border bg-background hover:border-primary transition-colors focus:outline-none">
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
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest pl-1">Tema</span>
                </div>
                <div className="flex gap-1 px-2 pb-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('light')}
                    title="Claro"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('dark')}
                    title="Escuro"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('system')}
                    title="Sistema"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
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

          <nav className="hidden lg:flex items-center gap-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label;
              const isSuaEmpresa = item.label === "Sua Empresa";
              const baseVariant = isActive ? "default" : "ghost";
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

            <Button
              variant="default"
              size="sm"
              className="gap-2 shadow-sm"
              asChild
            >
              <a href="/marketplace">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-semibold">Marketplace</span>
              </a>
            </Button>

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
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest pl-1">Tema</span>
                </div>
                <div className="flex gap-1 px-2 pb-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('light')}
                    title="Claro"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('dark')}
                    title="Escuro"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setTheme('system')}
                    title="Sistema"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>

      <div className="border-t border-border bg-background overflow-hidden relative">
        <div className="container mx-auto px-4 relative group/subheader">
          {showLeftArrow && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary border border-primary text-white hover:bg-primary/90 hidden lg:flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto no-scrollbar py-3 gap-4 scroll-smooth px-10 md:px-12"
          >
            {quickLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.path}
                  className="flex-shrink-0 flex items-center gap-2.5 p-2 px-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-secondary/50 border border-border/50 ${item.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-60 leading-none mb-0.5">{item.sub}</span>
                    <span className="text-xs font-bold whitespace-nowrap leading-none">{item.label}</span>
                  </div>
                </a>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary border border-primary text-white hover:bg-primary/90 hidden lg:flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;
