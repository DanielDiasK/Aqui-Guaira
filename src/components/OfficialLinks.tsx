import { ExternalLink, Globe, Building2, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const OfficialLinks = () => {
  const links = [
    {
      label: "IBGE Cidades",
      icon: Globe,
      url: "https://www.ibge.gov.br/cidades-e-estados/sp/guaira.html",
    },
    {
      label: "Portal da Prefeitura",
      icon: Building2,
      url: "https://www.guaira.sp.gov.br/",
    },
    {
      label: "Câmara Municipal",
      icon: Landmark,
      url: "https://www.camaraguaira.com.br/",
    },
  ];

  return (
    <Card className="glass-card overflow-hidden border-2 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-6">
        <CardTitle className="text-2xl font-bold gradient-text">
          Links Oficiais
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between h-auto p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {link.label}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficialLinks;
