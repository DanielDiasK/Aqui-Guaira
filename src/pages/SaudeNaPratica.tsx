import { Phone, MapPin, Clock, AlertCircle, Building2, Stethoscope, Ambulance, ArrowLeft, Home } from "lucide-react";
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

const unidadesSaude: UnidadeSaude[] = [
  {
    nome: "Santa Casa de Misericórdia de Guaíra",
    tipo: "hospital",
    endereco: "Rua Marechal Deodoro da Fonseca, 1055",
    bairro: "Centro",
    telefone: "(17) 3331-9200",
    whatsapp: "(17) 99999-9999",
    horario: "24 horas - Emergência e Internação",
    servicos: [
      "Pronto-Socorro 24h",
      "Internação",
      "Centro Cirúrgico",
      "UTI",
      "Maternidade",
      "Exames Laboratoriais",
      "Raio-X",
      "Ultrassonografia",
      "Ambulatório"
    ],
    emergencia: true
  },
  {
    nome: "UPA - Unidade de Pronto Atendimento 24h",
    tipo: "upa",
    endereco: "Av. Dom Pedro I, 2500",
    bairro: "Jardim Primavera",
    telefone: "(17) 3331-8500",
    horario: "24 horas - Atendimento de Urgência e Emergência",
    servicos: [
      "Urgência e Emergência 24h",
      "Medicação",
      "Curativos",
      "Inalação",
      "Suturas",
      "Raio-X",
      "Eletrocardiograma",
      "Coleta de Exames"
    ],
    emergencia: true
  },
  {
    nome: "UBS - Centro de Saúde Central",
    tipo: "ubs",
    endereco: "Rua 7 de Setembro, 450",
    bairro: "Centro",
    telefone: "(17) 3331-7100",
    horario: "Segunda a Sexta: 7h às 17h",
    servicos: [
      "Consultas Médicas",
      "Enfermagem",
      "Vacinação",
      "Pré-natal",
      "Puericultura",
      "Curativos",
      "Farmácia Básica",
      "Coleta de Exames"
    ]
  },
  {
    nome: "UBS - Vila Bela Vista",
    tipo: "ubs",
    endereco: "Rua das Flores, 890",
    bairro: "Vila Bela Vista",
    telefone: "(17) 3331-7150",
    horario: "Segunda a Sexta: 7h às 17h",
    servicos: [
      "Consultas Médicas",
      "Enfermagem",
      "Vacinação",
      "Pré-natal",
      "Curativos",
      "Farmácia Básica"
    ]
  },
  {
    nome: "UBS - Jardim Aeroporto",
    tipo: "ubs",
    endereco: "Av. dos Bandeirantes, 1234",
    bairro: "Jardim Aeroporto",
    telefone: "(17) 3331-7200",
    horario: "Segunda a Sexta: 7h às 17h",
    servicos: [
      "Consultas Médicas",
      "Enfermagem",
      "Vacinação",
      "Pré-natal",
      "Curativos",
      "Farmácia Básica"
    ]
  },
  {
    nome: "UBS - Vila Maria",
    tipo: "ubs",
    endereco: "Rua Santa Maria, 567",
    bairro: "Vila Maria",
    telefone: "(17) 3331-7250",
    horario: "Segunda a Sexta: 7h às 17h",
    servicos: [
      "Consultas Médicas",
      "Enfermagem",
      "Vacinação",
      "Pré-natal",
      "Curativos",
      "Farmácia Básica"
    ]
  },
  {
    nome: "Centro de Especialidades Médicas",
    tipo: "especializado",
    endereco: "Av. Saudade, 789",
    bairro: "Centro",
    telefone: "(17) 3331-7300",
    horario: "Segunda a Sexta: 7h às 18h",
    servicos: [
      "Cardiologia",
      "Ortopedia",
      "Oftalmologia",
      "Otorrinolaringologia",
      "Ginecologia",
      "Pediatria",
      "Dermatologia",
      "Psicologia"
    ]
  },
  {
    nome: "CAPS - Centro de Atenção Psicossocial",
    tipo: "especializado",
    endereco: "Rua da Saúde, 321",
    bairro: "Jardim Brasil",
    telefone: "(17) 3331-7400",
    horario: "Segunda a Sexta: 7h às 17h",
    servicos: [
      "Atendimento Psiquiátrico",
      "Psicologia",
      "Terapia Ocupacional",
      "Assistência Social",
      "Grupos Terapêuticos",
      "Oficinas"
    ]
  }
];

const emergencias = [
  { nome: "SAMU", telefone: "192", descricao: "Serviço de Atendimento Móvel de Urgência" },
  { nome: "Bombeiros", telefone: "193", descricao: "Corpo de Bombeiros" },
  { nome: "Polícia Militar", telefone: "190", descricao: "Emergências Policiais" },
  { nome: "Defesa Civil", telefone: "199", descricao: "Emergências Ambientais" },
];

