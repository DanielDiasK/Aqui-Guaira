import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal,
    Image as ImageIcon, Smile, MapPin, Calendar,
    MessageCircle, Repeat2, Heart, Share, Trash2, ShieldCheck,
    TrendingUp, Sparkles, X, Plus, CheckCircle2, MoreVertical,
    Loader2, ArrowLeft, Send, MessageSquare, Quote, Pencil, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getUsuarioLogado, buscarPosts, criarPost, uploadImagem, buscarComentarios, criarComentario } from "@/lib/supabase";

interface Post {
    id: string;
    user_id?: string;
    autor_nome: string;
    autor_bairro: string;
    titulo: string;
    conteudo: string;
    imagens?: string[];
    created_at: string;
    curtidas?: number;
}

interface Comentario {
    id: string;
    post_id: string;
    user_id?: string;
    autor_nome: string;
    conteudo: string;
    curtidas?: number;
    created_at: string;
}

const XFeed = () => {
    const navigate = useNavigate();
    const user = getUsuarioLogado();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postContent, setPostContent] = useState("");
    const [postBairro, setPostBairro] = useState("Guaíra");
    const [isPosting, setIsPosting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Social states
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [comentarios, setComentarios] = useState<Record<string, Comentario[]>>({});
    const [userApoios, setUserApoios] = useState<Record<string, boolean>>({});
    const [novoComentario, setNovoComentario] = useState<Record<string, string>>({});
    const [comentarioApoios, setComentarioApoios] = useState<Record<string, boolean>>({});

    // Editing state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        carregarPosts();
    }, []);

    const carregarPosts = async () => {
        setLoading(true);
        try {
            const data = await buscarPosts({ limite: 50 });
            setPosts(data);
        } catch (err) {
            toast.error("Erro ao carregar o feed");
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!user) {
            toast.error("Faça login para postar");
            return;
        }
        if (!postContent.trim()) return;

        setIsPosting(true);
        try {
            const resp = await criarPost({
                titulo: "Voz da Cidade",
                conteudo: postContent,
                autor_nome: user.nome || user.email,
                autor_bairro: postBairro,
                user_id: user.id,
            });

            if (resp) {
                toast.success("Publicado com sucesso!");
                setPostContent("");
                carregarPosts();
            }
        } catch (err) {
            toast.error("Erro ao publicar");
        } finally {
            setIsPosting(false);
        }
    };

    const handleApoiar = async (postId: string, currentCurtidas: number) => {
        if (!user) { toast.error("Faça login para apoiar"); return; }

        const isApoiado = userApoios[postId];
        const newCount = isApoiado ? Math.max(0, currentCurtidas - 1) : currentCurtidas + 1;

        setUserApoios(prev => ({ ...prev, [postId]: !isApoiado }));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, curtidas: newCount } : p));

        try {
            await fetch(`/api/posts?id=${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curtidas: newCount })
            });
        } catch (err) { }
    };

    const toggleComments = (postId: string) => {
        if (!expandedComments[postId]) {
            fetchComments(postId);
        }
        setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const fetchComments = async (postId: string) => {
        try {
            const data = await buscarComentarios(postId);
            setComentarios(prev => ({ ...prev, [postId]: data }));
        } catch (err) { }
    };

    const handleComment = async (postId: string) => {
        if (!user) { toast.error("Faça login!"); return; }
        const texto = novoComentario[postId];
        if (!texto?.trim()) return;

        try {
            const resp = await criarComentario({
                post_id: postId,
                autor_nome: user.nome || user.email,
                conteudo: texto,
                user_id: user.id
            });
            if (resp) {
                setNovoComentario(prev => ({ ...prev, [postId]: "" }));
                fetchComments(postId);
            }
        } catch (err) { }
    };

    const handleExcluirPost = async (postId: string) => {
        if (!window.confirm("Excluir publicação permanentemente?")) return;
        try {
            const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Publicação removida");
                carregarPosts();
            } else {
                toast.error("Erro ao excluir");
            }
        } catch (err) {
            toast.error("Erro inesperado ao excluir");
        }
    };

    const handleSalvarEdicao = async () => {
        if (!editingPost || !editContent.trim()) return;
        setIsSavingEdit(true);
        try {
            const res = await fetch(`/api/posts?id=${editingPost.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo: editContent })
            });
            if (res.ok) {
                toast.success("Publicação atualizada!");
                setEditingPost(null);
                carregarPosts();
            } else {
                toast.error("Erro ao salvar alterações");
            }
        } catch (err) {
            toast.error("Erro ao conectar ao servidor");
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100 selection:bg-primary/30 antialiased font-sans">

            {/* Header Estilizado */}
            <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                <div className="container mx-auto max-w-5xl h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => navigate("/")} variant="ghost" size="icon" className="rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Voz da Cidade</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Community</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <span className="text-xs font-black text-primary uppercase">{posts.length} Ativos</span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto max-w-5xl py-10 px-6">

                {/* Composer Card */}
                <div className="mb-12">
                    <Card className="bg-white dark:bg-[#121214] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[2.5rem] p-4 md:p-8">
                        <div className="flex gap-4 md:gap-6">
                            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                {user?.nome?.charAt(0) || "C"}
                            </div>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    className="w-full bg-transparent border-none text-xl md:text-2xl focus:ring-0 placeholder:text-zinc-400 font-medium resize-none min-h-[120px] pt-2"
                                    placeholder="O que de novo em Guaíra hoje?"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                />
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="rounded-2xl text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all">
                                            <ImageIcon className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-2xl text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition-all">
                                            <MapPin className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <Button
                                        disabled={!postContent.trim() || isPosting}
                                        onClick={handlePost}
                                        className="rounded-2xl px-8 h-12 font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                    >
                                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Publicar</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Grid de Posts em Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <span className="font-bold text-zinc-400 uppercase tracking-widest text-xs">Sincronizando Vozes...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {posts.map(post => (
                            <Card key={post.id} className="group bg-white dark:bg-[#121214] border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)]">

                                <div className="p-6 md:p-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:bg-primary transition-colors group-hover:text-white duration-500">
                                                {post.autor_nome?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-black text-lg md:text-xl tracking-tight leading-none mb-1">{post.autor_nome}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">@{post.autor_bairro.toLowerCase()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                                    <span className="text-[10px] font-bold text-primary">{new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-primary/5 transition-all active:scale-95">
                                                        <MoreHorizontal className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-none shadow-2xl bg-white dark:bg-[#1A1A1E]">
                                                    {user?.id === post.user_id ? (
                                                        <>
                                                            <DropdownMenuItem
                                                                className="rounded-xl gap-3 font-bold py-3 cursor-pointer focus:bg-primary/10 focus:text-primary"
                                                                onClick={() => {
                                                                    setEditingPost(post);
                                                                    setEditContent(post.conteudo);
                                                                }}
                                                            >
                                                                <Pencil className="w-4 h-4" /> Editar Post
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="rounded-xl gap-3 font-bold py-3 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                                                                onClick={() => handleExcluirPost(post.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Excluir Post
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <DropdownMenuItem className="rounded-xl gap-3 font-bold py-3 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                                            <ShieldAlert className="w-4 h-4" /> Denunciar Post
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -top-6 -left-6 w-12 h-12 text-zinc-50 dark:text-zinc-900 -z-10 transition-colors group-hover:text-primary/5" />
                                        <p className="text-xl md:text-2xl font-semibold leading-relaxed text-zinc-700 dark:text-zinc-300 mb-8 whitespace-pre-wrap">
                                            {post.conteudo}
                                        </p>
                                    </div>

                                    {post.imagens && post.imagens.length > 0 && (
                                        <div
                                            className="rounded-[2.5rem] overflow-hidden border-4 border-zinc-50 dark:border-zinc-900 mb-8 shadow-inner cursor-zoom-in"
                                            onClick={() => setSelectedImage(post.imagens![0])}
                                        >
                                            <img src={post.imagens[0]} className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 pt-6 md:pt-8 border-t border-zinc-50 dark:border-zinc-800">
                                        <Button
                                            onClick={() => handleApoiar(post.id, post.curtidas || 0)}
                                            className={`h-14 rounded-[1.5rem] px-8 gap-3 font-black text-sm transition-all shadow-lg active:scale-95 ${userApoios[post.id] ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200" : "bg-[#F4F4F5] dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-rose-500 hover:text-white"}`}
                                        >
                                            <Heart className={`w-5 h-5 ${userApoios[post.id] ? "fill-current" : ""}`} />
                                            APOIAR {(post.curtidas || 0) > 0 ? `• ${post.curtidas}` : ""}
                                        </Button>

                                        <Button
                                            onClick={() => toggleComments(post.id)}
                                            variant="ghost"
                                            className="h-14 rounded-[1.5rem] px-8 gap-3 font-black text-sm bg-zinc-50 dark:bg-zinc-800/30 text-zinc-500 hover:bg-primary/5 hover:text-primary transition-all"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            {comentarios[post.id]?.length || 0} COMENTÁRIOS
                                        </Button>
                                    </div>

                                    {/* Comentários Expansíveis */}
                                    {expandedComments[post.id] && (
                                        <div className="mt-8 space-y-6 pt-8 border-t-2 border-dashed border-zinc-100 dark:border-zinc-800/50 animate-in slide-in-from-top-4 duration-500">

                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                                                    {user?.nome?.charAt(0) || "C"}
                                                </div>
                                                <div className="flex-1 relative">
                                                    <Input
                                                        value={novoComentario[post.id] || ""}
                                                        onChange={(e) => setNovoComentario(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                        placeholder="Adicione um comentário..."
                                                        className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-900/50 border-none px-6 pr-12 text-sm font-medium"
                                                    />
                                                    <Button
                                                        onClick={() => handleComment(post.id)}
                                                        size="icon"
                                                        variant="ghost"
                                                        className="absolute right-1 top-1 text-primary hover:bg-primary/10 rounded-xl"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {(comentarios[post.id] || []).map(c => (
                                                    <div key={c.id} className="flex gap-4 p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/50">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                                            {c.autor_nome.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-black text-sm">{c.autor_nome}</span>
                                                                <span className="text-[10px] font-bold text-zinc-400 capitalize">{new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.conteudo}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Lightbox */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] p-0 border-none bg-transparent shadow-none">
                    <img src={selectedImage!} className="max-w-full max-h-[90vh] object-contain rounded-[3rem] shadow-2xl mx-auto border-8 border-white dark:border-black/50" />
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Editar sua publicação</DialogTitle>
                            <DialogDescription className="font-medium">O que você gostaria de mudar na sua mensagem?</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <Textarea
                            className="min-h-[200px] rounded-3xl border-2 border-zinc-100 focus:border-primary p-6 text-lg font-medium resize-none shadow-inner bg-zinc-50/50"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-2xl font-bold"
                                onClick={() => setEditingPost(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-[2] h-12 rounded-2xl font-black text-lg shadow-lg shadow-primary/20"
                                onClick={handleSalvarEdicao}
                                disabled={isSavingEdit}
                            >
                                {isSavingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default XFeed;
