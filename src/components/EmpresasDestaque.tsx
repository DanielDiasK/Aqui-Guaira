import { useState, useEffect } from "react";
import { supabase, type EmpresaCompleta } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmpresasDestaque = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<EmpresaCompleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEmpresasDestaque();
  }, []);

  const carregarEmpresasDestaque = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas_completas")
        .select("*")
        .eq("destaque", true)
        .order("visualizacoes", { ascending: false })
        .limit(6);

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error("Erro ao carregar empresas em destaque:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (empresas.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              Empresas em Destaque
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Encontre Empresas Locais
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Empresas selecionadas que oferecem serviços de qualidade em Guaíra
          </p>
        </div>

        {/* Grid de Empresas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {empresas.map((empresa) => (
            <Card
              key={empresa.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden border-2 hover:border-primary/50"
              onClick={() => navigate(`/empresas?id=${empresa.id}`)}
            >
              {/* Badge de Destaque */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Destaque
                </Badge>
              </div>

              {/* Banner/Logo */}
              <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {empresa.imagens && empresa.imagens.length > 0 ? (
                  <img
                    src={empresa.imagens[0]}
                    alt={empresa.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                {/* Logo sobreposto */}
                {empresa.logo && (
                  <div className="absolute bottom-2 left-4 w-16 h-16 rounded-lg bg-background border-2 border-border shadow-lg overflow-hidden">
                    <img
                      src={empresa.logo}
                      alt={empresa.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <CardContent className="pt-6 pb-4">
                {/* Nome e Categoria */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {empresa.nome}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {empresa.categoria_nome && (
                      <Badge variant="secondary" className="text-xs">
                        {empresa.categoria_icone} {empresa.categoria_nome}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {empresa.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {empresa.descricao}
                  </p>
                )}

                {/* Subcategorias */}
                {empresa.subcategorias && empresa.subcategorias.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {empresa.subcategorias.slice(0, 2).map((sub, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0">
                        {sub}
                      </Badge>
                    ))}
                    {empresa.subcategorias.length > 2 && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        +{empresa.subcategorias.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Informações de Contato */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{empresa.bairro}</span>
                  </div>
                  {empresa.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{empresa.telefone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Ver Todas */}
        <div className="text-center">
          <Button
            onClick={() => navigate("/empresas")}
            size="lg"
            className="gap-2 group"
          >
            Ver Todas as Empresas
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmpresasDestaque;
