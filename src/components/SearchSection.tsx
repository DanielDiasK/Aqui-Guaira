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

import { Search, Heart, Building2, MapPin, Star, ChevronDown, Filter, X, Check, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { supabase, type EmpresaCompleta, getUsuarioLogado } from "@/lib/supabase";
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

interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmpresaCompleta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [empresasDestaque, setEmpresasDestaque] = useState<EmpresaCompleta[]>([]);
  const [carouselIndex, setCarouselIndex] = useState<{ [key: string]: number }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getUsuarioLogado();

  // Carregar categorias que têm empresas
  useEffect(() => {
    const carregarCategorias = async () => {
      setLoadingCategorias(true);
      try {
        // Buscar todas as empresas aprovadas para pegar categorias únicas
        const { data: empresasData, error } = await supabase
          .from('empresas')
          .select(`
            categoria_id,
            categorias:categoria_id(id, nome, icone, cor)
          `)
          .eq('status', 'aprovado');

        if (error) throw error;

        // Extrair categorias únicas
        const categoriasUnicas = new Map<string, Categoria>();
        empresasData?.forEach(empresa => {
          if (empresa.categorias && empresa.categoria_id) {
            const cat = empresa.categorias as any;
            if (!categoriasUnicas.has(cat.id)) {
              categoriasUnicas.set(cat.id, {
                id: cat.id,
                nome: cat.nome,
                icone: cat.icone,
                cor: cat.cor
              });
            }
          }
        });

        // Converter para array e ordenar por nome
        const categoriasArray = Array.from(categoriasUnicas.values())
          .sort((a, b) => a.nome.localeCompare(b.nome));

        setCategorias(categoriasArray);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    const carregarEmpresasDestaque = async () => {
      try {
        const { data, error } = await supabase
          .from("empresas_completas")
          .select("*")
          .eq("destaque", true)
          .order("visualizacoes", { ascending: false })
          .limit(3);
        if (error) throw error;
        console.log('⭐ Empresas em destaque carregadas:', data);
        setEmpresasDestaque(data || []);
      } catch (error) {
        console.error("Erro ao carregar empresas em destaque:", error);
      }
    };

    carregarCategorias();
    carregarEmpresasDestaque();
  }, []);

  // Carousel automático para empresas em destaque
  useEffect(() => {
    if (empresasDestaque.length === 0) return;

    const interval = setInterval(() => {
      setCarouselIndex(prev => {
        const newIndex = { ...prev };
        empresasDestaque.forEach(empresa => {
          const currentIndex = prev[empresa.id] || 0;
          newIndex[empresa.id] = (currentIndex + 1) % 5; // 5 slides (incluindo logo)
        });
        return newIndex;
      });
    }, 4000); // 4 segundos

    return () => clearInterval(interval);
  }, [empresasDestaque]);

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
        // Usar empresas_completas que já inclui subcategorias e categoria_nome
        const { data, error } = await supabase
          .from("empresas_completas")
          .select("*")
          .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,bairro.ilike.%${searchTerm}%,categoria_nome.ilike.%${searchTerm}%`)
          .order("destaque", { ascending: false })
          .order("visualizacoes", { ascending: false })
          .limit(20); // Aumentado para 20 pois agora busca em mais campos

        if (error) throw error;

        // Filtrar também por subcategorias no lado do cliente (pois PostgreSQL não suporta ILIKE em arrays diretamente)
        let resultados = data || [];
        const searchLower = searchTerm.toLowerCase();

        resultados = resultados.filter(empresa => {
          // Já passou pelos filtros do .or() acima
          const matchBasico = true;

          // Verificar subcategorias
          const matchSubcategorias = empresa.subcategorias?.some((sub: string) =>
            sub.toLowerCase().includes(searchLower)
          );

          return matchBasico || matchSubcategorias;
        });

        // Limitar a 8 resultados finais
        setSearchResults(resultados.slice(0, 8));
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
    navigate(`/empresas?id=${empresaId}`);
  };

  const handleMeusFavoritos = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    navigate('/meus-locais');
  };

  const handleSelecionarCategoria = (categoriaId: string) => {
    navigate(`/empresas?categoria=${categoriaId}`);
  };

  const renderCarouselContent = (empresa: EmpresaCompleta) => {
    const slideIndex = carouselIndex[empresa.id] || 0;

    switch (slideIndex) {
      case 0:
        // Slide 1: Subcategorias
        return empresa.subcategorias && empresa.subcategorias.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-2 animate-fade-in">
            {empresa.subcategorias.slice(0, 2).map((sub, idx) => (
              <span key={idx} className="text-xs text-gray-900 font-semibold drop-shadow-md">
                • {sub}
              </span>
            ))}
            {empresa.subcategorias.length > 2 && (
              <span className="text-xs text-gray-900 font-semibold drop-shadow-md">
                • +{empresa.subcategorias.length - 2} mais
              </span>
            )}
          </div>
        ) : null;

      case 1:
        // Slide 2: Ponto de coleta Mercado Livre (se aplicável)
        return (
          <div className="mb-2 animate-fade-in flex items-center justify-center">
            <p className="text-lg text-gray-900 font-black drop-shadow-lg text-center leading-tight">
              📦 Ponto de coleta<br />
              <span className="text-2xl font-black drop-shadow-xl" style={{ color: '#FFE600', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Mercado Livre</span>
            </p>
          </div>
        );

      case 2:
        // Slide 3: Endereço
        return (
          <div className="mb-2 animate-fade-in">
            <p className="text-sm text-gray-900 font-semibold drop-shadow-md">
              📍 {empresa.endereco || `${empresa.bairro}, Guaíra-SP`}
            </p>
          </div>
        );

      case 3:
        // Slide 4: WhatsApp
        return empresa.whatsapp ? (
          <div className="mb-2 animate-fade-in">
            <p className="text-sm text-green-600 font-bold drop-shadow-md">
              💬 WhatsApp: {empresa.whatsapp}
            </p>
          </div>
        ) : (
          <div className="mb-2 animate-fade-in">
            <p className="text-sm text-gray-900 font-semibold drop-shadow-md">
              📞 {empresa.telefone}
            </p>
          </div>
        );

      case 4:
        // Slide 5: Apenas logo em destaque (sem texto)
        return null;

      default:
        return null;
    }
  };

  return (
    <section className="container mx-auto px-4 mt-8 relative z-10">
      <div className="glass-card rounded-3xl shadow-2xl p-8 md:p-10 border-2 animate-slide-up">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-3 gradient-text">
          Encontre empresas locais
        </h3>
        <p className="text-center text-muted-foreground mb-6 text-lg">
          Busque por nome, categoria ou serviço
        </p>

        {/* Empresas em Destaque */}
        {empresasDestaque.length > 0 && (
          <div className="mb-8">
            <p className="text-base font-medium text-muted-foreground mb-3 text-center">⭐ Empresas em Destaque</p>
            <div className="grid gap-3 md:grid-cols-3 max-w-4xl mx-auto">
              {empresasDestaque.map((empresa) => {
                const slideIndex = carouselIndex[empresa.id] || 0;
                const isLogoSlide = slideIndex === 4;

                return (
                  <div
                    key={empresa.id}
                    onClick={() => navigate(`/empresas?id=${empresa.id}`)}
                    className="relative overflow-hidden p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Logo como background */}
                    {empresa.logo && (
                      <div
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${isLogoSlide ? 'opacity-90' : 'opacity-40 group-hover:opacity-50'
                          }`}
                        style={{ backgroundImage: `url(${empresa.logo})` }}
                      />
                    )}

                    {/* Conteúdo por cima do background */}
                    <div className={`relative z-10 transition-opacity duration-700 ${isLogoSlide ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm text-gray-900 drop-shadow-sm">{empresa.nome}</h3>
                        <span className="text-amber-500 text-lg drop-shadow-sm">⭐</span>
                      </div>

                      <p className="text-xs text-gray-700 mb-3 drop-shadow-sm font-medium">{empresa.categoria_nome}</p>

                      {/* Carousel de informações */}
                      <div className="min-h-[60px] flex items-center">
                        {renderCarouselContent(empresa)}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-700 mt-2 drop-shadow-sm font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {empresa.bairro}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                      disabled={loadingCategorias}
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
                      {loadingCategorias ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Carregando...
                        </div>
                      ) : categorias.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhuma categoria disponível
                        </div>
                      ) : (
                        categorias.map((categoria) => (
                          <DropdownMenuItem
                            key={categoria.id}
                            onClick={() => setCategoriaFiltro(categoria.id)}
                            className={`cursor-pointer ${categoriaFiltro === categoria.id ? 'bg-primary/10' : ''}`}
                          >
                            <span className="font-medium">{categoria.nome}</span>
                            {categoriaFiltro === categoria.id && (
                              <Check className="h-4 w-4 ml-auto text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
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
                        {categorias.find(c => c.id === categoriaFiltro)?.nome}
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
                            {empresa.subcategorias && empresa.subcategorias.length > 1 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                +{empresa.subcategorias.length - 1}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{empresa.bairro}</span>
                            </div>
                          </div>

                          {empresa.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {empresa.descricao}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer do Dropdown */}
                  <div className="px-4 py-2 bg-muted/30 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
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

      {/* Dialog de Login */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
      />
    </section>
  );
};

export default SearchSection;
