import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Phone, Mail, Globe, Clipboard, Check, Loader2, ArrowLeft, Home, Heart, Instagram, Facebook, Briefcase } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { LoginDialog } from "@/components/LoginDialog";
import {
    buscarEmpresas,
    adicionarFavoritoUsuario,
    removerFavoritoUsuario,
    buscarFavoritosUsuario,
    incrementarVisualizacoesEmpresa,
    buscarVagas,
    buscarEmpresaPorSlug,
    buscarEmpresaPorId,
    getUsuarioLogado,
    type EmpresaCompleta,
    type Vaga
} from "@/lib/supabase";

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const PerfilEmpresa = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [showLogin, setShowLogin] = useState(false);
    const [copiado, setCopiado] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [vagas, setVagas] = useState<Vaga[]>([]);

    const empresaId = searchParams.get('id');

    useEffect(() => {
        if (!empresaId && !slug) {
            navigate('/empresas');
            return;
        }

        const carregarDados = async () => {
            setLoading(true);
            try {
                let found: EmpresaCompleta | null = null;

                if (slug) {
                    found = await buscarEmpresaPorSlug(slug);
                } else if (empresaId) {
                    found = await buscarEmpresaPorId(empresaId);
                }

                if (found) {
                    setEmpresa(found);
                    incrementarVisualizacoesEmpresa(found.id);

                    const [favoritosData, vagasData] = await Promise.all([
                        buscarFavoritosUsuario('empresa'),
                        buscarVagas(found.id)
                    ]);

                    setFavoritos(new Set(favoritosData.map((f: any) => f.item_id)));
                    setVagas(vagasData.filter((v: Vaga) => v.status === 'aberta'));
                } else {
                    toast.error("Empresa não encontrada");
                    navigate('/empresas');
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                toast.error("Erro ao carregar perfil da empresa");
            } finally {
                setLoading(false);
            }
        };

        carregarDados();

        // Tentar pegar localização silenciosamente para cálculo de distância se disponível
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => { }
            );
        }
    }, [empresaId, navigate]);

    const copiar = (texto?: string) => {
        if (!texto) return;
        navigator.clipboard.writeText(texto).then(() => {
            setCopiado(texto);
            toast("Copiado!", { description: texto, duration: 1200 });
            setTimeout(() => setCopiado(null), 1200);
        }).catch(() => {
            toast.error("Falha ao copiar");
        });
    };

    const toggleFavorito = async (id: string) => {
        const user = getUsuarioLogado();
        if (!user) {
            setShowLogin(true);
            return;
        }

        const jaFavoritado = favoritos.has(id);
        try {
            if (jaFavoritado) {
                await removerFavoritoUsuario('empresa', id);
                setFavoritos(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                toast("Removido dos favoritos");
            } else {
                await adicionarFavoritoUsuario('empresa', id);
                setFavoritos(prev => {
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                });
                toast("Adicionado aos favoritos!");
            }
        } catch (error) {
            toast.error("Erro ao atualizar favorito");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!empresa) return null;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Botões de Ação Superiores */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate(-1)}
                                className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl px-6 font-bold shadow-lg transition-all hover:scale-105"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="gap-2 border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl px-6 font-bold shadow-sm transition-all hover:scale-105"
                            >
                                <Home className="w-4 h-4" />
                                Início
                            </Button>
                        </div>

                        <Button
                            variant={favoritos.has(empresa.id) ? "default" : "outline"}
                            onClick={() => toggleFavorito(empresa.id)}
                            className={"gap-2 rounded-xl px-6 font-bold shadow-sm transition-all hover:scale-105 " + (favoritos.has(empresa.id) ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : "border-2 border-red-500 text-red-500 hover:bg-red-50")}
                        >
                            <Heart className={"h-4 w-4 " + (favoritos.has(empresa.id) ? "fill-white" : "")} />
                            {favoritos.has(empresa.id) ? "Favoritado" : "Favoritar"}
                        </Button>
                    </div>

                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
                        {/* Banner/Hero Section */}
                        <div className="h-72 md:h-96 w-full overflow-hidden relative group">
                            {empresa.imagens && empresa.imagens.length > 0 ? (
                                <img
                                    src={empresa.imagens[0]}
                                    alt={empresa.nome}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                    <Building2 className="h-24 w-24 text-primary/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>


                        </div>

                        <div className="px-6 md:px-12 py-8 space-y-12 relative">
                            {/* Header com Logo e Nome */}
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-24 md:-mt-32 relative z-10">
                                {/* Logo */}
                                <div className="flex-shrink-0 w-40 h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-background shadow-2xl bg-background group transition-transform hover:scale-105 duration-300">
                                    {empresa.logo ? (
                                        <img
                                            src={empresa.logo}
                                            alt={`Logo ${empresa.nome}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                            <Building2 className="h-16 w-16 text-primary" />
                                        </div>
                                    )}
                                </div>

                                {/* Nome e Info Principal */}
                                <div className="text-center md:text-left flex-1 space-y-2 mb-4">
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                                        {empresa.nome}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {empresa.bairro}
                                        </div>
                                        {userLocation && (
                                            <Badge variant="outline" className="border-primary/30 text-primary font-bold px-3">
                                                A {haversineKm(userLocation.lat, userLocation.lng, empresa.latitude, empresa.longitude).toFixed(1)} km de você
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Grid de Conteúdo - Flow Vertical para maior largura individual */}
                            <div className="space-y-12">
                                {/* Seção Sobre */}
                                <section className="max-w-4xl space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight">Sobre a Empresa</h2>
                                    </div>
                                    <p className="text-xl leading-relaxed text-muted-foreground font-medium">
                                        {empresa.descricao}
                                    </p>

                                    {empresa.subcategorias && empresa.subcategorias.length > 0 && (
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {empresa.subcategorias.map((sub, idx) => (
                                                <Badge key={idx} variant="secondary" className="px-5 py-2 rounded-2xl text-sm font-bold bg-muted/50 border border-border/50">
                                                    {sub}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Canais de Contato e Localização - Lado a Lado (Full Width) */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Card de Contato */}
                                    <Card className="border-2 border-border/50 bg-white dark:bg-black/20 rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-8 space-y-6 md:space-y-8 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Phone className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight text-foreground">Canais de Contato</h2>
                                        </div>

                                        <div className="grid gap-4">
                                            {empresa.whatsapp && (
                                                <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-[2rem] bg-green-500/10 border-2 border-green-500/20 hover:bg-green-500/20 transition-all shadow-sm gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-green-500 rounded-2xl">
                                                            <Phone className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs uppercase font-black text-green-500/80 tracking-widest leading-none mb-1">WhatsApp</span>
                                                            <span className="font-black text-green-500 text-xl">{empresa.whatsapp}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="lg"
                                                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg px-8 py-6"
                                                        asChild
                                                    >
                                                        <a href={`https://wa.me/${empresa.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">Conversar</a>
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {empresa.telefone && (
                                                    <div className="group flex items-center justify-between p-5 rounded-[2rem] bg-blue-500/10 border-2 border-blue-500/20 hover:bg-blue-500/20 transition-all shadow-sm">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="p-2 bg-blue-500 rounded-xl flex-shrink-0">
                                                                <Phone className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden text-ellipsis">
                                                                <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest leading-none mb-1">Telefone</span>
                                                                <span className="font-bold text-blue-300 text-base">{empresa.telefone}</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => copiar(empresa.telefone)} className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
                                                            {copiado === empresa.telefone ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                                                        </button>
                                                    </div>
                                                )}

                                                {empresa.email && (
                                                    <div className="group flex items-center justify-between p-5 rounded-[2rem] bg-purple-500/10 border-2 border-purple-500/20 hover:bg-purple-500/20 transition-all shadow-sm">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="p-2 bg-purple-500 rounded-xl flex-shrink-0">
                                                                <Mail className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest leading-none mb-1">E-mail</span>
                                                                <span className="font-bold text-purple-300 text-sm truncate max-w-[100px]">{empresa.email}</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => copiar(empresa.email)} className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0">
                                                            {copiado === empresa.email ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {empresa.site && (
                                                <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-[2rem] bg-primary/10 border-2 border-primary/20 hover:bg-primary/20 transition-all shadow-sm gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                                                            <Globe className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs uppercase font-black text-primary tracking-widest leading-none mb-1">Website Oficial</span>
                                                            <span className="font-black text-primary text-lg truncate max-w-[200px]">{empresa.site}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="lg"
                                                        className="w-full sm:w-auto bg-primary/20 hover:bg-primary text-white border-none rounded-2xl font-bold px-8 py-6"
                                                        asChild
                                                    >
                                                        <a href={empresa.site.startsWith('http') ? empresa.site : `https://${empresa.site}`} target="_blank" rel="noopener noreferrer">Acessar</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Redes Sociais */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {empresa.instagram && (
                                                <a
                                                    href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-[2rem] bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-black shadow-xl hover:shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-95 group"
                                                >
                                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
                                                        <Instagram className="w-6 h-6" />
                                                    </div>
                                                    <span>Instagram</span>
                                                </a>
                                            )}
                                            {empresa.facebook && (
                                                <a
                                                    href={empresa.facebook.startsWith('http') ? empresa.facebook : `https://facebook.com/${empresa.facebook.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-[2rem] bg-[#1877F2] text-white font-black shadow-xl hover:shadow-blue-500/20 transition-all hover:scale-[1.03] active:scale-95 group"
                                                >
                                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
                                                        <Facebook className="w-6 h-6" />
                                                    </div>
                                                    <span>Facebook</span>
                                                </a>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Card de Localização */}
                                    <Card className="border-2 border-border/50 bg-white dark:bg-black/20 rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-8 space-y-6 md:space-y-8 overflow-hidden shadow-sm flex flex-col">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-black tracking-tight text-foreground">Onde Estamos</h2>
                                        </div>

                                        <div className="flex-1 space-y-6">
                                            <div className="text-lg font-medium bg-black/5 dark:bg-black/40 p-6 rounded-[2rem] border-2 border-border/30 shadow-inner">
                                                <p className="font-black text-foreground dark:text-white text-xl mb-1">{empresa.endereco}</p>
                                                <p className="text-muted-foreground dark:text-white/70">{empresa.bairro}</p>
                                                <p className="text-sm font-bold text-primary uppercase tracking-widest">{empresa.cidade} - {empresa.estado}</p>
                                            </div>

                                            {empresa.latitude && empresa.longitude && (
                                                <div className="w-full h-72 rounded-[2.5rem] overflow-hidden border-2 border-border/50 relative shadow-lg group">
                                                    <iframe
                                                        src={`https://www.google.com/maps?q=${empresa.latitude},${empresa.longitude}&hl=pt-BR&z=17&output=embed`}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        allowFullScreen
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        className="grayscale-[0.4] contrast-[1.2] transition-all duration-500 group-hover:grayscale-0 dark:invert-[0.85] dark:hue-rotate-[180deg] dark:group-hover:invert-0 dark:group-hover:hue-rotate-0"
                                                    ></iframe>
                                                </div>
                                            )}

                                            {empresa.link_google_maps && (
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-[2rem] font-black py-8 text-lg shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                                                    asChild
                                                >
                                                    <a href={empresa.link_google_maps} target="_blank" rel="noopener noreferrer">
                                                        <MapPin className="w-6 h-6 mr-3" />
                                                        Traçar Rota no Google Maps
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                {/* Vagas de Emprego */}
                                {vagas.length > 0 && (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Oportunidades de Emprego</h2>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {vagas.map(vaga => (
                                                <Card key={vaga.id} className="rounded-[2.5rem] border-2 border-border/50 p-8 hover:border-primary/30 transition-all hover:scale-[1.02]">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <Badge className="bg-primary/20 text-primary border-none mb-2">{vaga.tipo}</Badge>
                                                            <h3 className="text-2xl font-black">{vaga.titulo}</h3>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Vagas</p>
                                                            <p className="text-2xl font-black text-primary">{vaga.quantidade}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground font-medium mb-6 line-clamp-3">{vaga.descricao}</p>
                                                    {vaga.salario && (
                                                        <div className="p-4 bg-primary/5 rounded-2xl mb-6">
                                                            <p className="text-xs font-bold uppercase text-primary/60 tracking-widest mb-1">Remuneração</p>
                                                            <p className="text-xl font-black text-primary">{vaga.salario}</p>
                                                        </div>
                                                    )}
                                                    <Button className="w-full rounded-2xl bg-primary hover:bg-primary/90 font-bold py-6 text-base" asChild>
                                                        <a href={`https://wa.me/${empresa.whatsapp?.replace(/[^\d]/g, '')}?text=Olá! Vi a vaga de ${vaga.titulo} no Aqui Guaíra e gostaria de me candidatar.`} target="_blank" rel="noopener noreferrer">
                                                            Candidatar-se via WhatsApp
                                                        </a>
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Galeria de Fotos - Horizontal Grid */}
                                {empresa.imagens && empresa.imagens.length > 1 && (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">Galeria de Fotos</h2>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {empresa.imagens.slice(1).map((img, idx) => (
                                                <div key={idx} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-border/50 group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                                    <img
                                                        src={img}
                                                        alt={`${empresa.nome} - Foto ${idx + 2}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />

            <LoginDialog
                open={showLogin}
                onOpenChange={setShowLogin}
            />
        </div>
    );
};

export default PerfilEmpresa;
