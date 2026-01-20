import { Clock, MapPin, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface Empresa {
  id: string;
  nome: string;
  bairro: string;
  visualizacoes: number;
  updated_at: string;
  categorias?: {
    nome: string;
  };
}

const RecentLocations = () => {
  const [locations, setLocations] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarLocaisRecentes = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select(`
            id,
            nome,
            bairro,
            visualizacoes,
            updated_at,
            categorias:categoria_id(nome)
          `)
          .eq('status', 'aprovado')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error('Erro ao carregar locais recentes:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarLocaisRecentes();
  }, []);

  const getTempoRelativo = (dataStr: string) => {
    const data = new Date(dataStr);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Agora há pouco';
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return data.toLocaleDateString('pt-BR');
  };

  const handleClickLocal = (empresaId: string) => {
    navigate(`/empresas?id=${empresaId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Locais Recentes
        </CardTitle>
        <CardDescription>
          Seus destinos visitados recentemente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Nenhum local recente encontrado
            </p>
          </div>
        ) : (
          locations.map((location) => (
          <div
              key={location.id}
              className="flex items-start justify-between p-4 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleClickLocal(location.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{location.nome}</h4>
                  {location.categorias?.nome && (
                <Badge className="bg-primary text-primary-foreground">
                      {location.categorias.nome}
                </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location.bairro}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTempoRelativo(location.updated_at)}
                </p>
              </div>
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLocations;
