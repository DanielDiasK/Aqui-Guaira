import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  MapPin,
  Clock,
  Search,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Calendar,
  ExternalLink,
  Info,
  MessageSquare,
  ArrowLeft,
  Home,
  HeartPulse,
  Syringe,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FarmaciaPlantao {
  farmacia_id: string;
  farmacia_nome: string;
  endereco: string;
  bairro: string;
  telefone?: string;
  whatsapp?: string;
  latitude: number;
  longitude: number;
  tipo_plantao: string; // '24h', 'noite', 'diurno'
  status: string;
  fonte?: string;
  url_fonte?: string;
  ultima_atualizacao: string;
  tem_override: boolean;
}

interface Farmacia {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  telefone?: string;
  whatsapp?: string;
  latitude: number;
  longitude: number;
}

const FarmaciaPlantao = () => {
  const navigate = useNavigate();
  const [farmaciasPlantao, setFarmaciasPlantao] = useState<FarmaciaPlantao[]>([]);
  const [todasFarmacias, setTodasFarmacias] = useState<Farmacia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [diaAtual] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }));

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    // Dados serão carregados de uma fonte externa futuramente
    setLoading(false);
  };

  const farmaciasFiltradas = todasFarmacias.filter(farmacia =>
    busca === '' ||
    farmacia.nome.toLowerCase().includes(busca.toLowerCase()) ||
    farmacia.bairro?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleLigar = (telefone: string) => {
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (whatsapp: string, nome: string) => {
    const numero = whatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá! Vi que a ${nome} está de plantão hoje. Gostaria de mais informações.`);
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
  };

  const handleComoChegar = (endereco: string, bairro: string, nome: string) => {
    const query = encodeURIComponent(`${endereco}, ${bairro}, Guaíra - SP`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getTipoBadge = (tipo: string) => {
    const badges = {
      '24h': { label: '24 Horas', class: 'bg-green-600' },
      'noite': { label: 'Plantão Noturno', class: 'bg-blue-600' },
      'diurno': { label: 'Plantão Diurno', class: 'bg-orange-600' }
    };
    return badges[tipo as keyof typeof badges] || badges['24h'];
  };

  const formatarDataAtualizacao = (data: string) => {
    const date = new Date(data);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Atualizado hoje';
    if (days === 1) return 'Atualizado ontem';
    return `Atualizado há ${days} dias`;
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
                <HeartPulse className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Farmácias de <br />
                <span className="gradient-text">Plantão Hoje</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Informações atualizadas sobre as farmácias abertas 24h e em regime de plantão no município de Guaíra-SP.
              </p>
            </div>
          </div>
        </section>

        {/* Plantão Agora Section */}
        <section className="container mx-auto px-4 py-8">
          {farmaciasPlantao.length > 0 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Disponíveis <span className="text-primary">Agora</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {farmaciasPlantao.map((farmacia) => {
                  const tipoBadge = getTipoBadge(farmacia.tipo_plantao);
                  return (
                    <Card key={farmacia.farmacia_id} className="bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-xl">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className={`${tipoBadge.class} text-white px-3 py-1 rounded-lg animate-pulse`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {tipoBadge.label}
                          </Badge>
                          {farmacia.tem_override && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Alteração Especial
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl font-bold group-hover:text-green-600 transition-colors">
                          {farmacia.farmacia_nome}
                        </CardTitle>
                        {farmacia.status !== 'Plantão normal' && (
                          <CardDescription className="text-orange-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {farmacia.status}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl">
                          <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">{farmacia.endereco}</p>
                            <p className="text-sm text-muted-foreground font-medium">{farmacia.bairro}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleComoChegar(farmacia.endereco, farmacia.bairro, farmacia.farmacia_nome)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02]"
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Como Chegar
                          </Button>

                          {farmacia.telefone && (
                            <Button
                              onClick={() => handleLigar(farmacia.telefone!)}
                              variant="outline"
                              className="rounded-xl py-6 font-bold border-2 hover:bg-gray-50 transition-all hover:scale-[1.02]"
                            >
                              <Phone className="w-4 h-4 mr-2 text-green-600" />
                              Ligar Agora
                            </Button>
                          )}
                        </div>

                        {farmacia.whatsapp && (
                          <Button
                            onClick={() => handleWhatsApp(farmacia.whatsapp!, farmacia.farmacia_nome)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-green-100 transition-all hover:scale-[1.02]"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            WhatsApp Farmácia
                          </Button>
                        )}

                        {farmacia.fonte && (
                          <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-primary" />
                              <span>{formatarDataAtualizacao(farmacia.ultima_atualizacao)} • Fonte: {farmacia.fonte}</span>
                            </div>
                            {farmacia.url_fonte && (
                              <a href={farmacia.url_fonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                Ver Original <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        {/* Emergency Section */}
        <section className="container mx-auto px-4 py-8">
          <Card className="border-red-500/20 bg-red-500/5 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 font-black">
                <Syringe className="w-6 h-6" />
                Números de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { num: '192', label: 'SAMU', color: 'bg-red-600' },
                  { num: '193', label: 'Bombeiros', color: 'bg-red-500' },
                  { num: '190', label: 'Polícia', color: 'bg-blue-600' },
                  { num: '199', label: 'D. Civil', color: 'bg-orange-600' }
                ].map((item) => (
                  <Button
                    key={item.num}
                    onClick={() => handleLigar(item.num)}
                    variant="outline"
                    className="flex flex-col h-auto py-6 bg-card border-2 border-red-500/20 hover:border-red-500/40 rounded-2xl transition-all hover:scale-105"
                  >
                    <span className={`text-2xl font-black ${item.num === '190' ? 'text-blue-500' : 'text-red-500'}`}>{item.num}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* All Pharmacies Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Todas as <span className="text-primary">Farmácias</span>
                </h2>
              </div>

              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Nome ou bairro da farmácia..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-12 py-6 rounded-xl bg-card border-border/50 focus:border-primary transition-all font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmaciasFiltradas.map((farmacia) => (
                <Card key={farmacia.id} className="bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden p-0 shadow-sm hover:shadow-xl group">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{farmacia.nome}</CardTitle>
                    <Badge variant="secondary" className="w-fit bg-background border border-border/50 text-muted-foreground font-bold uppercase text-[10px]">
                      {farmacia.bairro}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span className="text-sm font-medium text-gray-600 leading-tight">{farmacia.endereco}</span>
                    </div>

                    <div className="flex gap-2">
                      {farmacia.telefone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLigar(farmacia.telefone!)}
                          className="flex-1 rounded-xl font-bold py-5 border-2"
                        >
                          <Phone className="w-4 h-4 mr-1.5" />
                          Ligar
                        </Button>
                      )}
                      {farmacia.whatsapp && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold py-5"
                          onClick={() => handleWhatsApp(farmacia.whatsapp!, farmacia.nome)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          Zap
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {farmaciasFiltradas.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground font-bold text-lg">Nenhuma farmácia encontrada para sua busca</p>
                <Button variant="link" onClick={() => setBusca("")} className="text-primary font-black">Limpar Filtros</Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FarmaciaPlantao;
