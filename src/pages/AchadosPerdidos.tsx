import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlusCircle, MapPin, Calendar, Phone, CheckCircle, AlertCircle, Package, ArrowLeft, Home, Loader2, X, ImagePlus, User, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";

interface ItemAchadoPerdido {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: "perdido" | "encontrado";
  status: "ativo" | "recuperado";
  bairro: string;
  local_referencia?: string;
  data_ocorrencia: string;
  telefone_contato: string;
  nome_contato: string;
  imagem?: string;
  user_id: string;
  criado_em: string;
  users?: {
    nome: string;
  };
}

const categorias = [
  "Documentos",
  "Celular/Eletrônicos",
  "Carteira/Bolsa",
  "Chaves",
  "Óculos",
  "Joias/Relógios",
  "Roupas/Acessórios",
  "Animais de Estimação",
  "Outros"
];

export default function AchadosPerdidos() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [itens, setItens] = useState<ItemAchadoPerdido[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("ativo");

  // Formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState<"perdido" | "encontrado">("perdido");
  const [bairro, setBairro] = useState("");
  const [localReferencia, setLocalReferencia] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    carregarUsuario();
    carregarItens();
  }, []);

  const carregarUsuario = async () => {
    // setUser(usuarioLogado);
  };

  const carregarItens = async () => {
    setLoading(true);
    // Dados serão carregados de uma fonte externa futuramente
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("");
    setTipo("perdido");
    setBairro("");
    setLocalReferencia("");
    setDataOcorrencia("");
    setTelefoneContato("");
    setNomeContato("");
    setImagemFile(null);
    setImagemPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Funcionalidade em desenvolvimento");
  };

  const marcarComoRecuperado = async (itemId: string) => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const itensFiltrados = itens.filter(item => {
    const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      item.bairro.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
    const matchCategoria = filtroCategoria === "todas" || item.categoria === filtroCategoria;
    const matchStatus = filtroStatus === "todos" || item.status === filtroStatus;

    return matchBusca && matchTipo && matchCategoria && matchStatus;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
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

            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Achados e <br />
                <span className="gradient-text">Perdidos</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Encontrou algo? Perdeu algo? Cadastre aqui e ajude a comunidade guairense a recuperar seus pertences.
              </p>
            </div>

            <div className="flex justify-center">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-xl px-8 py-7 bg-primary hover:bg-primary/90 text-lg font-bold gap-2">
                    <PlusCircle className="w-6 h-6" />
                    Cadastrar Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                      <Package className="w-6 h-6 text-primary" />
                      Novo Cadastro
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                      {user ? "Preencha os detalhes do item para ajudar na identificação." : "Acesse sua conta para publicar um item."}
                    </DialogDescription>
                  </DialogHeader>

                  {!user ? (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl">
                      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Este item foi... *</Label>
                        <Select value={tipo} onValueChange={(value: "perdido" | "encontrado") => setTipo(value)}>
                          <SelectTrigger className="py-6 rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="perdido" className="py-3">
                              <div className="flex items-center gap-2 font-bold text-red-600">
                                <AlertCircle className="w-4 h-4" /> Perdido
                              </div>
                            </SelectItem>
                            <SelectItem value="encontrado" className="py-3">
                              <div className="flex items-center gap-2 font-bold text-green-600">
                                <CheckCircle className="w-4 h-4" /> Encontrado
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Título do Anúncio *</Label>
                          <Input
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Carteira de Couro Marrom"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Categoria *</Label>
                          <Select value={categoria} onValueChange={setCategoria}>
                            <SelectTrigger className="py-6 rounded-xl border-2">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {categorias.map(cat => (
                                <SelectItem key={cat} value={cat} className="py-2.5">{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Descrição Detalhada *</Label>
                        <Textarea
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          placeholder="Descreva cor, marca, marcas de uso, etc. Não informe dados sensíveis se for item encontrado."
                          rows={3}
                          className="rounded-xl border-2 p-4"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Bairro *</Label>
                          <Input
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            placeholder="Onde aconteceu?"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Local aproximado</Label>
                          <Input
                            value={localReferencia}
                            onChange={(e) => setLocalReferencia(e.target.value)}
                            placeholder="Ex: Perto da Praça da Matriz"
                            className="py-6 rounded-xl border-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Data do Ocorrido *</Label>
                        <Input
                          type="date"
                          value={dataOcorrencia}
                          onChange={(e) => setDataOcorrencia(e.target.value)}
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Seu Nome para Contato *</Label>
                          <Input
                            value={nomeContato}
                            onChange={(e) => setNomeContato(e.target.value)}
                            placeholder="Nome completo"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Telefone/WhatsApp *</Label>
                          <Input
                            value={telefoneContato}
                            onChange={(e) => setTelefoneContato(e.target.value)}
                            placeholder="(00) 00000-0000"
                            className="py-6 rounded-xl border-2"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Foto do Item (Recomendado)</Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="gap-2 py-8 px-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                          >
                            <ImagePlus className="w-5 h-5" />
                            Adicionar Foto
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          {imagemPreview && (
                            <div className="relative group">
                              <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-primary/20 shadow-lg" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                                onClick={() => { setImagemFile(null); setImagemPreview(""); }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)} className="rounded-xl font-bold">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting} className="rounded-xl px-12 font-bold py-6 h-auto">
                          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar Anúncio'}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Filtros e Resultados Section */}
        <section className="container mx-auto px-4 py-8 space-y-12">
          {/* Barra de Filtros Premium */}
          <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Busca Rápida</Label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="O que você perdeu?"
                    className="pl-10 py-5 rounded-xl border-gray-100 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Filtrar por Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todos">Todos os registros</SelectItem>
                    <SelectItem value="perdido">Itens Perdidos</SelectItem>
                    <SelectItem value="encontrado">Itens Encontrados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Categoria Principal</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todas">Todas Categorias</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Status do Registro</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="ativo">Ativos (Ainda perdido)</SelectItem>
                    <SelectItem value="recuperado">Recuperados (Resolvido)</SelectItem>
                    <SelectItem value="todos">Mostrar Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Listagem de Resultados */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Loader2 className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-bold">Localizando pertences...</p>
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
              <Package className="w-20 h-20 text-muted-foreground/30" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Nenhum item localizado</h3>
                <p className="text-muted-foreground font-medium">Tente ajustar seus filtros ou cadastre um novo item.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {itensFiltrados.map((item) => (
                <Card key={item.id} className="group bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0 flex flex-col rounded-[2rem]">
                  {/* Container da Imagem */}
                  <div className="relative h-64 overflow-hidden bg-muted/20">
                    {item.imagem ? (
                      <img
                        src={item.imagem}
                        alt={item.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted">
                        <Package className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Badge de Status/Tipo */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <Badge
                        className={`px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg ${item.tipo === "perdido" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                          }`}
                      >
                        {item.tipo === "perdido" ? (
                          <><AlertCircle className="w-3 h-3 mr-1.5" /> Perdido</>
                        ) : (
                          <><CheckCircle className="w-3 h-3 mr-1.5" /> Encontrado</>
                        )}
                      </Badge>

                      {item.status === "recuperado" && (
                        <Badge className="bg-blue-600 text-white px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Recuperado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.categoria}</span>
                      </div>
                      <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                        {item.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed italic">
                        "{item.descricao}"
                      </p>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="space-y-2.5 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <span className="truncate">[{item.bairro}] <span className="text-muted-foreground font-medium">{item.local_referencia}</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <span>{formatarData(item.data_ocorrencia)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-primary">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Phone className="w-4 h-4" />
                          </div>
                          <a href={`tel:${item.telefone_contato}`} className="hover:underline">
                            {item.telefone_contato}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" /> Por: {item.users?.nome || 'Comunidade'}
                        </span>
                      </div>

                      {user?.id === item.user_id && item.status === "ativo" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl py-6 font-bold border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all gap-2"
                          onClick={() => marcarComoRecuperado(item.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marcar como Recuperado
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
