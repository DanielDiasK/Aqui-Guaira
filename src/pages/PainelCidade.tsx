import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  ArrowLeft, 
  Home, 
  Construction, 
  Calendar, 
  Briefcase, 
  Users, 
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
  Building2,
  GraduationCap,
  Heart,
  Loader2,
  ExternalLink,
  Phone,
  Mail
} from "lucide-react";
import { supabase, getUsuarioLogado } from "@/lib/supabase";
import { toast } from "sonner";

interface Obra {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  tipo: "obra" | "interdicao";
  status: "em_andamento" | "concluida" | "planejada";
  data_inicio: string;
  data_previsao_fim?: string;
  impacto: string;
  responsavel: string;
  criado_em: string;
}

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "prefeitura" | "igreja" | "esporte" | "escola" | "cultura" | "outro";
  local: string;
  data_evento: string;
  horario: string;
  organizador: string;
  contato?: string;
  imagem?: string;
  criado_em: string;
}

interface Vaga {
  id: string;
  titulo: string;
  empresa: string;
  descricao: string;
  requisitos: string;
  salario?: string;
  tipo: "clt" | "pj" | "estagio" | "temporario" | "freelancer";
  area: string;
  local_trabalho: string;
  contato_email?: string;
  contato_telefone?: string;
  status: "ativa" | "encerrada";
  data_publicacao: string;
  criado_em: string;
}

interface Estatistica {
  total_empresas: number;
  total_usuarios: number;
  total_posts_mural: number;
  total_farmacias: number;
}

