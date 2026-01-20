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
  Heart,
  Loader2,
  Phone,
  Mail,
  Zap,
  LayoutDashboard
} from "lucide-react";
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
    // Dados serão carregados de uma fonte externa futuramente
    setLoading(false);
  };

  const carregarObras = async () => { };
  const carregarEventos = async () => { };
  const carregarVagas = async () => { };
  const carregarEstatisticas = async () => { };

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
    switch (status) {
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

            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Painel da <br />
                <span className="gradient-text">Nossa Cidade</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Acompanhe obras, eventos, vagas de emprego e estatísticas atualizadas da cidade de Guaíra-SP.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 space-y-12">
          {/* Estatísticas Rápidas - Premium Cards */}
          {estatisticas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group bg-card border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Empresas Ativas</p>
                      <p className="text-4xl font-black text-foreground">{estatisticas.total_empresas}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Usuários</p>
                      <p className="text-4xl font-black text-foreground">{estatisticas.total_usuarios}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Mural Guairense</p>
                      <p className="text-4xl font-black text-foreground">{estatisticas.total_posts_mural}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card border-l-4 border-l-red-500 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Farmácias</p>
                      <p className="text-4xl font-black text-foreground">{estatisticas.total_farmacias}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Heart className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs Section - Modern Design */}
          <Tabs defaultValue="obras" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted p-1.5 rounded-2xl h-auto gap-1">
              <TabsTrigger value="obras" className="gap-2 py-4 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
                <Construction className="w-5 h-5" />
                <span className="hidden sm:inline">Obras e Interdições</span>
                <span className="sm:hidden">Obras</span>
              </TabsTrigger>
              <TabsTrigger value="eventos" className="gap-2 py-4 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
                <Calendar className="w-5 h-5" />
                <span className="hidden sm:inline">Agenda de Eventos</span>
                <span className="sm:hidden">Eventos</span>
              </TabsTrigger>
              <TabsTrigger value="vagas" className="gap-2 py-4 rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
                <Briefcase className="w-5 h-5" />
                <span className="hidden sm:inline">Vagas de Emprego</span>
                <span className="sm:hidden">Vagas</span>
              </TabsTrigger>
            </TabsList>

            {/* Obras e Interdições */}
            <TabsContent value="obras" className="space-y-6 mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-foreground">Obras <span className="text-primary">e Interdições</span></h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  {obras.length} registros
                </Badge>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium">Carregando painel de obras...</p>
                </div>
              ) : obras.length === 0 ? (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <Construction className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-muted-foreground font-bold text-lg">Nenhuma obra ou interdição ativa no momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {obras.map((obra) => (
                    <Card key={obra.id} className="group bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0">
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">{obra.titulo}</CardTitle>
                          {getTipoBadge(obra.tipo)}
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(obra.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-6">
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed">{obra.descricao}</p>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="font-bold text-foreground text-sm">{obra.local}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 border border-border/50 rounded-xl text-xs font-bold text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary" />
                              INÍCIO: {formatarData(obra.data_inicio)}
                            </div>
                            {obra.data_previsao_fim && (
                              <div className="flex items-center gap-2 p-3 border border-border/50 rounded-xl text-xs font-bold text-muted-foreground">
                                <Clock className="w-4 h-4 text-primary" />
                                PREVISÃO: {formatarData(obra.data_previsao_fim)}
                              </div>
                            )}
                          </div>

                          {obra.impacto && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-1">Impacto Previsto</p>
                                <p className="text-xs text-amber-500/90 font-bold">{obra.impacto}</p>
                              </div>
                            </div>
                          )}

                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4 border-t border-border/50">
                            Responsável: <span className="text-gray-600">{obra.responsavel}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Agenda de Eventos */}
            <TabsContent value="eventos" className="space-y-6 mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-foreground">Programação <span className="text-primary">em Guaíra</span></h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  {eventos.length} eventos
                </Badge>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium">Carregando agenda cultural...</p>
                </div>
              ) : eventos.length === 0 ? (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <Calendar className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold text-lg">Nenhum evento agendado para os próximos dias.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {eventos.map((evento) => (
                    <Card key={evento.id} className="group bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0">
                      <div className="flex flex-col md:flex-row">
                        {evento.imagem && (
                          <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                            <img
                              src={evento.imagem}
                              alt={evento.titulo}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              {getCategoriaBadge(evento.categoria)}
                            </div>
                            <CardTitle className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">{evento.titulo}</CardTitle>
                            <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-6">{evento.descricao}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-sm font-bold border border-blue-500/20">
                                <Calendar className="w-4 h-4" />
                                <span className="capitalize">{formatarDataHora(evento.data_evento, evento.horario)}</span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 text-foreground rounded-xl text-sm font-bold border border-border/50">
                                <MapPin className="w-4 h-4 text-primary" />
                                {evento.local}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Organização: <strong className="text-foreground ml-1">{evento.organizador}</strong>
                              </span>
                              {evento.contato && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-4 rounded-xl border-border font-bold hover:bg-primary hover:text-white hover:border-primary transition-all"
                                  onClick={() => window.location.href = `tel:${evento.contato}`}
                                >
                                  <Phone className="w-3.5 h-3.5 mr-2" />
                                  Contato: {evento.contato}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Vagas de Emprego */}
            <TabsContent value="vagas" className="space-y-6 mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-foreground">Guaíra <span className="text-primary">Oportunidades</span></h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  {vagas.length} vagas ativas
                </Badge>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium">Buscando novas oportunidades...</p>
                </div>
              ) : vagas.length === 0 ? (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-bold text-lg">Nenhuma vaga anunciada no momento.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {vagas.map((vaga) => (
                    <Card key={vaga.id} className="group bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0">
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">{vaga.titulo}</CardTitle>
                          {getTipoVagaBadge(vaga.tipo)}
                        </div>
                        <p className="text-sm font-black text-primary uppercase tracking-widest">{vaga.empresa}</p>
                        <Badge variant="secondary" className="w-fit bg-muted text-muted-foreground font-bold border-none mt-1">Sertor: {vaga.area}</Badge>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Descrição do Cargo</p>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">{vaga.descricao}</p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Requisitos</p>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2">{vaga.requisitos}</p>
                          </div>
                        </div>

                        {vaga.salario && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-green-800 uppercase tracking-widest">Remuneração</span>
                            <span className="text-lg font-black text-green-700">{vaga.salario}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/50 px-4 py-3 rounded-xl">
                          <MapPin className="w-4 h-4 text-primary" />
                          {vaga.local_trabalho}
                        </div>

                        <div className="pt-6 border-t border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publicado em: {formatarData(vaga.data_publicacao)}</span>
                          </div>

                          <div className="flex gap-3">
                            {vaga.contato_email && (
                              <Button
                                className="flex-1 bg-background hover:bg-primary hover:text-white text-foreground border-2 border-border/50 hover:border-primary rounded-xl font-bold py-6 transition-all"
                                onClick={() => window.location.href = `mailto:${vaga.contato_email}`}
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                E-mail
                              </Button>
                            )}
                            {vaga.contato_telefone && (
                              <Button
                                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold py-6 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                onClick={() => window.location.href = `tel:${vaga.contato_telefone}`}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Ligar Agora
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
