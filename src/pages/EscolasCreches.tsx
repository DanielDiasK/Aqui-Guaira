import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Phone, MapPin, GraduationCap, Baby, School, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import escolasData from '@/data/escolas-creches.json';

interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
}

interface Contatos {
  telefone: string[];
  whatsapp: string[];
}

interface Unidade {
  nome: string;
  tipo: string;
  endereco: Endereco;
  contatos: Contatos;
}

const EscolasCreches = () => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  // Função para obter ícone baseado no tipo
  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'creche':
        return <Baby className="w-5 h-5" />;
      case 'cemei':
        return <School className="w-5 h-5" />;
      case 'escola':
        return <GraduationCap className="w-5 h-5" />;
      case 'escola_tecnica':
        return <Building2 className="w-5 h-5" />;
      case 'instituicao':
        return <Building2 className="w-5 h-5" />;
      default:
        return <School className="w-5 h-5" />;
    }
  };

  // Função para obter cor do badge baseado no tipo
  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'creche':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      case 'cemei':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'escola':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'escola_tecnica':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'instituicao':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Função para formatar nome do tipo
  const formatarTipo = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'creche': 'Creche',
      'cemei': 'CEMEI',
      'escola': 'Escola',
      'escola_tecnica': 'Escola Técnica',
      'instituicao': 'Instituição'
    };
    return tipos[tipo] || tipo;
  };

  // Função para formatar categoria
  const formatarCategoria = (categoria: string) => {
    const categorias: { [key: string]: string } = {
      'municipal': 'Municipal',
      'estadual': 'Estadual',
      'estadual_tecnica': 'Estadual Técnica',
      'particular': 'Particular'
    };
    return categorias[categoria] || categoria;
  };

  // Coletar todas as unidades organizadas
  const todasUnidades: { unidade: Unidade; categoria: string }[] = [];
  
  // Municipal
  escolasData.unidades_ativas.governamental.municipal.forEach(unidade => {
    todasUnidades.push({ unidade, categoria: 'municipal' });
  });

  // Estadual
  escolasData.unidades_ativas.governamental.estadual.forEach(unidade => {
    todasUnidades.push({ unidade, categoria: 'estadual' });
  });

  // Estadual Técnica
  escolasData.unidades_ativas.governamental.estadual_tecnica.forEach(unidade => {
    todasUnidades.push({ unidade, categoria: 'estadual_tecnica' });
  });

  // Particular
  escolasData.unidades_ativas.particular.forEach(unidade => {
    todasUnidades.push({ unidade, categoria: 'particular' });
  });

  // Filtrar unidades
  const unidadesFiltradas = todasUnidades.filter(({ unidade, categoria }) => {
    const passaTipo = filtroTipo === 'todas' || unidade.tipo === filtroTipo;
    const passaCategoria = filtroCategoria === 'todas' || categoria === filtroCategoria;
    return passaTipo && passaCategoria;
  });

  // Estatísticas
  const totalUnidades = todasUnidades.length;
  const totalMunicipal = escolasData.unidades_ativas.governamental.municipal.length;
  const totalEstadual = escolasData.unidades_ativas.governamental.estadual.length + 
                        escolasData.unidades_ativas.governamental.estadual_tecnica.length;
  const totalParticular = escolasData.unidades_ativas.particular.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                Escolas e Creches
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Rede de educação de Guaíra-SP • Atualizado em {new Date(escolasData.atualizado_em).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate(-1)}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-initial"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-initial"
              >
                <Home className="h-4 w-4" />
                Início
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold">{totalUnidades}</div>
              <div className="text-xs sm:text-sm opacity-90">Total</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold">{totalMunicipal}</div>
              <div className="text-xs sm:text-sm opacity-90">Municipal</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 sm:p-4 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold">{totalEstadual}</div>
              <div className="text-xs sm:text-sm opacity-90">Estadual</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-lg text-center">
              <div className="text-2xl sm:text-3xl font-bold">{totalParticular}</div>
              <div className="text-xs sm:text-sm opacity-90">Particular</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Filtrar Unidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Filtro por Tipo */}
              <div>
                <label className="text-sm sm:text-base font-semibold mb-3 block">Por Tipo</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroTipo === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setFiltroTipo('todas')}
                  >
                    Todas
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroTipo === 'creche' ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-800'}`}
                    onClick={() => setFiltroTipo('creche')}
                  >
                    Creches
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroTipo === 'cemei' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}
                    onClick={() => setFiltroTipo('cemei')}
                  >
                    CEMEI
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroTipo === 'escola' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                    onClick={() => setFiltroTipo('escola')}
                  >
                    Escolas
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroTipo === 'escola_tecnica' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                    onClick={() => setFiltroTipo('escola_tecnica')}
                  >
                    Técnicas
                  </Badge>
                </div>
              </div>

              {/* Filtro por Categoria */}
              <div>
                <label className="text-sm sm:text-base font-semibold mb-3 block">Por Categoria</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroCategoria === 'todas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setFiltroCategoria('todas')}
                  >
                    Todas
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroCategoria === 'municipal' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                    onClick={() => setFiltroCategoria('municipal')}
                  >
                    Municipal
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroCategoria === 'estadual' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}
                    onClick={() => setFiltroCategoria('estadual')}
                  >
                    Estadual
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroCategoria === 'estadual_tecnica' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                    onClick={() => setFiltroCategoria('estadual_tecnica')}
                  >
                    Estadual Técnica
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-sm sm:text-base px-4 py-2 ${filtroCategoria === 'particular' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}
                    onClick={() => setFiltroCategoria('particular')}
                  >
                    Particular
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Mostrando {unidadesFiltradas.length} de {totalUnidades} unidades
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {unidadesFiltradas.map(({ unidade, categoria }, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getCorTipo(unidade.tipo)}`}>
                      {getIconeTipo(unidade.tipo)}
                    </div>
                    <div>
                      <Badge className={getCorTipo(unidade.tipo)}>
                        {formatarTipo(unidade.tipo)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatarCategoria(categoria)}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg leading-tight">
                  {unidade.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Endereço */}
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium">
                      {unidade.endereco.logradouro}, {unidade.endereco.numero}
                    </div>
                    <div className="text-gray-500">
                      {unidade.endereco.bairro}
                      {unidade.endereco.complemento && ` (${unidade.endereco.complemento})`}
                    </div>
                  </div>
                </div>

                {/* Contatos */}
                {(unidade.contatos.telefone.length > 0 || unidade.contatos.whatsapp.length > 0) && (
                  <div className="space-y-2">
                    {unidade.contatos.telefone.length > 0 && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <Phone className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <div className="space-y-1">
                          {unidade.contatos.telefone.map((tel, i) => (
                            <a
                              key={i}
                              href={`tel:${tel.replace(/\D/g, '')}`}
                              className="block text-gray-700 hover:text-green-600 font-medium"
                            >
                              {tel}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {unidade.contatos.whatsapp.length > 0 && (
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600 font-bold">
                          📱
                        </div>
                        <div className="space-y-1">
                          {unidade.contatos.whatsapp.map((whats, i) => (
                            <a
                              key={i}
                              href={`https://wa.me/${whats.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-gray-700 hover:text-green-600 font-medium"
                            >
                              {whats}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {unidadesFiltradas.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <GraduationCap className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma unidade encontrada</p>
              <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EscolasCreches;
