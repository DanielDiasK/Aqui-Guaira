import { Users, Map, Gauge, Hash, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickStats = () => {
  const stats = [
    {
      label: "População",
      value: "39.279 hab",
      icon: Users,
    },
    {
      label: "Área",
      value: "1.258,465 km²",
      icon: Map,
    },
    {
      label: "Densidade",
      value: "31,21 hab/km²",
      icon: Gauge,
    },
    {
      label: "Código IBGE",
      value: "3517406",
      icon: Hash,
    },
    {
      label: "Gentílico",
      value: "Guairense",
      icon: Globe,
    },
  ];

  return (
    <Card className="glass-card overflow-hidden border-2 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-6">
        <CardTitle className="text-2xl font-bold gradient-text">
          Dados Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-gradient-to-r from-background to-accent/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <span className="text-base font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
