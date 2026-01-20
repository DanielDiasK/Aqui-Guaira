import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Heart, Phone, Mail, Globe, Clipboard, Check, Building2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  buscarFavoritosUsuario,
  removerFavoritoUsuario,
  adicionarFavoritoUsuario,
  buscarLocaisTuristicos,
  buscarEmpresasPorIds,
  EmpresaCompleta,
  LocalTuristico,
  getUsuarioLogado
} from "@/lib/supabase";

// Página refatorada: agora consome favoritos do Supabase (empresa + local) vinculados ao usuário logado (user_id) ou identificador anônimo.

type ItemFavorito = {
  id: string;
  tipo: 'empresa' | 'local';
  nome: string;
  descricao: string;
  categoria?: string;
  bairro?: string;
  imagens: string[];
  logo?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  endereco?: string;
};

const MeusLocais = () => {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [bairro, setBairro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<'todos'|'empresas'|'locais'>('todos');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [itens, setItens] = useState<ItemFavorito[]>([]);
  const usuario = getUsuarioLogado();

  const carregarFavoritos = async () => {
    setLoading(true); setErro(null);
    
    // Só carrega favoritos se usuário estiver logado
    if (!usuario) {
      setLoading(false);
      setItens([]);
      return;
    }
    
    try {
      // Buscar todos favoritos (empresa + local)
      const favs = await buscarFavoritosUsuario();
      const empresaIds = favs.filter(f => f.tipo === 'empresa').map(f => f.item_id);
      const localIds = favs.filter(f => f.tipo === 'local').map(f => f.item_id);

      // Buscar detalhes das empresas
      const empresas: EmpresaCompleta[] = empresaIds.length ? await buscarEmpresasPorIds(empresaIds) : [];
      // Buscar todos locais ativos e filtrar pelos ids favoritados (não temos view filtrada por ids ainda)
      const todosLocais: LocalTuristico[] = localIds.length ? await buscarLocaisTuristicos() : [];
      const locais = localIds.length ? todosLocais.filter(l => localIds.includes(l.id)) : [];

      const normalizadosEmpresas: ItemFavorito[] = empresas.map(e => ({
        id: e.id,
        tipo: 'empresa',
        nome: e.nome,
        descricao: e.descricao,
        categoria: e.categoria_nome,
        bairro: e.bairro,
        imagens: e.imagens?.length ? e.imagens : [e.logo || 'https://placehold.co/600x400?text=Empresa'],
        logo: e.logo,
        telefone: e.telefone,
        whatsapp: e.whatsapp,
        email: e.email,
        site: e.site,
        endereco: e.endereco,
      }));

      const normalizadosLocais: ItemFavorito[] = locais.map(l => ({
        id: l.id,
        tipo: 'local',
        nome: l.nome,
        descricao: l.descricao,
        categoria: l.categoria,
        bairro: l.bairro,
        imagens: l.imagens?.length ? l.imagens : ['https://placehold.co/600x400?text=Local'],
        telefone: l.telefone,
        site: l.site,
        endereco: l.endereco,
        email: undefined,
        whatsapp: undefined,
      }));

      setItens([...normalizadosEmpresas, ...normalizadosLocais].sort((a,b) => a.nome.localeCompare(b.nome)));
    } catch (e: any) {
      console.error(e);
      setErro('Falha ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarFavoritos(); }, []);

  const listaFiltrada = useMemo(() => {
    let base = itens;
    if (tipoFiltro === 'empresas') base = base.filter(i => i.tipo === 'empresa');
    if (tipoFiltro === 'locais') base = base.filter(i => i.tipo === 'local');
    if (categoria !== 'todas') base = base.filter(i => (i.categoria || '').toLowerCase() === categoria.toLowerCase());
    if (bairro !== 'todos') base = base.filter(i => (i.bairro || '').toLowerCase() === bairro.toLowerCase());
    if (busca) base = base.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()));
    return base;
  }, [itens, tipoFiltro, categoria, bairro, busca]);

  const categoriasDisponiveis = useMemo(() => Array.from(new Set(itens.map(i => i.categoria).filter(Boolean))), [itens]);
  const bairrosDisponiveis = useMemo(() => Array.from(new Set(itens.map(i => i.bairro).filter(Boolean))), [itens]);

  const toggleFavorito = async (item: ItemFavorito) => {
    try {
      await removerFavoritoUsuario(item.tipo, item.id);
      toast('Removido dos favoritos', { duration: 1200 });
      setItens(prev => prev.filter(i => !(i.id === item.id && i.tipo === item.tipo)));
    } catch {
      toast('Erro ao remover favorito');
    }
  };

  const copiar = (texto?: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(texto); toast('Copiado!', { description: texto, duration: 1200 }); setTimeout(() => setCopiado(null), 1200);
    }).catch(() => toast('Falha ao copiar', { duration: 1500 }));
  };

  const [selecionada, setSelecionada] = useState<ItemFavorito | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const abrir = (e: ItemFavorito) => { setSelecionada(e); setModalAberto(true); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold gradient-text flex items-center gap-3"><Heart className="h-8 w-8 text-primary" /> Meus Locais</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">Seus favoritos (empresas e locais turísticos). {usuario ? 'Vinculados à sua conta.' : 'Favoritos anônimos ligados ao navegador.'}</p>
        </div>

        {usuario && (
          <Card className="glass-card border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Filtros</CardTitle>
              <CardDescription>Refine seus favoritos por nome, categoria e bairro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium">Buscar (nome)</label>
                <Input placeholder="Ex: Padaria" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Tipo</label>
                <Select value={tipoFiltro} onValueChange={(v: any) => setTipoFiltro(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="empresas">Empresas</SelectItem>
                    <SelectItem value="locais">Locais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categoriasDisponiveis.map(c => c && <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Bairro</label>
                <Select value={bairro} onValueChange={setBairro}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Bairro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {bairrosDisponiveis.map(b => b && <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoria !== "todas" && <Badge variant="secondary">Categoria: {categoria}</Badge>}
              {bairro !== "todos" && <Badge variant="secondary">Bairro: {bairro}</Badge>}
              {busca && <Badge variant="secondary">Busca: {busca}</Badge>}
              {tipoFiltro !== 'todos' && <Badge variant="secondary">Tipo: {tipoFiltro}</Badge>}
              {(categoria !== "todas" || bairro !== "todos" || busca) && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoria("todas"); setBairro("todos"); setBusca(""); setTipoFiltro('todos'); }}>Limpar filtros</Button>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Favoritos ({listaFiltrada.length})</CardTitle>
            <CardDescription>Itens que você marcou. Você pode abrir detalhes ou remover.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {!usuario && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground space-y-4">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <p className="text-base font-medium">Faça login para ver seus favoritos</p>
                <p>Entre na sua conta para visualizar e gerenciar seus locais e empresas favoritos.</p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="default" size="sm" asChild>
                    <a href="/" className="gap-2 flex items-center">Ir para o início</a>
                  </Button>
                </div>
              </div>
            )}
            {usuario && loading && <p className="text-sm animate-pulse">Carregando favoritos...</p>}
            {usuario && erro && <p className="text-sm text-destructive">{erro}</p>}
            <div className="grid md:grid-cols-2 gap-6">
              {usuario && !loading && listaFiltrada.map(item => (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => abrir(item as any)}
                    className="w-full text-left group relative rounded-xl overflow-hidden border border-border/60 bg-gradient-to-br from-background to-accent/30 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="h-40 w-full overflow-hidden">
                      <img src={item.imagens[0]} alt={item.nome} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Logo (apenas para empresas) */}
                          {item.tipo === 'empresa' && (
                            item.logo ? (
                              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-border bg-background">
                                <img 
                                  src={item.logo} 
                                  alt={`Logo ${item.nome}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border">
                                <MapPin className="h-7 w-7 text-muted-foreground" />
                              </div>
                            )
                          )}
                          
                          {/* Nome */}
                          <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                            <span className="truncate">{item.nome}</span>
                            <Badge variant="secondary" className="flex-shrink-0">Favorito</Badge>
                          </h3>
                        </div>
                        
                        {/* Categoria */}
                        {item.categoria && <Badge className="flex-shrink-0">{item.categoria}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.descricao}</p>
                      <div className="flex items-center text-xs mt-2">
                        {item.bairro && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{item.bairro}</span>}
                        <span className="ml-auto text-[10px] uppercase tracking-wide font-medium opacity-60">{item.tipo}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="Remover dos favoritos"
                    onClick={() => toggleFavorito(item)}
                    className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </button>
                </div>
              ))}
              {usuario && !loading && listaFiltrada.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-muted-foreground space-y-4">
                  <p>Nenhum favorito encontrado.</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/empresas" className="gap-2 flex items-center"><Heart className="h-4 w-4" /> Explorar empresas</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selecionada && modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes do favorito ${selecionada.nome}`}
              className="relative w-full h-full sm:h-auto max-w-full sm:max-w-2xl md:max-w-3xl sm:rounded-2xl border-0 sm:border border-border/60 glass-card shadow-lg animate-in fade-in-0 zoom-in-95 sm:max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="h-40 sm:h-56 md:h-64 w-full overflow-hidden relative shrink-0">
                <img src={selecionada.imagens[0]} alt={selecionada.nome} className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Fechar modal"
                  onClick={() => setModalAberto(false)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
                >Fechar</button>
              </div>
              <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
                {/* Header com Logo e Nome */}
                <div className="flex items-start gap-4">
                  {/* Logo (apenas para empresas) */}
                  {selecionada.tipo === 'empresa' && (
                    selecionada.logo ? (
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 bg-background shadow-md">
                        <img 
                          src={selecionada.logo} 
                          alt={`Logo ${selecionada.nome}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20 shadow-md">
                        <MapPin className="h-10 w-10 text-primary/60" />
                      </div>
                    )
                  )}
                  
                  {/* Nome e Categoria */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                      <span className="break-words">{selecionada.nome}</span>
                      {selecionada.categoria && <Badge className="whitespace-nowrap">{selecionada.categoria}</Badge>}
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wide">{selecionada.tipo}</Badge>
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
                            {copiado === selecionada.telefone ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
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
                              {copiado === selecionada.whatsapp ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.email && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{selecionada.email}</span>
                          <button onClick={() => copiar(selecionada.email)} className="p-1 rounded hover:bg-accent" aria-label="Copiar email">
                            {copiado === selecionada.email ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
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
                              {copiado === selecionada.site ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Localização</h4>
                    <div className="text-sm flex flex-col gap-1">
                      {selecionada.bairro && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{selecionada.bairro}</span>}
                      {selecionada.endereco && <span className="text-muted-foreground break-words">{selecionada.endereco}</span>}
                      {/* Distância removida no redesign */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t px-4 sm:px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
                <div className="flex items-center gap-2">
                  {selecionada && <Badge variant="secondary">Favorito</Badge>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {selecionada && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { toggleFavorito(selecionada); setModalAberto(false);} }
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Heart className="h-4 w-4 fill-primary text-primary" /> Remover
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setModalAberto(false)} className="flex-1 sm:flex-none">Fechar</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MeusLocais;
