import { Building2, Users, CheckCircle, MapPin, MessageCircle, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ActionCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Business Registration Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-primary/10 overflow-hidden relative">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-primary text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            Cadastre sua empresa
          </CardTitle>
          <CardDescription>
            Divulgue seu negócio gratuitamente no portal da cidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Divulgação gratuita</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Localização no mapa</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Contato direto via WhatsApp</span>
            </li>
            <li className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Galeria de fotos</span>
            </li>
          </ul>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => navigate('/sua-empresa')}>
              Cadastrar Empresa
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Wall Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-primary/10 overflow-hidden relative">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-primary text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            Participe do mural
          </CardTitle>
          <CardDescription>
            Compartilhe novidades e conecte-se com a comunidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Publique fotos e vídeos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Compartilhe eventos locais</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Conecte-se com vizinhos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Moderação segura</span>
            </li>
          </ul>

          <Button className="w-full bg-primary" onClick={() => navigate('/mural')}>
            Ver Mural
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionCards;
