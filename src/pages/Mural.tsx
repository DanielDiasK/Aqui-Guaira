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
import { ImagePlus, PlusCircle, Send, Loader2, X, Clock, CheckCircle2, MapPin, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";
import { getUsuarioLogado, supabase, uploadImagens } from "@/lib/supabase";

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  aprovado: boolean;
  data_criacao: string;
  data_aprovacao?: string;
  empresa_id?: string;
  user_id: string;
  bairro?: string;
  logradouro?: string;
  empresas?: {
    nome: string;
    logo?: string;
  };
  users?: {
    nome: string;
  };
}

const Mural = () => {
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
  }, []); // Apenas na montagem

  useEffect(() => {
    if (user) {
      carregarMeusPosts();
    }
  }, [user?.id]); // Apenas quando o ID do usuário mudar

  const carregarPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('mural_posts')
        .select(`
          *,
          empresas!empresa_id(nome, logo),
          users!user_id(nome)
        `)
        .eq('aprovado', true)
        .order('data_criacao', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar posts:', error);
        return;
      }
      
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const carregarMeusPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mural_posts')
        .select(`
          *,
          empresas!empresa_id(nome, logo)
        `)
        .eq('user_id', user.id)
        .eq('aprovado', false)
        .is('motivo_rejeicao', null) // Apenas posts pendentes (não rejeitados)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setMeusPostsPendentes(data || []);
    } catch (error) {
      console.error('Erro ao carregar meus posts:', error);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setConteudo("");
    setImagemFile(null);
    setImagemPreview("");
    setBairro("");
    setLogradouro("");
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImagemFile(null);
    setImagemPreview("");
  };

  const submitPost = async () => {
    // Validações
    if (!titulo.trim()) {
      toast.error('Digite o título do post');
      return;
    }
    if (!conteudo.trim()) {
      toast.error('Digite o conteúdo do post');
      return;
    }

    // Precisa estar logado
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    try {
      // Upload da imagem (opcional)
      let imagemUrl = "";
      if (imagemFile) {
        const urls = await uploadImagens('posts-images', [imagemFile], 'mural');
        imagemUrl = urls[0] || "";
      }

      // Criar post
      const postData = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        imagem: imagemUrl || null,
        user_id: user.id,
        aprovado: false, // Aguarda aprovação do admin
        bairro: bairro.trim() || null,
        logradouro: logradouro.trim() || null,
      };

      const { error } = await supabase
        .from('mural_posts')
        .insert([postData]);

      if (error) throw error;

      toast.success('Post enviado com sucesso!', {
        description: 'Seu post está aguardando aprovação do administrador.'
      });

      resetForm();
      setOpen(false);
      await carregarMeusPosts(); // Atualizar lista de posts pendentes
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    carregarMeusPosts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 pb-32 space-y-10 flex-grow">
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
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold gradient-text">Mural da Cidade</h2>
            <p className="text-muted-foreground max-w-xl text-sm mt-2">Compartilhe acontecimentos, observações e destaques do seu bairro. Cada postagem entra como pendente aguardando moderação.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="animated" className="gap-2">
                <PlusCircle className="h-5 w-5" /> Nova Postagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Criar nova postagem no mural
                </DialogTitle>
                <DialogDescription>
                  {user ? (
                    <>Seu post será enviado para aprovação do administrador antes de ser publicado.</>
                  ) : (
                    <>Você precisa estar logado para criar posts no mural.</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Opção de login */}
                {!user && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Fazer login para postar</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Apenas usuários autenticados podem criar posts
                          </p>
                        </div>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => setShowLogin(true)}
                        >
                          Login
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {user && (
                  <>
                    {/* Endereço */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          placeholder="Ex: Jardim Paulista"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logradouro">Rua / Avenida</Label>
                        <Input
                          id="logradouro"
                          placeholder="Ex: Av. Principal, 123"
                          value={logradouro}
                          onChange={(e) => setLogradouro(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        placeholder="Digite um título para o post"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="space-y-2">
                      <Label htmlFor="conteudo">Conteúdo *</Label>
                      <Textarea
                        id="conteudo"
                        placeholder="Escreva o conteúdo do seu post..."
                        rows={6}
                        value={conteudo}
                        onChange={(e) => setConteudo(e.target.value)}
                      />
                    </div>

                    {/* Upload de imagem */}
                    <div className="space-y-2">
                      <Label>Imagem (opcional)</Label>
                      {!imagemPreview ? (
                        <div
                          className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer border-border hover:border-primary/70 hover:bg-accent/30 transition-all"
                          onClick={() => document.getElementById('file-input-mural')?.click()}
                        >
                          <input 
                            id="file-input-mural" 
                            className="hidden" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImage} 
                          />
                          <div className="flex flex-col items-center gap-2">
                            <ImagePlus className="h-8 w-8 text-primary" />
                            <p className="text-xs text-muted-foreground">
                              Clique para selecionar uma imagem
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border">
                          <img src={imagemPreview} alt="preview" className="w-full h-64 object-cover" />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Seu post ficará pendente até ser aprovado por um administrador
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={submitPost} 
                  disabled={loading || !user || !titulo.trim() || !conteudo.trim()} 
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar para Aprovação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Meus Posts Pendentes */}
        {user && meusPostsPendentes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Seus Posts Aguardando Aprovação
              </CardTitle>
              <CardDescription>
                {meusPostsPendentes.length} {meusPostsPendentes.length === 1 ? 'post pendente' : 'posts pendentes'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meusPostsPendentes.map((post) => (
                <Card key={post.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{post.titulo}</CardTitle>
                        <CardDescription className="mt-1">
                          Enviado em {new Date(post.data_criacao).toLocaleDateString('pt-BR')}
                        </CardDescription>
                        {(post.bairro || post.logradouro) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">
                                {[post.logradouro, post.bairro].filter(Boolean).join(' • ')}
                              </span>
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.conteudo}</p>
                    {post.imagem && (
                      <img 
                        src={post.imagem} 
                        alt={post.titulo}
                        className="mt-3 w-full max-w-xs rounded-lg"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lista de posts */}
        <div className="space-y-6">
          {loadingPosts ? (
            <Card className="glass-card border-2">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="text-lg">Nenhuma postagem ainda</CardTitle>
                <CardDescription>Seja o primeiro a compartilhar algo sobre seu bairro!</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="glass-card overflow-hidden border-2 hover:border-primary/40 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {post.users?.nome?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>

                      {/* Info do autor */}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1">{post.titulo}</CardTitle>
                        <CardDescription className="text-xs">
                          Por {post.users?.nome || 'Usuário'} • {new Date(post.data_criacao).toLocaleDateString("pt-BR", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Badge aprovado */}
                    <Badge variant="default" className="bg-green-600 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.conteudo}</p>
                  
                  {/* Imagem */}
                  {post.imagem && (
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={post.imagem} 
                        alt={post.titulo} 
                        className="w-full max-h-96 object-cover" 
                      />
                    </div>
                  )}
                </CardContent>
                {(post.bairro || post.logradouro) && (
                  <div className="px-6 pb-4">
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">
                        {[post.logradouro, post.bairro].filter(Boolean).join(' • ')}
                      </span>
                    </Badge>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
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

export default Mural;
