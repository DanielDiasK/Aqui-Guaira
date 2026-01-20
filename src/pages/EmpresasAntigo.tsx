import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

  // Estado para modal de detalhes
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<EmpresaCompleta | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Verificar se há ID ou categoria na URL
  useEffect(() => {
    const empresaId = searchParams.get('id');
    const categoriaId = searchParams.get('categoria');
    
    if (empresaId && empresas.length > 0) {
      const empresa = empresas.find(e => e.id === empresaId);
      if (empresa) {
        abrirDetalhes(empresa);
        // Limpar o parâmetro da URL
        setSearchParams({});
      }
    } else if (categoriaId && empresas.length > 0) {
      // Buscar a empresa que tem essa categoria para pegar o nome
      const empresaComCategoria = empresas.find(e => e.categoria_id === categoriaId);
      if (empresaComCategoria && empresaComCategoria.categoria_nome) {
        setCategoria(empresaComCategoria.categoria_nome);
      }
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

      // Extrair categorias únicas
      const categoriasUnicas = Array.from(new Set(empresasData.map(e => e.categoria_nome).filter(Boolean)));
      setCategorias(categoriasUnicas as string[]);

      // Extrair bairros únicos
      const bairrosUnicos = Array.from(new Set(empresasData.map(e => e.bairro)));
      setBairros(bairrosUnicos);

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
    return empresas.map(emp => {
      const distancia = userLocation ? haversineKm(userLocation.lat, userLocation.lng, emp.latitude, emp.longitude) : null;
      return { ...emp, distancia };
    })
      .filter(emp => {
        if (busca && !emp.nome.toLowerCase().includes(busca.toLowerCase())) return false;
        if (categoria !== "todas" && emp.categoria_nome !== categoria) return false;
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
  }, [empresas, busca, categoria, bairro, userLocation, maxDistance]);

  // Paginação
  const [page, setPage] = useState(1);
  const pageSize = 10; // Aumentado de 4 para 10
  const totalPages = Math.max(1, Math.ceil(empresasFiltradas.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1); // reset se filtros reduzirem número de páginas
  }, [empresasFiltradas.length, totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return empresasFiltradas.slice(start, start + pageSize);
  }, [empresasFiltradas, page]);

  const abrirDetalhes = async (emp: EmpresaCompleta) => {
    setSelecionada(emp);
    setDetalheAberto(true);
    // Incrementar visualizações
    await incrementarVisualizacoesEmpresa(emp.id);
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
            {/* Acesso Rápido por Categoria */}
            <div className="space-y-3 pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Acesso rápido:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {categoriasData.categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.nome)}
                    className={`bg-gradient-to-br ${cat.cor} hover:opacity-90 text-white font-semibold p-3 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-center ${
                      categoria === cat.nome ? 'ring-4 ring-blue-400' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icone}</div>
                    <div className="text-xs leading-tight line-clamp-2">{cat.nome}</div>
                    <Badge className="mt-1 bg-white/30 text-white border-0 text-[10px]">
                      {cat.subcategorias.length}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Busca (nome)</label>
                <Input placeholder="Ex: Farmácia" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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

        {/* Lista */}
        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Empresas ({empresasFiltradas.length})</CardTitle>
            <CardDescription>
              Resultados conforme filtros aplicados. Página {page} de {totalPages}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {paginated.map(emp => (
              <div key={emp.id} className="relative">
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
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground">Nenhuma empresa encontrada com esses filtros.</div>
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

        {/* Modal de detalhes */}
        {selecionada && detalheAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setDetalheAberto(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes da empresa ${selecionada.nome}`}
              className="relative w-full h-full sm:h-auto max-w-full sm:max-w-2xl md:max-w-3xl sm:rounded-2xl border-0 sm:border border-border/60 glass-card shadow-lg animate-in fade-in-0 zoom-in-95 sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="h-40 sm:h-56 md:h-64 w-full overflow-hidden relative shrink-0">
                <img src={selecionada.imagens[0]} alt={selecionada.nome} className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Fechar modal"
                  onClick={() => setDetalheAberto(false)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
                >Fechar</button>
              </div>
              {/* Conteúdo scrollável mantendo barra inferior fixa */}
              <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
                {/* Header com Logo e Nome */}
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  {selecionada.logo ? (
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 bg-background shadow-md">
                      <img 
                        src={selecionada.logo} 
                        alt={`Logo ${selecionada.nome}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20 shadow-md">
                      <Building2 className="h-10 w-10 text-primary/60" />
                    </div>
                  )}
                  
                  {/* Nome e Categoria */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                      <span className="break-words">{selecionada.nome}</span>
                      <Badge className="whitespace-nowrap">{selecionada.categoria}</Badge>
                    </h3>
                  </div>
                </div>

                {/* Cards de Localização e Bio - Compacto */}
                <div className="grid md:grid-cols-2 gap-3">
                  {/* Card de Localização */}
                  <Card className="border">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-0 space-y-1.5">
                      {selecionada.endereco && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground min-w-[60px] font-medium">Endereço:</span>
                          <span className="text-xs flex-1">{selecionada.endereco}</span>
                        </div>
                      )}
                      {selecionada.bairro && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground min-w-[60px] font-medium">Bairro:</span>
                          <span className="text-xs flex-1">{selecionada.bairro}</span>
                        </div>
                      )}
                      {selecionada.cidade && selecionada.estado && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground min-w-[60px] font-medium">Cidade:</span>
                          <span className="text-xs flex-1">{selecionada.cidade} - {selecionada.estado}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card de Bio/Descrição */}
                  <Card className="border">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        Sobre
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-0">
                      <p className="text-xs leading-relaxed text-foreground/80">{selecionada.descricao}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Informações de Contato */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Contato</h4>
                    <ul className="space-y-2 text-sm">
                      {selecionada.telefone && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{selecionada.telefone}</span>
                          <button onClick={() => copiar(selecionada.telefone)} className="p-1 rounded hover:bg-accent" aria-label="Copiar telefone">
                            {copiado === selecionada.telefone ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.whatsapp && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />WhatsApp: {selecionada.whatsapp}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://wa.me/${selecionada.whatsapp.replace(/[^\d]/g,'')}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.whatsapp)} className="p-1 rounded hover:bg-accent" aria-label="Copiar WhatsApp">
                              {copiado === selecionada.whatsapp ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.email && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{selecionada.email}</span>
                          <button onClick={() => copiar(selecionada.email)} className="p-1 rounded hover:bg-accent" aria-label="Copiar email">
                            {copiado === selecionada.email ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.site && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{selecionada.site}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={selecionada.site} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.site)} className="p-1 rounded hover:bg-accent" aria-label="Copiar site">
                              {copiado === selecionada.site ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Localização</h4>
                    <div className="text-sm flex flex-col gap-1">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{selecionada.bairro}</span>
                      {selecionada.endereco && <span className="text-muted-foreground break-words">{selecionada.endereco}</span>}
                      {userLocation && (
                        <span className="text-xs mt-1">Distância estimada: {haversineKm(userLocation.lat, userLocation.lng, selecionada.lat, selecionada.lng).toFixed(2)} km</span>
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
                  <Button variant="ghost" size="sm" onClick={() => setDetalheAberto(false)} className="flex-1 sm:flex-none">Fechar</Button>
                </div>
              </div>
            </div>
          </div>
        )}
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
