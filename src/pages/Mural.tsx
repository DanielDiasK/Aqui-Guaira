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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        setTitulo("");
        setConteudo("");
        setImagemFile(null);
        setImagemPreview("");
        setBairro("");
        setLogradouro("");
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
                Avisos, utilidade pública e notícias da comunidade de Guaíra-SP.
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
                    </DialogHeader>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">O que você quer anunciar? *</Label>
                        <Input
                          placeholder="Título curto e direto"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Descrição detalhada *</Label>
                        <Textarea
                          placeholder="Escreva aqui as informações..."
                          rows={4}
                          value={conteudo}
                          onChange={(e) => setConteudo(e.target.value)}
                          className="rounded-xl border-2 p-4"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Bairro *</Label>
                          <Input
                            placeholder="Ex: Miguel Fabiano"
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Rua (Opcional)</Label>
                          <Input
                            placeholder="Ex: Rua 10, nº 123"
                            value={logradouro}
                            onChange={(e) => setLogradouro(e.target.value)}
                            className="py-6 rounded-xl border-2"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Foto (Opcional)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="py-2"
                        />
                        {imagemPreview && (
                          <img src={imagemPreview} className="w-24 h-24 object-cover rounded-xl mt-2 border" />
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full rounded-xl h-12 font-bold" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Enviar Aviso
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
                <h2 className="text-2xl font-black">Em Análise</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {meusPostsPendentes.map((post) => (
                  <Card key={post.id} className="bg-orange-50/50 border-orange-100 rounded-3xl p-6 flex gap-4">
                    {post.imagens && post.imagens.length > 0 && (
                      <img src={post.imagens[0]} className="w-20 h-20 object-cover rounded-2xl" />
                    )}
                    <div>
                      <Badge className="bg-orange-500 text-white mb-2">Aguardando</Badge>
                      <h3 className="font-bold leading-tight">{post.titulo}</h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-primary" />
                <h2 className="text-3xl font-black">Últimos Avisos</h2>
              </div>
              <Badge variant="outline">{posts.length} ativos</Badge>
            </div>

            {loadingPosts ? (
              <div className="py-24 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="font-bold text-muted-foreground">Carregando feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed">
                <MessageSquare className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Mural Vazio</h3>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white dark:bg-[#1A1A1A] border-none shadow-sm hover:shadow-md transition-all overflow-hidden rounded-[2rem]">
                    <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                        {(post.autor_nome || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                            {post.autor_nome}
                          </h3>
                          <Badge className="bg-green-500/10 text-green-600 text-[10px] h-5 border-none">
                            Verificado
                          </Badge>
                          <span className="text-zinc-400 text-xs">•</span>
                          <span className="text-zinc-400 text-[10px] font-bold">{formatarData(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-primary/70 uppercase transform translate-y-[-2px]">
                          <MapPin className="w-3 h-3" />
                          {post.bairro}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-4">
                      <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-3">
                        {post.titulo}
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {post.conteudo}
                      </p>
                    </div>

                    {post.imagens && post.imagens.length > 0 && (
                      <div className="px-6 pb-6">
                        <div
                          className="relative overflow-hidden rounded-[2rem] border bg-zinc-50 cursor-pointer"
                          onClick={() => setSelectedImage(post.imagens![0])}
                        >
                          <img src={post.imagens[0]} className="w-full h-auto max-h-[500px] object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t flex items-center justify-between">
                      <div className="flex gap-6">
                        <button className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-xs font-bold">Apoiar</span>
                        </button>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-xl text-zinc-400 gap-2 font-bold hover:text-primary">
                        <Send className="w-4 h-4" /> Compactilhar
                      </Button>
                    </div>
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
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white bg-black/50 hover:bg-black/70 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6" />
              </Button>
              {selectedImage && (
                <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Mural;
