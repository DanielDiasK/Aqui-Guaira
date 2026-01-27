import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
                                <Card key={vaga.id} className="p-6 rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 group cursor-pointer hover:ring-2 hover:ring-sky-500/20">
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
                                                <Button className="rounded-xl font-bold bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:bg-sky-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-zinc-900 transition-all hidden md:flex">
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

                                            <Button className="w-full rounded-xl font-bold md:hidden mt-2 h-12 text-base bg-sky-600 hover:bg-sky-700 text-white">
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
        </div>
    );
}
