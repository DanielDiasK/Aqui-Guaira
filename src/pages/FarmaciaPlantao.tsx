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
  Home
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
    try {
      // Carregar farmácias de plantão HOJE
      const { data: plantaoData, error: plantaoError } = await supabase
        .from('plantao_hoje')
        .select('*');

      if (plantaoError) {
        console.error('Erro ao carregar plantões:', plantaoError);
      } else {
        setFarmaciasPlantao(plantaoData || []);
      }

      // Carregar todas as farmácias (para lista completa)
      const { data: farmaciasData, error: farmaciasError } = await supabase
        .from('empresas')
        .select(`
          id,
          nome,
          endereco,
          bairro,
          telefone,
          whatsapp,
          latitude,
          longitude,
          categoria_id,
          categorias:categoria_id(nome)
        `)
        .eq('status', 'aprovado')
        .eq('ativa', true);

      if (farmaciasError) {
        console.error('Erro ao carregar farmácias:', farmaciasError);
      } else {
        // Filtrar apenas farmácias
        const apenasFarmacias = (farmaciasData || []).filter((f: any) => 
          f.categorias?.nome?.toLowerCase().includes('farmácia') || 
          f.categorias?.nome?.toLowerCase().includes('farmacia')
        );
        setTodasFarmacias(apenasFarmacias);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar farmácias');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          {/* Botões de Navegação */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-white bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-white bg-green-500 hover:bg-green-600 gap-2"
            >
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <AlertCircle className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Farmácias de Plantão</h1>
              <p className="text-xl text-green-50">Encontre farmácias abertas 24 horas em Guaíra</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg w-fit">
            <Calendar className="w-4 h-4" />
            <span className="capitalize font-medium">{diaAtual}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Farmácias de Plantão AGORA */}
        {farmaciasPlantao.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Plantão Agora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {farmaciasPlantao.map((farmacia) => {
                const tipoBadge = getTipoBadge(farmacia.tipo_plantao);
                return (
                  <Card key={farmacia.farmacia_id} className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${tipoBadge.class} text-white animate-pulse`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {tipoBadge.label}
                            </Badge>
                            {farmacia.tem_override && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Alteração Especial
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{farmacia.farmacia_nome}</CardTitle>
                          <CardDescription className="mt-2">
                            {farmacia.status !== 'Plantão normal' && (
                              <span className="text-orange-600 font-medium">{farmacia.status}</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Endereço */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{farmacia.endereco}</div>
                          <div className="text-sm text-gray-600">{farmacia.bairro}</div>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleComoChegar(farmacia.endereco, farmacia.bairro, farmacia.farmacia_nome)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Como Chegar
                        </Button>
                        
                        {farmacia.telefone && (
                          <Button
                            onClick={() => handleLigar(farmacia.telefone!)}
                            variant="outline"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Ligar
                          </Button>
                        )}
                      </div>

                      {farmacia.whatsapp && (
                        <Button
                          onClick={() => handleWhatsApp(farmacia.whatsapp!, farmacia.farmacia_nome)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}

                      {/* Info da Fonte */}
                      {farmacia.fonte && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Info className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{formatarDataAtualizacao(farmacia.ultima_atualizacao)}</div>
                              <div>Fonte: {farmacia.fonte}</div>
                            </div>
                            {farmacia.url_fonte && (
                              <a
                                href={farmacia.url_fonte}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-blue-600 hover:text-blue-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Aviso se não houver plantão cadastrado */}
        {farmaciasPlantao.length === 0 && !loading && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Não há farmácias de plantão cadastradas para hoje. Verifique a lista completa abaixo ou entre em contato com as farmácias diretamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Números de Emergência */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleLigar('192')}
                variant="outline"
                className="border-red-300 hover:bg-red-100"
              >
                <span className="text-2xl font-bold text-red-600">192</span>
                <span className="ml-2 text-sm">SAMU</span>
              </Button>
              <Button
                onClick={() => handleLigar('193')}
                variant="outline"
                className="border-red-300 hover:bg-red-100"
              >
                <span className="text-2xl font-bold text-red-600">193</span>
                <span className="ml-2 text-sm">Bombeiros</span>
              </Button>
              <Button
                onClick={() => handleLigar('190')}
                variant="outline"
                className="border-red-300 hover:bg-red-100"
              >
                <span className="text-2xl font-bold text-red-600">190</span>
                <span className="ml-2 text-sm">Polícia</span>
              </Button>
              <Button
                onClick={() => handleLigar('199')}
                variant="outline"
                className="border-red-300 hover:bg-red-100"
              >
                <span className="text-2xl font-bold text-red-600">199</span>
                <span className="ml-2 text-sm">Defesa Civil</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista Completa de Farmácias */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Todas as Farmácias</h2>
          
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nome ou bairro..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Grid de Farmácias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmaciasFiltradas.map((farmacia) => (
              <Card key={farmacia.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{farmacia.nome}</CardTitle>
                  <CardDescription>{farmacia.bairro}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{farmacia.endereco}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {farmacia.telefone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLigar(farmacia.telefone!)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Ligar
                      </Button>
                    )}
                    {farmacia.whatsapp && (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsApp(farmacia.whatsapp!, farmacia.nome)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {farmaciasFiltradas.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhuma farmácia encontrada
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FarmaciaPlantao;
