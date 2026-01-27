import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    buscarVagas,
    buscarEmpresasPorIds,
    Vaga,
    EmpresaCompleta
} from "@/lib/supabase";
import {
    Briefcase,
    MapPin,
    Clock,
    DollarSign,
    Building2,
    Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Vagas() {
    const [vagas, setVagas] = useState<Vaga[]>([]);
    const [empresas, setEmpresas] = useState<Record<string, EmpresaCompleta>>({});
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");

    const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const vagasData = await buscarVagas() as Vaga[];
            setVagas(vagasData);

            // Extract unique company IDs
            const companyIds = Array.from(new Set(vagasData.map(v => v.empresa_id))) as string[];
            if (companyIds.length > 0) {
                const empresasData = await buscarEmpresasPorIds(companyIds);
                const empresasMap: Record<string, EmpresaCompleta> = {};
                empresasData.forEach(emp => {
                    empresasMap[emp.id] = emp;
                });
                setEmpresas(empresasMap);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar vagas");
        } finally {
            setLoading(false);
        }
    };

    const filteredVagas = vagas.filter(v => {
        const termo = filtro.toLowerCase();
        const tituloMatch = v.titulo.toLowerCase().includes(termo);
        const empresaMatch = empresas[v.empresa_id]?.nome.toLowerCase().includes(termo);
        return tituloMatch || empresaMatch;
    });

    const handleWhatsApp = (vaga: Vaga) => {
        const empresa = empresas[vaga.empresa_id];
        const num = empresa?.whatsapp?.replace(/\D/g, '') || empresa?.telefone?.replace(/\D/g, '');
        if (!num) {
            toast.error("Empresa sem número cadastrado");
            return;
        }
        const text = encodeURIComponent(`Olá, vi a vaga de *${vaga.titulo}* no Aqui Guaíra e gostaria de mais informações.`);
        window.open(`https://wa.me/55${num}?text=${text}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Vagas de Emprego</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Oportunidades profissionais em Guaíra</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Buscar por cargo ou empresa..."
                            className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm text-lg"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-slate-200 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : filteredVagas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nenhuma vaga encontrada</h3>
                        <p className="text-slate-500">Tente buscar por outro termo ou volte mais tarde.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredVagas.map(vaga => {
                            const empresa = empresas[vaga.empresa_id];
                            return (
                                <Card key={vaga.id} className="p-6 rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 group cursor-pointer hover:ring-2 hover:ring-sky-500/20"
                                    onClick={() => setSelectedVaga(vaga)}>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Header Mobile */}
                                        <div className="flex items-start justify-between md:hidden">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-zinc-800 shrink-0">
                                                    {empresa?.logo ? (
                                                        <img src={empresa.logo} alt={empresa.nome} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">{empresa?.nome || "Empresa Confidencial"}</h3>
                                                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {empresa?.bairro || "Guaíra - SP"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logo Desktop */}
                                        <div className="hidden md:flex w-24 h-24 rounded-3xl bg-slate-50 dark:bg-zinc-800 items-center justify-center overflow-hidden border border-slate-100 dark:border-zinc-800 shrink-0 group-hover:scale-105 transition-transform">
                                            {empresa?.logo ? (
                                                <img src={empresa.logo} alt={empresa.nome} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-10 h-10 text-slate-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 group-hover:text-sky-600 transition-colors">{vaga.titulo}</h2>
                                                    <div className="hidden md:flex items-center gap-2 mt-1">
                                                        <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                            <Building2 className="w-4 h-4" /> {empresa?.nome}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" /> {empresa?.bairro || "Guaíra"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedVaga(vaga); }}
                                                    className="rounded-xl font-bold bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:bg-sky-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-zinc-900 transition-all hidden md:flex"
                                                >
                                                    Ver Detalhes
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="rounded-lg px-3 py-1.5 font-bold text-slate-600 bg-slate-100 dark:bg-zinc-800 dark:text-slate-300">
                                                    {vaga.tipo}
                                                </Badge>
                                                {vaga.salario && (
                                                    <Badge variant="outline" className="rounded-lg px-3 py-1.5 font-bold border-slate-200 dark:border-zinc-700 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10">
                                                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                                                        {vaga.salario}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="rounded-lg px-3 py-1.5 font-bold border-slate-200 dark:border-zinc-700 text-slate-400">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {new Date(vaga.created_at).toLocaleDateString()}
                                                </Badge>
                                            </div>

                                            <p className="text-slate-600 dark:text-slate-400 line-clamp-3 md:line-clamp-2 text-sm md:text-base leading-relaxed">
                                                {vaga.descricao}
                                            </p>

                                            <Button
                                                onClick={(e) => { e.stopPropagation(); setSelectedVaga(vaga); }}
                                                className="w-full rounded-xl font-bold md:hidden mt-2 h-12 text-base bg-sky-600 hover:bg-sky-700 text-white"
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            <Dialog open={!!selectedVaga} onOpenChange={(open) => !open && setSelectedVaga(null)}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-[#121214]">
                    {selectedVaga && (
                        <>
                            <div className="bg-slate-50 dark:bg-zinc-900 p-8 border-b border-slate-100 dark:border-zinc-800">
                                <DialogHeader>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm shrink-0">
                                            {empresas[selectedVaga.empresa_id]?.logo ? (
                                                <img src={empresas[selectedVaga.empresa_id].logo} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-1 leading-tight">
                                                {selectedVaga.titulo}
                                            </DialogTitle>
                                            <p className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4" /> {empresas[selectedVaga.empresa_id]?.nome}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-lg h-7 px-3">
                                            {selectedVaga.tipo}
                                        </Badge>
                                        {selectedVaga.salario && (
                                            <Badge variant="outline" className="rounded-lg h-7 px-3 border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                                                {selectedVaga.salario}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="rounded-lg h-7 px-3 text-slate-500 border-slate-200 dark:border-zinc-700">
                                            {empresas[selectedVaga.empresa_id]?.bairro}
                                        </Badge>
                                    </div>
                                </DialogHeader>
                            </div>

                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Sobre a vaga</h4>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                                        {selectedVaga.descricao}
                                    </p>
                                </div>

                                {selectedVaga.requisitos && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Requisitos</h4>
                                        <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-6 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-zinc-800">
                                            {selectedVaga.requisitos}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
                                <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500" onClick={() => setSelectedVaga(null)}>
                                    Fechar
                                </Button>
                                <Button
                                    className="flex-[2] h-14 rounded-2xl font-black text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none gap-2"
                                    onClick={() => handleWhatsApp(selectedVaga)}
                                >
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    Conversar no WhatsApp
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
