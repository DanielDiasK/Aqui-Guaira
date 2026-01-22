import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Header and Footer clones removed for a cleaner Sidebar logic
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  LayoutDashboard,
  User,
  FileText,
  Image as ImageIcon,
  Settings,
  ChevronRight,
  Plus,
  TrendingUp,
  Activity,
  History,
  Star,
  ExternalLink,
  Search,
  Building2,
  LogOut,
  Eye,
  Edit,
  Save,
  X,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Menu,
  Instagram,
  Facebook
} from "lucide-react";
import {
  supabase,
  uploadImagem,
  buscarCategorias,
  buscarEmpresaPorId,
  atualizarEmpresa,
  type Empresa,
  type Post as PostType
} from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import categoriasData from "@/data/categorias-empresas.json";

const Dashboard = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [subcategoriasSelecionadas, setSubcategoriasSelecionadas] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Dados editáveis
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [site, setSite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkGoogleMaps, setLinkGoogleMaps] = useState("");



  const carregarCategorias = async () => {
    const cats = await buscarCategorias();
    setCategorias(cats.map(c => c.nome));
  };

  const carregarPosts = async (empresaId: string) => {
    setLoadingPosts(true);
    try {
      const res = await fetch(`/api/posts?empresaId=${empresaId}`);
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    const auth = localStorage.getItem('empresa_auth');

    if (!auth) {
      toast("Acesso negado", { description: "Faça login primeiro" });
      navigate('/sua-empresa');
      return;
    }

    try {
      const { empresaId } = JSON.parse(auth);

      const data = await buscarEmpresaPorId(empresaId);

      if (!data) {
        throw new Error('Empresa não encontrada');
      }

      setEmpresa(data);
      setNome(data.nome);
      setDescricao(data.descricao);
      setSubcategoriasSelecionadas(data.subcategorias || []);

      if (data.categoria_id) {
        const cat = categoriasData.categorias.find(c => c.id === data.categoria_id);
        setCategoria(cat?.nome || "");
      }

      setTelefone(data.telefone || "");
      setWhatsapp(data.whatsapp || "");
      setEmail(data.email || "");
      setSite(data.site || "");
      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setLinkGoogleMaps(data.link_google_maps || "");

      // Carregar posts e categorias
      carregarPosts(empresaId);
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
      toast("Erro ao carregar dados", { description: "Tente novamente" });
      localStorage.removeItem('empresa_auth');
      navigate('/sua-empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('empresa_auth');
    toast("Logout realizado", { duration: 1500 });
    navigate('/');
  };

  const handleSalvar = async () => {
    if (!empresa) return;

    setSalvando(true);
    try {
      // Mapear nome da categoria de volta para ID
      let categoriaId = empresa.categoria_id;
      if (categoria) {
        const cat = categoriasData.categorias.find(c => c.nome === categoria);
        if (cat) categoriaId = cat.id;
      }

      const sucesso = await atualizarEmpresa(empresa.id, {
        nome,
        descricao,
        categoria_id: categoriaId,
        subcategorias: subcategoriasSelecionadas,
        telefone,
        whatsapp,
        email,
        site: site || null,
        instagram: instagram || null,
        facebook: facebook || null,
        link_google_maps: linkGoogleMaps || null,
      });

      if (!sucesso) throw new Error('Falha ao salvar');

      toast("Dados atualizados!", { description: "Alterações salvas com sucesso", duration: 2000 });
      setEditando(false);

      // Recarregar dados
      verificarAutenticacao();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast("Erro ao salvar", { description: "Tente novamente", duration: 2000 });
    } finally {
      setSalvando(false);
    }
  };

  const handleUploadImagem = async (file: File) => {
    if (!empresa) return;

    try {
      toast("Fazendo upload do banner...", { duration: 1000 });

      const url = await uploadImagem('empresas-images', file, `banner-${empresa.id}`);

      if (!url) throw new Error('Falha no upload');

      // Substituir o banner (sempre será a primeira posição)
      const novasImagens = [url];

      const sucesso = await atualizarEmpresa(empresa.id, { imagens: novasImagens });

      if (!sucesso) throw new Error('Falha ao salvar url da imagem');

      toast.success("Banner atualizado!");
      setEmpresa({ ...empresa, imagens: novasImagens });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error("Erro ao enviar banner");
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!empresa) return;

    try {
      toast("Fazendo upload da logo...", { duration: 1000 });

      const url = await uploadImagem('empresas-images', file, `logo-${empresa.id}`);

      if (!url) throw new Error('Falha no upload');

      const sucesso = await atualizarEmpresa(empresa.id, { logo: url });

      if (!sucesso) throw new Error('Falha ao salvar url da logo');

      toast.success("Logo atualizada com sucesso!");
      setEmpresa({ ...empresa, logo: url });
    } catch (error) {
      console.error('Erro no upload da logo:', error);
      toast.error("Erro ao enviar logo");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'pendente':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center animate-in fade-in duration-500">
          <Building2 className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (!empresa) return null;

  const navItems = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
    { id: "perfil", label: "Meu Perfil", icon: User },
    { id: "imagens", label: "Logo e Banner", icon: ImageIcon },
    { id: "config", label: "Configurações", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center p-2 shadow-sm border border-zinc-100 dark:border-zinc-700">
          <img src="/images/logo.png" alt="Aqui Guaíra" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 leading-none">Painel Empresa</span>
          <span className="text-[10px] uppercase tracking-wider text-primary font-bold mt-1">Aqui Guaíra</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setEditando(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? "" : "group-hover:scale-110 transition-transform"}`} />
            <span className="font-medium flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
            {empresa?.logo ? <img src={empresa.logo} className="w-full h-full object-cover" /> : "E"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{empresa?.nome}</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter">Conta {empresa?.destaque ? "Premium" : "Básica"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-3 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair da Conta</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex rounded-xl gap-2 font-bold text-xs"
              onClick={() => window.open(`/perfil-de-empresa/${empresa?.slug}`, '_blank')}
            >
              <Eye className="w-4 h-4" /> Perfil Público
            </Button>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Painel do Parceiro</p>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard label="Visualizações" value={empresa.visualizacoes || 0} sub="Visitas no perfil" icon={Eye} color="bg-emerald-500" />
                  <StatCard label="Status" value={empresa.status === 'aprovado' ? "Ativo" : "Pendente"} sub="Status da conta" icon={CheckCircle2} color="bg-amber-500" />
                  <StatCard label="Destaque" value={empresa.destaque ? "Sim" : "Não"} sub="Exposição premium" icon={Star} color="bg-purple-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Info Card */}
                  <Card className="lg:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">Bem-vindo, {empresa.nome}!</h3>
                        <p className="text-sm text-muted-foreground">Este é o seu novo painel de controle.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <p className="text-xs font-bold uppercase text-zinc-400 mb-2">Dica do Dia</p>
                        <p className="text-sm">Mantenha suas fotos atualizadas para atrair mais clientes!</p>
                      </div>
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <p className="text-xs font-bold uppercase text-zinc-400 mb-2">Novo no Mural</p>
                        <p className="text-sm">Você pode publicar avisos e promoções direto no Mural da cidade.</p>
                      </div>
                    </div>
                  </Card>

                  {/* Sidebar stats/links */}
                  <div className="space-y-6">
                    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Atalhos Rápidos
                      </h4>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start rounded-xl text-sm" onClick={() => setActiveTab("perfil")}>Editar Informações</Button>
                        <Button variant="ghost" className="w-full justify-start rounded-xl text-sm" onClick={() => setActiveTab("imagens")}>Trocar Fotos</Button>
                        <Button variant="ghost" className="w-full justify-start rounded-xl text-sm font-bold text-primary" onClick={() => navigate('/mural')}>Publicar no Mural</Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PERFIL VIEW (Unified Edit) */}
            {activeTab === "perfil" && (
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <header className="p-6 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Dados Principais</h3>
                      <p className="text-xs text-muted-foreground">Informações que aparecem na busca e perfil.</p>
                    </div>
                    {!editando ? (
                      <Button onClick={() => setEditando(true)} className="rounded-xl gap-2 h-10">
                        <Edit className="w-4 h-4" /> Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setEditando(false)} className="rounded-xl h-10">Cancelar</Button>
                        <Button onClick={handleSalvar} disabled={salvando} className="rounded-xl h-10 gap-2">
                          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </header>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest pl-1">Nome Fantasia</Label>
                          {editando ? <Input value={nome} onChange={e => setNome(e.target.value)} className="rounded-xl h-12" /> : <p className="text-lg font-bold p-1">{nome}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest pl-1">Categoria Principal</Label>
                          {editando ? (
                            <Select value={categoria} onValueChange={setCategoria}>
                              <SelectTrigger className="rounded-xl h-12 text-foreground font-medium border-border">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-2xl border-border/50">
                                {categoriasData.categorias.map(cat => (
                                  <SelectItem key={cat.id} value={cat.nome} className="rounded-lg">{cat.icone} {cat.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : <p className="font-semibold p-1">{categoria || "Não definida"}</p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-black uppercase text-zinc-400 tracking-widest pl-1">Sobre o Negócio</Label>
                        {editando ? <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="rounded-xl min-h-[140px] resize-none" /> : <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed p-1">{descricao}</p>}
                      </div>
                    </div>

                    <div className="border-t dark:border-zinc-800 pt-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest pl-1">Subcategorias (Máximo 3)</h4>
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter">
                          {subcategoriasSelecionadas.length} de 3
                        </Badge>
                      </div>

                      {editando ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categoriasData.categorias
                            .find(c => c.nome === categoria)
                            ?.subcategorias.map(sub => {
                              const isSelected = subcategoriasSelecionadas.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSubcategoriasSelecionadas(subcategoriasSelecionadas.filter(s => s !== sub));
                                    } else if (subcategoriasSelecionadas.length < 3) {
                                      setSubcategoriasSelecionadas([...subcategoriasSelecionadas, sub]);
                                    }
                                  }}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${isSelected
                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 text-muted-foreground"
                                    }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {subcategoriasSelecionadas.length > 0 ? (
                            subcategoriasSelecionadas.map(sub => (
                              <Badge key={sub} variant="secondary" className="rounded-lg px-3 py-1 text-[11px] font-bold">
                                {sub}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-zinc-500 italic pl-1">Nenhuma subcategoria selecionada.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t dark:border-zinc-800 pt-8">
                      <h4 className="font-bold mb-6 text-zinc-400 uppercase text-[10px] tracking-widest pl-1">Contatos e Redes Sociais</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ContactField icon={Phone} label="Telefone" value={telefone} editing={editando} onChange={setTelefone} />
                        <ContactField icon={Phone} label="WhatsApp" value={whatsapp} editing={editando} onChange={setWhatsapp} isWa />
                        <ContactField icon={Mail} label="E-mail" value={email} editing={editando} onChange={setEmail} />
                        <ContactField icon={Instagram} label="Instagram" value={instagram} editing={editando} onChange={setInstagram} placeholder="@sua-empresa" />
                        <ContactField icon={Facebook} label="Facebook" value={facebook} editing={editando} onChange={setFacebook} placeholder="facebook.com/empresa" />
                        <ContactField icon={Globe} label="Site Oficial" value={site} editing={editando} onChange={setSite} placeholder="https://..." />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3. IMAGENS VIEW */}
            {activeTab === "imagens" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[32px] overflow-hidden shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
                  <header className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold">Logo do Perfil</h3>
                    <Button variant="ghost" size="sm" onClick={() => document.getElementById('upload-logo')?.click()}>Alterar</Button>
                  </header>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="w-48 h-48 rounded-[48px] bg-zinc-50 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden mb-6 flex items-center justify-center">
                      {empresa.logo ? <img src={empresa.logo} className="w-full h-full object-cover" /> : <Building2 className="w-16 h-16 text-zinc-200" />}
                    </div>
                    <input type="file" id="upload-logo" className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUploadLogo(e.target.files[0]) }} />
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest text-center">Recomendado: Quadrado 400x400px</p>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] overflow-hidden shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
                  <header className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold">Banner de Destaque</h3>
                    <Button variant="ghost" size="sm" onClick={() => document.getElementById('upload-banner')?.click()}>Alterar</Button>
                  </header>
                  <CardContent className="p-6 space-y-4">
                    <div className="aspect-[3/1] rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 overflow-hidden flex items-center justify-center group relative">
                      {empresa.imagens?.[0] ? <img src={empresa.imagens[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-zinc-200" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" onClick={() => document.getElementById('upload-banner')?.click()}>Substituir Imagem</Button>
                      </div>
                    </div>
                    <input type="file" id="upload-banner" className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) handleUploadImagem(e.target.files[0]) }} />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">Aparece no topo do seu perfil público</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 4. MURAL VIEW */}
            {activeTab === "mural" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Meus Posts no Mural</h3>
                    <p className="text-sm text-zinc-500">Avisos e comunicados que você publicou.</p>
                  </div>
                  <Button size="lg" className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/mural')}>
                    <Plus className="w-5 h-5" /> Novo Post
                  </Button>
                </div>

                {loadingPosts ? (
                  <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /></div>
                ) : posts.length === 0 ? (
                  <Card className="border-dashed py-20 text-center rounded-[32px]">
                    <p className="text-zinc-500">Você ainda não publicou nada no mural.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map(post => (
                      <Card key={post.id} className="rounded-3xl overflow-hidden shadow-sm border-zinc-200 dark:border-zinc-800">
                        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 border-b dark:border-zinc-800 overflow-hidden">
                          {post.imagens?.[0] ? <img src={post.imagens[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><FileText className="w-10 h-10" /></div>}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant={post.status === 'aprovado' ? "default" : post.status === 'pendente' ? "secondary" : "destructive"}>
                              {post.status.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] font-bold text-zinc-400">{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed line-clamp-3">{post.conteudo}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS (Identical pattern to Admin for consistency) ---

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="p-6 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest pl-0.5 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</span>
            <span className="text-[10px] font-bold text-zinc-500 truncate">{sub}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ContactField({ icon: Icon, label, value, editing, onChange, placeholder, isWa }: any) {
  return (
    <div className="space-y-1.5 p-4 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-2 text-zinc-400">
        <Icon className="w-3.5 h-3.5" />
        <Label className="text-[10px] font-black uppercase tracking-widest">{label}</Label>
      </div>
      {editing ? (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-xl bg-white dark:bg-zinc-900"
        />
      ) : (
        <p className="text-sm font-bold truncate flex items-center gap-2">
          {value || "Não informado"}
          {isWa && value && <Badge className="bg-emerald-500 text-[8px] h-4">Zap</Badge>}
        </p>
      )}
    </div>
  )
}

export default Dashboard;
