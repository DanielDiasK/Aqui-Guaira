import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, PlusCircle, Send, Loader2, X, Clock, CheckCircle2, MapPin, ArrowLeft, Home, Sparkles, MessageSquare, TrendingUp, Filter } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";
import { useNavigate } from "react-router-dom";
import { getUsuarioLogado, buscarPosts, criarPost, uploadImagem } from "@/lib/supabase";

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagens?: string[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  bairro: string;
  logradouro?: string;
  user_id: string;
  autor_nome: string;
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

  const user = getUsuarioLogado();

  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");

  // Carregar posts ao montar
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
      console.error("Erro ao carregar posts:", error);
      toast.error("Não foi possível carregar os posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const carregarMeusPostsPendentes = async () => {
    if (!user) return;
    try {
      const data = await buscarPosts({ userId: user.id });
      // Filtrar apenas os pendentes (embora o userId filter retorne todos do usuário, 
      // o Mural geralmente só mostra os aprovados para o público)
      setMeusPostsPendentes(data.filter((p: Post) => p.status === 'pendente'));
    } catch (error) {
      console.error("Erro ao carregar seus posts:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. O tamanho máximo é 5MB.");
        return;
      }
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      let imagemUrl = "";
      if (imagemFile) {
        const uploadedUrl = await uploadImagem('posts-images', imagemFile);
        if (uploadedUrl) {
          imagemUrl = uploadedUrl;
        }
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
        toast.success("Aviso enviado para análise!", {
          description: "Nossa equipe irá revisar sua publicação em breve."
        });
        setOpen(false);
        // Reset form
        setTitulo("");
        setConteudo("");
        setImagemFile(null);
        setImagemPreview("");
        setBairro("");
        setLogradouro("");

        // Recarregar pendentes
        carregarMeusPostsPendentes();
      } else {
        toast.error("Erro ao enviar aviso. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Data indisponível";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(-1)}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <Home className="w-4 h-4" />
                  Início
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
                Avisos, utilidade pública e notícias da comunidade. Participe e mantenha todos informados sobre o que acontece em Guaíra-SP.
              </p>
            </div>

            <div className="flex justify-center">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-xl px-10 py-8 bg-primary hover:bg-primary/90 text-lg font-bold gap-3">
                    <PlusCircle className="w-6 h-6" />
                    Publicar Aviso
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden">
                  <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Novo Aviso no Mural
                      </DialogTitle>
                      <DialogDescription className="font-medium text-primary/70">
                        Seu aviso será analisado por nossa equipe antes de ser publicado.
                      </DialogDescription>
                    </DialogHeader>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-gray-700">O que você quer anunciar? *</Label>
                        <Input
                          placeholder="Título curto e direto"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="py-6 rounded-xl border-2 focus:border-primary transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-gray-700">Descrição detalhada *</Label>
                        <Textarea
                          placeholder="Escreva aqui as informações do seu aviso..."
                          rows={4}
                          value={conteudo}
                          onChange={(e) => setConteudo(e.target.value)}
                          className="rounded-xl border-2 focus:border-primary transition-all p-4"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Qual o Bairro? *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Ex: Miguel Fabiano"
                              value={bairro}
                              onChange={(e) => setBairro(e.target.value)}
                              className="pl-10 py-6 rounded-xl border-2"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Rua (Opcional)</Label>
                          <Input
                            placeholder="Ex: Rua 10, nº 123"
                            value={logradouro}
                            onChange={(e) => setLogradouro(e.target.value)}
                            className="py-6 rounded-xl border-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-gray-700">Adicionar Foto (Recomendado)</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('mural-image-upload')?.click()}
                            className="gap-2 py-8 px-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary transition-colors flex-grow md:flex-grow-0"
                          >
                            <ImagePlus className="w-5 h-5" />
                            Escolher Arquivo
                          </Button>
                          <input
                            id="mural-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          {imagemPreview && (
                            <div className="relative group">
                              <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-primary/20 shadow-lg" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                                onClick={() => { setImagemFile(null); setImagemPreview(""); }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      {!user && (
                        <p className="text-sm text-red-500 font-bold mb-4 w-full">
                          Você precisa estar logado para publicar.
                        </p>
                      )}
                      <div className="flex w-full gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1 rounded-xl h-12 font-bold"
                          onClick={() => setOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/20 gap-2"
                          disabled={loading || !user}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Enviar para Análise
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 max-w-5xl space-y-12">
          {/* Seus Posts Pendentes */}
          {meusPostsPendentes.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Publicações em <span className="text-orange-500">Análise</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meusPostsPendentes.map((post) => (
                  <Card key={post.id} className="bg-[#FFF9F2] dark:bg-[#1E1A15] border-2 border-[#FFE4CC] dark:border-[#3D2B1F] rounded-3xl overflow-hidden group hover:border-orange-300 dark:hover:border-orange-800 transition-all shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row gap-5">
                      {post.imagens && post.imagens.length > 0 && (
                        <div className="relative shrink-0">
                          <img
                            src={post.imagens[0]}
                            alt={post.titulo}
                            className="w-full md:w-28 h-28 object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 font-bold px-3 py-1">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" />
                            Aguardando...
                          </Badge>
                        </div>
                        <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 leading-tight">{post.titulo}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-orange-700/70 dark:text-orange-400/60 font-bold uppercase tracking-widest">
                          <MapPin className="w-3 h-3" />
                          {post.bairro}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Feed do Mural */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Últimos <span className="text-primary">Avisos</span></h2>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold hidden sm:flex">
                {posts.length} avisos ativos
              </Badge>
            </div>

            {loadingPosts ? (
              <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-bold">Lendo o mural...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center bg-white/5 dark:bg-white/[0.02] backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center gap-6">
                <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-full">
                  <MessageSquare className="w-16 h-16 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-foreground">O mural está vazio</h3>
                  <p className="text-muted-foreground dark:text-zinc-400 font-medium max-w-sm mx-auto">Seja o primeiro a publicar um aviso útil para a comunidade de Guaíra!</p>
                </div>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {posts.map((post) => (
                  <Card key={post.id} className="break-inside-avoid-column bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-zinc-800/50 hover:border-primary/40 dark:hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0 group rounded-[2rem] mb-8">
                    {post.imagens && post.imagens.length > 0 && (
                      <div className="relative overflow-hidden h-56">
                        <img
                          src={post.imagens[0]}
                          alt={post.titulo}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                    )}

                    <div className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground dark:text-zinc-500 uppercase tracking-[0.2em]">{post.bairro}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{post.titulo}</h3>
                        <p className="text-muted-foreground dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap">{post.conteudo}</p>
                      </div>

                      <div className="pt-6 border-t border-gray-100 dark:border-zinc-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 dark:from-primary/80 dark:to-primary/40 flex items-center justify-center text-white font-black text-xs shadow-md">
                            {(post.autor_nome || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground dark:text-zinc-200 line-clamp-1">{post.autor_nome || "Usuário"}</p>
                            <p className="text-[10px] font-bold text-muted-foreground dark:text-zinc-500 uppercase tracking-widest">{formatarData(post.created_at)}</p>
                          </div>
                        </div>
                        <div className="p-1.5 bg-green-500/10 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      </main>

      <Footer />
    </div>
  );
};

export default Mural;
