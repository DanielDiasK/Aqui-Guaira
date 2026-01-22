import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal,
    Image as ImageIcon, Smile, MapPin, Calendar,
    MessageCircle, Repeat2, Heart, Share, Trash2, ShieldCheck,
    TrendingUp, Sparkles, X, Plus, CheckCircle2, MoreVertical,
    Loader2, ArrowLeft, Send, MessageSquare, Quote, Pencil, ShieldAlert,
    MapPinned, Camera, History, Check, AlertCircle, Clock
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
    status: 'pendente' | 'aprovado' | 'recusado';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postContent, setPostContent] = useState("");
    const [postBairro, setPostBairro] = useState("Guaíra");
    const [isPosting, setIsPosting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Imagem no composer
    const [composerImage, setComposerImage] = useState<File | null>(null);
    const [composerPreview, setComposerPreview] = useState<string | null>(null);

    // Social states
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [comentarios, setComentarios] = useState<Record<string, Comentario[]>>({});
    const [userApoios, setUserApoios] = useState<Record<string, boolean>>({});
    const [novoComentario, setNovoComentario] = useState<Record<string, string>>({});
    const [comentarioApoios, setComentarioApoios] = useState<Record<string, boolean>>({});

    // Post Editing state
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    // Comment Editing state
    const [editingComment, setEditingComment] = useState<Comentario | null>(null);
    const [editCommentContent, setEditCommentContent] = useState("");

    useEffect(() => {
        carregarPosts();
    }, []);

    const carregarPosts = async () => {
        setLoading(true);
        try {
            // Se tiver user, busca os dele também (pendentes)
            const data = await buscarPosts({
                limite: 50,
                userId: user?.id
            });
            setPosts(data);
        } catch (err) {
            toast.error("Erro ao carregar o feed");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'composer' | 'edit') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'composer') {
                    setComposerImage(file);
                    setComposerPreview(reader.result as string);
                } else {
                    setEditImageFile(file);
                    setEditImagePreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
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
            let imageUrls = [];
            if (composerImage) {
                const url = await uploadImagem('posts-images', composerImage);
                if (url) imageUrls.push(url);
            }

            const resp = await criarPost({
                titulo: "Voz da Cidade",
                conteudo: postContent,
                autor_nome: user.nome || user.email,
                autor_bairro: postBairro,
                user_id: user.id,
                imagens: imageUrls
            });

            if (resp) {
                toast.success("Enviado para análise!");
                setPostContent("");
                setComposerImage(null);
                setComposerPreview(null);
                carregarPosts();
            }
        } catch (err) {
            toast.error("Erro ao publicar");
        } finally {
            setIsPosting(false);
        }
    };

    const handleSalvarEdicao = async () => {
        if (!editingPost || !editContent.trim()) return;
        setIsSavingEdit(true);
        try {
            let imageUrls = editingPost.imagens || [];
            if (editImageFile) {
                const url = await uploadImagem('posts-images', editImageFile);
                if (url) imageUrls = [url]; // Substitui por enquanto ou poderia adicionar
            } else if (editImagePreview === null) {
                imageUrls = []; // Removeu a imagem
            }

            const res = await fetch(`/api/posts?id=${editingPost.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo: editContent, imagens: imageUrls })
            });
            if (res.ok) {
                toast.success("Publicação atualizada!");
                setEditingPost(null);
                setEditImageFile(null);
                setEditImagePreview(null);
                carregarPosts();
            }
        } catch (err) {
            toast.error("Erro ao salvar");
        } finally {
            setIsSavingEdit(false);
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
        if (!expandedComments[postId]) fetchComments(postId);
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

    const handleSalvarEdicaoComentario = async () => {
        if (!editingComment || !editCommentContent.trim()) return;
        try {
            const res = await fetch(`/api/posts?action=comentario&comentarioId=${editingComment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conteudo: editCommentContent })
            });
            if (res.ok) {
                toast.success("Resposta atualizada");
                setEditingComment(null);
                fetchComments(editingComment.post_id);
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
            }
        } catch (err) { }
    };

    const handleExcluirComentario = async (postId: string, comentarioId: string) => {
        if (!window.confirm("Excluir resposta?")) return;
        try {
            const res = await fetch(`/api/posts?action=comentario&comentarioId=${comentarioId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Resposta removida");
                fetchComments(postId);
            }
        } catch (err) { }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'pendente': return <Badge className="bg-amber-500 text-white gap-1.5 rounded-lg border-none"><Clock className="w-3 h-3" /> Pendente</Badge>;
            case 'recusado': return <Badge className="bg-rose-500 text-white gap-1.5 rounded-lg border-none"><AlertCircle className="w-3 h-3" /> Recusado</Badge>;
            case 'aprovado': return <Badge className="bg-emerald-500 text-white gap-1.5 rounded-lg border-none"><Check className="w-3 h-3" /> Aprovado</Badge>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100 selection:bg-primary/30 antialiased font-sans pb-20">

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
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Comunidade Ativa</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <span className="text-xs font-black text-primary uppercase">{posts.filter(p => p.status === 'aprovado').length} Aprovados</span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto max-w-5xl py-8 px-4 md:px-6">

                {/* COMPOSER CARD */}
                <div className="mb-10">
                    <Card className="bg-white dark:bg-[#121214] border-none shadow-xl rounded-[2.5rem] p-4 md:p-8">
                        <div className="flex gap-4 md:gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                {user?.nome?.charAt(0) || "C"}
                            </div>
                            <div className="flex-1 space-y-4">
                                <textarea
                                    className="w-full bg-transparent border-none text-xl focus:outline-none focus:ring-0 placeholder:text-zinc-400 font-medium resize-none min-h-[100px] pt-1 transition-all"
                                    placeholder="O que está acontecendo no seu bairro?"
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                />

                                {composerPreview && (
                                    <div className="relative w-fit group">
                                        <img src={composerPreview} className="max-h-60 rounded-3xl border-4 border-zinc-100 dark:border-zinc-800 object-cover" />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute -top-3 -right-3 rounded-full w-8 h-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => { setComposerImage(null); setComposerPreview(null); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 gap-4 flex-wrap">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'composer')}
                                        />
                                        <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="sm" className="rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold gap-2 px-4 h-10">
                                            <Camera className="w-4 h-4" /> <span className="hidden sm:inline">Imagem</span>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold gap-2 px-4 h-10">
                                            <MapPinned className="w-4 h-4" /> <span className="hidden sm:inline">Em {postBairro}</span>
                                        </Button>
                                    </div>
                                    <Button
                                        disabled={!postContent.trim() || isPosting}
                                        onClick={handlePost}
                                        className="rounded-xl px-10 h-11 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 flex-1 sm:flex-none"
                                    >
                                        {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Postar</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* FEED CONTENT */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <History className="w-6 h-6 text-primary animate-spin" />
                        </div>
                        <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Atualizando voz da cidade...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map(post => {
                            const postOwner = user?.id === post.user_id;

                            return (
                                <Card key={post.id} className="group bg-white dark:bg-[#121214] border-none shadow-sm rounded-[2.5rem] overflow-hidden transition-all duration-300">
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary font-black text-lg group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                    {post.autor_nome?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-lg leading-none">{post.autor_nome}</h3>
                                                        {postOwner && renderStatusBadge(post.status)}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">@{post.autor_bairro.toLowerCase()} • {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl bg-zinc-50 dark:bg-zinc-800 opacity-60 hover:opacity-100 transition-all">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-none shadow-2xl bg-white dark:bg-[#1A1A1E] z-[1002]">
                                                    {postOwner ? (
                                                        <>
                                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold py-3 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
                                                                onClick={() => { setEditingPost(post); setEditContent(post.conteudo); setEditImagePreview(post.imagens?.[0] || null); }}>
                                                                <Pencil className="w-4 h-4" /> Editar Publicação
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl gap-3 font-bold py-3 cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
                                                                onClick={() => handleExcluirPost(post.id)}>
                                                                <Trash2 className="w-4 h-4" /> Excluir permanentemente
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <DropdownMenuItem className="rounded-xl gap-3 font-bold py-3 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                                            <ShieldAlert className="w-4 h-4 text-amber-500" /> Denunciar conteúdo
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="relative mb-6">
                                            <Quote className="absolute -top-4 -left-4 w-10 h-10 text-zinc-50 dark:text-zinc-900 -z-10 group-hover:text-primary/10 transition-colors" />
                                            <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                                {post.conteudo}
                                            </p>
                                        </div>

                                        {post.imagens && post.imagens.length > 0 && (
                                            <div className="rounded-[2rem] overflow-hidden border-2 border-zinc-50 dark:border-zinc-800 mb-6 cursor-zoom-in group/img" onClick={() => setSelectedImage(post.imagens![0])}>
                                                <img src={post.imagens[0]} className="w-full max-h-[450px] object-cover hover:scale-[1.02] transition-transform duration-700" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                                            <button
                                                onClick={() => handleApoiar(post.id, post.curtidas || 0)}
                                                className={`group/btn flex items-center gap-2.5 font-black text-xs transition-all px-5 py-2.5 rounded-2xl ${userApoios[post.id] ? "bg-rose-500 text-white" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5"}`}
                                            >
                                                <Heart className={`w-4 h-4 ${userApoios[post.id] ? "fill-current" : "group-hover/btn:scale-125 transition-transform"}`} />
                                                {(post.curtidas || 0) > 0 ? post.curtidas : "APOIAR"}
                                            </button>

                                            <button
                                                onClick={() => toggleComments(post.id)}
                                                className="flex items-center gap-2.5 font-black text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-5 py-2.5 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                {comentarios[post.id]?.length || 0} RESPOSTAS
                                            </button>
                                        </div>

                                        {/* COMMENTS SECTION */}
                                        {expandedComments[post.id] && (
                                            <div className="mt-6 space-y-4 pt-6 border-t border-dashed border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="flex gap-3">
                                                    <Input
                                                        value={novoComentario[post.id] || ""}
                                                        onChange={(e) => setNovoComentario(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                        placeholder="Sua resposta para a comunidade..."
                                                        className="rounded-2xl h-11 bg-zinc-50 dark:bg-zinc-900 border-none px-5 text-sm font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                                                    />
                                                    <Button onClick={() => handleComment(post.id)} size="icon" className="h-11 w-11 rounded-2xl shrink-0"><Send className="w-4 h-4" /></Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {(comentarios[post.id] || []).map(c => {
                                                        const isCommentOwner = user?.id === c.user_id;
                                                        const isPostOwner = user?.id === post.user_id;

                                                        return (
                                                            <div key={c.id} className="flex gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100/50 dark:border-zinc-800/50 group/comm">
                                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0">{c.autor_nome.charAt(0)}</div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-xs">{c.autor_nome}</span>
                                                                            <span className="text-[9px] font-bold text-zinc-400">{new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>

                                                                        {(isCommentOwner || isPostOwner) && (
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <button className="p-1 rounded-lg opacity-0 group-hover/comm:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800"><MoreVertical className="w-3.5 h-3.5 text-zinc-400" /></button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="p-1 rounded-xl border-none shadow-xl bg-white dark:bg-[#1A1A1E]">
                                                                                    {isCommentOwner && (
                                                                                        <DropdownMenuItem className="text-[11px] font-bold gap-2 p-2 rounded-lg cursor-pointer transition-colors"
                                                                                            onClick={() => { setEditingComment(c); setEditCommentContent(c.conteudo); }}>
                                                                                            <Pencil className="w-3 h-3 text-primary" /> Editar
                                                                                        </DropdownMenuItem>
                                                                                    )}
                                                                                    <DropdownMenuItem className="text-[11px] font-bold gap-2 p-2 rounded-lg cursor-pointer text-rose-500 transition-colors"
                                                                                        onClick={() => handleExcluirComentario(post.id, c.id)}>
                                                                                        <Trash2 className="w-3 h-3" /> Excluir
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{c.conteudo}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* LIGHTBOX */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] p-0 border-none bg-transparent shadow-none">
                    <img src={selectedImage!} className="max-w-full max-h-[90vh] object-contain rounded-[3rem] shadow-2xl mx-auto border-8 border-white dark:border-black/50" />
                </DialogContent>
            </Dialog>

            {/* POST EDIT MODAL */}
            <Dialog open={!!editingPost} onOpenChange={(open) => { if (!open) setEditingPost(null); }}>
                <DialogContent className="max-w-2xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-[#121214]">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Refinar Publicação</DialogTitle>
                            <DialogDescription className="font-bold text-zinc-500">Mude o texto ou substitua a imagem do seu card.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <Textarea
                            className="min-h-[150px] rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 focus:border-primary focus:outline-none focus:ring-0 p-6 text-lg font-medium resize-none shadow-inner bg-zinc-50 dark:bg-zinc-900 transition-all"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />

                        <div className="relative group">
                            {editImagePreview ? (
                                <div className="relative w-fit">
                                    <img src={editImagePreview} className="max-h-48 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800" />
                                    <Button
                                        size="icon" variant="destructive"
                                        className="absolute -top-2 -right-2 rounded-full w-7 h-7"
                                        onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                                    ><X className="w-3.5 h-3.5" /></Button>
                                </div>
                            ) : (
                                <Button onClick={() => editFileInputRef.current?.click()} variant="outline" className="w-[120px] h-[120px] rounded-2xl border-dashed border-2 flex flex-col gap-2 font-bold text-xs text-zinc-400">
                                    <Camera className="w-5 h-5" /> Mudar Foto
                                </Button>
                            )}
                            <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'edit')} />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => setEditingPost(null)}>Descartar</Button>
                            <Button className="flex-[2] h-12 rounded-2xl font-black text-lg bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none"
                                onClick={handleSalvarEdicao} disabled={isSavingEdit}>
                                {isSavingEdit ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* COMMENT EDIT MODAL */}
            <Dialog open={!!editingComment} onOpenChange={(open) => !open && setEditingComment(null)}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl bg-white dark:bg-[#121214]">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-xl font-black">Editar Resposta</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        className="min-h-[120px] rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 focus:border-primary focus:outline-none focus:ring-0 p-4 font-medium resize-none mb-6 transition-all"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setEditingComment(null)}>Cancelar</Button>
                        <Button className="flex-1 rounded-xl font-black" onClick={handleSalvarEdicaoComentario}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default XFeed;
