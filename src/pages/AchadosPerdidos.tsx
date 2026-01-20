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
import { Search, PlusCircle, MapPin, Calendar, Phone, CheckCircle, AlertCircle, Package, ArrowLeft, Home, Loader2, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase, getUsuarioLogado, uploadImagens } from "@/lib/supabase";
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
    const usuarioLogado = await getUsuarioLogado();
    setUser(usuarioLogado);
  };

  const carregarItens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achados_perdidos')
        .select(`
          *,
          users!user_id(nome)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setItens(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error("Erro ao carregar itens");
    } finally {
      setLoading(false);
    }
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

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    if (!titulo || !descricao || !categoria || !bairro || !dataOcorrencia || !telefoneContato || !nomeContato) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      let imagemUrl = null;

      // Upload da imagem se houver
      if (imagemFile) {
        const urls = imagemFile ? await uploadImagens('posts-images', [imagemFile], 'achados-perdidos') : [];
        imagemUrl = urls[0];
      }

      // Inserir item
      const { error } = await supabase
        .from('achados_perdidos')
        .insert({
          titulo,
          descricao,
          categoria,
          tipo,
          status: 'ativo',
          bairro,
          local_referencia: localReferencia || null,
          data_ocorrencia: dataOcorrencia,
          telefone_contato: telefoneContato,
          nome_contato: nomeContato,
          imagem: imagemUrl,
          user_id: user.id
        });

      if (error) throw error;

      toast.success(tipo === "perdido" ? "Item perdido cadastrado!" : "Item encontrado cadastrado!");
      limparFormulario();
      setOpenDialog(false);
      carregarItens();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error("Erro ao cadastrar item");
    } finally {
      setSubmitting(false);
    }
  };

  const marcarComoRecuperado = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('achados_perdidos')
        .update({ status: 'recuperado' })
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Item marcado como recuperado!");
      carregarItens();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Filtrar itens
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
      
      <main className="flex-grow container mx-auto px-4 py-12 space-y-8">
        {/* Botões de Navegação */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <Home className="w-4 h-4" />
            Página Inicial
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
              <Package className="w-10 h-10 text-primary" />
              Achados e Perdidos
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Encontrou algo? Perdeu algo? Cadastre aqui e ajude a comunidade a recuperar seus pertences.
            </p>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="animated" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Cadastrar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Cadastrar Item
                </DialogTitle>
                <DialogDescription>
                  {user ? (
                    <>Preencha os dados do item perdido ou encontrado. Seus dados de contato serão exibidos.</>
                  ) : (
                    <>Você precisa estar logado para cadastrar itens.</>
                  )}
                </DialogDescription>
              </DialogHeader>

              {!user ? (
                <div className="py-8 text-center">
                  <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo */}
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select value={tipo} onValueChange={(value: "perdido" | "encontrado") => setTipo(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perdido">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Perdi algo
                          </div>
                        </SelectItem>
                        <SelectItem value="encontrado">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Encontrei algo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Título */}
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Carteira marrom"
                        required
                      />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select value={categoria} onValueChange={setCategoria}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva o item com detalhes (cor, marca, características)"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Bairro */}
                    <div className="space-y-2">
                      <Label>Bairro *</Label>
                      <Input
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        placeholder="Ex: Centro"
                        required
                      />
                    </div>

                    {/* Local de Referência */}
                    <div className="space-y-2">
                      <Label>Local de Referência</Label>
                      <Input
                        value={localReferencia}
                        onChange={(e) => setLocalReferencia(e.target.value)}
                        placeholder="Ex: Próximo ao banco"
                      />
                    </div>
                  </div>

                  {/* Data da Ocorrência */}
                  <div className="space-y-2">
                    <Label>Data da Ocorrência *</Label>
                    <Input
                      type="date"
                      value={dataOcorrencia}
                      onChange={(e) => setDataOcorrencia(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nome para Contato */}
                    <div className="space-y-2">
                      <Label>Seu Nome *</Label>
                      <Input
                        value={nomeContato}
                        onChange={(e) => setNomeContato(e.target.value)}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                      <Label>Telefone para Contato *</Label>
                      <Input
                        value={telefoneContato}
                        onChange={(e) => setTelefoneContato(e.target.value)}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </div>

                  {/* Upload de Imagem */}
                  <div className="space-y-2">
                    <Label>Foto do Item (opcional)</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="gap-2"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Escolher Foto
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagemPreview && (
                        <div className="relative">
                          <img src={imagemPreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6"
                            onClick={() => {
                              setImagemFile(null);
                              setImagemPreview("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        'Cadastrar'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Item, local..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="perdido">Perdidos</SelectItem>
                    <SelectItem value="encontrado">Encontrados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="recuperado">Recuperados</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando itens...</span>
          </div>
        ) : itensFiltrados.length === 0 ? (
          <Card className="py-20 text-center">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">
                {busca || filtroTipo !== "todos" || filtroCategoria !== "todas"
                  ? "Tente ajustar os filtros de busca"
                  : "Seja o primeiro a cadastrar um item"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itensFiltrados.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all">
                {item.imagem && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={item.imagem}
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg">{item.titulo}</CardTitle>
                    <Badge
                      variant={item.tipo === "perdido" ? "destructive" : "default"}
                      className={item.tipo === "encontrado" ? "bg-green-600" : ""}
                    >
                      {item.tipo === "perdido" ? (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Perdido
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Encontrado
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{item.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{item.categoria}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{item.bairro}</span>
                    {item.local_referencia && ` - ${item.local_referencia}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatarData(item.data_ocorrencia)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${item.telefone_contato}`} className="text-primary hover:underline">
                      {item.telefone_contato}
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Contato: {item.nome_contato}
                  </div>

                  {item.status === "recuperado" && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 w-full justify-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Recuperado
                    </Badge>
                  )}

                  {user?.id === item.user_id && item.status === "ativo" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => marcarComoRecuperado(item.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Recuperado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
