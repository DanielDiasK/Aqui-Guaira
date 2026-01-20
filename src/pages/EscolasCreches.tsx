import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Home,
  Phone,
  MapPin,
  GraduationCap,
  Baby,
  School,
  Building2,
  BookOpen,
  Users,
  Sparkles,
  Mail,
  Search,
  Zap,
  Star
} from 'lucide-react';
import escolasData from '@/data/escolas-creches.json';

interface Endereco {
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
}

interface Contatos {
  telefone: string[];
  whatsapp: string[];
}

interface Unidade {
  nome: string;
  tipo: string;
  endereco: Endereco;
  contatos: Contatos;
}

const EscolasCreches = () => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busca, setBusca] = useState("");

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'creche': return Baby;
      case 'cemei': return School;
      case 'escola': return GraduationCap;
      case 'escola_tecnica': return Building2;
      case 'instituicao': return Building2;
      default: return School;
    }
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'creche': return 'bg-pink-500';
      case 'cemei': return 'bg-purple-500';
      case 'escola': return 'bg-blue-500';
      case 'escola_tecnica': return 'bg-green-500';
      case 'instituicao': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatarTipo = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'creche': 'Creche',
      'cemei': 'CEMEI',
      'escola': 'Escola',
      'escola_tecnica': 'Ensino Técnico',
      'instituicao': 'Instituição'
    };
    return tipos[tipo] || tipo;
  };

  const formatarCategoria = (categoria: string) => {
    const categorias: { [key: string]: string } = {
      'municipal': 'Municipal',
      'estadual': 'Estadual',
      'estadual_tecnica': 'Estadual Técnica',
      'particular': 'Particular'
    };
    return categorias[categoria] || categoria;
  };

  const todasUnidades: { unidade: Unidade; categoria: string }[] = [];
  // escolasData.unidades_ativas.governamental.municipal.forEach(unidade => todasUnidades.push({ unidade, categoria: 'municipal' }));
  // escolasData.unidades_ativas.governamental.estadual.forEach(unidade => todasUnidades.push({ unidade, categoria: 'estadual' }));
  // escolasData.unidades_ativas.governamental.estadual_tecnica.forEach(unidade => todasUnidades.push({ unidade, categoria: 'estadual_tecnica' }));
  // escolasData.unidades_ativas.particular.forEach(unidade => todasUnidades.push({ unidade, categoria: 'particular' }));

  const unidadesFiltradas = todasUnidades.filter(({ unidade, categoria }) => {
    const passaTipo = filtroTipo === 'todas' || unidade.tipo === filtroTipo;
    const passaCategoria = filtroCategoria === 'todas' || categoria === filtroCategoria;
    const passaBusca = busca === "" || unidade.nome.toLowerCase().includes(busca.toLowerCase()) || unidade.endereco.bairro.toLowerCase().includes(busca.toLowerCase());
    return passaTipo && passaCategoria && passaBusca;
  });

  const totalUnidades = todasUnidades.length;
  const totalMunicipal = escolasData.unidades_ativas.governamental.municipal.length;
  const totalEstadual = escolasData.unidades_ativas.governamental.estadual.length + escolasData.unidades_ativas.governamental.estadual_tecnica.length;
  const totalParticular = escolasData.unidades_ativas.particular.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(-1)}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                >
                  <Home className="w-4 h-4" />
                  Início
                </Button>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                  Educação em <span className="gradient-text">Guaíra-SP</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                  Encontre creches, escolas e instituições de ensino técnico. Guia completo da rede pública e particular do município.
                </p>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { label: "Unidades", value: totalUnidades, color: "bg-blue-100", textColor: "text-blue-600", icon: School },
                  { label: "Municipais", value: totalMunicipal, color: "bg-green-100", textColor: "text-green-600", icon: Baby },
                  { label: "Estaduais", value: totalEstadual, color: "bg-purple-100", textColor: "text-purple-600", icon: BookOpen },
                  { label: "Particulares", value: totalParticular, color: "bg-orange-100", textColor: "text-orange-600", icon: Users }
                ].map((stat, i) => (
                  <div key={i} className="bg-card p-4 rounded-[2rem] border border-border/50 shadow-sm transition-all hover:shadow-md hover:scale-105">
                    <div className={`w-10 h-10 ${stat.color} ${stat.textColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filtros Section */}
        <section className="container mx-auto px-4 py-12">
          <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] p-8 -mt-10 mb-16 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="font-black text-xs text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" /> Buscar Unidade
                </Label>
                <Input
                  placeholder="Nome da escola ou bairro..."
                  className="py-6 rounded-2xl border-border/50 focus:border-primary transition-all font-medium bg-muted/10 text-foreground placeholder:text-muted-foreground"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="font-black text-xs text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Tipo de Ensino
                </Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="py-6 rounded-2xl border-border/50 font-medium bg-muted/10">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="todas">Todas as Unidades</SelectItem>
                    <SelectItem value="creche">Creches</SelectItem>
                    <SelectItem value="cemei">CEMEI</SelectItem>
                    <SelectItem value="escola">Escolas de Ensino Regular</SelectItem>
                    <SelectItem value="escola_tecnica">Ensino Técnico / ETEC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-xs text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Rede de Ensino
                </Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="py-6 rounded-2xl border-border/50 font-medium bg-muted/10">
                    <SelectValue placeholder="Todas as redes" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="todas">Todas as Redes</SelectItem>
                    <SelectItem value="municipal">Rede Municipal</SelectItem>
                    <SelectItem value="estadual">Rede Estadual</SelectItem>
                    <SelectItem value="particular">Rede Particular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Grid de Resultados */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-6">
              <h2 className="text-2xl font-black text-foreground">Unidades <span className="text-primary">Encontradas</span></h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                {unidadesFiltradas.length} resultados
              </Badge>
            </div>

            {unidadesFiltradas.length === 0 ? (
              <div className="py-24 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
                <GraduationCap className="w-20 h-20 text-muted-foreground/30" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">Nenhuma unidade encontrada</h3>
                  <p className="text-muted-foreground font-medium">Tente ajustar seus filtros para encontrar a escola desejada.</p>
                </div>
                <Button variant="link" onClick={() => { setBusca(""); setFiltroTipo("todas"); setFiltroCategoria("todas"); }} className="text-primary font-bold">Limpar Filtros</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {unidadesFiltradas.map(({ unidade, categoria }, idx) => {
                  const Icone = getIconeTipo(unidade.tipo);
                  const cor = getCorTipo(unidade.tipo);

                  return (
                    <Card key={idx} className="group bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden p-0 flex flex-col">
                      <div className={`h-3 ${cor} w-full`} />
                      <CardHeader className="p-8 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className={`p-3 rounded-2xl ${cor} bg-opacity-10`}>
                            <Icone className={`w-6 h-6 ${cor.replace('bg-', 'text-')}`} />
                          </div>
                          <Badge variant="outline" className="font-bold border-border/30 text-muted-foreground uppercase text-[10px] tracking-widest px-3 py-1">
                            {formatarCategoria(categoria)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[10px] font-black ${cor.replace('bg-', 'text-')} uppercase tracking-widest`}>
                            {formatarTipo(unidade.tipo)}
                          </p>
                          <CardTitle className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                            {unidade.nome}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="p-8 pt-0 flex-grow flex flex-col gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted/20 rounded-xl">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-sm">
                              <p className="font-bold text-foreground">{unidade.endereco.logradouro}, {unidade.endereco.numero}</p>
                              <p className="text-xs text-muted-foreground font-medium">
                                {unidade.endereco.bairro}
                                {unidade.endereco.complemento && <span className="text-muted-foreground/60"> • {unidade.endereco.complemento}</span>}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            {unidade.contatos.telefone.map((tel, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                  <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <a href={`tel:${tel.replace(/\D/g, '')}`} className="text-sm font-bold text-foreground hover:text-green-500 transition-colors">
                                  {tel}
                                </a>
                              </div>
                            ))}
                            {unidade.contatos.whatsapp.map((whats, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                  <Mail className="w-4 h-4 text-green-600" />
                                </div>
                                <a href={`https://wa.me/55${whats.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-foreground hover:text-green-500 transition-colors">
                                  WhatsApp: {whats}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-border/50">
                          <Button
                            className="w-full rounded-2xl py-6 font-bold bg-card text-foreground border-2 border-border/50 hover:border-primary/50 hover:bg-muted/30 hover:text-primary transition-all uppercase text-[10px] tracking-widest shadow-none"
                            onClick={() => {
                              const query = encodeURIComponent(`${unidade.nome}, ${unidade.endereco.logradouro}, Guaíra - SP`);
                              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                            }}
                          >
                            <MapPin className="w-3.5 h-3.5 mr-2" /> Localização Completa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EscolasCreches;
