/*
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                   🏢 SEÇÃO EMPRESAS - PÁGINA COMPLETA                         ║
║                                                                               ║
║  Esta é a PÁGINA PRINCIPAL de empresas (rota: /empresas)                     ║
║  Funcionalidades:                                                             ║
║  - Cards de empresas (grid 2 colunas) - CLICÁVEIS para abrir modal          ║
║  - Filtros: busca, categoria, bairro, distância                              ║
║  - Geolocalização e ordenação por distância                                  ║
║  - Paginação (12 empresas por página)                                        ║
║  - Modal completo com detalhes da empresa                                     ║
║  - Sistema de favoritos                                                       ║
║  - Botões de navegação: Voltar e Página Inicial                              ║
║                                                                               ║
║  ⚠️  NÃO CONFUNDIR COM: src/components/SearchSection.tsx (busca homepage)    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
*/

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, RefreshCcw, LocateFixed, Phone, Mail, Globe, Clipboard, ExternalLink, Heart, Check, Loader2, ArrowLeft, Home } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { LoginDialog } from "@/components/LoginDialog";
import categoriasData from '@/data/categorias-empresas.json';
import { BAIRROS_GUAIRA } from '@/data/bairros';

import { 
  buscarEmpresas, 
  buscarCategorias, 
  adicionarFavoritoUsuario, 
  removerFavoritoUsuario, 
  buscarFavoritosUsuario, 
  incrementarVisualizacoesEmpresa, 
  getUsuarioLogado,
  type EmpresaCompleta 
} from "@/lib/supabase";

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Empresas = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [bairro, setBairro] = useState<string>("todos");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(20); // km
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  // Estados Supabase
  const [empresas, setEmpresas] = useState<EmpresaCompleta[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [empresaPendente, setEmpresaPendente] = useState<string | null>(null);

  // Estado para página de detalhes
  const [selecionada, setSelecionada] = useState<EmpresaCompleta | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Verificar se há ID na URL para mostrar detalhes
  useEffect(() => {
    const empresaId = searchParams.get('id');
    const categoriaId = searchParams.get('categoria');
    const searchTerm = searchParams.get('search');
    
    if (empresaId && empresas.length > 0) {
      const empresa = empresas.find(e => e.id === empresaId);
      if (empresa) {
        setSelecionada(empresa);
        incrementarVisualizacoesEmpresa(empresaId);
      }
    } else {
      // Se não tem ID na URL, limpar selecionada
      setSelecionada(null);
    }
    
    if (categoriaId && empresas.length > 0) {
      // Buscar a empresa que tem essa categoria para pegar o nome
      const empresaComCategoria = empresas.find(e => e.categoria_id === categoriaId);
      if (empresaComCategoria && empresaComCategoria.categoria_nome) {
        setCategoria(empresaComCategoria.categoria_nome);
      }
      // Limpar o parâmetro da URL após aplicar o filtro
      setSearchParams({});
    } else if (searchTerm && empresas.length > 0) {
      // Se veio um termo de busca pela URL, aplicar no filtro
      setBusca(searchTerm);
      // Limpar o parâmetro da URL após aplicar o filtro
      setSearchParams({});
    }
  }, [searchParams, empresas]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar empresas
      const empresasData = await buscarEmpresas();
      setEmpresas(empresasData as EmpresaCompleta[]);
      
      // Debug: verificar subcategorias das empresas carregadas
      console.log('🏢 Empresas carregadas:', empresasData.length);
      const comSubcategorias = empresasData.filter(e => e.subcategorias && e.subcategorias.length > 0);
      console.log('📋 Empresas COM subcategorias:', comSubcategorias.length);
      comSubcategorias.forEach(e => {
        console.log(`  - ${e.nome}: ${e.subcategorias?.length || 0} subcategorias`, e.subcategorias);
      });

      // Buscar categorias do Supabase (não extrair das empresas)
      const categoriasData = await buscarCategorias();
      const categoriasNomes = categoriasData.map(c => c.nome);
      setCategorias(categoriasNomes);

      // Usar lista fixa de bairros + bairros das empresas
      const bairrosEmpresas = Array.from(new Set(empresasData.map(e => e.bairro).filter(Boolean)));
      const todosBairros = Array.from(new Set([...BAIRROS_GUAIRA, ...bairrosEmpresas])).sort();
      setBairros(todosBairros);

      // Buscar favoritos (se logado, busca do usuário)
      const favoritosData = await buscarFavoritosUsuario('empresa');
      setFavoritos(new Set(favoritosData.map(f => f.item_id)));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast("Erro ao carregar empresas", { description: "Tente novamente mais tarde" });
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocalização não suportada");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(null);
        setLoadingLoc(false);
      },
      (err) => {
        setLocError(err.message || "Falha ao obter localização");
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const empresasFiltradas = useMemo(() => {
    const resultado = empresas.map(emp => {
      const distancia = userLocation ? haversineKm(userLocation.lat, userLocation.lng, emp.latitude, emp.longitude) : null;
      return { ...emp, distancia };
    })
      .filter(emp => {
        if (busca) {
          const buscaLower = busca.toLowerCase().trim();
          
          // Debug: log para ver dados da empresa
          if (emp.nome.toLowerCase().includes('all') || emp.nome.toLowerCase().includes('import')) {
            console.log('🔍 Empresa encontrada:', {
              nome: emp.nome,
              categoria: emp.categoria_nome || emp.categoria,
              subcategorias: emp.subcategorias,
              busca: buscaLower
            });
          }
          
          // Busca simples por inclusão
          const nomeMatch = emp.nome.toLowerCase().includes(buscaLower);
          const descricaoMatch = emp.descricao?.toLowerCase().includes(buscaLower);
          const categoriaMatch = (emp.categoria_nome || emp.categoria)?.toLowerCase().includes(buscaLower);
          
          // Busca em subcategorias (mais flexível)
          const subcategoriasMatch = emp.subcategorias?.some(sub => 
            sub.toLowerCase().includes(buscaLower)
          ) || false;
          
          // Busca por palavras individuais (para queries complexas como "Lojas de celulares")
          const palavras = buscaLower.split(/\s+/).filter(p => p.length > 2);
          const palavrasMatch = palavras.length > 0 && palavras.every(palavra => {
            return emp.nome.toLowerCase().includes(palavra) ||
                   emp.descricao?.toLowerCase().includes(palavra) ||
                   (emp.categoria_nome || emp.categoria)?.toLowerCase().includes(palavra) ||
                   emp.subcategorias?.some(sub => sub.toLowerCase().includes(palavra));
          });
          
          if (!nomeMatch && !descricaoMatch && !categoriaMatch && !subcategoriasMatch && !palavrasMatch) return false;
        }
        // Filtro por categoria: usar categoria_nome (da view) ou categoria (fallback)
        const empresaCategoria = emp.categoria_nome || emp.categoria;
        if (categoria !== "todas" && empresaCategoria !== categoria) return false;
        if (bairro !== "todos" && emp.bairro !== bairro) return false;
        if (userLocation && emp.distancia !== null && emp.distancia > maxDistance) return false;
        return true;
      })
      .sort((a, b) => {
        if (userLocation) {
          return (a.distancia ?? Infinity) - (b.distancia ?? Infinity);
        }
        return a.nome.localeCompare(b.nome);
      });
    
    // Debug final
    console.log('📊 Total empresas:', empresas.length, '| Filtradas:', resultado.length, '| Busca:', busca);
    
    return resultado;
  }, [empresas, busca, categoria, bairro, userLocation, maxDistance]);

  // Paginação
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(empresasFiltradas.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1); // reset se filtros reduzirem número de páginas
  }, [empresasFiltradas.length, totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return empresasFiltradas.slice(start, start + pageSize);
  }, [empresasFiltradas, page]);

  const abrirDetalhes = (emp: EmpresaCompleta) => {
    navigate(`/empresas?id=${emp.id}`);
  };

  const copiar = (texto?: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(texto);
      toast("Copiado!", { description: texto, duration: 1200 });
      setTimeout(() => setCopiado(null), 1200);
    }).catch(() => {
      toast("Falha ao copiar", { description: "Tente novamente", duration: 1500 });
    });
  };

  const toggleFavorito = async (id: string) => {
    const user = getUsuarioLogado();
    
    // Se não estiver logado, pedir login
    if (!user) {
      setEmpresaPendente(id);
      setShowLogin(true);
      return;
    }

    const jaFavoritado = favoritos.has(id);
    
    try {
      if (jaFavoritado) {
        await removerFavoritoUsuario('empresa', id);
        setFavoritos(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast("💔 Removido dos favoritos", { duration: 1500 });
      } else {
        await adicionarFavoritoUsuario('empresa', id);
        setFavoritos(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        toast("❤️ Adicionado aos favoritos!", { duration: 1500 });
      }
    } catch (error) {
      toast("Erro ao atualizar favorito", { description: "Tente novamente" });
    }
  };

  const handleLoginSuccess = async () => {
    // Recarregar favoritos após login
    const favoritosData = await buscarFavoritosUsuario('empresa');
    setFavoritos(new Set(favoritosData.map(f => f.item_id)));
    
    // Se tinha empresa pendente, favoritar automaticamente
    if (empresaPendente) {
      await toggleFavorito(empresaPendente);
      setEmpresaPendente(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        {/* Botões de Navegação */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-2 sm:gap-3">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> 
            Empresas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Explore empresas locais por categoria, bairro ou proximidade. Ative a localização para ordenar por distância em tempo real.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando empresas...</span>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <Card className="glass-card border-2">
              <CardHeader className="pb-4">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <CardDescription>Refine a busca usando os campos abaixo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Busca (nome)</label>
                <Input placeholder="Ex: Farmácia" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="todas">Todas</SelectItem>
                    {/* Categorias do Supabase (20 categorias principais) */}
                    {categorias.map(cat => {
                      const catData = categoriasData.categorias.find(c => c.nome === cat);
                      return (
                        <SelectItem key={cat} value={cat}>
                          {catData ? `${catData.icone} ` : ''}{cat}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Bairro</label>
                <Select value={bairro} onValueChange={setBairro}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Bairro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {bairros.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-2">Distância (km) {userLocation ? <Badge variant="secondary">{maxDistance} km</Badge> : null}</label>
                <div className="space-y-3">
                  <Slider value={[maxDistance]} min={1} max={50} step={1} onValueChange={(v) => setMaxDistance(v[0])} disabled={!userLocation} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={requestLocation} disabled={loadingLoc} className="gap-2">
                      {loadingLoc ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                      {userLocation ? "Atualizar" : "Ativar"}
                    </Button>
                    {locError && <span className="text-xs text-destructive">{locError}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoria !== "todas" && <Badge variant="secondary">Categoria: {categoria}</Badge>}
              {bairro !== "todos" && <Badge variant="secondary">Bairro: {bairro}</Badge>}
              {busca && <Badge variant="secondary">Busca: {busca}</Badge>}
              {userLocation && <Badge variant="secondary">Localização ativa</Badge>}
              {(categoria !== "todas" || bairro !== "todos" || busca || userLocation) && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoria("todas"); setBairro("todos"); setBusca(""); }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 🏢 CARDS DE EMPRESAS - SEÇÃO PRINCIPAL (CLICÁVEIS PARA PÁGINA)    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!selecionada && (
        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Empresas ({empresasFiltradas.length})</CardTitle>
            <CardDescription>
              Resultados conforme filtros aplicados. Página {page} de {totalPages}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginated.map(emp => (
              <div key={emp.id} className="relative">
                {/* Card clicável - Abre página com detalhes completos */}
                <button
                  type="button"
                  onClick={() => abrirDetalhes(emp)}
                  className="w-full text-left group relative rounded-xl overflow-hidden border border-border/60 bg-gradient-to-br from-background to-accent/30 shadow-sm hover:shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:scale-[1.02]"
                >
                  {/* Imagem de Capa */}
                  <div className="h-48 w-full overflow-hidden relative bg-gradient-to-br from-primary/5 to-accent/10">
                    {emp.imagens && emp.imagens.length > 0 ? (
                      <img 
                        src={emp.imagens[0]} 
                        alt={emp.nome} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2 className="h-20 w-20 text-primary/20" />
                      </div>
                    )}
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        {emp.logo ? (
                          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 bg-background shadow-md -mt-8 relative z-10">
                            <img 
                              src={emp.logo} 
                              alt={`Logo ${emp.nome}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center border-2 border-primary/20 shadow-md -mt-8 relative z-10">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        
                        {/* Nome */}
                        <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                          <span className="truncate">{emp.nome}</span>
                          {favoritos.has(emp.id) && <Badge variant="secondary" className="animate-pulse flex-shrink-0">Favorito</Badge>}
                        </h3>
                      </div>
                      
                      {/* Categoria */}
                      <Badge className="flex-shrink-0">{emp.categoria}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{emp.descricao}</p>
                    {emp.subcategorias && emp.subcategorias.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {emp.subcategorias.slice(0, 2).map((sub, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0">
                            {sub}
                          </Badge>
                        ))}
                        {emp.subcategorias.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0">
                            +{emp.subcategorias.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{emp.bairro}</span>
                      {emp.distancia !== null && userLocation ? (
                        <span className="font-medium">{emp.distancia.toFixed(2)} km</span>
                      ) : (
                        <span className="text-muted-foreground">Sem distância</span>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={favoritos.has(emp.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  onClick={() => toggleFavorito(emp.id)}
                  className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Heart className={"h-4 w-4 " + (favoritos.has(emp.id) ? "fill-primary text-primary" : "")} />
                </button>
              </div>
            ))}
            {empresasFiltradas.length === 0 && (
              <div className="col-span-full text-center py-16 px-4">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {busca && `Não há empresas cadastradas que correspondam a "${busca}".`}
                  {!busca && categoria !== "todas" && `Não há empresas na categoria "${categoria}".`}
                  {!busca && categoria === "todas" && bairro !== "todos" && `Não há empresas no bairro "${bairro}".`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBusca("");
                      setCategoria("todas");
                      setBairro("todos");
                    }}
                  >
                    Limpar filtros
                  </Button>
                  <Button
                    onClick={() => navigate('/sua-empresa')}
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Cadastrar empresa
                  </Button>
                </div>
              </div>
            )}
            </div>
            {empresasFiltradas.length > pageSize && (
              <Pagination className="pt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                      className={page === 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                      className={page === totalPages ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
        )}

        {/* Página de detalhes */}
        {selecionada ? (
          <div className="w-full max-w-5xl mx-auto">
            <div className="mb-4">
              <Button 
                onClick={() => navigate('/empresas')} 
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para lista
              </Button>
            </div>
            <div
              className="w-full border-2 border-border/60 rounded-3xl glass-card shadow-2xl overflow-hidden"
            >
              <div className="h-64 md:h-80 w-full overflow-hidden relative">
                <img src={selecionada.imagens[0]} alt={selecionada.nome} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
              </div>
              {/* Conteúdo scrollável */}
              <div className="px-6 py-8 space-y-8">
                {/* Header com Logo e Nome */}
                <div className="flex items-start gap-5 -mt-16 relative z-10">
                  {/* Logo */}
                  {selecionada.logo ? (
                    <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-background shadow-2xl bg-background">
                      <img 
                        src={selecionada.logo} 
                        alt={`Logo ${selecionada.nome}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border-4 border-background shadow-2xl">
                      <Building2 className="h-12 w-12 text-orange-500" />
                    </div>
                  )}
                  
                  {/* Nome e Categoria */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0 pt-8">
                    <h3 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-3">
                      <span className="break-words">{selecionada.nome}</span>
                      <Badge className="whitespace-nowrap text-sm px-3 py-1">{selecionada.categoria}</Badge>
                    </h3>
                  </div>
                </div>

                {/* Cards de Localização e Bio - Compacto */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Card de Localização */}
                  <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                    <CardHeader className="pb-3 pt-4 px-5">
                      <CardTitle className="text-base flex items-center gap-2 font-semibold text-orange-600">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        Endereço
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 pt-0 space-y-2">
                      {selecionada.endereco && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-[70px] font-medium">Endereço:</span>
                          <span className="text-sm flex-1">{selecionada.endereco}</span>
                        </div>
                      )}
                      {selecionada.bairro && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-[70px] font-medium">Bairro:</span>
                          <span className="text-sm flex-1">{selecionada.bairro}</span>
                        </div>
                      )}
                      {selecionada.cidade && selecionada.estado && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-[70px] font-medium">Cidade:</span>
                          <span className="text-sm flex-1">{selecionada.cidade} - {selecionada.estado}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card de Bio/Descrição */}
                  <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
                    <CardHeader className="pb-3 pt-4 px-5">
                      <CardTitle className="text-base flex items-center gap-2 font-semibold text-orange-600">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        Sobre
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 pt-0">
                      <p className="text-sm leading-relaxed text-foreground/90">{selecionada.descricao}</p>
                      {selecionada.subcategorias && selecionada.subcategorias.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Especialidades:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selecionada.subcategorias.map((sub, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Informações de Contato */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm uppercase tracking-wide font-bold text-orange-600 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contato
                    </h4>
                    <ul className="space-y-3 text-sm">
                      {selecionada.telefone && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                          <span className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4 text-orange-500" />{selecionada.telefone}</span>
                          <button onClick={() => copiar(selecionada.telefone)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="Copiar telefone">
                            {copiado === selecionada.telefone ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.whatsapp && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors border border-green-500/20">
                          <span className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4 text-green-600" />WhatsApp: {selecionada.whatsapp}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild className="bg-green-500 hover:bg-green-600 text-white border-0">
                              <a href={`https://wa.me/${selecionada.whatsapp.replace(/[^\d]/g,'')}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.whatsapp)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="Copiar WhatsApp">
                              {copiado === selecionada.whatsapp ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.email && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                          <span className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4 text-orange-500" />{selecionada.email}</span>
                          <button onClick={() => copiar(selecionada.email)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="Copiar email">
                            {copiado === selecionada.email ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.site && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                          <span className="flex items-center gap-2 font-medium"><Globe className="h-4 w-4 text-orange-500" />{selecionada.site}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                              <a href={selecionada.site} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.site)} className="p-2 rounded-lg hover:bg-background transition-colors" aria-label="Copiar site">
                              {copiado === selecionada.site ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.instagram && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors border border-pink-500/20">
                          <span className="flex items-center gap-2 font-medium">
                            <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            Instagram
                          </span>
                          <Button size="sm" asChild className="gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0">
                            <a href={selecionada.instagram.startsWith('http') ? selecionada.instagram : `https://instagram.com/${selecionada.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                              Abrir
                            </a>
                          </Button>
                        </li>
                      )}
                      {selecionada.facebook && (
                        <li className="flex items-center justify-between gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                          <span className="flex items-center gap-2 font-medium">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                          </span>
                          <Button size="sm" asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                            <a href={selecionada.facebook.startsWith('http') ? selecionada.facebook : `https://facebook.com/${selecionada.facebook.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              Abrir
                            </a>
                          </Button>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm uppercase tracking-wide font-bold text-orange-600 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Localização
                    </h4>
                    <div className="text-sm flex flex-col gap-3">
                      <div className="p-3 rounded-lg bg-accent/50">
                        <span className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-orange-500" />{selecionada.bairro}</span>
                        {selecionada.endereco && <span className="text-muted-foreground break-words ml-6">{selecionada.endereco}</span>}
                        {userLocation && (
                          <span className="text-xs mt-2 block ml-6 text-orange-600 font-medium">Distância: {haversineKm(userLocation.lat, userLocation.lng, selecionada.lat, selecionada.lng).toFixed(2)} km</span>
                        )}
                      </div>
                      {selecionada.link_google_maps && (
                        <>
                          <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-orange-500/20">
                            <iframe
                              src={`https://www.google.com/maps?q=-20.3219334,-48.3115341&hl=pt-BR&z=17&output=embed`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                          <Button variant="outline" size="sm" asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                            <a href={selecionada.link_google_maps} target="_blank" rel="noopener noreferrer">
                              <MapPin className="h-4 w-4 mr-2" />
                              Abrir no Google Maps
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Barra de ações fixa */}
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t px-4 sm:px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
                <div className="flex items-center gap-2">
                  {selecionada && favoritos.has(selecionada.id) && <Badge variant="secondary">Favorito</Badge>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {selecionada && (
                    <Button
                      variant={favoritos.has(selecionada.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleFavorito(selecionada.id)}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Heart className={"h-4 w-4 " + (favoritos.has(selecionada.id) ? "fill-primary text-primary" : "")} />
                      {favoritos.has(selecionada.id) ? "Remover" : "Favoritar"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
          </>
        )}
      </main>
      <Footer />
      
      {/* Dialog de Login */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Empresas;
