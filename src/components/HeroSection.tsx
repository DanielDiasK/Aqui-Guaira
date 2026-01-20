import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Building2, Map, Search, PawPrint,
  Pill, Stethoscope, AlertTriangle, GraduationCap,
  ChevronRight, ChevronLeft, Newspaper, Building,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentAd, setCurrentAd] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const anuncios = [
    {
      titulo: "Mural Comunitário",
      descricao: "Compartilhe notícias e fique por dentro dos eventos da cidade de Guaíra.",
      imagem: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop",
      cta: "Acessar Mural",
      path: "/mural"
    },
    {
      titulo: "Descubra Empresas Locais",
      descricao: "Encontre os melhores estabelecimentos e serviços da nossa região.",
      imagem: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
      cta: "Ver Empresas",
      path: "/empresas"
    },
    {
      titulo: "Cresça seu Negócio",
      descricao: "Divulgue sua empresa gratuitamente no portal oficial da nossa comunidade.",
      imagem: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop",
      cta: "Cadastrar Agora",
      path: "/sua-empresa"
    }
  ];

  const leftButtons = [
    { label: "Painel da Cidade", sub: "Acesse", icon: Building2, path: "/painel-cidade", color: "blue" },
    { label: "Serviços por Bairro", sub: "Veja", icon: Map, path: "/servicos-por-bairro", color: "purple" },
    { label: "Achados e Perdidos", sub: "Consulte", icon: Search, path: "/achados-perdidos", color: "orange" },
    { label: "Pets e Adoção", sub: "Ajude", icon: PawPrint, path: "/pets-perdidos", color: "pink" },
  ];

  const rightButtons = [
    { label: "Farmácia Plantão", sub: "Veja", icon: Pill, path: "/farmacia-plantao", color: "red" },
    { label: "Saúde na Prática", sub: "Acesse", icon: Stethoscope, path: "/saude-na-pratica", color: "green" },
    { label: "Ocorrências", sub: "Registre", icon: AlertTriangle, path: "#", color: "amber" },
    { label: "Escolas e Creches", sub: "Encontre", icon: GraduationCap, path: "/escolas-creches", color: "cyan" },
  ];

  /* Carrossel de Anúncios */
  useEffect(() => {
    const adTimer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % anuncios.length);
    }, 5000);
    return () => clearInterval(adTimer);
  }, [anuncios.length]);


  const QuickButton = ({ item, className = "" }: { item: any, className?: string }) => {
    const Icon = item.icon;
    const colorClasses: Record<string, string> = {
      blue: "text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300 hover:bg-blue-100",
      purple: "text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300 hover:bg-purple-100",
      orange: "text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300 hover:bg-orange-100",
      pink: "text-pink-600 bg-pink-50 border-pink-100 hover:border-pink-300 hover:bg-pink-100",
      red: "text-red-600 bg-red-50 border-red-100 hover:border-red-300 hover:bg-red-100",
      green: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100",
      cyan: "text-cyan-600 bg-cyan-50 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-100",
    };

    return (
      <button
        onClick={() => item.path !== "#" && navigate(item.path)}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] w-full xl:w-[220px] text-left group ${colorClasses[item.color]} ${className}`}
      >
        <div className="p-2 rounded-lg bg-background border border-border/50 shadow-sm transition-transform group-hover:rotate-3">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-70 leading-none mb-1">{item.sub}</div>
          <div className="text-sm font-bold leading-tight">{item.label}</div>
        </div>
      </button>
    );
  };

  return (
    <section className="relative bg-background pt-8 pb-8 lg:pt-12 lg:pb-12 overflow-hidden">
      {/* Elementos de fundo sutis */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      {/* Menu Mobile Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="xl:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`xl:hidden fixed inset-y-0 right-0 z-[45] w-[85%] max-w-sm bg-background shadow-2xl transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">Aqui Guaíra</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-6 pb-20">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Serviços e Utilidades</h3>
              <div className="grid gap-3">
                {[...leftButtons, ...rightButtons].map((item, idx) => (
                  <QuickButton key={idx} item={item} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Navegação</h3>
              <div className="grid gap-3">
                <button onClick={() => navigate('/mural')} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Newspaper className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Mural Comunitário</span>
                </button>
                <button onClick={() => navigate('/empresas')} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Building className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Guia de Empresas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="w-full">
          {/* Banner Central */}
          <div className="w-full relative group">
            <div className="relative aspect-[16/9] md:aspect-[21/9] xl:aspect-[21/7] overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-muted border border-border/50">
              {anuncios.map((anuncio, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentAd ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                >
                  <img
                    src={anuncio.imagem}
                    alt={anuncio.titulo}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Gradiente Profissional */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Conteúdo do Banner */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 xl:p-14 text-white">
                    <div className="max-w-2xl animate-slide-up">
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
                        {anuncio.titulo}
                      </h2>
                      <p className="text-base md:text-xl text-white/90 mb-8 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                        {anuncio.descricao}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          onClick={() => navigate(anuncio.path)}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 md:h-14 font-bold text-lg shadow-xl hover:shadow-primary/20 transition-all hover:scale-105"
                        >
                          {anuncio.cta}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Controles do Carrossel */}
              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex gap-2">
                <button
                  onClick={() => setCurrentAd((prev) => (prev - 1 + anuncios.length) % anuncios.length)}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentAd((prev) => (prev + 1) % anuncios.length)}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Dots Indicadores */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {anuncios.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAd(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentAd ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
