import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Clock, CheckCircle2, User2, ArrowLeft, XCircle, MapPin } from "lucide-react";
import { getUsuarioLogado, supabase } from "@/lib/supabase";

interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  aprovado: boolean;
  data_criacao: string;
  data_aprovacao?: string;
  motivo_rejeicao?: string;
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

const MeusPosts = () => {
  const navigate = useNavigate();
  const [todosMeusPosts, setTodosMeusPosts] = useState<Post[]>([]);
  const [loadingMeusPosts, setLoadingMeusPosts] = useState(true);
  const [postSelecionado, setPostSelecionado] = useState<Post | null>(null);
  const [openDetalhes, setOpenDetalhes] = useState(false);

  const user = getUsuarioLogado();

  useEffect(() => {
    const carregarDados = async () => {
      if (!user) {
        navigate('/mural');
        return;
      }

      setLoadingMeusPosts(true);
      try {
        const { data, error } = await supabase
          .from('mural_posts')
          .select(`
            *,
            empresas!empresa_id(nome, logo),
            users!user_id(nome)
          `)
          .eq('user_id', user.id)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Erro ao carregar posts:', error);
          throw error;
        }
        
        setTodosMeusPosts(data || []);
      } catch (error) {
        console.error('Erro ao carregar todos meus posts:', error);
        setTodosMeusPosts([]);
      } finally {
        setLoadingMeusPosts(false);
      }
    };

    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar o componente

  const handleClickPost = (post: Post) => {
    setPostSelecionado(post);
    setOpenDetalhes(true);
  };

  const getStatusBadge = (post: Post) => {
    if (post.aprovado) {
      return (
        <Badge variant="default" className="bg-green-600 flex-shrink-0 text-xs">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
          Aprovado
        </Badge>
      );
    }
    
    if (post.motivo_rejeicao) {
      return (
        <Badge variant="destructive" className="flex-shrink-0 text-xs">
          <XCircle className="w-2.5 h-2.5 mr-1" />
          Rejeitado
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex-shrink-0 text-xs">
        <Clock className="w-2.5 h-2.5 mr-1" />
        Pendente
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 pb-32 space-y-10 flex-grow">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/mural')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">
              <User2 className="w-8 h-8" />
              Meus Posts
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm mt-2">
              Gerencie todos os seus posts do mural da cidade
            </p>
          </div>
        </div>

        {loadingMeusPosts ? (
          <Card className="glass-card border-2">
            <CardContent className="py-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : todosMeusPosts.length === 0 ? (
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="text-lg">Nenhum post ainda</CardTitle>
              <CardDescription>
                Você ainda não criou nenhum post no mural. Que tal criar o primeiro?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/mural')} variant="default">
                Ir para o Mural
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Todos os Posts
              </CardTitle>
              <CardDescription>
                {todosMeusPosts.length} {todosMeusPosts.length === 1 ? 'post' : 'posts'} no total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todosMeusPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="group overflow-hidden border-2 hover:border-primary/60 transition-all cursor-pointer hover:shadow-lg"
                    onClick={() => handleClickPost(post)}
                  >
                    {post.imagem && (
                      <div className="h-32 overflow-hidden bg-muted">
                        <img 
                          src={post.imagem} 
                          alt={post.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm line-clamp-2">{post.titulo}</CardTitle>
                        {getStatusBadge(post)}
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(post.data_criacao).toLocaleDateString('pt-BR')}
                      </CardDescription>
                      {(post.bairro || post.logradouro) && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px]">
                              {[post.logradouro, post.bairro].filter(Boolean).join(' • ')}
                            </span>
                          </Badge>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.conteudo}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />

      {/* Dialog de Detalhes do Post */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {postSelecionado && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{postSelecionado.titulo}</DialogTitle>
                    <DialogDescription className="mt-2">
                      Por {postSelecionado.users?.nome || 'Usuário'} • {new Date(postSelecionado.data_criacao).toLocaleDateString("pt-BR", {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </DialogDescription>
                    {(postSelecionado.bairro || postSelecionado.logradouro) && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">
                            {[postSelecionado.logradouro, postSelecionado.bairro].filter(Boolean).join(' • ')}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(postSelecionado)}
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {postSelecionado.imagem && (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={postSelecionado.imagem} 
                      alt={postSelecionado.titulo} 
                      className="w-full max-h-[500px] object-cover" 
                    />
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{postSelecionado.conteudo}</p>
                </div>

                {postSelecionado.motivo_rejeicao ? (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm">
                      <strong>Motivo da rejeição:</strong> {postSelecionado.motivo_rejeicao}
                    </AlertDescription>
                  </Alert>
                ) : !postSelecionado.aprovado ? (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm">
                      <strong>Status:</strong> Aguardando aprovação do administrador
                    </AlertDescription>
                  </Alert>
                ) : null}

                {postSelecionado.aprovado && postSelecionado.data_aprovacao && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      <strong>Aprovado em:</strong> {new Date(postSelecionado.data_aprovacao).toLocaleDateString("pt-BR", {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="default" onClick={() => setOpenDetalhes(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeusPosts;

