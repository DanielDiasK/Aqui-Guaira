import { useEffect, useState } from "react";
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
  Search,
  Trash2,
  LayoutDashboard,
  UserCheck,
  History,
  Menu,
  ChevronRight,
  ExternalLink,
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  razaoSocial?: string;
  cnpj?: string;
  descricao?: string;
  categoria_id: string;
  categorias?: { nome: string };
  ativa: boolean;
  status?: string; // 'pendente', 'aprovado', 'rejeitado'
  destaque?: boolean;
  data_cadastro: string;
  motivo_bloqueio?: string;
  telefone?: string;
  celular?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  logo?: string;
  banner?: string;
  link_google_maps?: string;
  imagens?: string[];
}

interface User {
  id: string;
  nome: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagens?: string[];
  status: string; // 'pendente', 'aprovado', 'rejeitado'
  created_at: string;
  data_aprovacao?: string;
  motivo_rejeicao?: string;
  empresa_id?: string;
  user_id?: string;
  bairro?: string;
  logradouro?: string;
  autor_nome?: string;
  autor_email?: string;
  autor_bairro?: string;
  empresas?: { nome: string };
  users?: { nome: string; email: string };
}

interface AdminLog {
  id: string;
  admin_id: string;
  acao: string;
  entidade_tipo: string;
  entidade_id: string;
  detalhes: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminData, setAdminData] = useState<any>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
  const [postSelecionado, setPostSelecionado] = useState<Post | null>(null);
  const [motivoBloqueio, setMotivoBloqueio] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [showBloqueioDialog, setShowBloqueioDialog] = useState(false);
  const [showRejeicaoDialog, setShowRejeicaoDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showPostDetalhesDialog, setShowPostDetalhesDialog] = useState(false);

  // Filtros Empresas
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [showRejeitarEmpresaDialog, setShowRejeitarEmpresaDialog] = useState(false);
  const [motivoRejeicaoEmpresa, setMotivoRejeicaoEmpresa] = useState("");

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    let filtered = [...empresas];
    if (filtroNome.trim()) {
      filtered = filtered.filter(e => e.nome.toLowerCase().includes(filtroNome.toLowerCase()));
    }
    if (filtroStatus === "ativas") {
      filtered = filtered.filter(e => e.ativa && e.status === 'aprovado');
    } else if (filtroStatus === "bloqueadas") {
      filtered = filtered.filter(e => !e.ativa);
    } else if (filtroStatus === "pendentes") {
      filtered = filtered.filter(e => e.status === 'pendente');
    }
    setEmpresasFiltradas(filtered);
  }, [empresas, filtroNome, filtroStatus]);

  const verificarAdmin = async () => {
    try {
      const adminStr = localStorage.getItem("admin");
      if (!adminStr) {
        navigate("/admin");
        return;
      }
      const admin = JSON.parse(adminStr);
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

  const carregarDados = async () => {
    await Promise.all([
      carregarEstatisticas(),
      carregarEmpresas(),
      carregarPosts(),
      carregarUsuarios(),
      carregarLogs(),
      carregarCategorias()
    ]);
  };

  const carregarEstatisticas = async () => {
    const res = await fetch('/api/admin?action=stats');
    if (res.ok) setEstatisticas(await res.json());
  };

  const carregarEmpresas = async () => {
    const res = await fetch('/api/empresas?admin=true');
    if (res.ok) setEmpresas(await res.json());
  };

  const carregarPosts = async () => {
    const res = await fetch('/api/posts?admin=true');
    if (res.ok) setPosts(await res.json());
  };

  const carregarUsuarios = async () => {
    const res = await fetch('/api/admin?action=usuarios');
    if (res.ok) setUsuarios(await res.json());
  };

  const carregarLogs = async () => {
    const res = await fetch('/api/admin?action=logs');
    if (res.ok) setLogs(await res.json());
  };

  const carregarCategorias = async () => {
    const { buscarCategorias } = await import("@/lib/supabase");
    setCategorias(await buscarCategorias());
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("admin");
    toast.success("Logout realizado");
    navigate("/admin");
  };

  // Açôes de Empresa
  const handleBloquearEmpresa = async () => {
    if (!empresaSelecionada || !motivoBloqueio.trim()) {
      toast.error("Informe o motivo do bloqueio");
      return;
    }
    const res = await fetch(`/api/empresas?id=${empresaSelecionada.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativa: false, status: 'bloqueado', motivo_bloqueio: motivoBloqueio })
    });
    if (res.ok) {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminData.id, acao: "bloquear_empresa", entidade_tipo: "empresa", entidade_id: empresaSelecionada.id, detalhes: `Empresa "${empresaSelecionada.nome}" bloqueada: ${motivoBloqueio}` })
      });
      toast.success("Empresa bloqueada");
      setShowBloqueioDialog(false);
      await carregarDados();
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    const res = await fetch(`/api/admin?action=toggle_admin&id=${userId}`, { method: 'PATCH' });
    if (res.ok) {
      toast.success("Status de admin alterado");
      await carregarDados();
    }
  };

  const handleExcluirUsuario = async (userId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    const res = await fetch(`/api/admin?action=usuario&id=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success("Usuário excluído");
      await carregarDados();
    }
  };

  const handleExcluirEmpresa = async (empresa: Empresa) => {
    if (!window.confirm(`Excluir permanentemente "${empresa.nome}"?`)) return;
    const res = await fetch(`/api/empresas?id=${empresa.id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminData.id, acao: "excluir_empresa", entidade_tipo: "empresa", entidade_id: empresa.id, detalhes: `Empresa "${empresa.nome}" excluída` })
      });
      toast.success("Empresa excluída");
      await carregarDados();
    }
  };
  const handleExcluirPost = async (post: Post) => {
    if (!window.confirm(`Excluir permanentemente o post "${post.titulo}"?`)) return;
    const res = await fetch(`/api/posts?id=${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminData.id,
          acao: "excluir_post",
          entidade_tipo: "post",
          entidade_id: post.id,
          detalhes: `Post "${post.titulo}" excluído pelo administrador`
        })
      });
      toast.success("Post excluído permanentemente");
      setShowPostDetalhesDialog(false);
      await carregarDados();
    } else {
      toast.error("Erro ao excluir post");
    }
  };


  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center animate-in fade-in duration-500">
        <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Autenticando acesso seguro...</p>
      </div>
    </div>
  );

  const formatarData = (data: string) => {
    if (!data) return "N/D";
    try {
      return new Date(data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "Data inválida";
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "empresas", label: "Empresas", icon: Building2 },
    { id: "posts", label: "Posts do Mural", icon: FileText, badge: estatisticas?.posts_pendentes },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "logs", label: "Auditoria", icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center p-2 shadow-sm border border-zinc-100 dark:border-zinc-700">
            <img src="/images/logo.png" alt="Aqui Guaíra" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 leading-none">Aqui Guaíra</span>
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold mt-1">Painel Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "" : "group-hover:scale-110 transition-transform"}`} />
              <span className="font-medium flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === item.id ? "bg-white text-primary" : "bg-red-500 text-white animate-bounce"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {adminData?.nome?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{adminData?.nome}</p>
              <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter">Administrador</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 gap-3 rounded-xl"
            onClick={handleLogoutAdmin}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair do Painel</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formatarData(new Date().toISOString()).split(',')[0]}</p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status: Sistema Online ✅</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Ativas" value={estatisticas?.empresas_ativas} sub={`Total: ${estatisticas?.total_empresas}`} icon={Building2} color="bg-emerald-500" />
                  <StatCard label="Bloqueadas" value={estatisticas?.empresas_bloqueadas} sub="Excluídas do site" icon={Ban} color="bg-rose-500" />
                  <StatCard label="Posts Mural" value={estatisticas?.total_posts} sub={`${estatisticas?.posts_pendentes} pendentes`} icon={FileText} color="bg-amber-500" />
                  <StatCard label="Comunidade" value={estatisticas?.total_usuarios} sub={`${estatisticas?.total_admins} admins`} icon={Users} color="bg-blue-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Logs (preview) */}
                  <Card className="lg:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <div>
                        <CardTitle className="text-lg">Atividades Recentes</CardTitle>
                        <CardDescription>Ultimas ações realizadas no painel</CardDescription>
                      </div>
                      <History className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {logs.slice(0, 5).map((log) => (
                          <div key={log.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.acao.includes('bloquear') || log.acao.includes('excluir') || log.acao.includes('rejeitar') ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{log.detalhes}</p>
                              <p className="text-xs text-zinc-500">{formatarData(log.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="link" className="w-full mt-4 text-primary font-bold" onClick={() => setActiveTab("logs")}>
                        Ver histórico completo
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Actions / Tips */}
                  <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <QuickButton icon={Plus} label="Novo Local Turístico" disabled />
                      <QuickButton icon={Building2} label="Validar Empresas" onClick={() => setActiveTab("empresas")} />
                      <QuickButton icon={FileText} label="Moderar Mural" onClick={() => setActiveTab("posts")} accent />
                      <QuickButton icon={UserCheck} label="Gerenciar Equipe" onClick={() => setActiveTab("usuarios")} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* 2. EMPRESAS */}
            {activeTab === "empresas" && (
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                          placeholder="Buscar empresa por nome..."
                          className="pl-10 rounded-xl"
                          value={filtroNome}
                          onChange={(e) => setFiltroNome(e.target.value)}
                        />
                      </div>
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger className="w-full md:w-48 rounded-xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="todas">Todos Status</SelectItem>
                          <SelectItem value="ativas">Ativas</SelectItem>
                          <SelectItem value="pendentes">Pendentes</SelectItem>
                          <SelectItem value="bloqueadas">Bloqueadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  {empresasFiltradas.map((empresa) => (
                    <Card key={empresa.id} className="rounded-3xl border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all group">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700 overflow-hidden">
                            {empresa.logo ? (
                              <img src={empresa.logo} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-8 h-8 text-zinc-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-center md:text-left space-y-1">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-2">
                              {empresa.nome}
                              {empresa.destaque && <Badge className="bg-amber-500 text-[10px] uppercase">⭐ Destaque</Badge>}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-zinc-500 uppercase font-bold tracking-tighter">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {empresa.bairro || 'Guaíra'}</span>
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {empresa.whatsapp || empresa.telefone || 'S/ Tel'}</span>
                            </div>
                            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
                              <StatusBadge status={empresa.status} ativa={empresa.ativa} />
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-center md:justify-end gap-2 shrink-0">
                            <ActionBtn icon={Eye} label="Ver Detalhes" onClick={() => { setEmpresaSelecionada(empresa); setShowDetalhesDialog(true); }} />
                            {empresa.status === 'pendente' ? (
                              <ActionBtn icon={CheckCircle2} label="Aprovar" variant="success" onClick={async () => {
                                const res = await fetch(`/api/empresas?id=${empresa.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'aprovado', ativa: true }) });
                                if (res.ok) { toast.success("Empresa aprovada!"); await carregarDados(); }
                              }} />
                            ) : (
                              <ActionBtn
                                icon={empresa.ativa ? Ban : Unlock}
                                label={empresa.ativa ? "Bloquear" : "Ativar"}
                                variant={empresa.ativa ? "danger" : "success"}
                                onClick={async () => {
                                  if (empresa.ativa) {
                                    setEmpresaSelecionada(empresa);
                                    setShowBloqueioDialog(true);
                                  } else {
                                    const res = await fetch(`/api/empresas?id=${empresa.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativa: true, motivo_bloqueio: null, status: 'aprovado' }) });
                                    if (res.ok) { toast.success("Empresa ativada!"); await carregarDados(); }
                                  }
                                }}
                              />
                            )}
                            <ActionBtn icon={Trash2} variant="ghost-danger" onClick={() => handleExcluirEmpresa(empresa)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. POSTS */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                  <Card className="col-span-full py-16 text-center border-dashed rounded-3xl">
                    <p className="text-zinc-500">Nenhum post no mural para moderar.</p>
                  </Card>
                ) : posts.map((post) => (
                  <Card key={post.id} className="rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800 flex flex-col">
                    <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 border-b dark:border-zinc-800">
                      {post.imagens && post.imagens.length > 0 ? (
                        <img src={post.imagens[0]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <FileText className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <PostStatusBadge status={post.status} />
                      </div>
                    </div>
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">
                          {post.autor_nome || post.empresas?.nome || 'Anônimo'}
                        </CardDescription>
                        <span className="text-[10px] text-zinc-400 font-medium">{formatarData(post.created_at).split(',')[0]}</span>
                      </div>
                      <CardTitle className="text-lg mb-1 leading-tight line-clamp-1">{post.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-4 flex-1">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{post.conteudo}</p>
                    </CardContent>
                    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-800/80 border-t dark:border-zinc-800 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl h-9 gap-2 font-bold"
                          onClick={() => { setPostSelecionado(post); setShowPostDetalhesDialog(true); }}
                        >
                          <Eye className="w-4 h-4" /> Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl h-9 px-3 border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                          onClick={() => handleExcluirPost(post)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {post.status === 'pendente' && (
                          <>
                            <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl gap-2 h-10 shadow-lg shadow-emerald-500/20" onClick={async () => {
                              const res = await fetch(`/api/posts?id=${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'aprovado', data_aprovacao: new Date().toISOString(), admin_aprovador_id: adminData.id }) });
                              if (res.ok) { toast.success("Post aprovado!"); await carregarDados(); }
                            }}>
                              <CheckCircle2 className="w-4 h-4" /> Aprovar
                            </Button>
                            <Button variant="outline" className="flex-1 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl h-10" onClick={() => { setPostSelecionado(post); setShowRejeicaoDialog(true); }}>
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {post.status !== 'pendente' && (
                          <Button variant="ghost" className="w-full rounded-xl text-zinc-400 cursor-default h-10 text-xs font-bold bg-zinc-100 dark:bg-zinc-800/50">
                            {post.status === 'aprovado' ? "Post já publicado ✅" : "Post rejeitado ❌"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 4. USUÁRIOS */}
            {activeTab === "usuarios" && (
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase text-[10px] font-bold tracking-widest border-b dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-4">Usuário</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {usuarios.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.is_admin ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                                  {u.nome?.[0] || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{u.nome || 'Sem nome'}</p>
                                  <p className="text-xs text-zinc-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {u.is_admin ? (
                                <Badge className="bg-primary shadow-sm">Administrador</Badge>
                              ) : (
                                <Badge variant="outline" className="text-zinc-400 border-zinc-200">Visitante</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`rounded-xl gap-2 ${u.is_admin ? 'text-rose-500 hover:bg-rose-50' : 'text-primary hover:bg-primary/10'}`}
                                  onClick={() => handleToggleAdmin(u.id)}
                                >
                                  {u.is_admin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  {u.is_admin ? 'Revogar Admin' : 'Tornar Admin'}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl" onClick={() => handleExcluirUsuario(u.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* 5. LOGS */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <Card className="rounded-3xl shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-800/50 p-6 border-b dark:border-zinc-800">
                    <CardTitle>Histórico de Auditoria</CardTitle>
                    <CardDescription>Todas as modificações feitas pelo sistema administrativo</CardDescription>
                  </CardHeader>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {logs.map((log) => (
                      <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{log.detalhes}</p>
                          <div className="flex gap-4 text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                            <span>🚀 {log.acao}</span>
                            <span>👤 ID: {log.admin_id?.slice(-6)}</span>
                            <span>📅 {formatarData(log.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

          </div>
        </ScrollArea>
      </main>

      {/* MODALS / DIALOGS (Mantenho os mesmos mas posso dar um tapa no estilo depois) */}
      <Dialog open={showBloqueioDialog} onOpenChange={setShowBloqueioDialog}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Bloquear Empresa</DialogTitle>
            <DialogDescription>A empresa não aparecerá mais no site. Informe o motivo:</DialogDescription>
          </DialogHeader>
          <Textarea
            className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            placeholder="Ex: Informações falsas, fotos impróprias..."
            value={motivoBloqueio}
            onChange={(e) => setMotivoBloqueio(e.target.value)}
          />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowBloqueioDialog(false)}>Manter Ativa</Button>
            <Button variant="destructive" className="rounded-xl shadow-lg shadow-rose-500/20" onClick={handleBloquearEmpresa}>Confirmar Bloqueio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejeicaoDialog} onOpenChange={setShowRejeicaoDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Rejeitar Conteúdo</DialogTitle></DialogHeader>
          <Textarea
            className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 min-h-[100px]"
            value={motivoRejeicao}
            onChange={(e) => setMotivoRejeicao(e.target.value)}
            placeholder="Motivo da rejeição para o usuário..."
          />
          <DialogFooter>
            <Button variant="destructive" onClick={async () => {
              const res = await fetch(`/api/posts?id=${postSelecionado?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejeitado', motivo_rejeicao: motivoRejeicao }) });
              if (res.ok) { toast.success("Post rejeitado"); setShowRejeicaoDialog(false); await carregarDados(); }
            }}>Rejeitar Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Detalhes Dialog */}
      <Dialog open={showPostDetalhesDialog} onOpenChange={setShowPostDetalhesDialog}>
        <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          {postSelecionado && (
            <div className="flex flex-col">
              <div className="h-64 relative bg-zinc-100 dark:bg-zinc-900">
                {postSelecionado.imagens && postSelecionado.imagens.length > 0 ? (
                  <img src={postSelecionado.imagens[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <FileText className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <PostStatusBadge status={postSelecionado.status} />
                </div>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    <History className="w-3 h-3" />
                    Enviado em {formatarData(postSelecionado.created_at)}
                  </div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                    {postSelecionado.titulo}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Autor</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{postSelecionado.autor_nome || postSelecionado.users?.nome || 'Não identificado'}</p>
                    <p className="text-[10px] text-zinc-500">{postSelecionado.autor_email || postSelecionado.users?.email || 'Sem e-mail'}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Localização</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{postSelecionado.bairro || 'Guaíra'}</p>
                    <p className="text-[10px] text-zinc-500">{postSelecionado.logradouro || 'Endereço não informado'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest pl-1">Conteúdo da Mensagem</p>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                      {postSelecionado.conteudo}
                    </p>
                  </div>
                </div>

                {postSelecionado.motivo_rejeicao && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <p className="text-[9px] font-black uppercase text-rose-500 mb-1">Motivo da Rejeição</p>
                    <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">{postSelecionado.motivo_rejeicao}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setShowPostDetalhesDialog(false)}>
                    Fechar
                  </Button>
                  {postSelecionado.status === 'aprovado' && (
                    <Button variant="outline" className="rounded-2xl h-12 px-6 border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold" onClick={() => handleExcluirPost(postSelecionado)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                  {postSelecionado.status === 'pendente' && (
                    <Button className="flex-1 rounded-2xl h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20" onClick={async () => {
                      const res = await fetch(`/api/posts?id=${postSelecionado.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'aprovado', data_aprovacao: new Date().toISOString(), admin_aprovador_id: adminData.id }) });
                      if (res.ok) { toast.success("Post aprovado!"); await carregarDados(); setShowPostDetalhesDialog(false); }
                    }}>
                      Aprovar Agora
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detalhes Modal (Premium Style) */}
      <Dialog open={showDetalhesDialog} onOpenChange={setShowDetalhesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 bg-white dark:bg-zinc-950 overflow-x-hidden">
          {empresaSelecionada && (
            <div className="flex flex-col">
              {/* Banner Section */}
              <div className="h-64 relative overflow-hidden group">
                {(empresaSelecionada.banner || (empresaSelecionada.imagens && empresaSelecionada.imagens[0])) ? (
                  <img
                    src={empresaSelecionada.banner || empresaSelecionada.imagens?.[0]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-indigo-700" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Profile Info Section */}
              <div className="px-10 pb-10 -mt-20 relative z-10 flex flex-col md:flex-row gap-8 items-end">
                <div className="w-40 h-40 rounded-[40px] bg-white dark:bg-zinc-900 p-2 shadow-2xl mx-auto md:mx-0 shrink-0 transform hover:rotate-3 transition-transform duration-500 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-full h-full rounded-[32px] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {empresaSelecionada.logo ? (
                      <img src={empresaSelecionada.logo} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-16 h-16 text-zinc-300" />
                    )}
                  </div>
                </div>
                <div className="flex-1 pb-4 text-center md:text-left">
                  <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-2">{empresaSelecionada.nome}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                      {categorias.find(c => c.id === empresaSelecionada.categoria_id)?.nome || 'Empreendedor Local'}
                    </p>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                    <StatusBadge status={empresaSelecionada.status} ativa={empresaSelecionada.ativa} />
                    {empresaSelecionada.destaque && <Badge className="bg-amber-400 text-amber-950 font-black border-none animate-pulse">PREMIUM ⭐</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-10 pb-12">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Identity Card */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Informações de Registro</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[9px] uppercase font-black text-zinc-400 mb-1">CNPJ / Documento</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{empresaSelecionada.cnpj || 'Não informado'}</p>
                      </div>
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[9px] uppercase font-black text-zinc-400 mb-1">Razão Social</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{empresaSelecionada.razaoSocial || empresaSelecionada.nome}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Descrição do Negócio</label>
                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px] text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800 relative">
                      <span className="absolute top-4 left-6 text-6xl text-primary/5 font-serif">“</span>
                      <p className="relative z-10">{empresaSelecionada.descricao || "Esta empresa ainda não cadastrou uma descrição detalhada sobre seus serviços ou história."}</p>
                    </div>
                  </div>

                  {/* Location Summary */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Localização</label>
                    <div className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border-2 border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{empresaSelecionada.endereco || 'Apenas atendimento remoto'}</p>
                        <p className="text-sm text-zinc-500 font-medium">{empresaSelecionada.bairro} • Guaíra - SP {empresaSelecionada.cep ? `• CEP ${empresaSelecionada.cep}` : ''}</p>
                      </div>
                      {empresaSelecionada.link_google_maps && (
                        <Button className="rounded-2xl gap-2 font-bold group shadow-lg shadow-primary/20" onClick={() => window.open(empresaSelecionada.link_google_maps, '_blank')}>
                          Ver no Maps <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Info Column */}
                <div className="space-y-8">
                  {/* Contacts */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Canais de Contato</label>
                    <div className="grid grid-cols-1 gap-3">
                      <ContactItem icon={Phone} label="WhatsApp Business" value={empresaSelecionada.whatsapp} isSuccess />
                      <ContactItem icon={Phone} label="Celular / Tel" value={empresaSelecionada.celular || empresaSelecionada.telefone} />
                      <ContactItem icon={Mail} label="E-mail" value={empresaSelecionada.email} />
                      <ContactItem icon={Globe} label="Website" value={empresaSelecionada.site} isPrimary />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Redes Sociais</label>
                    <div className="flex gap-4">
                      {empresaSelecionada.instagram && (
                        <button className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-lg transform hover:-translate-y-1 transition-transform" onClick={() => window.open(`https://instagram.com/${empresaSelecionada.instagram}`, '_blank')}>
                          <Instagram className="w-6 h-6" />
                        </button>
                      )}
                      {empresaSelecionada.facebook && (
                        <button className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white shadow-lg transform hover:-translate-y-1 transition-transform" onClick={() => window.open(empresaSelecionada.facebook, '_blank')}>
                          <Facebook className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions Box */}
                  <div className="p-8 bg-zinc-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
                    <p className="text-[10px] font-bold uppercase opacity-50 mb-6 tracking-[0.3em] flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Gestão de Status
                    </p>
                    <div className="flex flex-col gap-3 relative z-10">
                      <Button className="w-full h-12 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px]" onClick={async () => {
                        const novoDestaque = !empresaSelecionada.destaque;
                        const res = await fetch(`/api/empresas?id=${empresaSelecionada.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destaque: novoDestaque }) });
                        if (res.ok) { toast.success(novoDestaque ? "Destaque ativado!" : "Destaque removido"); await carregarDados(); }
                      }}>
                        {empresaSelecionada.destaque ? "Remover Destaque" : "⭐ Ativar Destaque"}
                      </Button>
                      {empresaSelecionada.ativa ? (
                        <Button className="w-full h-12 rounded-2xl border-2 border-white/20 bg-white/5 text-white hover:bg-rose-500 hover:border-rose-500 font-black uppercase tracking-widest text-[10px] transition-all" onClick={() => { setShowDetalhesDialog(false); setShowBloqueioDialog(true); }}>
                          Bloquear
                        </Button>
                      ) : (
                        <Button className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]" onClick={async () => {
                          const res = await fetch(`/api/empresas?id=${empresaSelecionada.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativa: true, motivo_bloqueio: null, status: 'aprovado' }) });
                          if (res.ok) { toast.success("Empresa Reativada!"); await carregarDados(); setShowDetalhesDialog(false); }
                        }}>
                          Reativar Agora
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --------------------------------------------------------------------------------------------------------------------
// UI COMPONENTS HELPER
// --------------------------------------------------------------------------------------------------------------------

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white dark:bg-zinc-900">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5 leading-none">{value || 0}</p>
            <p className="text-[10px] text-zinc-400 font-bold mt-1.5">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickButton({ icon: Icon, label, onClick, disabled, accent }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
        ${disabled ? 'opacity-40 cursor-not-allowed bg-zinc-50 dark:bg-zinc-800' :
          accent ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary shadow-sm hover:text-white hover:shadow-lg hover:shadow-primary/20' :
            'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-primary hover:bg-primary/5 hover:text-primary'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-30" />
    </button>
  );
}

function StatusBadge({ status, ativa }: any) {
  if (!ativa) return <Badge variant="destructive" className="bg-rose-500 border-none shadow-sm gap-1"><XCircle className="w-3 h-3" /> Bloqueada</Badge>;
  if (status === 'pendente') return <Badge className="bg-amber-500 border-none shadow-sm gap-1 text-white"><Clock className="w-3 h-3" /> Pendente</Badge>;
  if (status === 'rejeitado') return <Badge variant="destructive" className="bg-rose-500 border-none shadow-sm gap-1"><XCircle className="w-3 h-3" /> Rejeitada</Badge>;
  return <Badge className="bg-emerald-500 border-none shadow-sm gap-1"><CheckCircle2 className="w-3 h-3" /> Ativa</Badge>;
}

function PostStatusBadge({ status }: { status: string }) {
  if (status === 'aprovado') return <Badge className="bg-emerald-500 border-none shadow-lg"><CheckCircle2 className="w-3 h-3 mr-1" /> Público</Badge>;
  if (status === 'pendente') return <Badge className="bg-amber-500 border-none shadow-lg"><Clock className="w-3 h-3 mr-1" /> Moderando</Badge>;
  return <Badge variant="destructive" className="border-none shadow-lg"><XCircle className="w-3 h-3 mr-1" /> Recusado</Badge>;
}

function ActionBtn({ icon: Icon, label, onClick, variant = 'default' }: any) {
  const styles: any = {
    default: "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700",
    success: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-500 hover:text-white",
    danger: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 hover:bg-rose-500 hover:text-white",
    'ghost-danger': "bg-transparent text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-transparent",
  };
  return (
    <Button
      variant="outline"
      size="sm"
      className={`rounded-xl px-3 h-9 transition-all duration-300 font-bold border-2 ${styles[variant]}`}
      onClick={onClick}
    >
      <Icon className={`w-4 h-4 ${label ? 'mr-2' : ''}`} />
      {label}
    </Button>
  );
}

function ContactItem({ icon: Icon, label, value, isPrimary, isSuccess }: any) {
  if (!value) return null;
  return (
    <div className={`p-4 rounded-2xl flex items-center gap-3 border transition-colors
      ${isPrimary ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400' :
        isSuccess ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400' :
          'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'}
    `}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
        ${isPrimary ? 'bg-indigo-500/10' : isSuccess ? 'bg-emerald-500/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] uppercase font-black opacity-50 leading-none mb-1 tracking-widest">{label}</p>
        <p className="text-xs font-bold leading-none truncate max-w-[120px]">{value}</p>
      </div>
    </div>
  );
}
