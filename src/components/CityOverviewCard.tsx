import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Info, Users, MapPin, PartyPopper, BookOpen } from "lucide-react";

const CityOverviewCard = () => {
  return (
    <Card id="sobre-guaira" className="glass-card overflow-hidden border-2 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold gradient-text">Sobre Guaíra – SP</CardTitle>
        </div>
        <CardDescription className="text-base">Conheça nossa cidade, sua história e características</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Ajuste de layout: agora 2 colunas em telas grandes para dar mais espaço à imagem */}
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="space-y-8">
            {/* Dados Populacionais */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-semibold">Dados Populacionais</h4>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Guaíra é um município do estado de São Paulo, com gentílico guairense e código IBGE <strong>3517406</strong>. No Censo 2022 o município registrou <strong>39.279 habitantes</strong> e densidade de <strong>31,21 hab/km²</strong>. A área territorial é de <strong>1.258,465 km²</strong> (IBGE). A estimativa 2024 indica cerca de <strong>40 mil habitantes</strong>.
              </p>
            </section>

            {/* Atrativos */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-semibold">Atrativos e Pontos Turísticos</h4>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Entre os atrativos locais destacam-se o <strong>Parque Ecológico / Lago Maracá</strong> — complexo de esporte e lazer com pistas de caminhada e ciclismo, quadras de areia, pesca, palco de torneios como o Guaíra Open, além de equipamentos culturais como Casa de Cultura e Museu Municipal.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Outros pontos citados pelo portal da Prefeitura incluem: Praça São Sebastião (Jardim Japonês), Balneário Municipal, Zoológico, Vilarejo Guaritá, Capela do Pindoba e a Escultura de Tomie Ohtake.
              </p>
            </section>

            {/* Eventos */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-semibold">Eventos e Festividades</h4>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A cidade realiza diversas festividades ao longo do ano, incluindo <strong>Carnaval</strong>, <strong>Festa do Peão</strong>, <strong>ECAL (Exposição Comercial, Agropecuária e Industrial de Guaíra)</strong> e festividades religiosas como a <strong>Festa de Santa Luzia</strong>.
              </p>
            </section>

            {/* Fontes */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-semibold">Fontes</h4>
              </div>
              <ul className="text-sm leading-relaxed text-muted-foreground list-disc pl-5 space-y-1">
                <li><strong>IBGE</strong> (censo / área): Cidades IBGE</li>
                <li><strong>Município de Guaíra</strong>: Portal oficial da Prefeitura</li>
                <li><strong>Página municipal de turismo</strong> e "A Cidade"</li>
              </ul>
            </section>
          </div>
          {/* Imagem ampliada: ocupa metade do card em telas grandes; sem bordas/efeitos */}
          <div className="flex items-stretch">
            <div className="w-full relative">
              <img
                src="/images/publi.png"
                alt="Imagem promocional de Guaíra"
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityOverviewCard;
