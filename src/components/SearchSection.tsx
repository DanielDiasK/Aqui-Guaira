/*
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                   🔍 BUSCA RÁPIDA DE EMPRESAS - HOMEPAGE                      ║
║                                                                               ║
║  Este componente aparece na PÁGINA INICIAL (Index.tsx)                       ║
║  Funcionalidades:                                                             ║
║  - Barra de busca com autocomplete                                            ║
║  - Botão "Meus Favoritos"                                                     ║
║  - Dropdown "Por Categoria" (20 categorias hierárquicas)                     ║
║                                                                               ║
║  ⚠️  NÃO CONFUNDIR COM: src/pages/Empresas.tsx (página completa)             ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
*/

import { Search, Heart, Building2, MapPin, Star, ChevronDown, Filter, X, Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { buscarEmpresas, type EmpresaCompleta, getUsuarioLogado } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import categoriasData from '@/data/categorias-empresas.json';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmpresaCompleta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [empresasDestaque, setEmpresasDestaque] = useState<EmpresaCompleta[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getUsuarioLogado();

  // Carregar empresas destaque
  useEffect(() => {
    const carregarEmpresasDestaque = async () => {
      try {
        const data = await buscarEmpresas({ destaque: true });
        console.log('⭐ Empresas em destaque carregadas:', data);
        setEmpresasDestaque(data ? data.slice(0, 3) : []);
      } catch (error) {
        console.error("Erro ao carregar empresas em destaque:", error);
      }
    };

    carregarEmpresasDestaque();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar empresas
  useEffect(() => {
    const searchEmpresas = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const data = await buscarEmpresas({
          busca: searchTerm,
          categoria: categoriaFiltro || undefined
        });

        setSearchResults(data.slice(0, 8));
        setShowDropdown(true);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchEmpresas();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, categoriaFiltro]);

  const handleSelectEmpresa = (empresaId: string) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/perfil-de-empresa?id=${empresaId}`);
  };

  const handleMeusFavoritos = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    navigate('/meus-locais');
  };

  return (
    <section className="container mx-auto px-4 mt-8 relative z-10">
      <div className="glass-card rounded-[3rem] shadow-2xl p-8 md:p-12 border-2 border-primary/5 animate-slide-up bg-background/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Encontre <span className="gradient-text">empresas locais</span>
          </h3>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            O guia definitivo de Guaíra. Busque por nome, categoria ou serviço.
          </p>
        </div>

        {/* Empresas em Destaque */}
        {empresasDestaque.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-10">
              <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
              <h4 className="text-2xl font-black text-foreground tracking-tight">
                Empresas em <span className="text-primary">Destaque</span>
              </h4>
              <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {empresasDestaque.map((emp) => (
                <div key={emp.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => navigate(`/perfil-de-empresa?id=${emp.id}`)}
                    className="w-full text-left relative rounded-[2.5rem] overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-2xl transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:-translate-y-2"
                  >
                    {/* Imagem de Capa */}
                    <div className="h-48 w-full overflow-hidden relative bg-gradient-to-br from-primary/5 to-accent/10">
                      {emp.imagens && emp.imagens.length > 0 ? (
                        <img
                          src={emp.imagens[0]}
                          alt={emp.nome}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Building2 className="h-20 w-20 text-primary/20" />
                        </div>
                      )}

                      {/* Badge de Destaque Premium */}
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-xl gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                          <Star className="h-3.5 w-3.5 fill-white" />
                          Destaque
                        </Badge>
                      </div>

                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        {/* Logo Premium */}
                        {emp.logo ? (
                          <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] overflow-hidden border-4 border-background shadow-2xl bg-background -mt-14 relative z-10 group-hover:scale-105 transition-transform">
                            <img
                              src={emp.logo}
                              alt={`Logo ${emp.nome}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center border-4 border-background shadow-2xl -mt-14 relative z-10">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xl truncate group-hover:text-primary transition-colors">
                            {emp.nome}
                          </h3>
                          <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary border-none">
                            {emp.categoria_nome}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[40px]">
                        {emp.descricao}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                          <div className="p-1 bg-primary/5 rounded-md">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                          </div>
                          {emp.bairro}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-primary group-hover:translate-x-1 transition-transform">
                          Ver Detalhes
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-10" ref={dropdownRef}>
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                {/* Filtro de Categoria */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-2 hover:bg-primary/10 ${categoriaFiltro ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Filtrar por categoria</p>
                      {categoriaFiltro && (
                        <DropdownMenuItem
                          onClick={() => setCategoriaFiltro(null)}
                          className="cursor-pointer text-destructive mb-2"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpar filtro
                        </DropdownMenuItem>
                      )}
                      {categoriasData.categorias.map((categoria) => (
                        <DropdownMenuItem
                          key={categoria.id}
                          onClick={() => setCategoriaFiltro(categoria.id)}
                          className={`cursor-pointer ${categoriaFiltro === categoria.id ? 'bg-primary/10' : ''}`}
                        >
                          <span className="font-medium mr-2">{categoria.icone}</span>
                          <span className="font-medium">{categoria.nome}</span>
                          {categoriaFiltro === categoria.id && (
                            <Check className="h-4 w-4 ml-auto text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Badge do Filtro Selecionado */}
                {categoriaFiltro && (
                  <>
                    <div className="h-5 w-px bg-border/60" />
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 pr-0.5 py-0.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                    >
                      <span className="text-xs font-semibold pl-1.5">
                        {categoriasData.categorias.find(c => c.id === categoriaFiltro)?.nome}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoriaFiltro(null);
                        }}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </>
                )}
              </div>

              <Input
                type="text"
                placeholder="Ex: farmácia, restaurante, mecânico..."
                className={`${categoriaFiltro ? 'pl-40' : 'pl-12'} pr-6 py-7 text-lg bg-background border-2 border-border focus:border-primary rounded-2xl shadow-lg transition-all`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              />

              {/* Dropdown de Resultados */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((empresa) => (
                      <button
                        key={empresa.id}
                        onClick={() => handleSelectEmpresa(empresa.id)}
                        className="w-full px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border last:border-0"
                      >
                        {/* Logo ou Ícone */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {empresa.logo ? (
                            <img
                              src={empresa.logo}
                              alt={empresa.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex-1 text-left">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground line-clamp-1">
                              {empresa.nome}
                            </h4>
                            {empresa.destaque && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {empresa.categoria_nome && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {empresa.categoria_nome}
                              </span>
                            )}
                            {empresa.subcategorias && empresa.subcategorias.length > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                {empresa.subcategorias[0]}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{empresa.bairro}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              {/* Sem Resultados */}
              {showDropdown && !loading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-2xl shadow-2xl p-6 z-50 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">Nenhuma empresa encontrada</p>
                  <p className="text-xs text-muted-foreground mt-1">Tente outro termo de busca</p>
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="px-8 py-7 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-primary/80"
              onClick={() => searchTerm.trim() && navigate(`/empresas?search=${searchTerm}`)}
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-4">
          <p className="text-base font-medium text-muted-foreground">Acesso rápido:</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2 border-2"
            size="default"
            onClick={handleMeusFavoritos}
          >
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-2"
                size="default"
              >
                <Building2 className="h-5 w-5" />
                Por Categoria
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-h-[500px] overflow-y-auto">
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground mb-3 px-2">
                  Selecione uma categoria principal
                </p>
                {categoriasData.categorias.map((categoria) => (
                  <DropdownMenuSub key={categoria.id}>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <span className="text-xl mr-2">{categoria.icone}</span>
                      <div className="flex flex-col items-start flex-1">
                        <span className="font-medium text-sm">{categoria.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {categoria.subcategorias.length} subcategorias
                        </span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-72 max-h-[400px] overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                          {categoria.nome}
                        </p>
                        {categoria.subcategorias.map((sub, idx) => (
                          <DropdownMenuItem
                            key={idx}
                            className="cursor-pointer text-sm py-2"
                            onClick={() => {
                              setSearchTerm(sub);
                              navigate(`/empresas?search=${sub}`);
                            }}
                          >
                            <span className="text-blue-500 mr-2">✓</span>
                            {sub}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
      />
    </section>
  );
};

export default SearchSection;
