import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import categoriasData from '@/data/categorias-empresas.json';

const EmpresasNovo = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set());

  const toggleCategoria = (id: string) => {
    const novasExpandidas = new Set(categoriasExpandidas);
    if (novasExpandidas.has(id)) {
      novasExpandidas.delete(id);
    } else {
      novasExpandidas.add(id);
    }
    setCategoriasExpandidas(novasExpandidas);
  };

  // Filtrar categorias pela busca
  const categoriasFiltradas = categoriasData.categorias.filter(cat => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    const nomeMatch = cat.nome.toLowerCase().includes(buscaLower);
    const subMatch = cat.subcategorias.some(sub => sub.toLowerCase().includes(buscaLower));
    return nomeMatch || subMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Título e Botões */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  🏢 Encontre Empresas Locais
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Busque por nome, categoria ou serviço em Guaíra-SP
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

            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Digite o que você procura..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 py-6 text-base sm:text-lg"
              />
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold">{categoriasData.categorias.length}</div>
                <div className="text-xs">Categorias</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold">
                  {categoriasData.categorias.reduce((acc, cat) => acc + cat.subcategorias.length, 0)}
                </div>
                <div className="text-xs">Subcategorias</div>
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold">{categoriasFiltradas.length}</div>
                <div className="text-xs">Resultados</div>
              </div>
              <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold">100%</div>
                <div className="text-xs">Cobertura</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Principal com 100% da tela */}
      <div className="w-full">
        <div className="container mx-auto px-4 py-6">
          {/* Grid de Cards de Categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categoriasFiltradas.map((categoria) => {
              const expandida = categoriasExpandidas.has(categoria.id);
              
              return (
                <Card 
                  key={categoria.id} 
                  className={`hover:shadow-2xl transition-all cursor-pointer ${
                    expandida ? 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4' : ''
                  }`}
                  onClick={() => toggleCategoria(categoria.id)}
                >
                  <CardHeader className={`bg-gradient-to-br ${categoria.cor} text-white rounded-t-lg`}>
                    <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl">{categoria.icone}</span>
                        <span>{categoria.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {categoria.subcategorias.length}
                        </Badge>
                        {expandida ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    {!expandida ? (
                      // Visualização compacta - apenas primeiras 3 subcategorias
                      <div className="space-y-2">
                        {categoria.subcategorias.slice(0, 3).map((sub, idx) => (
                          <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{sub}</span>
                          </div>
                        ))}
                        {categoria.subcategorias.length > 3 && (
                          <p className="text-xs text-gray-500 italic mt-2">
                            + {categoria.subcategorias.length - 3} subcategorias...
                          </p>
                        )}
                      </div>
                    ) : (
                      // Visualização expandida - todas as subcategorias em grid
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {categoria.subcategorias.map((sub, idx) => (
                          <div 
                            key={idx} 
                            className="bg-gray-50 hover:bg-blue-50 p-3 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                          >
                            <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                              <span className="text-blue-500 text-xs mt-0.5">✓</span>
                              <span>{sub}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mensagem quando não há resultados */}
          {categoriasFiltradas.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                <p className="text-sm mt-2">Tente buscar com outras palavras-chave</p>
              </div>
            </Card>
          )}

          {/* Rodapé com informações */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Como usar esta página
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Buscar:</strong> Digite palavras-chave na barra de busca para filtrar categorias e subcategorias</p>
              <p>• <strong>Expandir:</strong> Clique em qualquer card para ver todas as subcategorias</p>
              <p>• <strong>Navegar:</strong> Explore os 20 segmentos principais de negócios em Guaíra</p>
              <p>• <strong>Cadastrar:</strong> Quer adicionar sua empresa? Entre em contato com a administração</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresasNovo;
