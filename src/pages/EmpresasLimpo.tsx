import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Search, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import categoriasData from '@/data/categorias-empresas.json';

const Empresas = () => {
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

  const categoriasFiltradas = categoriasData.categorias.filter(cat => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    const nomeMatch = cat.nome.toLowerCase().includes(buscaLower);
    const subMatch = cat.subcategorias.some(sub => sub.toLowerCase().includes(buscaLower));
    return nomeMatch || subMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
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

      <div className="w-full">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Acesso rápido por categoria:
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {categoriasFiltradas.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => toggleCategoria(categoria.id)}
                className={`bg-gradient-to-br ${categoria.cor} hover:opacity-90 text-white font-semibold p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center`}
              >
                <div className="text-3xl mb-2">{categoria.icone}</div>
                <div className="text-xs sm:text-sm leading-tight">{categoria.nome}</div>
                <Badge className="mt-2 bg-white/20 text-white border-0 text-xs">
                  {categoria.subcategorias.length}
                </Badge>
              </button>
            ))}
          </div>

          {Array.from(categoriasExpandidas).map((categoriaId) => {
            const categoria = categoriasFiltradas.find(cat => cat.id === categoriaId);
            if (!categoria) return null;
            
            return (
              <Card key={categoriaId} className="mt-6 shadow-2xl">
                <CardHeader className={`bg-gradient-to-br ${categoria.cor} text-white`}>
                  <CardTitle className="flex items-center justify-between text-xl sm:text-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{categoria.icone}</span>
                      <span>{categoria.nome}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoria(categoria.id);
                      }}
                      className="hover:bg-white/20 p-2 rounded-full transition-colors"
                    >
                      <ChevronUp className="h-6 w-6" />
                    </button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoria.subcategorias.map((sub, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 p-4 rounded-lg transition-all border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                          <span className="text-blue-500 text-base">✓</span>
                          <span>{sub}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {categoriasFiltradas.length === 0 && (
            <Card className="p-8 text-center mt-6">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                <p className="text-sm mt-2">Tente buscar com outras palavras-chave</p>
              </div>
            </Card>
          )}

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Como usar esta página
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Buscar:</strong> Digite palavras-chave na barra de busca para filtrar categorias</p>
              <p>• <strong>Clicar:</strong> Clique em qualquer botão de categoria para ver todas as subcategorias</p>
              <p>• <strong>Explorar:</strong> Navegue pelos 20 segmentos principais de negócios em Guaíra</p>
              <p>• <strong>Cadastrar:</strong> Quer adicionar sua empresa? Entre em contato com a administração</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empresas;