export default function SaudeNaPratica() {
  const getTipoLabel = (tipo: string) => {
    const labels = {
      hospital: "Hospital",
      upa: "UPA 24h",
      ubs: "UBS",
      especializado: "Especializado"
    };
    return labels[tipo as keyof typeof labels];
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      hospital: "bg-red-500",
      upa: "bg-orange-500",
      ubs: "bg-blue-500",
      especializado: "bg-purple-500"
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
            <Stethoscope className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Saúde na Prática</h1>
          </div>
          <p className="text-xl text-green-50 max-w-2xl">
            Encontre todas as unidades de saúde de Guaíra - SP com endereços completos, 
            telefones e serviços disponíveis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Emergências */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Ambulance className="w-8 h-8 text-red-600" />
              <div>
                <CardTitle className="text-red-900">Telefones de Emergência</CardTitle>
                <CardDescription className="text-red-700">
                  Em caso de urgência, ligue imediatamente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergencias.map((emergencia) => (
                <div
                  key={emergencia.telefone}
                  className="bg-white rounded-lg p-4 border-2 border-red-200 hover:border-red-400 transition-all cursor-pointer"
                  onClick={() => handleLigar(emergencia.telefone)}
                >
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {emergencia.telefone}
                  </div>
                  <div className="font-semibold text-gray-900">{emergencia.nome}</div>
                  <div className="text-sm text-gray-600">{emergencia.descricao}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unidades de Emergência 24h */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Atendimento 24 Horas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unidadesSaude
              .filter(u => u.emergencia)
              .map((unidade, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getTipoColor(unidade.tipo)} text-white`}>
                            {getTipoLabel(unidade.tipo)}
                          </Badge>
                          {unidade.emergencia && (
                            <Badge variant="destructive">24h</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{unidade.nome}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Endereço */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{unidade.endereco}</div>
                        <div className="text-sm text-gray-600">{unidade.bairro}</div>
                        <button
                          onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium mt-1"
                        >
                          Ver no mapa →
                        </button>
                      </div>
                    </div>

                    {/* Telefone */}
                    {unidade.telefone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <button
                            onClick={() => handleLigar(unidade.telefone!)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {unidade.telefone}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp */}
                    {unidade.whatsapp && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <button
                          onClick={() => handleWhatsApp(unidade.whatsapp!)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          WhatsApp: {unidade.whatsapp}
                        </button>
                      </div>
                    )}

                    {/* Horário */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                      <div className="text-gray-700">{unidade.horario}</div>
                    </div>

                    {/* Serviços */}
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">Serviços:</div>
                      <div className="flex flex-wrap gap-2">
                        {unidade.servicos.map((servico, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
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

        {/* UBS - Unidades Básicas de Saúde */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Unidades Básicas de Saúde (UBS)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unidadesSaude
              .filter(u => u.tipo === "ubs")
              .map((unidade, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className={`${getTipoColor(unidade.tipo)} text-white w-fit`}>
                      {getTipoLabel(unidade.tipo)}
                    </Badge>
                    <CardTitle className="text-lg mt-2">{unidade.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Endereço */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">{unidade.endereco}</div>
                        <div className="text-gray-600">{unidade.bairro}</div>
                        <button
                          onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                          className="text-green-600 hover:text-green-700 font-medium mt-1"
                        >
                          Ver no mapa →
                        </button>
                      </div>
                    </div>

                    {/* Telefone */}
                    {unidade.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <button
                          onClick={() => handleLigar(unidade.telefone!)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {unidade.telefone}
                        </button>
                      </div>
                    )}

                    {/* Horário */}
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">{unidade.horario}</div>
                    </div>

                    {/* Serviços */}
                    <div className="flex flex-wrap gap-1">
                      {unidade.servicos.slice(0, 4).map((servico, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {servico}
                        </Badge>
                      ))}
                      {unidade.servicos.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{unidade.servicos.length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Unidades Especializadas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-purple-600" />
            Centros Especializados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unidadesSaude
              .filter(u => u.tipo === "especializado")
              .map((unidade, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className={`${getTipoColor(unidade.tipo)} text-white w-fit`}>
                      {getTipoLabel(unidade.tipo)}
                    </Badge>
                    <CardTitle className="text-lg mt-2">{unidade.nome}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Endereço */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">{unidade.endereco}</div>
                        <div className="text-gray-600">{unidade.bairro}</div>
                        <button
                          onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                          className="text-green-600 hover:text-green-700 font-medium mt-1"
                        >
                          Ver no mapa →
                        </button>
                      </div>
                    </div>

                    {/* Telefone */}
                    {unidade.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <button
                          onClick={() => handleLigar(unidade.telefone!)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {unidade.telefone}
                        </button>
                      </div>
                    )}

                    {/* Horário */}
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">{unidade.horario}</div>
                    </div>

                    {/* Especialidades */}
                    <div>
                      <div className="font-semibold text-sm mb-2">Especialidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {unidade.servicos.map((servico, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
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

        {/* Informações Adicionais */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold">Documentos Necessários</div>
                <div className="text-sm text-gray-700">
                  Cartão SUS, RG, CPF e comprovante de residência atualizado
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold">Agendamento de Consultas</div>
                <div className="text-sm text-gray-700">
                  Procure a UBS mais próxima de sua residência para agendar consultas e exames
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-semibold">Farmácia Popular</div>
                <div className="text-sm text-gray-700">
                  Medicamentos gratuitos disponíveis mediante prescrição médica
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
