import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Activity
} from "lucide-react";
import bairrosData from "@/data/bairros-guaira.json";

// Lista de todos os bairros de Guaíra
const BAIRROS = bairrosData.bairros.map(b => ({
  slug: b.slug,
  nome_exibicao: b.nome_exibicao
}));

// Regras gerais da cidade
const REGRAS_GERAIS = bairrosData.regras_gerais;

// Função para formatar dias da semana
const formatarDiasSemana = (dias: string[]) => {
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

// Função para obter serviços específicos do bairro
const getServicosBairro = (slug: string) => {
  const bairro = bairrosData.bairros.find(b => b.slug === slug);
  if (!bairro) return null;

  // Retorna os serviços essenciais específicos do bairro + agendas
  return {
    bairro_info: bairro,
    servicos_essenciais: bairro.servicos_essenciais,
    agenda: bairro.agenda,
    grupo_coleta: bairro.grupo_coleta
  };
};

export default function ServicosPorBairro() {
  const [bairroSelecionado, setBairroSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  // Filtrar bairros pela busca
  const bairrosFiltrados = BAIRROS.filter(b =>
    b.nome_exibicao.toLowerCase().includes(busca.toLowerCase())
  );

  // Se um bairro está selecionado, mostrar detalhes
  if (bairroSelecionado) {
    const bairro = BAIRROS.find(b => b.slug === bairroSelecionado);
    const dadosBairro = getServicosBairro(bairroSelecionado);
    
    if (!dadosBairro) {
      return <div>Bairro não encontrado</div>;
    }

    const { servicos_essenciais, agenda } = dadosBairro;
    const temServicos = servicos_essenciais && Object.keys(servicos_essenciais).length > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="ghost"
                className="text-white bg-orange-500 hover:bg-orange-600"
                onClick={() => setBairroSelecionado(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Bairros
              </Button>
              <Button
                variant="ghost"
                className="text-white bg-green-500 hover:bg-green-600"
                onClick={() => window.location.href = '/'}
              >
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">{bairro?.nome_exibicao}</h1>
                <p className="text-blue-100">Serviços disponíveis no bairro</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Agenda de Coleta de Lixo Doméstico */}
          {agenda?.lixo_domestico && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Coleta de Lixo Doméstico</h2>
              </div>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="pt-6">
                  {agenda.lixo_domestico.herda_regra_geral && REGRAS_GERAIS.coleta_lixo_domestico && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-700">Dias de Coleta</span>
                        </div>
                        <p className="text-gray-600">
                          {formatarDiasSemana(REGRAS_GERAIS.coleta_lixo_domestico.dias_semana)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-700">Horário</span>
                        </div>
                        <p className="text-gray-600">A partir das {REGRAS_GERAIS.coleta_lixo_domestico.inicio_coleta}</p>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Observação:</strong> {REGRAS_GERAIS.coleta_lixo_domestico.observacao}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Poda de Árvores */}
          {agenda?.poda_arvores && REGRAS_GERAIS.poda_arvores && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-800">Poda de Árvores</h2>
              </div>
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Período de Recolhimento pela Prefeitura:</span>
                      <p className="text-gray-600 mt-1">
                        {REGRAS_GERAIS.poda_arvores.recolhimento_prefeitura_meses.map(m => 
                          m.charAt(0).toUpperCase() + m.slice(1)
                        ).join(', ')}
                      </p>
                    </div>
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Fora do Período:</strong> {REGRAS_GERAIS.poda_arvores.fora_do_periodo}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Entulho de Construção */}
          {agenda?.entulho_construcao && REGRAS_GERAIS.coleta_entulho_construcao && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">Entulho de Construção</h2>
              </div>
              <Card className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardContent className="pt-6">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>⚠️ {REGRAS_GERAIS.coleta_entulho_construcao.tipo.replace(/_/g, ' ').toUpperCase()}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {REGRAS_GERAIS.coleta_entulho_construcao.orientacao}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Descarte de Galhos, Folhas e Volumosos */}
          {agenda?.limpeza_quintal_galhos_folhas_volumosos && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-800">Descarte de Galhos, Folhas e Volumosos</h2>
              </div>
              <Card className="bg-gradient-to-r from-teal-50 to-cyan-50">
                <CardContent className="pt-6">
                  {agenda.limpeza_quintal_galhos_folhas_volumosos.janelas && 
                   agenda.limpeza_quintal_galhos_folhas_volumosos.janelas.length > 0 ? (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Próximas datas de coleta:</p>
                      <div className="space-y-2">
                        {agenda.limpeza_quintal_galhos_folhas_volumosos.janelas.map((janela: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-white text-teal-700 border-teal-300">
                            {janela}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>ℹ️ Informação:</strong> Calendário de coleta em atualização. 
                        Consulte a prefeitura ou aguarde divulgação oficial.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Serviços Essenciais do Bairro */}
          {temServicos && Object.keys(servicos_essenciais).length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Serviços Essenciais no Bairro</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(servicos_essenciais).map(([categoria, dados]: [string, any], idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {categoria === 'saude_ubs_esf' && <Hospital className="w-5 h-5 text-red-600" />}
                        {categoria === 'escola_creche' && <School className="w-5 h-5 text-purple-600" />}
                        {categoria === 'farmacia' && <Activity className="w-5 h-5 text-green-600" />}
                        {categoria === 'mercado_hortifruti' && <ShoppingBag className="w-5 h-5 text-orange-600" />}
                        {!['saude_ubs_esf', 'escola_creche', 'farmacia', 'mercado_hortifruti'].includes(categoria) && (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        )}
                        {categoria.replace(/_/g, ' ').toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Array.isArray(dados) ? (
                        dados.map((item: any, i: number) => (
                          <div key={i} className="text-sm">
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </div>
                        ))
                      ) : typeof dados === 'object' ? (
                        Object.entries(dados).map(([key, value]: [string, any], i) => (
                          <div key={i} className="text-sm">
                            <span className="font-semibold">{key}:</span> {String(value)}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm">{String(dados)}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Mensagem se não houver serviços específicos cadastrados */}
          {!temServicos && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Serviços Específicos em Atualização
                </h3>
                <p className="text-gray-600 mb-4">
                  Este bairro segue as regras gerais da cidade mostradas acima.
                  Em breve teremos informações detalhadas sobre serviços específicos disponíveis no bairro.
                </p>
                <p className="text-sm text-gray-500">
                  Para serviços de saúde, escolas, comércio e outros, você pode consultar a seção "Empresas" 
                  e filtrar pelo bairro {bairro?.nome_exibicao}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Tela de listagem de bairros
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 shadow-lg">
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
          
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold">Serviços por Bairro</h1>
              <p className="text-blue-100 text-lg">
                Encontre serviços de saúde, coleta de lixo e mais em cada bairro de Guaíra
              </p>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar bairro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 py-6 text-lg bg-white/95 backdrop-blur"
            />
          </div>
        </div>
      </div>

      {/* Grid de Bairros */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{bairrosFiltrados.length}</span> bairros encontrados
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bairrosFiltrados.map((bairro) => {
            const dadosBairro = getServicosBairro(bairro.slug);
            
            return (
              <Card
                key={bairro.slug}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-2 hover:border-blue-300"
                onClick={() => setBairroSelecionado(bairro.slug)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                        {bairro.nome_exibicao}
                      </h3>
                      <p className="text-sm text-gray-500">Ver serviços →</p>
                    </div>
                  </div>

                  {/* Preview de informações disponíveis */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Coleta de Lixo
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      Poda de Árvores
                    </Badge>
                    {dadosBairro && Object.keys(dadosBairro.servicos_essenciais || {}).length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        <Building2 className="w-3 h-3 mr-1" />
                        Serviços
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {bairrosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum bairro encontrado
            </h3>
            <p className="text-gray-500">
              Tente buscar com outro termo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
