import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, PlusCircle, Send, Loader2, X, Clock, CheckCircle2, MapPin, ArrowLeft, Home, Sparkles, MessageSquare, TrendingUp, Trash } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";
import { useNavigate } from "react-router-dom";
import { getUsuarioLogado, buscarPosts, criarPost, uploadImagem, buscarComentarios, criarComentario } from "@/lib/supabase";

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagens?: string[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  bairro: string;
  logradouro?: string;
  user_id?: string;
  autor_nome: string;
  created_at: string;
  curtidas?: number;
}

interface Comentario {
  id: string;
  post_id: string;
  user_id?: string;
  autor_nome: string;
  conteudo: string;
  curtidas?: number;
  created_at: string;
}

const Mural = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [meusPostsPendentes, setMeusPostsPendentes] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Estados para Social
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [comentarios, setComentarios] = useState<Record<string, Comentario[]>>({});
  const [apoios, setApoios] = useState<Record<string, number>>({});
  const [userApoios, setUserApoios] = useState<Record<string, boolean>>({});
  const [novoComentarioTexto, setNovoComentarioTexto] = useState<Record<string, string>>({});
  const [comentarioApoios, setComentarioApoios] = useState<Record<string, boolean>>({});

  const user = getUsuarioLogado();

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");

  useEffect(() => {
    carregarPosts();
    if (user) {
      carregarMeusPostsPendentes();
    }
  }, [user?.id]);

  const carregarPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await buscarPosts({ limite: 50 });
      setPosts(data);
    } catch (error) {
      toast.error("Erro ao carregar posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const carregarMeusPostsPendentes = async () => {
    if (!user) return;
    try {
      const data = await buscarPosts({ userId: user.id });
      setMeusPostsPendentes(data.filter((p: Post) => p.status === 'pendente'));
    } catch (error) {}
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande (máx 5MB).");
        return;
      }
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowLogin(true); return; }

    setLoading(true);
    try {
      let imagemUrl = "";
      if (imagemFile) {
        const uploadedUrl = await uploadImagem('posts-images', imagemFile);
        if (uploadedUrl) imagemUrl = uploadedUrl;
      }

      const novoPost = {
        titulo,
        conteudo,
        autor_nome: user.nome || user.email,
        autor_bairro: bairro,
        autor_email: user.email,
        user_id: user.id,
        bairro,
        logradouro,
        imagens: imagemUrl ? [imagemUrl] : [],
      };

      const result = await criarPost(novoPost);
      if (result) {
        toast.success("Enviado para análise!");
        setOpen(false);
        setTitulo(""); setConteudo(""); setImagemFile(null); setImagemPreview(""); setBairro(""); setLogradouro("");
        carregarMeusPostsPendentes();
      }
    } catch (error) {
      toast.error("Erro ao criar post.");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
             ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return "Data indisponível"; }
  };

  const handleApoiar = async (postId: string) => {
    if (!user) { setShowLogin(true); return; }

    const isApoiado = userApoios[postId];
    const currentCount = apoios[postId] !== undefined ? apoios[postId] : (posts.find(p => p.id === postId)?.curtidas || 0);
    const newCount = isApoiado ? Math.max(0, currentCount - 1) : currentCount + 1;
    
    setUserApoios(prev => ({ ...prev, [postId]: !isApoiado }));
    setApoios(prev => ({ ...prev, [postId]: newCount }));

    try {
      await fetch(`/api/posts?id=${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curtidas: newCount })
      });
    } catch (error) {}
  };

  const carregarComentariosData = async (postId: string) => {
    try {
      const data = await buscarComentarios(postId);
      setComentarios(prev => ({ ...prev, [postId]: data }));
    } catch (error) {}
  };

  const toggleComments = (postId: string) => {
    if (!expandedComments[postId]) {
      carregarComentariosData(postId);
    }
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleEnviarComentario = async (postId: string) => {
    if (!user) { setShowLogin(true); return; }
    const texto = novoComentarioTexto[postId];
    if (!texto?.trim()) return;

    try {
      const resp = await criarComentario({
        post_id: postId,
        autor_nome: user.nome || user.email,
        conteudo: texto,
        user_id: user.id
      });
      if (resp) {
        setNovoComentarioTexto(prev => ({ ...prev, [postId]: "" }));
        carregarComentariosData(postId);
        toast.success("Comentário enviado!");
      }
    } catch (error) { toast.error("Erro ao comentar."); }
  };

  const handleExcluirPost = async (postId: string) => {
    if (!window.confirm("Excluir post permanentemente?")) return;
    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Post removido");
        carregarPosts();
      }
    } catch (error) {}
  };

  const handleExcluirComentario = async (postId: string, comentarioId: string) => {
    if (!window.confirm("Excluir comentário?")) return;
    try {
      const res = await fetch(`/api/posts?action=comentario&comentarioId=${comentarioId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Comentário removido");
        carregarComentariosData(postId);
      }
    } catch (error) {}
  };

  const handleApoiarComentario = async (comentario: Comentario) => {
    if (!user) { setShowLogin(true); return; }
    const isApoiado = comentarioApoios[comentario.id];
    const newCurtidas = (comentario.curtidas || 0) + (isApoiado ? -1 : 1);
    
    setComentarioApoios(prev => ({ ...prev, [comentario.id]: !isApoiado }));
    setComentarios(prev => ({
      ...prev,
      [comentario.post_id]: prev[comentario.post_id].map(c => 
        c.id === comentario.id ? { ...c, curtidas: newCurtidas } : c
      )
    }));

    try {
      await fetch(`/api/posts?action=comentario&id=${comentario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curtidas: newCurtidas })
      });
    } catch (error) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        <section className="relative pt-12 pb-20 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button onClick={() => navigate('/')} className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6">
                  <Home className="w-4 h-4" /> Início
                </Button>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Mural da <br />
                <span className="gradient-text">Nossa Cidade</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Voz da população: Sua plataforma de avisos e notícias comunitárias em Guaíra-SP.
              </p>
            </div>

            <div className="flex justify-center">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-xl px-10 py-8 bg-primary hover:bg-primary/90 text-lg font-bold gap-3">
                    <PlusCircle className="w-6 h-6" />
                    Publicar Agora
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        O que está acontecendo?
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Título do Aviso *</Label>
                        <Input placeholder="Resumo em poucas palavras" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="py-6 rounded-xl border-2" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Sua Mensagem *</Label>
                        <Textarea placeholder="Detalhes do seu aviso..." rows={4} value={conteudo} onChange={(e) => setConteudo(e.target.value)} className="rounded-xl border-2 p-4" required />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="font-bold">Bairro *</Label><Input placeholder="Onde?" value={bairro} onChange={(e) => setBairro(e.target.value)} className="py-6 rounded-xl border-2" required /></div>
                        <div className="space-y-2"><Label className="font-bold">Referência (Opcional)</Label><Input placeholder="Próximo a..." value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="py-6 rounded-xl border-2" /></div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Adicionar Foto</Label>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="py-2" />
                        {imagemPreview && <img src={imagemPreview} className="w-24 h-24 object-cover rounded-xl mt-2 border shadow-sm" />}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full rounded-xl h-14 font-black shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                        PUBLICAR NO MURAL
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
          {meusPostsPendentes.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-black">Suas postagens em análise</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meusPostsPendentes.map((post) => (
                  <Card key={post.id} className="bg-orange-50/30 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900 rounded-3xl p-6 flex gap-4">
                    {post.imagens && post.imagens.length > 0 && (
                      <img src={post.imagens[0]} className="w-20 h-20 object-cover rounded-2xl grayscale opacity-50" />
                    )}
                    <div className="flex-1">
                      <Badge className="bg-orange-500 text-white mb-2">Pendente</Badge>
                      <h3 className="font-bold leading-tight line-clamp-2">{post.titulo}</h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl"><MessageSquare className="w-7 h-7 text-primary" /></div>
                <h2 className="text-3xl font-black">Voz da População</h2>
              </div>
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-2 font-bold">{posts.length} posts</Badge>
            </div>

            {loadingPosts ? (
              <div className="py-24 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="font-bold text-muted-foreground">Carregando voz das ruas...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <MessageSquare className="w-16 h-16 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Nenhuma postagem ainda</h3>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
                {posts.map((post) => (
                  <Card key={post.id} className="group bg-white dark:bg-zinc-900 border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-[2.5rem]">
                    <div className="px-8 pt-8 pb-4 flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform">
                        {(post.autor_nome || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 truncate">{post.autor_nome}</h3>
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] h-5 border-none font-bold uppercase tracking-wider">Cidadão Ativo</Badge>
                          <span className="text-zinc-300 dark:text-zinc-800">•</span>
                          <span className="text-zinc-400 dark:text-zinc-600 text-[11px] font-bold uppercase tracking-tighter">{formatarData(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/80 uppercase tracking-[0.2em] mt-0.5"><MapPin className="w-3 h-3" />{post.bairro}</div>
                      </div>
                      <div className="flex gap-1">
                        {user?.id === post.user_id && (
                          <Button variant="ghost" size="icon" className="rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20" onClick={() => handleExcluirPost(post.id)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full text-zinc-300 hover:text-primary transition-colors"><Sparkles className="w-5 h-5" /></Button>
                      </div>
                    </div>

                    <div className="px-8 pb-6">
                      <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-4 tracking-tight">{post.titulo}</h4>
                      <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg leading-relaxed whitespace-pre-wrap">{post.conteudo}</p>
                    </div>

                    {post.imagens && post.imagens.length > 0 && (
                      <div className="px-8 pb-8">
                        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-zoom-in group max-w-2xl" onClick={() => setSelectedImage(post.imagens![0])}>
                          <img src={post.imagens[0]} className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>
                      </div>
                    )}

                    <div className="px-8 py-5 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <Button 
                          variant="ghost" 
                          className={`rounded-2xl gap-2 font-bold px-6 py-6 transition-all ${userApoios[post.id] ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400' : 'text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-rose-400'}`}
                          onClick={() => handleApoiar(post.id)}
                        >
                          <TrendingUp className={`w-5 h-5 ${userApoios[post.id] ? 'animate-bounce' : ''}`} />
                          <span className="text-sm">Apoiar {(apoios[post.id] !== undefined ? apoios[post.id] : (post.curtidas || 0)) > 0 ? `(${(apoios[post.id] !== undefined ? apoios[post.id] : post.curtidas)})` : ''}</span>
                        </Button>
                        <Button variant="ghost" className="rounded-2xl gap-2 text-zinc-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-zinc-800 font-bold px-6 py-6" onClick={() => toggleComments(post.id)}>
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm">Comentar</span>
                        </Button>
                      </div>
                      <Button variant="ghost" className="rounded-2xl text-zinc-400 gap-2 font-bold hover:text-indigo-500 dark:hover:bg-zinc-800 px-6 py-6" onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: post.titulo, text: post.conteudo, url: window.location.href }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.info("Link copiado!");
                        }
                      }}>
                        <Send className="w-5 h-5" />
                        <span className="text-sm">Compartilhar</span>
                      </Button>
                    </div>

                    {expandedComments[post.id] && (
                      <div className="px-8 py-8 bg-zinc-50/30 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-6 mb-6">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Comentários da Comunidade</p>
                          {(!comentarios[post.id] || comentarios[post.id].length === 0) ? (
                            <div className="p-12 text-center bg-white/50 dark:bg-black/20 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                               <MessageSquare className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-2" />
                               <p className="text-sm text-zinc-400 font-medium">Nenhum comentário por aqui ainda.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {comentarios[post.id].map(comment => (
                                <div key={comment.id} className="group relative bg-white dark:bg-zinc-800/40 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">{comment.autor_nome.charAt(0).toUpperCase()}</div>
                                      <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{comment.autor_nome}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => handleApoiarComentario(comment)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${comentarioApoios[comment.id] ? 'bg-rose-50 text-rose-500' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black">{comment.curtidas || 0}</span>
                                      </button>
                                      {(user?.id && (user.id === comment.user_id || user.id === post.user_id)) && (
                                        <button 
                                          onClick={() => handleExcluirComentario(post.id, comment.id)} 
                                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                                          title="Excluir comentário"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-9">{comment.conteudo}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Input placeholder="Adicione um comentário..." className="rounded-2xl h-14 bg-white dark:bg-zinc-800 border-2" value={novoComentarioTexto[post.id] || ""} onChange={(e) => setNovoComentarioTexto(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleEnviarComentario(post.id)} />
                          <Button className="rounded-2xl h-14 w-14 p-0 shadow-lg" onClick={() => handleEnviarComentario(post.id)}><Send className="w-5 h-5" /></Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full" onClick={() => setSelectedImage(null)}><X className="w-6 h-6" /></Button>
              {selectedImage && <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Mural;
