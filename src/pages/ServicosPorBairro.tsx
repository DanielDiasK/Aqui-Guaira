import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  Search,
  Building2,
  Hospital,
  Trash2,
  Phone,
  Clock,
  AlertCircle,
  Home,
  School,
  ShoppingBag,
  Briefcase,
  Activity,
  Trees,
  Truck,
  Sparkles,
  Info,
  Navigation,
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
const BAIRROS: any[] = [];
const REGRAS_GERAIS: any = {};

const formatarDiasSemana = (dias: string[]) => {
  if (!dias) return "";
  const diasMap: Record<string, string> = {
    'segunda': 'Segunda',
    'terca': 'Terça',
    'quarta': 'Quarta',
    'quinta': 'Quinta',
    'sexta': 'Sexta',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };
  return dias.map(d => diasMap[d] || d).join(', ');
};

const getServicosBairro = (slug: string) => {
  return null;
};

export default function ServicosPorBairro() {
  const navigate = useNavigate();
  const [bairroSelecionado, setBairroSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const bairrosFiltrados = BAIRROS.filter(b =>
    b.nome_exibicao.toLowerCase().includes(busca.toLowerCase())
  );

  const renderDetalhesBairro = () => {
    const bairro = BAIRROS.find(b => b.slug === bairroSelecionado);
    const dadosBairro = getServicosBairro(bairroSelecionado!);

    if (!dadosBairro) return <div>Bairro não encontrado</div>;

    const { servicos_essenciais, agenda } = dadosBairro;
    const temServicos = servicos_essenciais && Object.keys(servicos_essenciais).length > 0;

    return (
      <div className="space-y-12 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-secondary/30 backdrop-blur-md p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Guia Local</p>
              <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">{bairro?.nome_exibicao}</h1>
              <p className="text-muted-foreground font-medium">Informações e utilidades exclusivas do bairro</p>
            </div>
          </div>
          <Button
            onClick={() => setBairroSelecionado(null)}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver outros bairros
          </Button>
        </div>

        <div className="grid gap-12">
          {/* Agenda de Coleta de Lixo */}
          {agenda?.lixo_domestico && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Coleta de <span className="text-green-600">Lixo Doméstico</span></h2>
              </div>
              <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8">
                  {agenda.lixo_domestico.herda_regra_geral && REGRAS_GERAIS.coleta_lixo_domestico && (
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-50 rounded-2xl">
                            <Clock className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Cronograma</p>
                            <p className="text-xl font-black text-foreground">
                              {formatarDiasSemana(REGRAS_GERAIS.coleta_lixo_domestico.dias_semana)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-50 rounded-2xl">
                            <Clock className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Início da Rota</p>
                            <p className="text-xl font-black text-foreground">A partir das {REGRAS_GERAIS.coleta_lixo_domestico.inicio_coleta}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-primary/10 flex items-start gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                          <Info className="w-20 h-20" />
                        </div>
                        <AlertCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div className="relative z-10">
                          <p className="text-sm font-black text-primary uppercase tracking-widest mb-2">Observação Importante</p>
                          <p className="text-foreground/80 leading-relaxed font-medium italic">
                            "{REGRAS_GERAIS.coleta_lixo_domestico.observacao}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Poda e Entulho */}
          <div className="grid md:grid-cols-2 gap-8">
            {agenda?.poda_arvores && REGRAS_GERAIS.poda_arvores && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Trees className="w-6 h-6 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Poda de Árvores</h2>
                </div>
                <Card className="bg-card border border-border/50 shadow-lg rounded-[2rem] p-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Meses de Recolhimento</p>
                      <div className="flex flex-wrap gap-2">
                        {REGRAS_GERAIS.poda_arvores.recolhimento_prefeitura_meses.map(m => (
                          <Badge key={m} className="bg-amber-100 text-amber-700 font-bold border-none py-2 px-4 rounded-xl">
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
                      <Info className="w-4 h-4 text-amber-600 mt-1" />
                      <p className="text-xs text-muted-foreground leading-relaxed font-bold italic">
                        {REGRAS_GERAIS.poda_arvores.fora_do_periodo}
                      </p>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {agenda?.entulho_construcao && REGRAS_GERAIS.coleta_entulho_construcao && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Entulho de Construção</h2>
                </div>
                <Card className="glass-card border-none shadow-lg rounded-[2rem] p-8">
                  <div className="space-y-4">
                    <Badge className="bg-orange-600 text-white font-black py-1.5 px-4 rounded-lg uppercase text-[10px]">
                      {REGRAS_GERAIS.coleta_entulho_construcao.tipo.replace(/_/g, ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                      "{REGRAS_GERAIS.coleta_entulho_construcao.orientacao}"
                    </p>
                  </div>
                </Card>
              </section>
            )}
          </div>

          {/* Serviços Essenciais */}
          {temServicos && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Utilidades no <span className="text-blue-600">Bairro</span></h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(servicos_essenciais!).map(([categoria, dados]: [string, any], idx) => (
                  <Card key={idx} className="bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                    <CardHeader className="p-6 bg-muted/30">
                      <CardTitle className="text-sm font-black flex items-center gap-3 text-foreground uppercase tracking-widest">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform border border-gray-100">
                          {categoria === 'saude_ubs_esf' && <Hospital className="w-5 h-5 text-red-500" />}
                          {categoria === 'escola_creche' && <School className="w-5 h-5 text-blue-500" />}
                          {categoria === 'farmacia' && <Activity className="w-5 h-5 text-green-500" />}
                          {categoria === 'mercado_hortifruti' && <ShoppingBag className="w-5 h-5 text-orange-500" />}
                          {!['saude_ubs_esf', 'escola_creche', 'farmacia', 'mercado_hortifruti'].includes(categoria) && (
                            <Building2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        {categoria.replace(/_/g, ' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      {Array.isArray(dados) ? (
                        dados.map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm">
                            <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="font-bold text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                          </div>
                        ))
                      ) : typeof dados === 'object' ? (
                        Object.entries(dados).map(([key, value]: [string, any], i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div>
                              <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">{key}</span>
                              <span className="font-bold text-gray-700">{String(value)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm font-bold text-foreground/90 p-3 bg-muted/50 rounded-xl">{String(dados)}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {!temServicos && (
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-[3rem] border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Sparkles className="w-40 h-40" />
              </div>
              <CardContent className="p-12 text-center relative z-10 space-y-6">
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-[2rem] w-fit mx-auto border border-white/20">
                  <Info className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black">Informações em Atualização</h3>
                  <p className="text-white/80 font-medium max-w-xl mx-auto leading-relaxed text-lg">
                    Estamos catalogando todos os serviços específicos deste bairro. Por enquanto, as regras gerais da cidade são aplicadas aqui.
                  </p>
                </div>
                <Button variant="outline" className="rounded-2xl py-6 px-10 border-white/30 text-white hover:bg-white hover:text-indigo-600 font-bold transition-all mt-4">
                  Explore outras áreas da cidade
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderListaBairros = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">Serviços por <br /><span className="gradient-text">Bairro</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
            Seu guia local prático. Encontre horários de coleta, unidades de saúde e utilitários perto de você.
          </p>
        </div>
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Qual o seu bairro?"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-12 py-8 text-lg bg-card border-2 border-border/50 rounded-2xl shadow-xl focus:border-primary transition-all font-bold placeholder:font-medium text-foreground"
          />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {bairrosFiltrados.map((bairro) => {
          const dadosBairro = getServicosBairro(bairro.slug);
          return (
            <Card
              key={bairro.slug}
              className="group bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-3 rounded-2xl overflow-hidden flex flex-col p-0"
              onClick={() => setBairroSelecionado(bairro.slug)}
            >
              <CardContent className="p-8 flex-grow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-primary to-primary/60 rounded-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Bairro</p>
                    <h3 className="font-extrabold text-foreground text-xl leading-tight group-hover:text-primary transition-colors truncate">
                      {bairro.nome_exibicao}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none py-1.5 px-3 font-bold text-[10px] uppercase">
                    <Truck className="w-3 h-3 mr-1.5" /> Limpeza
                  </Badge>
                  {dadosBairro && dadosBairro.servicos_essenciais && Object.keys(dadosBairro.servicos_essenciais).length > 0 && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none py-1.5 px-3 font-bold text-[10px] uppercase">
                      <Activity className="w-3 h-3 mr-1.5" /> Utilidades
                    </Badge>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-primary font-black text-xs uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                  Ver detalhes <Navigation className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bairrosFiltrados.length === 0 && (
        <div className="text-center py-24 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
          <MapPin className="w-20 h-20 text-gray-200" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-foreground">Ops! Bairro não localizado.</h3>
            <p className="text-muted-foreground font-medium">Verifique o nome ou tente novamente.</p>
          </div>
          <Button variant="outline" onClick={() => setBusca("")} className="rounded-xl px-10 border-2 font-bold py-5 h-auto mt-2">Limpar Busca</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 pb-24 space-y-10">
          {/* Global Breadcrumb / Nav */}
          {!bairroSelecionado && (
            <div className="flex gap-2">
              <Button
                onClick={() => navigate(-1)}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6"
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
          )}

          {bairroSelecionado ? renderDetalhesBairro() : renderListaBairros()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
