import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Phone, Mail, Globe, Clipboard, Check, Loader2, ArrowLeft, Home, Heart, Instagram, Facebook } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { LoginDialog } from "@/components/LoginDialog";
import {
    buscarEmpresas,
    adicionarFavoritoUsuario,
    removerFavoritoUsuario,
    buscarFavoritosUsuario,
    incrementarVisualizacoesEmpresa,
    getUsuarioLogado,
    type EmpresaCompleta
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
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [showLogin, setShowLogin] = useState(false);
    const [copiado, setCopiado] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const empresaId = searchParams.get('id');

    useEffect(() => {
        if (!empresaId) {
            navigate('/empresas');
            return;
        }

        const carregarDados = async () => {
            setLoading(true);
            try {
                const empresas = await buscarEmpresas();
                const found = empresas.find(e => e.id === empresaId);

                if (found) {
                    setEmpresa(found as EmpresaCompleta);
                    incrementarVisualizacoesEmpresa(empresaId);

                    const favoritosData = await buscarFavoritosUsuario('empresa');
                    setFavoritos(new Set(favoritosData.map(f => f.item_id)));
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
                <div className="max-w-5xl mx-auto space-y-6">
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

                            {/* Overlay Glass Stats */}
                            <div className="absolute bottom-6 right-6 flex gap-4">
                                <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                                        {empresa.categoria_nome}
                                    </Badge>
                                </div>
                            </div>
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

                            {/* Grid de Conteúdo */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Coluna Principal (Descrição e Galeria) */}
                                <div className="lg:col-span-2 space-y-8">
                                    <section className="space-y-4">
                                        <h2 className="text-2xl font-black flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl">
                                                <Building2 className="w-5 h-5 text-primary" />
                                            </div>
                                            Sobre a Empresa
                                        </h2>
                                        <p className="text-lg leading-relaxed text-muted-foreground font-medium">
                                            {empresa.descricao}
                                        </p>

                                        {empresa.subcategorias && empresa.subcategorias.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-4">
                                                {empresa.subcategorias.map((sub, idx) => (
                                                    <Badge key={idx} variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-bold bg-muted/50 border border-border/50">
                                                        {sub}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Galeria de Fotos (se houver mais de uma) */}
                                    {empresa.imagens && empresa.imagens.length > 1 && (
                                        <section className="space-y-4">
                                            <h2 className="text-2xl font-black flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-xl">
                                                    <Check className="w-5 h-5 text-primary" />
                                                </div>
                                                Galeria de Fotos
                                            </h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {empresa.imagens.slice(1).map((img, idx) => (
                                                    <div key={idx} className="aspect-square rounded-3xl overflow-hidden border-2 border-border/50 group cursor-pointer">
                                                        <img
                                                            src={img}
                                                            alt={`${empresa.nome} - Foto ${idx + 2}`}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* Coluna Lateral (Contato e Localização) */}
                                <div className="space-y-6">
                                    {/* Card de Contato */}
                                    <Card className="border-2 border-border/50 bg-muted/20 rounded-[2.5rem] p-6 space-y-6">
                                        <h2 className="text-xl font-black flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-primary" />
                                            Canais de Contato
                                        </h2>

                                        <div className="space-y-3">
                                            {empresa.whatsapp && (
                                                <div className="group flex items-center justify-between p-4 rounded-3xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-500 rounded-xl">
                                                            <Phone className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-black text-green-600 tracking-wider">WhatsApp</span>
                                                            <span className="font-bold text-green-700">{empresa.whatsapp}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md"
                                                        asChild
                                                    >
                                                        <a href={`https://wa.me/${empresa.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                                                    </Button>
                                                </div>
                                            )}

                                            {empresa.telefone && (
                                                <div className="group flex items-center justify-between p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500 rounded-xl">
                                                            <Phone className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">Telefone</span>
                                                            <span className="font-bold text-blue-700">{empresa.telefone}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => copiar(empresa.telefone)} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
                                                        {copiado === empresa.telefone ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                                                    </button>
                                                </div>
                                            )}

                                            {empresa.email && (
                                                <div className="group flex items-center justify-between p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-500 rounded-xl">
                                                            <Mail className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">E-mail</span>
                                                            <span className="font-bold text-purple-700 truncate max-w-[120px]">{empresa.email}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => copiar(empresa.email)} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
                                                        {copiado === empresa.email ? <Check className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5 text-muted-foreground" />}
                                                    </button>
                                                </div>
                                            )}

                                            {empresa.site && (
                                                <div className="group flex items-center justify-between p-4 rounded-3xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary rounded-xl">
                                                            <Globe className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-black text-primary tracking-wider">Website</span>
                                                            <span className="font-bold font-primary truncate max-w-[120px]">{empresa.site}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-white/50 hover:bg-white text-primary rounded-xl font-bold border border-primary/20"
                                                        asChild
                                                    >
                                                        <a href={empresa.site.startsWith('http') ? empresa.site : `https://${empresa.site}`} target="_blank" rel="noopener noreferrer">Visitar</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Redes Sociais */}
                                        <div className="flex gap-3 pt-2">
                                            {empresa.instagram && (
                                                <a
                                                    href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    <Instagram className="w-5 h-5" />
                                                    Instagram
                                                </a>
                                            )}
                                            {empresa.facebook && (
                                                <a
                                                    href={empresa.facebook.startsWith('http') ? empresa.facebook : `https://facebook.com/${empresa.facebook.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    <Facebook className="w-5 h-5" />
                                                    Facebook
                                                </a>
                                            )}
                                        </div>
                                    </Card>

                                    {/* Card de Localização */}
                                    <Card className="border-2 border-border/50 bg-muted/20 rounded-[2.5rem] p-6 space-y-6 overflow-hidden">
                                        <h2 className="text-xl font-black flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Localização
                                        </h2>

                                        <div className="space-y-4">
                                            <div className="text-sm font-medium text-muted-foreground bg-white/50 p-4 rounded-2xl border border-border/50">
                                                <p className="font-black text-foreground mb-1">{empresa.endereco}</p>
                                                <p>{empresa.bairro}</p>
                                                <p>{empresa.cidade} - {empresa.estado}</p>
                                            </div>

                                            {empresa.latitude && empresa.longitude && (
                                                <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-border/50 relative">
                                                    <iframe
                                                        src={`https://www.google.com/maps?q=${empresa.latitude},${empresa.longitude}&hl=pt-BR&z=17&output=embed`}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        allowFullScreen
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                    ></iframe>
                                                </div>
                                            )}

                                            {empresa.link_google_maps && (
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold py-6 shadow-xl"
                                                    asChild
                                                >
                                                    <a href={empresa.link_google_maps} target="_blank" rel="noopener noreferrer">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        Traçar Rota no Maps
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </div>
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
