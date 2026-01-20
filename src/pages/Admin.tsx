import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Shield, 
  Building2, 
  FileText, 
  Users, 
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Unlock,
  Clock,
  TrendingUp,
  AlertTriangle,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Estatisticas {
  empresas_ativas: number;
  empresas_bloqueadas: number;
  total_empresas: number;
  posts_pendentes: number;
  posts_aprovados: number;
  total_posts: number;
  total_usuarios: number;
  total_admins: number;
}

interface Empresa {
  id: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
  categorias?: { nome: string };
  ativa: boolean;
  status?: string; // 'pendente', 'aprovado', 'rejeitado'
  destaque?: boolean;
  data_cadastro: string;
  motivo_bloqueio?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  logo?: string;
  imagens?: string[];
}

interface Categoria {
  id: string;
  nome: string;
}

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  aprovado: boolean;
  data_criacao: string;
  data_aprovacao?: string;
  motivo_rejeicao?: string;
  empresa_id: string;
  user_id: string;
  bairro?: string;
  logradouro?: string;
  empresas?: { nome: string };
  users?: { nome: string; email: string };
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [postSelecionado, setPostSelecionado] = useState<Post | null>(null);
  const [motivoBloqueio, setMotivoBloqueio] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [showBloqueioDialog, setShowBloqueioDialog] = useState(false);
  const [showRejeicaoDialog, setShowRejeicaoDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [showRejeitarEmpresaDialog, setShowRejeitarEmpresaDialog] = useState(false);
  const [motivoRejeicaoEmpresa, setMotivoRejeicaoEmpresa] = useState("");

  useEffect(() => {
    verificarAdmin();
  }, []);

  // Aplicar filtros sempre que empresas ou filtros mudarem
  useEffect(() => {
    let filtered = [...empresas];

    // Filtro por nome
    if (filtroNome.trim()) {
      filtered = filtered.filter(e => 
        e.nome.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }

    // Filtro por status
    if (filtroStatus === "ativas") {
      filtered = filtered.filter(e => e.ativa && e.status === 'aprovado');
    } else if (filtroStatus === "bloqueadas") {
      filtered = filtered.filter(e => !e.ativa);
    } else if (filtroStatus === "pendentes") {
      filtered = filtered.filter(e => e.status === 'pendente');
    }

    // Filtro por categoria
    if (filtroCategoria !== "todas") {
      filtered = filtered.filter(e => e.categoria_id === filtroCategoria);
    }

    setEmpresasFiltradas(filtered);
  }, [empresas, filtroNome, filtroStatus, filtroCategoria]);

  const verificarAdmin = async () => {
    try {
      // Verificar se há admin logado no localStorage
      const adminStr = localStorage.getItem("admin");
      
      if (!adminStr) {
        navigate("/admin");
        return;
      }

      const admin = JSON.parse(adminStr);
      
      // Verificar se o login não expirou (24 horas)
      const loginTime = new Date(admin.loginTime);
      const now = new Date();
      const diffHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      
      if (diffHours > 24) {
        localStorage.removeItem("admin");
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/admin");
        return;
      }

      setAdminData(admin);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("admin");
    toast.success("Logout realizado");
    navigate("/admin");
  };


  const carregarDados = async () => {
    await Promise.all([
      carregarEstatisticas(),
      carregarEmpresas(),
      carregarPosts(),
      carregarCategorias()
    ]);
  };

  const carregarEstatisticas = async () => {
    const { data, error } = await supabase
      .from("admin_estatisticas")
      .select("*")
      .single();

    if (!error && data) {
      setEstatisticas(data);
    }
  };

  const carregarEmpresas = async () => {
    const { data, error } = await supabase
      .from("empresas")
      .select(`
        *,
        categorias(nome)
      `)
      .order("data_cadastro", { ascending: false });

    if (!error && data) {
      setEmpresas(data);
    } else if (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const carregarPosts = async () => {
    const { data, error } = await supabase
      .from("mural_posts")
      .select(`
        *,
        empresas!empresa_id(nome),
        users!user_id(nome, email)
      `)
      .order("data_criacao", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  };

  const carregarCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome")
      .order("nome");

    if (!error && data) {
      setCategorias(data);
    }
  };

  const handleBloquearEmpresa = async () => {
    if (!empresaSelecionada || !motivoBloqueio.trim()) {
      toast.error("Informe o motivo do bloqueio");
      return;
    }

    if (!adminData) return;

    // Atualizar empresa diretamente
    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        ativa: false,
        motivo_bloqueio: motivoBloqueio
      })
      .eq("id", empresaSelecionada.id);

    if (updateError) {
      toast.error("Erro ao bloquear empresa");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "bloquear_empresa",
      entidade_tipo: "empresa",
      entidade_id: empresaSelecionada.id,
      detalhes: `Empresa "${empresaSelecionada.nome}" bloqueada: ${motivoBloqueio}`
    });

    toast.success("Empresa bloqueada com sucesso");
    setShowBloqueioDialog(false);
    setMotivoBloqueio("");
    setEmpresaSelecionada(null);
    await carregarDados();
  };

  const handleDesbloquearEmpresa = async (empresa: Empresa) => {
    if (!adminData) return;

    // Atualizar empresa diretamente
    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        ativa: true,
        motivo_bloqueio: null
      })
      .eq("id", empresa.id);

    if (updateError) {
      toast.error("Erro ao desbloquear empresa");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "desbloquear_empresa",
      entidade_tipo: "empresa",
      entidade_id: empresa.id,
      detalhes: `Empresa "${empresa.nome}" desbloqueada`
    });

    toast.success("Empresa desbloqueada com sucesso");
    await carregarDados();
  };

  const handleAprovarEmpresa = async (empresa: Empresa) => {
    if (!adminData) return;

    // Aprovar empresa: status='aprovado' e ativa=true
    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        status: 'aprovado',
        ativa: true,
        verificado: true
      })
      .eq("id", empresa.id);

    if (updateError) {
      toast.error("Erro ao aprovar empresa");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "aprovar_empresa",
      entidade_tipo: "empresa",
      entidade_id: empresa.id,
      detalhes: `Empresa "${empresa.nome}" aprovada`
    });

    toast.success(`✅ ${empresa.nome} aprovada com sucesso!`);
    await carregarDados();
  };

  const handleRejeitarEmpresa = async (empresa: Empresa, motivo: string) => {
    if (!adminData) return;

    // Rejeitar empresa
    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        status: 'rejeitado',
        ativa: false,
        motivo_bloqueio: motivo
      })
      .eq("id", empresa.id);

    if (updateError) {
      toast.error("Erro ao rejeitar empresa");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "rejeitar_empresa",
      entidade_tipo: "empresa",
      entidade_id: empresa.id,
      detalhes: `Empresa "${empresa.nome}" rejeitada. Motivo: ${motivo}`
    });

    toast.success("Empresa rejeitada");
    await carregarDados();
  };

  const handleToggleDestaque = async (empresa: Empresa) => {
    if (!adminData) return;

    const novoDestaque = !empresa.destaque;

    // Alternar destaque
    const { error: updateError } = await supabase
      .from("empresas")
      .update({
        destaque: novoDestaque
      })
      .eq("id", empresa.id);

    if (updateError) {
      toast.error("Erro ao atualizar destaque");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: novoDestaque ? "destacar_empresa" : "remover_destaque_empresa",
      entidade_tipo: "empresa",
      entidade_id: empresa.id,
      detalhes: `Empresa "${empresa.nome}" ${novoDestaque ? 'adicionada ao' : 'removida do'} destaque`
    });

    toast.success(novoDestaque ? "⭐ Empresa destacada!" : "Destaque removido");
    await carregarDados();
  };

  const handleAprovarPost = async (post: Post) => {
    if (!adminData) return;

    // Atualizar o post diretamente
    const { error: updateError } = await supabase
      .from("mural_posts")
      .update({
        aprovado: true,
        data_aprovacao: new Date().toISOString(),
        admin_aprovador_id: adminData.id
      })
      .eq("id", post.id);

    if (updateError) {
      toast.error("Erro ao aprovar post");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "aprovar_post",
      entidade_tipo: "post",
      entidade_id: post.id,
      detalhes: `Post "${post.titulo}" aprovado`
    });

    toast.success("Post aprovado com sucesso");
    await carregarDados();
  };

  const handleRejeitarPost = async () => {
    if (!postSelecionado || !motivoRejeicao.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    if (!adminData) return;

    // Atualizar o post com motivo de rejeição
    const { error: updateError } = await supabase
      .from("mural_posts")
      .update({
        aprovado: false,
        motivo_rejeicao: motivoRejeicao
      })
      .eq("id", postSelecionado.id);

    if (updateError) {
      toast.error("Erro ao rejeitar post");
      console.error(updateError);
      return;
    }

    // Registrar log
    await supabase.from("admin_logs").insert({
      admin_id: adminData.id,
      acao: "rejeitar_post",
      entidade_tipo: "post",
      entidade_id: postSelecionado.id,
      detalhes: `Post "${postSelecionado.titulo}" rejeitado: ${motivoRejeicao}`
    });

    toast.success("Post rejeitado");
    setShowRejeicaoDialog(false);
    setMotivoRejeicao("");
    setPostSelecionado(null);
    await carregarDados();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando painel administrativo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Olá, {adminData?.nome}! Gerencie empresas, posts e visualize estatísticas</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogoutAdmin}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.empresas_ativas}</div>
              <p className="text-xs text-muted-foreground">
                Total: {estatisticas.total_empresas}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Bloqueadas</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.empresas_bloqueadas}</div>
              <p className="text-xs text-muted-foreground">
                {((estatisticas.empresas_bloqueadas / estatisticas.total_empresas) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Aprovados</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.posts_aprovados}</div>
              <p className="text-xs text-muted-foreground">
                Total: {estatisticas.total_posts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total_usuarios}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.total_admins} administradores
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="empresas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresas">
            <Building2 className="w-4 h-4 mr-2" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="posts">
            <FileText className="w-4 h-4 mr-2" />
            Posts do Mural
            {estatisticas && estatisticas.posts_pendentes > 0 && (
              <Badge variant="destructive" className="ml-2">
                {estatisticas.posts_pendentes}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Empresas */}
        <TabsContent value="empresas" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtrar Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Buscar por Nome</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o nome..."
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="pendentes">⏳ Pendentes</SelectItem>
                      <SelectItem value="ativas">✅ Ativas</SelectItem>
                      <SelectItem value="bloqueadas">🚫 Bloqueadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {empresasFiltradas.length} de {empresas.length} empresas
              </div>
            </CardContent>
          </Card>

          {/* Lista de Empresas */}
          {empresasFiltradas.map((empresa) => (
            <Card key={empresa.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  {empresa.logo ? (
                    <img 
                      src={empresa.logo} 
                      alt={empresa.nome}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{empresa.nome}</CardTitle>
                      {empresa.status === 'pendente' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      {empresa.status === 'aprovado' && empresa.ativa && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                      {empresa.status === 'aprovado' && !empresa.ativa && (
                        <Badge variant="destructive">
                          <Ban className="w-3 h-3 mr-1" />
                          Bloqueada
                        </Badge>
                      )}
                      {empresa.status === 'rejeitado' && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejeitada
                        </Badge>
                      )}
                    </div>
                    
                    <CardDescription className="mb-3">
                      {empresa.categorias?.nome} • Cadastrada em {formatarData(empresa.data_cadastro)}
                    </CardDescription>

                    {/* Informações de contato */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {empresa.bairro && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {empresa.bairro}
                        </div>
                      )}
                      {empresa.telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {empresa.telefone}
                        </div>
                      )}
                      {empresa.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {empresa.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmpresaSelecionada(empresa);
                        setShowDetalhesDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                    
                    {/* Botões para empresas PENDENTES */}
                    {empresa.status === 'pendente' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAprovarEmpresa(empresa)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setEmpresaSelecionada(empresa);
                            setShowRejeitarEmpresaDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    
                    {/* Botões para empresas ATIVAS/APROVADAS */}
                    {empresa.status === 'aprovado' && empresa.ativa && (
                      <>
                        <Button
                          variant={empresa.destaque ? "secondary" : "default"}
                          size="sm"
                          className={empresa.destaque ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                          onClick={() => handleToggleDestaque(empresa)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {empresa.destaque ? "⭐ Destacada" : "Destacar"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setEmpresaSelecionada(empresa);
                            setShowBloqueioDialog(true);
                          }}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Bloquear
                        </Button>
                      </>
                    )}
                    
                    {/* Botões para empresas BLOQUEADAS */}
                    {empresa.status === 'aprovado' && !empresa.ativa && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDesbloquearEmpresa(empresa)}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Desbloquear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {!empresa.ativa && empresa.motivo_bloqueio && (
                <CardContent>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Motivo do bloqueio:</strong> {empresa.motivo_bloqueio}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          ))}

          {empresasFiltradas.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma empresa encontrada com os filtros selecionados
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Posts */}
        <TabsContent value="posts" className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{post.titulo}</CardTitle>
                      {post.motivo_rejeicao ? (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejeitado
                        </Badge>
                      ) : post.aprovado ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aprovado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-600 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mb-1">
                      {post.empresas?.nome} • {formatarData(post.data_criacao)}
                    </CardDescription>
                    {post.users && (
                      <p className="text-sm text-muted-foreground">
                        Por: {post.users.nome} ({post.users.email})
                      </p>
                    )}
                    {(post.bairro || post.logradouro) && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">
                            {[post.logradouro, post.bairro].filter(Boolean).join(' • ')}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  {!post.aprovado && !post.motivo_rejeicao && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAprovarPost(post)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPostSelecionado(post);
                          setShowRejeicaoDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {post.imagem ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={post.imagem} 
                        alt={post.titulo}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                    <p className="text-sm leading-relaxed">{post.conteudo}</p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{post.conteudo}</p>
                )}
                {post.motivo_rejeicao && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Motivo da rejeição:</strong> {post.motivo_rejeicao}
                    </AlertDescription>
                  </Alert>
                )}
                {post.aprovado && post.data_aprovacao && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Aprovado em {formatarData(post.data_aprovacao)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum post encontrado
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Bloqueio Empresa */}
      <Dialog open={showBloqueioDialog} onOpenChange={setShowBloqueioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Empresa</DialogTitle>
            <DialogDescription>
              Informe o motivo do bloqueio de "{empresaSelecionada?.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo do Bloqueio</Label>
              <Textarea
                value={motivoBloqueio}
                onChange={(e) => setMotivoBloqueio(e.target.value)}
                placeholder="Ex: Conteúdo inadequado, informações falsas..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBloqueioDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBloquearEmpresa}>
              Bloquear Empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeição Empresa */}
      <Dialog open={showRejeitarEmpresaDialog} onOpenChange={setShowRejeitarEmpresaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Empresa</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição de "{empresaSelecionada?.nome}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={motivoRejeicaoEmpresa}
                onChange={(e) => setMotivoRejeicaoEmpresa(e.target.value)}
                placeholder="Ex: CNPJ inválido, informações incompletas, duplicada..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejeitarEmpresaDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (empresaSelecionada && motivoRejeicaoEmpresa.trim()) {
                  handleRejeitarEmpresa(empresaSelecionada, motivoRejeicaoEmpresa);
                  setShowRejeitarEmpresaDialog(false);
                  setMotivoRejeicaoEmpresa("");
                }
              }}
            >
              Rejeitar Empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeição Post */}
      <Dialog open={showRejeicaoDialog} onOpenChange={setShowRejeicaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Post</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do post "{postSelecionado?.titulo}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Conteúdo ofensivo, propaganda enganosa..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejeicaoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejeitarPost}>
              Rejeitar Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes Empresa */}
      <Dialog open={showDetalhesDialog} onOpenChange={setShowDetalhesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Empresa</DialogTitle>
          </DialogHeader>
          {empresaSelecionada && (
            <div className="space-y-6">
              {/* Header com Logo */}
              <div className="flex items-start gap-4">
                {empresaSelecionada.logo ? (
                  <img 
                    src={empresaSelecionada.logo} 
                    alt={empresaSelecionada.nome}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{empresaSelecionada.nome}</h3>
                  <p className="text-muted-foreground">{empresaSelecionada.categorias?.nome}</p>
                  {empresaSelecionada.ativa ? (
                    <Badge variant="default" className="bg-green-600 mt-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="mt-2">
                      <Ban className="w-3 h-3 mr-1" />
                      Bloqueada
                    </Badge>
                  )}
                </div>
              </div>

              {/* Descrição */}
              {empresaSelecionada.descricao && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{empresaSelecionada.descricao}</p>
                  </CardContent>
                </Card>
              )}

              {/* Localização */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {empresaSelecionada.endereco && (
                    <p className="text-sm"><strong>Endereço:</strong> {empresaSelecionada.endereco}</p>
                  )}
                  {empresaSelecionada.bairro && (
                    <p className="text-sm"><strong>Bairro:</strong> {empresaSelecionada.bairro}</p>
                  )}
                  {empresaSelecionada.cidade && (
                    <p className="text-sm"><strong>Cidade:</strong> {empresaSelecionada.cidade}</p>
                  )}
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {empresaSelecionada.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{empresaSelecionada.telefone}</span>
                    </div>
                  )}
                  {empresaSelecionada.whatsapp && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>{empresaSelecionada.whatsapp}</span>
                    </div>
                  )}
                  {empresaSelecionada.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{empresaSelecionada.email}</span>
                    </div>
                  )}
                  {empresaSelecionada.site && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4" />
                      <a href={empresaSelecionada.site} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {empresaSelecionada.site}
                      </a>
                    </div>
                  )}
                  {empresaSelecionada.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="w-4 h-4" />
                      <a href={`https://instagram.com/${empresaSelecionada.instagram}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        @{empresaSelecionada.instagram}
                      </a>
                    </div>
                  )}
                  {empresaSelecionada.facebook && (
                    <div className="flex items-center gap-2 text-sm">
                      <Facebook className="w-4 h-4" />
                      <a href={empresaSelecionada.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Facebook
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Galeria de Imagens */}
              {empresaSelecionada.imagens && empresaSelecionada.imagens.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Galeria de Imagens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {empresaSelecionada.imagens.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`${empresaSelecionada.nome} ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações Administrativas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informações Administrativas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Cadastrada em:</strong> {formatarData(empresaSelecionada.data_cadastro)}</p>
                  {!empresaSelecionada.ativa && empresaSelecionada.motivo_bloqueio && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Motivo do bloqueio:</strong> {empresaSelecionada.motivo_bloqueio}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
