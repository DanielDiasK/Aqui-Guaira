import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal,
    Image as ImageIcon, Smile, MapPin, Calendar,
    MessageCircle, Repeat2, Heart, Share, Trash2, ShieldCheck,
    TrendingUp, Sparkles, X, Plus, CheckCircle2, MoreVertical,
    Loader2, ArrowLeft, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const [activeTab, setActiveTab] = useState("for-you");
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
                titulo: "Publicação Voz da Cidade",
                conteudo: postContent,
                autor_nome: user.nome || user.email,
                autor_bairro: postBairro,
                user_id: user.id,
            });

            if (resp) {
                toast.success("Postado!");
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
        if (!window.confirm("Excluir post?")) return;
        try {
            const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Post removido");
                carregarPosts();
            }
        } catch (err) { }
    };

    const handleExcluirComentario = async (postId: string, comentarioId: string) => {
        if (!window.confirm("Excluir comentário?")) return;
        try {
            const res = await fetch(`/api/posts?action=comentario&comentarioId=${comentarioId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Comentário removido");
                fetchComments(postId);
            }
        } catch (err) {
            toast.error("Erro ao excluir");
        }
    };

    const handleApoiarComentario = async (comment: Comentario) => {
        if (!user) return;
        const isApoiado = comentarioApoios[comment.id];
        const newCount = (comment.curtidas || 0) + (isApoiado ? -1 : 1);

        setComentarioApoios(prev => ({ ...prev, [comment.id]: !isApoiado }));
        setComentarios(prev => ({
            ...prev,
            [comment.post_id]: prev[comment.post_id].map(c => c.id === comment.id ? { ...c, curtidas: newCount } : c)
        }));

        try {
            await fetch(`/api/posts?action=comentario&id=${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ curtidas: newCount })
            });
        } catch (err) { }
    };

    const trends = [
        { category: "Notícias • Guaíra", title: "Novo Hospital", posts: "2.4K" },
        { category: "Política • Guaíra", title: "Câmara Municipal", posts: "1.2K" },
        { category: "Utilidade • Trânsito", title: "Rua 10 Interditada", posts: "852" },
        { category: "Empregos • Novas Vagas", title: "Contratação Usina", posts: "1.9K" },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-primary/30 antialiased">
            <div className="container mx-auto flex justify-center max-w-7xl h-screen">

                {/* LEFT NAV (SIDEBAR) */}
                <header className="hidden md:flex flex-col items-end w-20 lg:w-64 sticky top-0 h-screen p-4 border-r border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col gap-2 w-full lg:items-start overflow-y-auto no-scrollbar">
                        <div className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer transition-colors w-fit mb-4" onClick={() => navigate("/")}>
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>

                        <NavItem icon={<Home className="w-7 h-7" />} label="Início" active />
                        <NavItem icon={<Search className="w-7 h-7" />} label="Explorar" />
                        <NavItem icon={<Bell className="w-7 h-7" />} label="Notificações" />
                        <NavItem icon={<Mail className="w-7 h-7" />} label="Mensagens" />
                        <NavItem icon={<Bookmark className="w-7 h-7" />} label="Salvos" />
                        <NavItem icon={<User className="w-7 h-7" />} label="Perfil" />
                        <NavItem icon={<MoreHorizontal className="w-7 h-7" />} label="Mais" />

                        <Button className="w-full h-14 rounded-full font-black text-xl mt-4 hidden lg:block shadow-lg shadow-primary/20">Postar</Button>
                        <Button className="w-fit p-3 rounded-full font-black text-lg mt-4 lg:hidden"><Plus className="w-6 h-6" /></Button>
                    </div>

                    <div className="mt-auto w-full lg:flex items-center gap-3 p-3 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 rounded-full cursor-pointer transition-all">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black shrink-0">
                            {user?.nome?.charAt(0) || "C"}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="font-bold truncate text-sm">{user?.nome || "Cidadão"}</p>
                            <p className="text-xs text-zinc-500 truncate">@{user?.email?.split("@")[0] || "guaira"}</p>
                        </div>
                    </div>
                </header>

                {/* FEED CENTRAL */}
                <main className="flex-1 max-w-[600px] border-r border-zinc-100 dark:border-zinc-800 h-screen overflow-y-auto no-scrollbar">
                    <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                        <h1 className="p-4 text-xl font-black">Página Inicial</h1>
                        <div className="flex w-full">
                            <TabItem label="Para você" active={activeTab === "for-you"} onClick={() => setActiveTab("for-you")} />
                            <TabItem label="Seguindo" active={activeTab === "following"} onClick={() => setActiveTab("following")} />
                        </div>
                    </div>

                    {/* COMPOSER */}
                    <div className="p-4 flex gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black shrink-0 shadow-inner">
                            {user?.nome?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1">
                            <textarea
                                className="w-full bg-transparent border-none text-xl focus:ring-0 placeholder:text-zinc-500 resize-none min-h-[100px] mt-2"
                                placeholder="O que está acontecendo em Guaíra?"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                <div className="flex gap-1 text-primary">
                                    <div className="p-2 hover:bg-primary/10 rounded-full cursor-pointer transition-colors"><ImageIcon className="w-5 h-5" /></div>
                                    <div className="p-2 hover:bg-primary/10 rounded-full cursor-pointer transition-colors"><MapPin className="w-5 h-5" /></div>
                                    <div className="p-2 hover:bg-primary/10 rounded-full cursor-pointer transition-colors"><Smile className="w-5 h-5" /></div>
                                </div>
                                <Button disabled={!postContent.trim() || isPosting} onClick={handlePost} className="rounded-full px-6 font-black h-9">
                                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Postar"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LISTA DE POSTS */}
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="pb-24">
                            {posts.map(post => {
                                const isAuthor = user?.id === post.user_id;
                                return (
                                    <article key={post.id} className="p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => toggleComments(post.id)}>
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="font-bold hover:underline truncate">{post.autor_nome}</span>
                                                    <span className="text-zinc-500 text-sm truncate">@{post.autor_bairro.toLowerCase()} • {new Date(post.created_at).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                                                    <div className="ml-auto flex gap-1 items-center">
                                                        {isAuthor && <Trash2 onClick={(e) => { e.stopPropagation(); handleExcluirPost(post.id); }} className="w-4 h-4 text-zinc-400 hover:text-rose-500 transition-colors p-0.5" />}
                                                        <MoreHorizontal className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                                <p className="text-[17px] leading-relaxed mb-3">{post.conteudo}</p>

                                                {post.imagens && post.imagens.length > 0 && (
                                                    <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 mb-3" onClick={(e) => { e.stopPropagation(); setSelectedImage(post.imagens![0]); }}>
                                                        <img src={post.imagens[0]} className="w-full max-h-[400px] object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex justify-between max-w-sm text-zinc-500 -ml-2">
                                                    <ToolbarItem icon={<MessageCircle className="w-5 h-5" />} label={post.id} color="hover:text-primary" bg="hover:bg-primary/10" onClick={() => toggleComments(post.id)} />
                                                    <ToolbarItem icon={<Repeat2 className="w-5 h-5" />} label="2" color="hover:text-green-500" bg="hover:bg-green-500/10" />
                                                    <ToolbarItem
                                                        icon={<Heart className={`w-5 h-5 ${userApoios[post.id] ? "fill-rose-500 text-rose-500" : ""}`} />}
                                                        label={post.curtidas || 0}
                                                        color="hover:text-rose-500" bg="hover:bg-rose-500/10"
                                                        onClick={() => handleApoiar(post.id, post.curtidas || 0)}
                                                    />
                                                    <ToolbarItem icon={<Share className="w-5 h-5" />} label="" color="hover:text-primary" bg="hover:bg-primary/10" />
                                                </div>

                                                {/* COMENTÁRIOS EXPANSIVEIS */}
                                                {expandedComments[post.id] && (
                                                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                className="rounded-full bg-zinc-100 dark:bg-zinc-900 border-none h-10 text-sm"
                                                                placeholder="Publicar sua resposta"
                                                                value={novoComentario[post.id] || ""}
                                                                onChange={(e) => setNovoComentario(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                            />
                                                            <Button size="sm" className="rounded-full px-4 h-10 font-bold" onClick={() => handleComment(post.id)}>Responder</Button>
                                                        </div>

                                                        {(comentarios[post.id] || []).map(c => {
                                                            const canDeleteComment = user?.id === c.user_id || user?.id === post.user_id;
                                                            return (
                                                                <div key={c.id} className="flex gap-3 py-1 group/comment">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black">{c.autor_nome.charAt(0).toUpperCase()}</div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-sm">{c.autor_nome}</span>
                                                                            <span className="text-[10px] text-zinc-500">{new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                            {canDeleteComment && <Trash2 onClick={() => handleExcluirComentario(post.id, c.id)} className="w-3.5 h-3.5 ml-auto text-zinc-300 hover:text-rose-500 cursor-pointer p-0.5" />}
                                                                        </div>
                                                                        <p className="text-sm dark:text-zinc-400">{c.conteudo}</p>
                                                                        <div className="flex gap-4 mt-1 text-zinc-500">
                                                                            <button onClick={() => handleApoiarComentario(c)} className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${comentarioApoios[c.id] ? "text-rose-500" : ""}`}>
                                                                                <Heart className={`w-3.5 h-3.5 ${comentarioApoios[c.id] ? "fill-current" : ""}`} />
                                                                                <span className="text-[10px]">{c.curtidas || 0}</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* RIGHT SIDEBAR (TRENDS) */}
                <aside className="hidden lg:flex flex-col w-[350px] p-4 sticky top-0 h-screen gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <Input className="rounded-full bg-zinc-100 dark:bg-zinc-900 border-none pl-12 h-12 placeholder:text-zinc-500" placeholder="Buscar no Voice Guaíra" />
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-4">
                        <h2 className="text-xl font-black mb-4">Em alta Guaíra</h2>
                        {trends.map((t, i) => (
                            <div key={i} className="py-3 hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-colors -mx-4 px-4 cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs text-zinc-500 font-medium">{t.category}</span>
                                    <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                </div>
                                <p className="font-extrabold text-sm group-hover:text-primary transition-colors">{t.title}</p>
                                <p className="text-xs text-zinc-500 font-medium">{t.posts} posts</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-4">
                        <h2 className="text-xl font-black mb-4">Quem seguir</h2>
                        <FollowItem name="Prefeitura de Guaíra" handle="guairaoficial" />
                        <FollowItem name="Guaíra Online" handle="guaira_noticias" />
                        <FollowItem name="Voz do Bairro" handle="vozbairro" />
                    </div>
                </aside>

            </div>

            {/* LIGHTBOX */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] p-0 border-none bg-transparent shadow-none overflow-hidden">
                    <img src={selectedImage!} className="max-w-full max-h-[90vh] object-contain rounded-3xl mx-auto shadow-2xl" />
                </DialogContent>
            </Dialog>
        </div>
    );
};

const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-5 p-3 px-4 rounded-full cursor-pointer transition-all w-fit ${active ? "font-black" : "font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
        <div className={active ? "text-primary" : ""}>{icon}</div>
        <span className="text-xl hidden lg:block">{label}</span>
    </div>
);

const TabItem = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="flex-1 pt-4 hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-colors relative">
        <div className={`pb-3 font-extrabold mx-auto w-fit text-sm tracking-tight ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"}`}>
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary rounded-full w-[40px] mx-auto" />}
        </div>
    </button>
);

const ToolbarItem = ({ icon, label, color, bg, onClick }: { icon: any, label: any, color: string, bg: string, onClick?: () => void }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick?.(); }} className={`flex items-center gap-1 group cursor-pointer transition-all px-2 py-1 rounded-full ${bg}`}>
        <div className={`p-1.5 rounded-full transition-all ${color}`}>{icon}</div>
        <span className={`text-xs transition-all ${color}`}>{typeof label === 'string' && label.length > 10 ? 'Res.' : label}</span>
    </div>
);

const FollowItem = ({ name, handle }: { name: string, handle: string }) => (
    <div className="flex items-center gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{name}</p>
            <p className="text-xs text-zinc-500 truncate">@{handle}</p>
        </div>
        <Button size="sm" className="rounded-full px-4 font-black h-8 bg-black dark:bg-white text-white dark:text-black">Seguir</Button>
    </div>
);

export default XFeed;
