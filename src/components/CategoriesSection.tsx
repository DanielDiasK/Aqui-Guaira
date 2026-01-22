import { Building2, HelpCircle, Loader2, Star, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { buscarEmpresas } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import categoriasData from '@/data/categorias-empresas.json';

interface Empresa {
  id: string;
  nome: string;
  logo: string | null;
  destaque: boolean;
  visualizacoes: number;
  categoria_id?: string;
  categoria_info?: {
    nome: string;
    icone: string;
    cor: string;
  }
}

const CategoriesSection = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const data = await buscarEmpresas({ destaque: true });

        // Map and hydrate category info locally since API might not return it joined
        const mapped = (data || []).slice(0, 4).map((e: any) => {
          const catInfo = categoriasData.categorias.find(c => c.id === e.categoria_id);
          return {
            id: e.id,
            nome: e.nome,
            logo: e.logo || null,
            destaque: e.destaque || false,
            visualizacoes: e.visualizacoes || 0,
            categoria_id: e.categoria_id,
            categoria_info: catInfo ? {
              nome: catInfo.nome,
              icone: catInfo.icone,
              cor: catInfo.cor
            } : undefined
          };
        });

        setEmpresas(mapped);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresas();
  }, []);

  const handleClickEmpresa = (empresaId: string) => {
    navigate(`/perfil-de-empresa?id=${empresaId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Empresas em Destaque
        </CardTitle>
        <CardDescription>
          As empresas mais populares de Guaíra
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : empresas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold text-foreground mb-2">
              Nenhuma empresa cadastrada ainda
            </h4>
            <p className="text-sm text-muted-foreground max-w-md">
              Empresas aprovadas aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {empresas.map((empresa) => (
              <div
                key={empresa.id}
                className="group relative rounded-xl border-2 border-border bg-card cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all overflow-hidden"
                onClick={() => handleClickEmpresa(empresa.id)}
              >
                {/* Logo da Empresa */}
                <div className="relative h-28 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center overflow-hidden">
                  {empresa.logo ? (
                    <img
                      src={empresa.logo}
                      alt={empresa.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground/40" />
                  )}

                  {/* Badge de Destaque */}
                  {empresa.destaque && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Star className="h-3 w-3 fill-white" />
                      Destaque
                    </div>
                  )}
                </div>

                {/* Informações da Empresa */}
                <div className="p-3">
                  <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors mb-2">
                    {empresa.nome}
                  </h4>

                  {/* Categoria */}
                  <div className="flex items-center justify-between">
                    {empresa.categoria_info && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${empresa.categoria_info.cor}20`,
                          color: empresa.categoria_info.cor,
                          borderColor: empresa.categoria_info.cor,
                          borderWidth: '1px'
                        }}
                      >
                        {empresa.categoria_info.nome}
                      </Badge>
                    )}

                    {/* Visualizações */}
                    {empresa.visualizacoes > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{empresa.visualizacoes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gradiente de hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesSection;