export default function PainelCidade() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [obras, setObras] = useState<Obra[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatistica | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarObras(),
        carregarEventos(),
        carregarVagas(),
        carregarEstatisticas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarObras = async () => {
    try {
      const { data, error } = await supabase
        .from('obras_interdicoes')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setObras(data || []);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  };

  const carregarEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .gte('data_evento', new Date().toISOString().split('T')[0])
        .order('data_evento', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const carregarVagas = async () => {
    try {
      const { data, error } = await supabase
        .from('vagas_emprego')
        .select('*')
        .eq('status', 'ativa')
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      setVagas(data || []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      // Empresas
      const { count: empresas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
        .eq('ativa', true);

      // Usuários
      const { count: usuarios } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Posts do mural
      const { count: posts } = await supabase
        .from('mural_posts')
        .select('*', { count: 'exact', head: true })
        .eq('aprovado', true);

      // Farmácias
      const { data: categorias } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', 'Farmácia')
        .single();

      let farmacias = 0;
      if (categorias) {
        const { count } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .eq('categoria_id', categorias.id)
          .eq('ativa', true);
        farmacias = count || 0;
      }

      setEstatisticas({
        total_empresas: empresas || 0,
        total_usuarios: usuarios || 0,
        total_posts_mural: posts || 0,
        total_farmacias: farmacias
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: string, hora: string) => {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    return `${dataFormatada} às ${hora}`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "em_andamento":
        return <Badge className="bg-yellow-600">Em Andamento</Badge>;
      case "concluida":
        return <Badge className="bg-green-600">Concluída</Badge>;
      case "planejada":
        return <Badge className="bg-blue-600">Planejada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === "obra" 
      ? <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Obra</Badge>
      : <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Interdição</Badge>;
  };

  const getCategoriaBadge = (categoria: string) => {
    const cores: Record<string, string> = {
      prefeitura: "bg-blue-100 text-blue-800",
      igreja: "bg-purple-100 text-purple-800",
      esporte: "bg-green-100 text-green-800",
      escola: "bg-yellow-100 text-yellow-800",
      cultura: "bg-pink-100 text-pink-800",
      outro: "bg-gray-100 text-gray-800"
    };
    
    return <Badge variant="outline" className={cores[categoria] || cores.outro}>
      {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
    </Badge>;
  };

  const getTipoVagaBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; color: string }> = {
      clt: { label: "CLT", color: "bg-green-600" },
      pj: { label: "PJ", color: "bg-blue-600" },
      estagio: { label: "Estágio", color: "bg-purple-600" },
      temporario: { label: "Temporário", color: "bg-orange-600" },
      freelancer: { label: "Freelancer", color: "bg-pink-600" }
    };
    
    const tipoInfo = tipos[tipo] || { label: tipo, color: "bg-gray-600" };
    return <Badge className={tipoInfo.color}>{tipoInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 space-y-8">
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

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary" />
            Painel da Cidade
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Acompanhe obras, eventos, vagas de emprego e dados atualizados sobre Guaíra-SP
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        {estatisticas && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Empresas Ativas</p>
                    <p className="text-3xl font-bold text-blue-900">{estatisticas.total_empresas}</p>
                  </div>
                  <Building2 className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Usuários</p>
                    <p className="text-3xl font-bold text-green-900">{estatisticas.total_usuarios}</p>
                  </div>
                  <Users className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Posts Aprovados</p>
                    <p className="text-3xl font-bold text-purple-900">{estatisticas.total_posts_mural}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Farmácias</p>
                    <p className="text-3xl font-bold text-red-900">{estatisticas.total_farmacias}</p>
                  </div>
                  <Heart className="w-12 h-12 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="obras" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="obras" className="gap-2">
              <Construction className="w-4 h-4" />
              Obras e Interdições
            </TabsTrigger>
            <TabsTrigger value="eventos" className="gap-2">
              <Calendar className="w-4 h-4" />
              Agenda de Eventos
            </TabsTrigger>
            <TabsTrigger value="vagas" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Vagas de Emprego
            </TabsTrigger>
          </TabsList>

          {/* Obras e Interdições */}
          <TabsContent value="obras" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Obras e Interdições</h2>
              <Badge variant="outline">{obras.length} registros</Badge>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : obras.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Construction className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma obra ou interdição cadastrada no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {obras.map((obra) => (
                  <Card key={obra.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg">{obra.titulo}</CardTitle>
                        {getTipoBadge(obra.tipo)}
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(obra.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{obra.descricao}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{obra.local}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span>Início: {formatarData(obra.data_inicio)}</span>
                        </div>
                        
                        {obra.data_previsao_fim && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span>Previsão: {formatarData(obra.data_previsao_fim)}</span>
                          </div>
                        )}

                        {obra.impacto && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-700 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-yellow-800">Impacto:</p>
                                <p className="text-xs text-yellow-700">{obra.impacto}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Responsável: {obra.responsavel}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Agenda de Eventos */}
          <TabsContent value="eventos" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Próximos Eventos</h2>
              <Badge variant="outline">{eventos.length} eventos</Badge>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : eventos.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum evento agendado no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {eventos.map((evento) => (
                  <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{evento.titulo}</CardTitle>
                          {getCategoriaBadge(evento.categoria)}
                        </div>
                        {evento.imagem && (
                          <img 
                            src={evento.imagem} 
                            alt={evento.titulo}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                      
                      <div className="space-y-2 bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900 font-medium capitalize">
                            {formatarDataHora(evento.data_evento, evento.horario)}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{evento.local}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-sm">
                        <span className="text-muted-foreground">
                          Organiza: <strong>{evento.organizador}</strong>
                        </span>
                        {evento.contato && (
                          <a 
                            href={`tel:${evento.contato}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {evento.contato}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vagas de Emprego */}
          <TabsContent value="vagas" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Vagas Disponíveis</h2>
              <Badge variant="outline">{vagas.length} vagas ativas</Badge>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : vagas.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma vaga disponível no momento</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Volte em breve para conferir novas oportunidades
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {vagas.map((vaga) => (
                  <Card key={vaga.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg">{vaga.titulo}</CardTitle>
                        {getTipoVagaBadge(vaga.tipo)}
                      </div>
                      <p className="text-sm font-semibold text-primary">{vaga.empresa}</p>
                      <Badge variant="outline" className="w-fit">{vaga.area}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Descrição:</p>
                        <p className="text-sm text-muted-foreground">{vaga.descricao}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Requisitos:</p>
                        <p className="text-sm text-muted-foreground">{vaga.requisitos}</p>
                      </div>

                      {vaga.salario && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-sm font-semibold text-green-800">
                            Salário: {vaga.salario}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{vaga.local_trabalho}</span>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Publicado em: {formatarData(vaga.data_publicacao)}
                        </p>
                        
                        <div className="flex gap-2">
                          {vaga.contato_email && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = `mailto:${vaga.contato_email}`}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              E-mail
                            </Button>
                          )}
                          {vaga.contato_telefone && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = `tel:${vaga.contato_telefone}`}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Ligar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
