import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock, AlertCircle, Building2, Stethoscope, Ambulance, ArrowLeft, Home, HeartPulse, Activity, Zap, Navigation, ExternalLink, ShieldCheck, Sparkles, Calendar, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UnidadeSaude {
  nome: string;
  tipo: "hospital" | "upa" | "ubs" | "especializado";
  endereco: string;
  bairro: string;
  telefone?: string;
  whatsapp?: string;
  horario: string;
  servicos: string[];
  emergencia?: boolean;
}

const unidadesSaude: UnidadeSaude[] = [];

const emergencias = [
  { nome: "SAMU", telefone: "192", descricao: "Serviço Móvel de Urgência", color: "bg-red-600" },
  { nome: "Bombeiros", telefone: "193", descricao: "Corpo de Bombeiros", color: "bg-red-500" },
  { nome: "Polícia", telefone: "190", descricao: "Polícia Militar", color: "bg-blue-600" },
  { nome: "D. Civil", telefone: "199", descricao: "Defesa Civil", color: "bg-orange-600" },
];

export default function SaudeNaPratica() {
  const navigate = useNavigate();

  const getTipoLabel = (tipo: string) => {
    const labels = {
      hospital: "Hospital",
      upa: "UPA 24h",
      ubs: "Unidade Básica",
      especializado: "Especializado"
    };
    return labels[tipo as keyof typeof labels];
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      hospital: "bg-red-600",
      upa: "bg-orange-600",
      ubs: "bg-blue-600",
      especializado: "bg-purple-600"
    };
    return colors[tipo as keyof typeof colors];
  };

  const handleLigar = (telefone: string) => {
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (whatsapp: string) => {
    const numero = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  };

  const handleVerMapa = (endereco: string, bairro: string) => {
    const query = encodeURIComponent(`${endereco}, ${bairro}, Guaíra - SP`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
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
                <HeartPulse className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Saúde na <br />
                <span className="gradient-text">Prática em Guaíra</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Guia completo de unidades de saúde, hospitais e serviços de emergência do município de Guaíra-SP.
              </p>
            </div>
          </div>
        </section>

        {/* Emergências Section */}
        <section className="container mx-auto px-4 py-8">
          <Card className="bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Ambulance className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900 font-black">Telefones de Emergência</CardTitle>
                  <CardDescription className="text-red-700 font-medium">Ligue imediatamente em casos de urgência</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {emergencias.map((item) => (
                  <Button
                    key={item.telefone}
                    onClick={() => handleLigar(item.telefone)}
                    variant="outline"
                    className="flex flex-col h-auto py-5 bg-background border-2 border-red-100/50 hover:border-red-400 rounded-xl transition-colors group"
                  >
                    <span className={`text-3xl font-black ${item.telefone === '190' ? 'text-blue-600' : 'text-red-600'}`}>{item.telefone}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter mt-1">{item.nome}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 py-12 space-y-16">
          {/* 24 Horas Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Atendimento <span className="text-red-600">24 Horas</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {unidadesSaude
                .filter(u => u.emergencia)
                .map((unidade, index) => (
                  <Card key={index} className="bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden group p-0 shadow-lg rounded-[2rem]">
                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${getTipoColor(unidade.tipo)} text-white px-3 py-1 rounded-lg`}>
                          {getTipoLabel(unidade.tipo)}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 animate-pulse font-black">24H</Badge>
                      </div>
                      <CardTitle className="text-2xl font-black group-hover:text-red-600 transition-colors uppercase tracking-tight">
                        {unidade.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 space-y-6">
                      <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-2xl">
                        <MapPin className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-foreground">{unidade.endereco}</p>
                          <p className="text-sm text-muted-foreground font-medium">{unidade.bairro}</p>
                          <button
                            onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                            className="text-xs text-blue-600 hover:underline font-bold mt-2 flex items-center gap-1"
                          >
                            VER NO MAPA <Navigation className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {unidade.telefone && (
                          <Button
                            onClick={() => handleLigar(unidade.telefone!)}
                            variant="outline"
                            className="rounded-xl py-6 font-bold border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Ligar Agora
                          </Button>
                        )}
                        {unidade.whatsapp && (
                          <Button
                            onClick={() => handleWhatsApp(unidade.whatsapp!)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-6 font-bold transition-all active:scale-95"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                          <Activity className="w-3.5 h-3.5" /> Serviços Disponíveis
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {unidade.servicos.map((servico, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-600 font-bold text-[10px] py-1">
                              {servico}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-foreground border-t border-border/10 pt-4">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {unidade.horario}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* UBS Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Unidades Básicas <span className="text-blue-600">(UBS)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unidadesSaude
                .filter(u => u.tipo === "ubs")
                .map((unidade, index) => (
                  <Card key={index} className="bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 rounded-[2rem] overflow-hidden p-0 group shadow-lg">
                    <CardHeader className="bg-muted/10 p-5">
                      <Badge className="bg-blue-600 text-white w-fit mb-2">UBS</Badge>
                      <CardTitle className="text-lg font-black group-hover:text-blue-600 transition-colors">{unidade.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-bold text-foreground leading-tight">{unidade.endereco}</p>
                          <p className="text-xs text-muted-foreground font-medium">{unidade.bairro}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {unidade.servicos.slice(0, 3).map((servico, idx) => (
                          <Badge key={idx} variant="outline" className="text-[9px] font-bold text-gray-400 capitalize">{servico}</Badge>
                        ))}
                        {unidade.servicos.length > 3 && (
                          <Badge variant="outline" className="text-[10px] font-bold text-blue-500">+{unidade.servicos.length - 3}</Badge>
                        )}
                      </div>

                      <div className="pt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLigar(unidade.telefone!)}
                          className="flex-1 rounded-xl font-bold py-5 border-2 text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1.5" /> Ligar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                          className="rounded-xl font-bold text-blue-600 text-xs px-2"
                        >
                          Mapa <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Centros Especializados */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-purple-100 rounded-xl">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Centros <span className="text-purple-600">Especializados</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {unidadesSaude
                .filter(u => u.tipo === "especializado")
                .map((unidade, index) => (
                  <Card key={index} className="bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden p-0">
                    <div className="bg-purple-600 p-6 text-white">
                      <Badge className="bg-white/20 text-white border-none mb-3 font-bold uppercase tracking-widest text-[10px]">Especializado</Badge>
                      <CardTitle className="text-2xl font-black">{unidade.nome}</CardTitle>
                    </div>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localização</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-purple-500 mt-1" />
                              <span className="text-sm font-bold text-foreground">{unidade.endereco}, {unidade.bairro}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Horário</p>
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-purple-500 mt-1" />
                              <span className="text-sm font-bold text-foreground">{unidade.horario}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrar em Contato</p>
                          <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold py-6 shadow-lg shadow-purple-100 transition-all uppercase text-xs tracking-tighter"
                            onClick={() => handleLigar(unidade.telefone!)}
                          >
                            <Phone className="w-4 h-4 mr-2" /> Ligue Agora
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Especialidades e Serviços</p>
                        <div className="flex flex-wrap gap-2">
                          {unidade.servicos.map((servico, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-purple-50 text-purple-700 font-bold border-none py-1.5 px-3">
                              {servico}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Informações Section */}
          <section className="py-8">
            <Card className="bg-gradient-to-br from-blue-600 to-green-600 text-white rounded-[2.5rem] border-none overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-3xl font-black">Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 grid md:grid-cols-3 gap-8">
                {[
                  { title: "Documentos", text: "Cartão SUS, RG, CPF e comprovante de residência atualizado.", icon: ShieldCheck },
                  { title: "Agendamento", text: "Procure a UBS mais próxima para marcar consultas e exames.", icon: Calendar },
                  { title: "Medicamentos", text: "Farmácia Popular com entrega mediante prescrição médica.", icon: Activity }
                ].map((info, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20">
                    <info.icon className="w-10 h-10 mb-4 text-white" />
                    <h3 className="font-black text-xl mb-2">{info.title}</h3>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">{info.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
